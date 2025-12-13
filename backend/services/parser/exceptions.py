"""Исключения для Parser Service."""


class ParserException(Exception):
    """Базовое исключение для парсера."""
    pass


class URLNotSupported(ParserException):
    """URL не поддерживается или недоступен."""
    pass


class ParsingTimeout(ParserException):
    """Превышено время ожидания парсинга."""
    pass


class ContentNotFound(ParserException):
    """Контент статьи не найден."""
    pass


class RateLimitExceeded(ParserException):
    """Превышен лимит запросов."""
    pass


class InvalidURL(ParserException):
    """Некорректный URL."""
    pass

