#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Сбор метрик Telegram через Telethon
Полные метрики: просмотры, форварды, реакции!
"""

import os
import json
from datetime import datetime
from telethon import TelegramClient
from telethon.tl.functions.channels import GetFullChannelRequest

API_ID = 35139259
API_HASH = 'b25479cd7760a9fe42fec4e290ef6cc5'
SESSION_NAME = 'telegram_session'
CHANNEL_USERNAME = '@SiriusNewsMPIT'

print('[*] ========================================')
print('[*]   СБОР МЕТРИК TELEGRAM')
print('[*] ========================================\n')

client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

async def main():
    try:
        await client.connect()
        
        if not await client.is_user_authorized():
            print('[-] Ошибка: не авторизованы!')
            print('[!] Запустите сначала: py telegram_auth_interactive.py')
            return
        
        print(f'[*] Получение метрик для канала: {CHANNEL_USERNAME}\n')
        
        # Получаем канал
        channel = await client.get_entity(CHANNEL_USERNAME)
        print(f'[+] Канал найден: {channel.title}')
        
        # Получаем полную информацию о канале
        full_channel = await client(GetFullChannelRequest(channel))
        participants_count = full_channel.full_chat.participants_count
        
        print(f'[+] Подписчиков: {participants_count:,}\n')
        
        # Собираем метрики
        metrics = {
            'collected_at': datetime.now().isoformat(),
            'channel': {
                'id': channel.id,
                'title': channel.title,
                'username': channel.username,
                'participants_count': participants_count,
                'description': full_channel.full_chat.about or '',
                'url': f'https://t.me/{channel.username}'
            },
            'posts': []
        }
        
        # Получаем последние 50 постов с метриками
        print('[*] Получение постов (это может занять некоторое время)...\n')
        
        post_count = 0
        total_views = 0
        total_forwards = 0
        
        async for message in client.iter_messages(channel, limit=50):
            if message.message:  # Только посты с текстом
                post_metrics = {
                    'message_id': message.id,
                    'date': message.date.isoformat(),
                    'text': message.message[:100] + '...' if len(message.message) > 100 else message.message,
                    'views': message.views or 0,
                    'forwards': message.forwards or 0,
                    'replies': message.replies.replies if message.replies else 0,
                    'reactions': {},
                    'has_media': message.media is not None,
                    'url': f'https://t.me/{channel.username}/{message.id}'
                }
                
                # Получаем реакции
                if message.reactions:
                    for reaction_count in message.reactions.results:
                        emoji = reaction_count.reaction.emoticon if hasattr(reaction_count.reaction, 'emoticon') else str(reaction_count.reaction)
                        post_metrics['reactions'][emoji] = reaction_count.count
                
                # Считаем engagement
                interactions = post_metrics['forwards'] + sum(post_metrics['reactions'].values())
                if post_metrics['views'] > 0:
                    post_metrics['engagement'] = round((interactions / post_metrics['views']) * 100, 2)
                else:
                    post_metrics['engagement'] = 0
                
                metrics['posts'].append(post_metrics)
                
                post_count += 1
                total_views += post_metrics['views']
                total_forwards += post_metrics['forwards']
                
                print(f'[+] Пост #{message.id}: {post_metrics["views"]:,} просмотров, {post_metrics["forwards"]} форвардов')
        
        # Статистика
        metrics['statistics'] = {
            'total_posts': post_count,
            'total_views': total_views,
            'total_forwards': total_forwards,
            'avg_views': round(total_views / post_count) if post_count > 0 else 0,
            'avg_forwards': round(total_forwards / post_count) if post_count > 0 else 0
        }
        
        # Сохраняем в JSON
        os.makedirs('../metrics', exist_ok=True)
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        json_filename = f'../metrics/telegram_metrics_{timestamp}.json'
        
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(metrics, f, ensure_ascii=False, indent=2)
        
        print(f'\n[+] JSON сохранен: {json_filename}')
        
        # Сохраняем текстовый отчет
        txt_filename = f'../metrics/telegram_report_{timestamp}.txt'
        
        with open(txt_filename, 'w', encoding='utf-8') as f:
            f.write('='*60 + '\n')
            f.write('ОТЧЕТ ПО МЕТРИКАМ TELEGRAM КАНАЛА\n')
            f.write('='*60 + '\n\n')
            f.write(f'Дата создания: {datetime.now().strftime("%d.%m.%Y %H:%M:%S")}\n\n')
            
            f.write('--- ИНФОРМАЦИЯ О КАНАЛЕ ---\n')
            f.write(f'Название: {metrics["channel"]["title"]}\n')
            f.write(f'Username: @{metrics["channel"]["username"]}\n')
            f.write(f'Ссылка: {metrics["channel"]["url"]}\n')
            f.write(f'Подписчиков: {metrics["channel"]["participants_count"]:,}\n\n')
            
            f.write('--- ОБЩАЯ СТАТИСТИКА ---\n')
            f.write(f'Всего постов: {metrics["statistics"]["total_posts"]}\n')
            f.write(f'Всего просмотров: {metrics["statistics"]["total_views"]:,}\n')
            f.write(f'Всего форвардов: {metrics["statistics"]["total_forwards"]:,}\n')
            f.write(f'Средние просмотры: {metrics["statistics"]["avg_views"]:,}\n')
            f.write(f'Средние форварды: {metrics["statistics"]["avg_forwards"]}\n\n')
            
            f.write('--- МЕТРИКИ ПОСТОВ ---\n\n')
            for i, post in enumerate(metrics['posts'], 1):
                f.write(f'{i}. Пост #{post["message_id"]}\n')
                f.write(f'   Дата: {datetime.fromisoformat(post["date"]).strftime("%d.%m.%Y %H:%M:%S")}\n')
                f.write(f'   Просмотры: {post["views"]:,}\n')
                f.write(f'   Форварды: {post["forwards"]}\n')
                f.write(f'   Engagement: {post["engagement"]}%\n')
                if post['reactions']:
                    f.write(f'   Реакции: {post["reactions"]}\n')
                f.write(f'   Ссылка: {post["url"]}\n\n')
        
        print(f'[+] Текстовый отчет: {txt_filename}\n')
        
        # Краткая сводка
        print('[+] ========================================')
        print('[+] КРАТКАЯ СВОДКА')
        print('[+] ========================================')
        print(f'[+] Канал: {metrics["channel"]["title"]}')
        print(f'[+] Подписчиков: {participants_count:,}')
        print(f'[+] Всего постов: {post_count}')
        print(f'[+] Всего просмотров: {total_views:,}')
        print(f'[+] Средние просмотры: {metrics["statistics"]["avg_views"]:,}')
        
        # Топ-3 постов
        top_posts = sorted(metrics['posts'], key=lambda x: x['views'], reverse=True)[:3]
        print(f'\n[+] ТОП-3 ПОСТОВ ПО ПРОСМОТРАМ:')
        for i, post in enumerate(top_posts, 1):
            print(f'    {i}. Пост #{post["message_id"]}: {post["views"]:,} просмотров ({post["engagement"]}% engagement)')
        
        print('\n[!] Готово! Метрики сохранены.')
        
    except Exception as e:
        print(f'\n[-] Ошибка: {e}')
        import traceback
        traceback.print_exc()
    finally:
        await client.disconnect()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())

