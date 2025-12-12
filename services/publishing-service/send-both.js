#!/usr/bin/env node
/**
 * Быстрая отправка тестового поста в Telegram и VK.
 * Зависимости: node-telegram-bot-api, vk-io, dotenv
 */

const { VK } = require('vk-io');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_DEFAULT_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
const VK_TOKEN = process.env.VK_ACCESS_TOKEN;
const VK_GROUP_ID = process.env.VK_GROUP_ID;

if (!TG_TOKEN || !TG_CHAT) {
  console.error('❌ TELEGRAM_BOT_TOKEN или TELEGRAM_DEFAULT_CHAT_ID не заданы в .env');
  process.exit(1);
}

if (!VK_TOKEN || !VK_GROUP_ID) {
  console.error('❌ VK_ACCESS_TOKEN или VK_GROUP_ID не заданы в .env');
  process.exit(1);
}

const message = `🚀 Тестовый пост ${new Date().toLocaleString('ru-RU')} (Telegram + VK)`;

async function sendTelegram() {
  const bot = new TelegramBot(TG_TOKEN, { polling: false });
  const msg = await bot.sendMessage(TG_CHAT, message, { parse_mode: 'HTML' });
  const url = `https://t.me/${TG_CHAT.replace('@', '')}/${msg.message_id}`;
  return { id: msg.message_id, url };
}

async function sendVK() {
  const vk = new VK({ token: VK_TOKEN });
  const ownerId = VK_GROUP_ID.startsWith('-') ? VK_GROUP_ID : `-${VK_GROUP_ID}`;
  const res = await vk.api.wall.post({
    owner_id: parseInt(ownerId, 10),
    from_group: 1,
    message,
    guid: `test-${Date.now()}`,
  });
  const url = `https://vk.com/wall${ownerId}_${res.post_id}`;
  return { id: res.post_id, url };
}

(async () => {
  console.log('🚀 Отправляю тестовый пост в Telegram и VK...');

  let tgResult = null;
  try {
    tgResult = await sendTelegram();
    console.log('✅ Telegram OK:', tgResult.url);
  } catch (err) {
    console.error('⚠️ Telegram не отправлен:', err.message);
  }

  let vkResult = null;
  try {
    vkResult = await sendVK();
    console.log('✅ VK OK:', vkResult.url);
  } catch (err) {
    console.error('⚠️ VK не отправлен:', err.message);
  }

  if (!tgResult && !vkResult) {
    console.error('❌ Ни один пост не отправлен');
    process.exit(1);
  } else {
    process.exit(0);
  }
})();

