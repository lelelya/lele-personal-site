import { copyFile, cp, readFile, readdir, mkdir, writeFile, unlink, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';
import python from 'highlight.js/lib/languages/python';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(root, 'content');
const outputRoot = path.join(root, 'dist', 'client');
const manifestPath = path.join(outputRoot, 'data', 'article-build-manifest.json');
const generatedMarker = '<!-- Generated from content/*.md by scripts/build-content.mjs. -->';
const sections = ['diary', 'notes'];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const generatedPathPattern = /^(?:diary|notes)\/[a-z0-9-]+\/index\.html$/;

hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('python', python);

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(code, language) {
    const requested = language.trim().split(/\s+/)[0].toLowerCase();
    const normalized = ['c++', 'cxx', 'ascend-c', 'ascendc'].includes(requested) ? 'cpp' : requested;
    const safeCode = hljs.getLanguage(normalized)
      ? hljs.highlight(code, { language: normalized, ignoreIllegals: true }).value
      : markdown.utils.escapeHtml(code);
    return `<pre><code class="hljs">${safeCode}</code></pre>`;
  }
});

const escapeHtml = (value) => markdown.utils.escapeHtml(String(value));

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/[\*_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDate(value, filename) {
  const date = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error(`${filename}: date 必须是 YYYY-MM-DD`);
  }
  if (new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error(`${filename}: date 不是有效日期`);
  }
  return date;
}

function normalizeArticle(source, section, filename) {
  const slug = path.basename(filename, '.md');
  if (!slugPattern.test(slug)) {
    throw new Error(`${filename}: 文件名只能使用小写英文字母、数字和连字符`);
  }
  const parsed = matter(source);
  const title = typeof parsed.data.title === 'string' ? parsed.data.title.trim() : '';
  if (!title) throw new Error(`${filename}: 缺少 title`);
  if (parsed.data.type !== section) throw new Error(`${filename}: type 必须是 ${section}`);
  if (!parsed.content.trim()) throw new Error(`${filename}: 正文不能为空`);
  const date = normalizeDate(parsed.data.date, filename);
  const tags = parsed.data.tags ?? [];
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
    throw new Error(`${filename}: tags 必须是非空字符串组成的列表`);
  }
  return {
    title,
    date,
    type: section,
    tags: tags.map((tag) => tag.trim()),
    slug,
    url: `/${section}/${slug}/`,
    body: parsed.content
  };
}

function renderArticle(article, template) {
  const label = article.type === 'diary' ? 'Diary' : 'Study Note';
  const listUrl = `/${article.type}/`;
  const tags = article.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `${generatedMarker}\n${template
    .replaceAll('{{DESCRIPTION}}', escapeHtml(article.title))
    .replaceAll('{{TITLE}}', escapeHtml(article.title))
    .replaceAll('{{DATE}}', escapeHtml(article.date))
    .replaceAll('{{TYPE_LABEL}}', label)
    .replaceAll('{{LIST_URL}}', listUrl)
    .replaceAll('{{TAGS}}', tags)
    .replaceAll('{{BODY}}', markdown.render(article.body))}`;
}

async function readPreviousManifest() {
  try {
    const entries = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (!Array.isArray(entries) || entries.some((entry) => typeof entry !== 'string' || !generatedPathPattern.test(entry))) {
      throw new Error('文章构建清单格式无效，停止以避免误删文件');
    }
    return entries;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function main() {
  const template = await readFile(path.join(root, 'templates', 'article.html'), 'utf8');
  const previousPages = await readPreviousManifest();
  const articles = [];
  for (const section of sections) {
    const folder = path.join(contentRoot, section);
    const files = (await readdir(folder)).filter((filename) => filename.endsWith('.md')).sort();
    for (const filename of files) {
      const source = await readFile(path.join(folder, filename), 'utf8');
      articles.push(normalizeArticle(source, section, filename));
    }
  }
  articles.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  for (const article of articles) {
    const destination = path.join(outputRoot, article.type, article.slug, 'index.html');
    try {
      if (!(await readFile(destination, 'utf8')).startsWith(generatedMarker)) {
        throw new Error(`拒绝覆盖非生成页面：${destination}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  const nextPages = [];
  for (const article of articles) {
    const relativePath = `${article.type}/${article.slug}/index.html`;
    const destination = path.join(outputRoot, article.type, article.slug);
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, 'index.html'), renderArticle(article, template), 'utf8');
    nextPages.push(relativePath);
  }

  for (const oldPage of previousPages) {
    if (nextPages.includes(oldPage)) continue;
    const oldFile = path.join(outputRoot, oldPage);
    let html;
    try {
      html = await readFile(oldFile, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (!html.startsWith(generatedMarker)) throw new Error(`拒绝清理非生成页面：${oldPage}`);
    await unlink(oldFile);
    await rmdir(path.dirname(oldFile));
  }

  for (const section of sections) {
    const items = articles.filter((article) => article.type === section).map(({ title, date, tags, url }) => ({ title, date, tags, url }));
    await writeFile(path.join(outputRoot, 'data', `${section}.json`), `${JSON.stringify(items, null, 2)}\n`, 'utf8');
  }
  await writeFile(manifestPath, `${JSON.stringify(nextPages, null, 2)}\n`, 'utf8');

  const projects = JSON.parse(await readFile(path.join(outputRoot, 'data', 'projects.json'), 'utf8'));
  const searchIndex = [
    ...articles.map((article) => {
      const text = stripMarkdown(article.body);
      return {
        type: article.type,
        title: article.title,
        date: article.date,
        tags: article.tags,
        url: article.url,
        excerpt: text.slice(0, 120),
        text
      };
    }),
    ...projects.filter((project) => project?.name && project?.url).map((project) => ({
      type: 'project',
      title: project.name,
      date: '',
      tags: Array.isArray(project.tags) ? project.tags : [],
      url: project.url,
      excerpt: project.description || '',
      text: `${project.name} ${project.description || ''} ${(project.tags || []).join(' ')}`
    }))
  ];
  await writeFile(path.join(outputRoot, 'data', 'search-index.json'), `${JSON.stringify(searchIndex, null, 2)}\n`, 'utf8');

  await mkdir(path.join(root, 'dist', 'server'), { recursive: true });
  await mkdir(path.join(root, 'dist', '.openai'), { recursive: true });
  await copyFile(path.join(root, 'worker', 'index.js'), path.join(root, 'dist', 'server', 'index.js'));
  await copyFile(path.join(root, '.openai', 'hosting.json'), path.join(root, 'dist', '.openai', 'hosting.json'));
  await cp(path.join(root, 'drizzle'), path.join(root, 'dist', '.openai', 'drizzle'), { recursive: true, force: true });
  console.log(`Built ${articles.filter((article) => article.type === 'diary').length} diary and ${articles.filter((article) => article.type === 'notes').length} note articles.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
