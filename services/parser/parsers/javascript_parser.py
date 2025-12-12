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
                
                # Ожидание загрузки контента
                if wait_for_selector:
                    try:
                        # Пробуем разные селекторы
                        selectors = wait_for_selector.split(',')
                        found = False
                        for selector in selectors:
                            selector = selector.strip()
                            try:
                                await page.wait_for_selector(
                                    selector,
                                    timeout=10000
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
                
                # Дополнительное ожидание для динамического контента (особенно для Дзена)
                await asyncio.sleep(5)  # Увеличено для Дзена
                
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
    
    async def _parse_html(self, html: str, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
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
        
        # Извлечение контента
        content = ''
        if content_selector:
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
            images = await self._extract_images(soup, url)
        
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

