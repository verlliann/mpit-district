"""JavaScript парсер для динамических сайтов с использованием Playwright."""

import asyncio
from typing import Dict, Any, Optional

from playwright.async_api import async_playwright, Browser, Page, TimeoutError as PlaywrightTimeoutError

from .html_parser import HTMLParser
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from exceptions import ParsingTimeout, ContentNotFound


class JavaScriptParser(HTMLParser):
    """Парсер для JavaScript-сайтов (SPA) с использованием headless browser."""
    
    def __init__(self):
        super().__init__()
        self.timeout = 90  # Увеличено для Дзена
        self.headless = True
    
    async def parse(self, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг JavaScript-сайта с помощью Playwright.
        
        Args:
            url: URL статьи
            options: Опции парсинга
            
        Returns:
            Словарь с данными статьи
        """
        timeout = options.get('timeout_seconds', self.timeout)
        wait_for_selector = options.get('wait_for_selector', 'article, .article, main, [role="article"]')
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            
            try:
                page = await browser.new_page()
                
                # Блокировка ненужных ресурсов для ускорения
                await self._block_resources(page, options)
                
                # Установка user agent
                user_agent = options.get('user_agent')
                if user_agent:
                    await page.set_extra_http_headers({'User-Agent': user_agent})
                
                # Загрузка страницы
                # Для Дзена используем 'load' вместо 'networkidle' (быстрее)
                wait_until_mode = options.get('wait_until', 'load')
                if wait_until_mode not in ['load', 'domcontentloaded', 'networkidle']:
                    wait_until_mode = 'load'
                
                try:
                    await page.goto(
                        url,
                        wait_until=wait_until_mode,
                        timeout=timeout * 1000
                    )
                except PlaywrightTimeoutError:
                    # Пробуем с более простым режимом ожидания
                    try:
                        await page.goto(
                            url,
                            wait_until='domcontentloaded',
                            timeout=30000  # 30 секунд
                        )
                    except PlaywrightTimeoutError:
                        raise ParsingTimeout(f"Timeout while loading {url}")
                
                # Специальная обработка для Telegram
                is_telegram = 't.me' in url
                telegram_content = None
                telegram_title = None
                telegram_images = []
                
                if is_telegram:
                    # Telegram виджет требует больше времени на загрузку
                    wait_timeout = options.get('wait_timeout', 20000)
                    
                    # Ждем загрузки скрипта виджета
                    await asyncio.sleep(5)
                    
                    # Пробуем извлечь контент напрямую через JavaScript из iframe
                    try:
                        # Получаем все iframe
                        iframes = await page.query_selector_all('iframe')
                        for iframe in iframes:
                            try:
                                # Переключаемся на iframe
                                frame = await iframe.content_frame()
                                if frame:
                                    # Ждем загрузки контента внутри iframe
                                    try:
                                        await frame.wait_for_selector('.tgme_widget_message_text, .tgme_widget_message', timeout=15000)
                                        await asyncio.sleep(3)  # Дополнительное время на рендеринг
                                        
                                        # Извлекаем контент напрямую из iframe через JavaScript
                                        content_js = """
                                        () => {
                                            // Пробуем найти текст сообщения
                                            const textElem = document.querySelector('.tgme_widget_message_text');
                                            if (textElem) {
                                                let text = textElem.innerText || textElem.textContent || '';
                                                // Убираем пустые строки и служебные тексты
                                                const serviceTexts = ['Download', 'Context', 'Embed', 'View In Channel', 'Copy', 
                                                                      'Download for Mac', 'Download for Windows', 'Download for Linux'];
                                                return text.split('\\n')
                                                    .map(line => line.trim())
                                                    .filter(line => line && !serviceTexts.includes(line))
                                                    .join('\\n');
                                            }
                                            
                                            // Если не нашли, пробуем весь виджет сообщения
                                            const msgElem = document.querySelector('.tgme_widget_message');
                                            if (msgElem) {
                                                // Удаляем служебные элементы
                                                const serviceElems = msgElem.querySelectorAll('.tgme_widget_message_footer, .tgme_widget_message_buttons, .tgme_widget_message_views');
                                                serviceElems.forEach(el => el.remove());
                                                
                                                const serviceTexts = ['Download', 'Context', 'Embed', 'View In Channel', 'Copy'];
                                                let text = msgElem.innerText || msgElem.textContent || '';
                                                return text.split('\\n')
                                                    .map(line => line.trim())
                                                    .filter(line => line && !serviceTexts.includes(line))
                                                    .join('\\n');
                                            }
                                            
                                            // Пробуем найти любой текст в виджете
                                            const widget = document.querySelector('.tgme_widget_message_wrap, [data-post]');
                                            if (widget) {
                                                const serviceTexts = ['Download', 'Context', 'Embed', 'View In Channel', 'Copy'];
                                                let text = widget.innerText || widget.textContent || '';
                                                return text.split('\\n')
                                                    .map(line => line.trim())
                                                    .filter(line => line && !serviceTexts.includes(line))
                                                    .join('\\n');
                                            }
                                            
                                            return '';
                                        }
                                        """
                                        telegram_content = await frame.evaluate(content_js)
                                        
                                        # Проверка на приватные каналы/группы
                                        if telegram_content:
                                            private_indicators = [
                                                'Message in a private group or channel',
                                                'This link will only work if you are a member',
                                                'Open Message',
                                                'сообщение в приватной группе',
                                                'только для участников'
                                            ]
                                            content_lower = telegram_content.lower()
                                            is_private = any(ind.lower() in content_lower for ind in private_indicators)
                                            
                                            if is_private:
                                                # Приватный канал - контент недоступен
                                                print(f"[DEBUG] Private channel detected, content not accessible")
                                                telegram_content = None  # Сброс для обработки ошибки
                                                break
                                            elif len(telegram_content.strip()) > 50:
                                                print(f"[DEBUG] Extracted from iframe: {len(telegram_content)} chars")
                                                
                                                # Извлекаем заголовок
                                                title_js = """
                                                () => {
                                                    const titleElem = document.querySelector('.tgme_widget_message_text, .tgme_widget_message .tgme_widget_message_author');
                                                    return titleElem ? (titleElem.innerText || titleElem.textContent || '').trim() : '';
                                                }
                                                """
                                                telegram_title = await frame.evaluate(title_js)
                                                
                                                # Извлекаем изображения из Telegram поста
                                                images_js = """
                                                () => {
                                                    const images = [];
                                                    // Ищем изображения в виджете
                                                    const imgElems = document.querySelectorAll('.tgme_widget_message_photo_wrap img, .tgme_widget_message_photo img, .tgme_widget_message img[src*="cdn"]');
                                                    imgElems.forEach(img => {
                                                        const src = img.src || img.getAttribute('src') || img.getAttribute('data-src');
                                                        if (src && !src.includes('telegram.org/img') && !src.includes('icon')) {
                                                            images.push({
                                                                url: src,
                                                                alt: img.alt || '',
                                                                width: img.width || 0,
                                                                height: img.height || 0
                                                            });
                                                        }
                                                    });
                                                    return images;
                                                }
                                                """
                                                telegram_images = await frame.evaluate(images_js)
                                                if telegram_images:
                                                    print(f"[DEBUG] Found {len(telegram_images)} images in Telegram post")
                                                
                                                print(f"[DEBUG] Using content from iframe: {telegram_content[:100]}")
                                                break
                                    except:
                                        continue
                            except:
                                continue
                    except Exception as e:
                        print(f"[WARNING] Failed to extract from iframe: {e}")
                    
                    # Если не получили из iframe, пробуем на основной странице
                    if not telegram_content:
                        try:
                            await page.wait_for_selector('.tgme_widget_message_text, .tgme_widget_message', timeout=wait_timeout)
                            await asyncio.sleep(5)
                            
                            # Извлекаем через JavaScript на основной странице
                            content_js = """
                            () => {
                                const textElem = document.querySelector('.tgme_widget_message_text');
                                if (textElem) {
                                    return textElem.innerText || textElem.textContent || '';
                                }
                                return '';
                            }
                            """
                            telegram_content = await page.evaluate(content_js)
                            print(f"[DEBUG] Extracted from main page: {len(telegram_content) if telegram_content else 0} chars")
                            
                            # Также пробуем извлечь изображения с основной страницы
                            if not telegram_images:
                                images_js = """
                                () => {
                                    const images = [];
                                    const imgElems = document.querySelectorAll('img[src*="cdn"], .tgme_widget_message_photo img');
                                    imgElems.forEach(img => {
                                        const src = img.src || img.getAttribute('src') || img.getAttribute('data-src');
                                        if (src && !src.includes('telegram.org/img') && !src.includes('icon') && !src.includes('logo')) {
                                            images.push({
                                                url: src,
                                                alt: img.alt || '',
                                                width: img.width || 0,
                                                height: img.height || 0
                                            });
                                        }
                                    });
                                    return images;
                                }
                                """
                                telegram_images = await page.evaluate(images_js)
                                if telegram_images:
                                    print(f"[DEBUG] Found {len(telegram_images)} images on main page")
                        except PlaywrightTimeoutError:
                            pass
                
                # Ожидание загрузки контента
                if wait_for_selector:
                    try:
                        # Пробуем разные селекторы
                        selectors = wait_for_selector.split(',')
                        found = False
                        wait_timeout_selector = options.get('wait_timeout', 10000) if is_telegram else 10000
                        for selector in selectors:
                            selector = selector.strip()
                            try:
                                await page.wait_for_selector(
                                    selector,
                                    timeout=wait_timeout_selector
                                )
                                found = True
                                break
                            except PlaywrightTimeoutError:
                                continue
                        
                        if not found:
                            # Если не нашли, ждем просто появления любого контента
                            await page.wait_for_selector('body', timeout=5000)
                    except PlaywrightTimeoutError:
                        # Продолжаем даже если селектор не найден
                        pass
                
                # Дополнительное ожидание для динамического контента
                wait_time = 8 if is_telegram else 5  # Больше времени для Telegram
                await asyncio.sleep(wait_time)
                
                # Прокрутка страницы для загрузки lazy content
                try:
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    await asyncio.sleep(2)
                    await page.evaluate("window.scrollTo(0, 0)")
                    await asyncio.sleep(2)
                except:
                    pass
                
                # Получение HTML
                html = await page.content()
                
                await browser.close()
                
                # Обработка полученного HTML
                # Если для Telegram получили контент напрямую, передаем его
                if is_telegram and telegram_content:
                    return await self._parse_html(html, url, options, telegram_content=telegram_content, telegram_title=telegram_title, telegram_images=telegram_images)
                else:
                    return await self._parse_html(html, url, options)
                
            except Exception as e:
                await browser.close()
                raise
    
    async def _block_resources(self, page: Page, options: Dict[str, Any]):
        """
        Блокировка ненужных ресурсов для ускорения загрузки.
        
        Args:
            page: Playwright Page объект
            options: Опции парсинга
        """
        block_media = options.get('block_media', False)  # По умолчанию не блокируем для Дзена
        
        if block_media:
            # Блокируем изображения, стили, шрифты (но не скрипты, они нужны для контента)
            await page.route("**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2,ico}", 
                           lambda route: route.abort())
    
    async def _parse_html(self, html: str, url: str, options: Dict[str, Any], telegram_content: str = None, telegram_title: str = None, telegram_images: list = None) -> Dict[str, Any]:
        """
        Парсинг HTML контента.
        
        Args:
            html: HTML контент
            url: URL статьи
            options: Опции парсинга
            
        Returns:
            Словарь с данными статьи
        """
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
        
        # Получаем селекторы из конфигурации
        config = options.get('selectors', {})
        title_selector = config.get('title', 'h1')
        content_selector = config.get('content', 'article, .article, main, [role="article"]')
        
        # Извлечение заголовка
        title = ''
        if title_selector:
            title_elem = soup.select_one(title_selector)
            if title_elem:
                title = title_elem.get_text(strip=True)
        
        # Если не нашли через селектор, пробуем стандартные методы
        if not title:
            title_tag = soup.find('title') or soup.find('h1')
            if title_tag:
                title = title_tag.get_text(strip=True)
        
        # Специальная обработка для Telegram
        is_telegram = 't.me' in url
        content = ''
        
        # Если получили контент напрямую из iframe через JavaScript, используем его
        if is_telegram and telegram_content:
            content = telegram_content.strip()
            if telegram_title and not title:
                title = telegram_title
            
            # Проверка на приватные каналы/группы
            private_messages = [
                'Message in a private group or channel',
                'This link will only work if you are a member',
                'Open Message',
                'сообщение в приватной группе',
                'только для участников'
            ]
            content_lower = content.lower()
            if any(msg.lower() in content_lower for msg in private_messages):
                # Это приватный канал - контент недоступен
                from exceptions import ContentNotFound
                raise ContentNotFound(f"Private Telegram channel/group. Content is not accessible without authorization: {url}")
        
        # Если не получили контент из iframe, пробуем извлечь из HTML
        if is_telegram and not content:
            # Telegram виджет - ищем текст в специальных классах
            telegram_selectors = [
                '.tgme_widget_message_text',
                '.tgme_widget_message',
                '[data-post]',
                '.tgme_widget_message_wrap'
            ]
            # Служебные тексты, которые нужно отфильтровать
            service_texts = ['Download', 'Context', 'Embed', 'View In Channel', 'Copy', 
                           'Download for Mac', 'Download for Windows', 'Download for Linux']
            
            for selector in telegram_selectors:
                content_elem = soup.select_one(selector)
                if content_elem:
                    # Удаляем скрипты, стили и iframe
                    for script in content_elem(["script", "style", "nav", "header", "footer", "aside", "iframe", "noscript"]):
                        script.decompose()
                    content = content_elem.get_text(separator='\n', strip=True)
                    # Убираем служебные тексты
                    lines = [line.strip() for line in content.split('\n') 
                            if line.strip() and line.strip() not in service_texts]
                    content = '\n'.join(lines)
                    
                    # Проверка на приватные каналы
                    private_indicators = [
                        'Message in a private group or channel',
                        'This link will only work if you are a member',
                        'Open Message'
                    ]
                    content_lower = content.lower()
                    if any(ind.lower() in content_lower for ind in private_indicators):
                        from exceptions import ContentNotFound
                        raise ContentNotFound(f"Private Telegram channel/group. Content is not accessible without authorization. Use public channel links like https://t.me/channel_name/post_id: {url}")
                    
                    if len(content) > 50:  # Минимум для Telegram
                        break
        
        # Обычное извлечение контента
        if not content and content_selector:
            # Пробуем разные селекторы
            for selector in content_selector.split(','):
                selector = selector.strip()
                content_elem = soup.select_one(selector)
                if content_elem:
                    # Удаляем скрипты и стили
                    for script in content_elem(["script", "style", "nav", "header", "footer", "aside"]):
                        script.decompose()
                    content = content_elem.get_text(separator='\n', strip=True)
                    if len(content) > 200:  # Достаточно контента
                        break
        
        # Если не нашли через селекторы, используем newspaper3k
        if not content or len(content.strip()) < 100:
            try:
                from newspaper import Article
                article = Article(url)
                article.html = html
                article.parse()
                content = article.text or ''
                if not title and article.title:
                    title = article.title
            except:
                pass
        
        # Если все еще нет контента, пробуем извлечь из body
        if not content or len(content.strip()) < 100:
            body = soup.find('body')
            if body:
                for script in body(["script", "style", "nav", "header", "footer", "aside", "noscript"]):
                    script.decompose()
                content = body.get_text(separator='\n', strip=True)
        
        # Проверка на блокировки и ошибки
        content_lower = content.lower() if content else ''
        block_messages = [
            'ваш браузер устарел',
            'browser is outdated',
            'доступ запрещен',
            'access denied',
            'cloudflare',
            'ddos protection',
            'проверка браузера',
            'browser check',
            'captcha',
            'robot',
            'bot detected'
        ]
        
        # Если обнаружена блокировка
        if content and any(msg in content_lower for msg in block_messages):
            # Пробуем извлечь контент из других мест
            body = soup.find('body')
            if body:
                for script in body(["script", "style", "nav", "header", "footer", "aside", "noscript"]):
                    script.decompose()
                # Ищем основной контент
                article_elem = body.find('article') or body.find('main') or body.find('[role="article"]')
                if article_elem:
                    content = article_elem.get_text(separator='\n', strip=True)
                    content = self.clean_text(content)
            
            # Если все еще блокировка, выбрасываем ошибку
            if any(msg in content_lower for msg in block_messages):
                raise ContentNotFound(f"Site blocked parsing or requires authentication: {url}. Content: {content[:200]}")
        
        # Проверка наличия контента
        if not content or len(content.strip()) < 50:
            raise ContentNotFound(f"Article content not found or too short: {url}")
        
        # Извлечение данных
        extract_images = options.get('extract_images', True)
        extract_metadata = options.get('extract_metadata', True)
        
        images = []
        if extract_images:
            # Если для Telegram получили изображения напрямую из iframe, используем их
            if is_telegram and telegram_images:
                # Преобразуем формат изображений из JavaScript в нужный формат
                for img in telegram_images:
                    images.append({
                        'url': img.get('url', ''),
                        'alt_text': img.get('alt', ''),
                        'width': img.get('width', 0) or 0,
                        'height': img.get('height', 0) or 0,
                    })
            
            # Всегда также извлекаем изображения из HTML (для всех сайтов, включая Telegram)
            html_images = await self._extract_images(soup, url)
            
            # Объединяем изображения, избегая дубликатов
            seen_urls = {img['url'] for img in images}
            for img in html_images:
                if img['url'] not in seen_urls:
                    images.append(img)
                    seen_urls.add(img['url'])
        
        metadata = {}
        if extract_metadata:
            # Извлекаем метаданные
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                metadata['description'] = meta_desc.get('content', '')
            
            # Open Graph
            og_title = soup.find('meta', property='og:title')
            if og_title:
                metadata['og_title'] = og_title.get('content', '')
        
        result = {
            'title': title or '',
            'content': self.clean_text(content),
            'excerpt': metadata.get('description', ''),
            'author': None,  # Можно добавить извлечение автора
            'published_at': None,  # Можно добавить извлечение даты
            'images': images,
            'metadata': metadata,
            'html': html,
            'source': self.extract_domain(url),
        }
        
        return result

