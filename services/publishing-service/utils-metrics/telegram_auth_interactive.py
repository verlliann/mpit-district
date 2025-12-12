#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Авторизация в Telegram через Telethon (интерактивная версия)
Запускайте в обычной консоли Windows (не через PowerShell скрипт)
"""

import os
import sys
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError

API_ID = 35139259
API_HASH = 'b25479cd7760a9fe42fec4e290ef6cc5'
SESSION_NAME = 'telegram_session'

print('[*] ========================================')
print('[*]    АВТОРИЗАЦИЯ В TELEGRAM')
print('[*] ========================================\n')
print(f'[*] API ID: {API_ID}')
print(f'[*] API Hash: {API_HASH[:10]}...\n')
print('[*] Telethon автоматически обходит блокировки!\n')

# Создаем клиент
client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

async def main():
    try:
        await client.start()
        
        # Проверяем авторизацию
        me = await client.get_me()
        print(f'\n[+] ========================================')
        print(f'[+] АВТОРИЗАЦИЯ УСПЕШНА!')
        print(f'[+] ========================================')
        print(f'[+] Пользователь: {me.first_name} {me.last_name or ""}')
        print(f'[+] Телефон: {me.phone}')
        print(f'[+] ID: {me.id}\n')
        
        # Сохраняем session string
        session_string = client.session.save()
        
        print(f'[+] Session сохранен в файл: {SESSION_NAME}.session')
        print('[!] Сохраните этот файл - он нужен для работы!')
        print('\n[!] Теперь можно собирать метрики!')
        print('[!] Запустите: py telegram_collect_metrics.py\n')
        
    except Exception as e:
        print(f'\n[-] Ошибка: {e}')
        print('[-] Возможные причины:')
        print('    1. Проблемы с сетью/VPN')
        print('    2. Неверный код из Telegram')
        print('    3. Telegram заблокирован (включите VPN)')
        sys.exit(1)
    finally:
        await client.disconnect()

# Запускаем
if __name__ == '__main__':
    import asyncio
    print('[*] Начинаю авторизацию...')
    print('[*] Если запрашивается номер - введите с кодом страны (+79001234567)\n')
    
    asyncio.run(main())

