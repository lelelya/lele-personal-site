import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const messages = [];
const env = {
  ASSETS: { fetch: async () => new Response('<h1>ok</h1>', { headers: { 'content-type': 'text/html' } }) },
  DB: {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              if (sql.includes('guestbook_rate_limits')) return { meta: { changes: 1 } };
              if (sql.includes('INSERT INTO guestbook_messages')) {
                messages.unshift({ id: 1, nickname: values[0], message: values[1], created_at: values[2] });
                return { meta: { last_row_id: 1, changes: 1 } };
              }
              throw new Error('Unexpected run query');
            }
          };
        },
        async all() {
          if (sql.includes('FROM guestbook_messages')) return { results: messages };
          throw new Error('Unexpected select query');
        }
      };
    }
  }
};

const empty = await worker.fetch(new Request('https://example.com/api/guestbook'), env);
assert.equal(empty.status, 200);
assert.deepEqual((await empty.json()).messages, []);

const created = await worker.fetch(new Request('https://example.com/api/guestbook', {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'https://example.com' },
  body: JSON.stringify({ nickname: 'reader', message: 'hello ♡', website: '' })
}), env);
assert.equal(created.status, 201);
assert.equal((await created.json()).message.message, 'hello ♡');

const invalid = await worker.fetch(new Request('https://example.com/api/guestbook', {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'https://example.com' },
  body: JSON.stringify({ nickname: '', message: '' })
}), env);
assert.equal(invalid.status, 400);

const asset = await worker.fetch(new Request('https://example.com/'), env);
assert.equal(asset.status, 200);
assert.equal(asset.headers.get('x-content-type-options'), 'nosniff');

console.log('Worker checks passed.');
