#!/usr/bin/env node
/**
 * Генерация RSS-ленты для Яндекс Дзен из локального posts.json
 *
 * Формат элемента в posts.json:
 * {
 *   "id": "unique-id",
 *   "title": "Заголовок",
 *   "summary": "Короткое описание",
 *   "link": "https://example.com/original",
 *   "image": "https://example.com/image.jpg",
 *   "publishedAt": "2025-12-12T12:44:47.000Z"
 * }
 *
 * Результат: zen/zen-feed.xml
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const POSTS_PATH = path.join(ROOT, 'posts.json');
const FEED_PATH = path.join(ROOT, 'zen-feed.xml');

// Можно переопределить через ENV
const FEED_TITLE = process.env.ZEN_FEED_TITLE || 'Telegram → Яндекс Дзен';
const FEED_LINK = process.env.ZEN_FEED_LINK || 'https://t.me/your_channel';
const FEED_DESCRIPTION =
  process.env.ZEN_FEED_DESCRIPTION ||
  'Автогенерация RSS для Яндекс Дзен из Telegram.';
const FEED_LANGUAGE = process.env.ZEN_FEED_LANGUAGE || 'ru-RU';
const MAX_ITEMS = parseInt(process.env.ZEN_FEED_MAX_ITEMS || '50', 10);

function escapeXml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rssDate(iso) {
  return new Date(iso).toUTCString();
}

function loadPosts() {
  if (!fs.existsSync(POSTS_PATH)) return [];
  const raw = fs.readFileSync(POSTS_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => p && p.id && p.title && p.link && p.publishedAt)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function buildItem(p) {
  const enclosure = p.image
    ? `<enclosure url="${escapeXml(p.image)}" type="image/jpeg"/>`
    : '';
  return `
  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${escapeXml(p.link)}</link>
    <description>${escapeXml(p.summary || '')}</description>
    <guid isPermaLink="false">${escapeXml(p.id)}</guid>
    <pubDate>${rssDate(p.publishedAt)}</pubDate>
    ${enclosure}
  </item>`;
}

function buildFeed(posts) {
  const items = posts.map(buildItem).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(FEED_TITLE)}</title>
  <link>${escapeXml(FEED_LINK)}</link>
  <description>${escapeXml(FEED_DESCRIPTION)}</description>
  <language>${escapeXml(FEED_LANGUAGE)}</language>
${items}
</channel>
</rss>`;
}

function main() {
  const posts = loadPosts();
  const xml = buildFeed(posts);
  fs.writeFileSync(FEED_PATH, xml, 'utf8');
  console.log(`✅ RSS сгенерирован: ${FEED_PATH}`);
  console.log(`   Постов в ленте: ${posts.length}`);
}

main();

