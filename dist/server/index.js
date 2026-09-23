const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const MAX_NICKNAME_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 180;
const MAX_REQUEST_BYTES = 4096;
const HOURLY_LIMIT = 3;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, 'cache-control': 'no-store', ...headers }
  });
}

function cleanText(value) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
}

async function fingerprint(request, windowKey) {
  const address = request.headers.get('cf-connecting-ip') || 'unknown';
  const agent = request.headers.get('user-agent') || 'unknown';
  const bytes = new TextEncoder().encode(`${windowKey}|${address}|${agent}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function listMessages(env) {
  const result = await env.DB.prepare(
    `SELECT id, nickname, message, created_at
     FROM guestbook_messages
     WHERE status = 'published'
     ORDER BY created_at DESC, id DESC
     LIMIT 30`
  ).all();
  return json({ messages: result.results || [] });
}

async function createMessage(request, env, url) {
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'Invalid request origin.' }, 403);

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) return json({ error: 'Message is too large.' }, 413);
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return json({ error: 'Expected JSON.' }, 415);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid message data.' }, 400);
  }

  if (body?.website) return json({ ok: true }, 201);
  const nickname = cleanText(body?.nickname);
  const message = cleanText(body?.message);
  if (!nickname || nickname.length > MAX_NICKNAME_LENGTH) {
    return json({ error: `Nickname must be 1-${MAX_NICKNAME_LENGTH} characters.` }, 400);
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: `Message must be 1-${MAX_MESSAGE_LENGTH} characters.` }, 400);
  }

  const now = new Date();
  const windowKey = now.toISOString().slice(0, 13);
  const visitor = await fingerprint(request, windowKey);
  const rateResult = await env.DB.prepare(
    `INSERT INTO guestbook_rate_limits (fingerprint, window_key, submission_count, updated_at)
     VALUES (?, ?, 1, unixepoch())
     ON CONFLICT(fingerprint, window_key) DO UPDATE SET
       submission_count = submission_count + 1,
       updated_at = unixepoch()
     WHERE submission_count < ?`
  ).bind(visitor, windowKey, HOURLY_LIMIT).run();

  if (!rateResult.meta?.changes) {
    return json({ error: '留言有点频繁，请稍后再试。' }, 429, { 'retry-after': '3600' });
  }

  const createdAt = now.toISOString();
  const insert = await env.DB.prepare(
    `INSERT INTO guestbook_messages (nickname, message, created_at, status)
     VALUES (?, ?, ?, 'published')`
  ).bind(nickname, message, createdAt).run();

  return json({
    message: {
      id: insert.meta?.last_row_id,
      nickname,
      message,
      created_at: createdAt
    }
  }, 201);
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  headers.set('x-frame-options', 'SAMEORIGIN');
  headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('content-security-policy', "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'self'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/guestbook') {
        if (!env.DB) return json({ error: 'Guestbook is temporarily unavailable.' }, 503);
        if (request.method === 'GET') return listMessages(env);
        if (request.method === 'POST') return createMessage(request, env, url);
        return json({ error: 'Method not allowed.' }, 405, { allow: 'GET, POST' });
      }

      if (!env.ASSETS?.fetch) return new Response('Static assets are unavailable.', { status: 503 });
      return withSecurityHeaders(await env.ASSETS.fetch(request));
    } catch (error) {
      console.error('guestbook request failed', error);
      return json({ error: 'Guestbook is temporarily unavailable.' }, 503);
    }
  }
};
