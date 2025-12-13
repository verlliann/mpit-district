"""Парсер для извлечения контента из PDF файлов."""

import io
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
from urllib.parse import urlparse

from parsers.base import BaseParser
from exceptions import ContentNotFound, ParsingTimeout

# Опциональные импорты для работы с PDF
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False


class PDFParser(BaseParser):
    """Парсер для PDF файлов."""
    
    def __init__(self):
        super().__init__()
        self.timeout = 60  # PDF файлы могут быть большими
    
    async def parse(self, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг PDF файла по URL.
        
        Args:
            url: URL PDF файла
            options: Дополнительные опции парсинга
            
        Returns:
            Словарь с данными статьи
            
        Raises:
            ContentNotFound: Если не удалось извлечь контент
            ParsingTimeout: Если превышено время ожидания
        """
        if not HAS_PDFPLUMBER and not HAS_PYMUPDF:
            raise ImportError(
                "PDF parsing requires pdfplumber or PyMuPDF. "
                "Install with: pip install pdfplumber or pip install pymupdf"
            )
        
        # Загрузка PDF
        timeout = options.get('timeout_seconds', self.timeout)
        headers = {
            'User-Agent': options.get('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        }
        
        try:
            response = requests.get(
                url,
                headers=headers,
                timeout=timeout,
                stream=True,
                verify=options.get('verify_ssl', True)
            )
            response.raise_for_status()
        except requests.exceptions.Timeout:
            raise ParsingTimeout(f"Timeout while downloading PDF: {url}")
        except requests.exceptions.RequestException as e:
            raise ContentNotFound(f"Failed to download PDF: {str(e)}")
        
        # Проверка Content-Type
        content_type = response.headers.get('Content-Type', '').lower()
        if 'pdf' not in content_type and not url.lower().endswith('.pdf'):
            # Пробуем все равно, может быть неправильный заголовок
            pass
        
        pdf_bytes = response.content
        
        # Парсинг PDF
        try:
            if HAS_PDFPLUMBER:
                result = await self._parse_with_pdfplumber(pdf_bytes, url, options)
            elif HAS_PYMUPDF:
                result = await self._parse_with_pymupdf(pdf_bytes, url, options)
            else:
                raise ContentNotFound("No PDF parser available")
        except Exception as e:
            raise ContentNotFound(f"Failed to parse PDF: {str(e)}")
        
        return result
    
    async def _parse_with_pdfplumber(self, pdf_bytes: bytes, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг PDF с помощью pdfplumber.
        
        Args:
            pdf_bytes: Байты PDF файла
            url: URL файла
            options: Опции парсинга
            
        Returns:
            Словарь с данными статьи
        """
        pdf_file = io.BytesIO(pdf_bytes)
        
        with pdfplumber.open(pdf_file) as pdf:
            # Извлечение метаданных
            metadata = pdf.metadata or {}
            
            # Извлечение текста со всех страниц
            pages_text = []
            images = []
            
            for page_num, page in enumerate(pdf.pages, 1):
                # Извлечение текста
                text = page.extract_text()
                if text:
                    pages_text.append(f"--- Страница {page_num} ---\n{text}")
                
                # Извлечение изображений (если нужно)
                if options.get('extract_images', True):
                    page_images = page.images
                    for img in page_images:
                        # pdfplumber не извлекает сами изображения, только их координаты
                        # Для извлечения изображений лучше использовать PyMuPDF
                        pass
            
            content = '\n\n'.join(pages_text)
            
            if not content or len(content.strip()) < 50:
                raise ContentNotFound("PDF does not contain extractable text")
            
            # Извлечение заголовка
            title = (
                metadata.get('Title') or
                metadata.get('title') or
                self._extract_title_from_content(content) or
                self._extract_filename_from_url(url)
            )
            
            # Извлечение автора
            author = (
                metadata.get('Author') or
                metadata.get('author') or
                metadata.get('Creator') or
                None
            )
            
            # Извлечение даты
            published_at = None
            if metadata.get('CreationDate'):
                published_at = self._parse_pdf_date(metadata['CreationDate'])
            elif metadata.get('ModDate'):
                published_at = self._parse_pdf_date(metadata['ModDate'])
            
            # Дополнительные метаданные
            pdf_metadata = {
                'pages': len(pdf.pages),
                'creator': metadata.get('Creator'),
                'producer': metadata.get('Producer'),
                'subject': metadata.get('Subject'),
                'keywords': metadata.get('Keywords'),
            }
            
            return {
                'title': title,
                'content': self.clean_text(content),
                'excerpt': metadata.get('Subject') or '',
                'author': author,
                'published_at': published_at,
                'images': images,  # Пустой список, так как pdfplumber не извлекает изображения напрямую
                'metadata': pdf_metadata,
                'html': None,  # PDF не имеет HTML представления
                'source': self.extract_domain(url),
            }
    
    async def _parse_with_pymupdf(self, pdf_bytes: bytes, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг PDF с помощью PyMuPDF (fitz).
        
        Args:
            pdf_bytes: Байты PDF файла
            url: URL файла
            options: Опции парсинга
            
        Returns:
            Словарь с данными статьи
        """
        pdf_file = io.BytesIO(pdf_bytes)
        doc = fitz.open(stream=pdf_file, filetype="pdf")
        
        try:
            # Извлечение метаданных
            metadata = doc.metadata
            
            # Извлечение текста со всех страниц
            pages_text = []
            images = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Извлечение текста
                text = page.get_text()
                if text:
                    pages_text.append(f"--- Страница {page_num + 1} ---\n{text}")
                
                # Извлечение изображений (если нужно)
                if options.get('extract_images', True):
                    image_list = page.get_images()
                    for img_index, img in enumerate(image_list):
                        try:
                            xref = img[0]
                            base_image = doc.extract_image(xref)
                            image_bytes = base_image["image"]
                            image_ext = base_image["ext"]
                            
                            # Сохраняем информацию об изображении
                            images.append({
                                'url': f"{url}#page={page_num + 1}&image={img_index}",
                                'alt_text': f"Image {img_index + 1} from page {page_num + 1}",
                                'format': image_ext,
                                'size': len(image_bytes),
                            })
                        except Exception:
                            # Пропускаем изображения, которые не удалось извлечь
                            pass
            
            content = '\n\n'.join(pages_text)
            
            if not content or len(content.strip()) < 50:
                raise ContentNotFound("PDF does not contain extractable text")
            
            # Извлечение заголовка
            title = (
                metadata.get('title') or
                self._extract_title_from_content(content) or
                self._extract_filename_from_url(url)
            )
            
            # Извлечение автора
            author = (
                metadata.get('author') or
                metadata.get('creator') or
                None
            )
            
            # Извлечение даты
            published_at = None
            if metadata.get('creationDate'):
                published_at = self._parse_pdf_date(metadata['creationDate'])
            elif metadata.get('modDate'):
                published_at = self._parse_pdf_date(metadata['modDate'])
            
            # Дополнительные метаданные
            pdf_metadata = {
                'pages': len(doc),
                'creator': metadata.get('creator'),
                'producer': metadata.get('producer'),
                'subject': metadata.get('subject'),
                'keywords': metadata.get('keywords'),
            }
            
            return {
                'title': title,
                'content': self.clean_text(content),
                'excerpt': metadata.get('subject') or '',
                'author': author,
                'published_at': published_at,
                'images': images,
                'metadata': pdf_metadata,
                'html': None,
                'source': self.extract_domain(url),
            }
        finally:
            doc.close()
    
    def _extract_title_from_content(self, content: str) -> Optional[str]:
        """
        Попытка извлечь заголовок из первых строк контента.
        
        Args:
            content: Текст контента
            
        Returns:
            Заголовок или None
        """
        if not content:
            return None
        
        lines = content.split('\n')
        for line in lines[:10]:  # Проверяем первые 10 строк
            line = line.strip()
            if line and len(line) > 10 and len(line) < 200:
                # Если строка выглядит как заголовок
                if not line.endswith('.') and not line.endswith(','):
                    return line
        
        return None
    
    def _extract_filename_from_url(self, url: str) -> str:
        """
        Извлечение имени файла из URL.
        
        Args:
            url: URL файла
            
        Returns:
            Имя файла без расширения
        """
        parsed = urlparse(url)
        filename = parsed.path.split('/')[-1]
        if filename.endswith('.pdf'):
            filename = filename[:-4]
        return filename or 'PDF Document'
    
    def _parse_pdf_date(self, date_str: str) -> Optional[int]:
        """
        Парсинг даты из PDF метаданных.
        
        Формат PDF даты: D:YYYYMMDDHHmmSSOHH'mm'
        Например: D:20240101120000+03'00'
        
        Args:
            date_str: Строка с датой
            
        Returns:
            Timestamp или None
        """
        if not date_str:
            return None
        
        try:
            # Удаляем префикс D: если есть
            if date_str.startswith('D:'):
                date_str = date_str[2:]
            
            # Парсим дату
            if len(date_str) >= 14:
                year = int(date_str[0:4])
                month = int(date_str[4:6])
                day = int(date_str[6:8])
                hour = int(date_str[8:10]) if len(date_str) > 8 else 0
                minute = int(date_str[10:12]) if len(date_str) > 10 else 0
                second = int(date_str[12:14]) if len(date_str) > 12 else 0
                
                dt = datetime(year, month, day, hour, minute, second)
                return int(dt.timestamp())
        except (ValueError, IndexError):
            pass
        
        return None

