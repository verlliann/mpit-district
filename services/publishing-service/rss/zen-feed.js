#!/usr/bin/env node
/**
 * Простейший генератор RSS для Яндекс Дзен.
 * Хранит посты в JSON и рендерит zen-feed.xml
 */

const fs = require('fs');
const path = require('path');

const FEED_DIR = path.join(__dirname, '..', 'zen');
const POSTS_JSON = path.join(FEED_DIR, 'posts.json');
const FEED_XML = path.join(FEED_DIR, 'zen-feed.xml');

const FEED_TITLE = process.env.ZEN_FEED_TITLE || 'Sirius News';
const FEED_LINK = process.env.ZEN_FEED_LINK || 'https://example.com/zen';
const FEED_DESCRIPTION =
  process.env.ZEN_FEED_DESCRIPTION || 'RSS фид для импорта в Яндекс Дзен';

function ensureDirs() {
  if (!fs.existsSync(FEED_DIR)) {
    fs.mkdirSync(FEED_DIR, { recursive: true });
  }
}

function loadPosts() {
  try {
    const raw = fs.readFileSync(POSTS_JSON, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePosts(posts) {
  fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 2), 'utf8');
}

function escape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toRssDate(date) {
  return new Date(date).toUTCString();
}

function renderFeed(posts) {
  const items = posts
    .slice(0, 50) // ограничим
    .map((p) => {
      const description = escape(p.description || p.title || '');
      const title = escape(p.title || 'Без заголовка');
      const link = escape(p.link || '');
      const guid = escape(p.guid || p.link || String(p.id));
      const enclosure = p.image
        ? `<enclosure url="${escape(p.image)}" type="image/jpeg" />`
        : '';

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${toRssDate(p.pubDate || Date.now())}</pubDate>
      ${enclosure}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(FEED_TITLE)}</title>
    <link>${escape(FEED_LINK)}</link>
    <description>${escape(FEED_DESCRIPTION)}</description>
${items}
  </channel>
</rss>`;
}

/**
 * Добавляет пост и регенерирует RSS
 * @param {{title:string, description:string, link:string, image?:string, pubDate?:string|number}} post
 */
function addPost(post) {
  ensureDirs();
  const posts = loadPosts();

  posts.unshift({
    id: Date.now(),
    guid: post.link || `zen-${Date.now()}`,
    title: post.title || '',
    description: post.description || '',
    link: post.link || '',
    image: post.image,
    pubDate: post.pubDate || Date.now(),
  });

  // ограничим размер
  const trimmed = posts.slice(0, 100);
  savePosts(trimmed);

  const xml = renderFeed(trimmed);
  fs.writeFileSync(FEED_XML, xml, 'utf8');

  return { xmlPath: FEED_XML, count: trimmed.length };
}

module.exports = { addPost, renderFeed, loadPosts, FEED_XML };

// CLI для ручного теста
if (require.main === module) {
  const title = process.argv[2] || `Test ${new Date().toISOString()}`;
  const link = process.argv[3] || 'https://example.com/test';
  const description = process.argv[4] || 'Demo description';
  const res = addPost({ title, link, description });
  console.log('✅ Добавлен пост, всего в фиде:', res.count);
  console.log('📄 RSS:', res.xmlPath);
}

