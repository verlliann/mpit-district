"""Prompt templates for AI Engine Service."""

ANALYZE_CONTENT_PROMPT = """
Проанализируй статью и извлеки информацию.

Заголовок: {title}
Текст: {content}

Параметры:
- Извлечь факты: {extract_facts}
- Извлечь сущности: {extract_entities}
- Извлечь цитаты: {extract_quotes}
- Анализ тональности: {analyze_sentiment}
- Резюме: {generate_summary}
- Макс. фактов: {max_facts}
- Мин. важность: {min_importance}

Верни JSON:
{{
  "facts": [{{"content": "факт", "importance": 8, "source_text": "источник", "confidence": 0.9}}],
  "entities": [{{"name": "имя", "type": "person|organization|location|date|money|event", "normalized_name": "норм. имя"}}],
  "quotes": [{{"text": "цитата", "author": "автор", "context": "контекст", "is_direct": true}}],
  "sentiment": {{"sentiment": "positive|negative|neutral|mixed", "score": 0.5, "confidence": 0.85}},
  "summary": "резюме"
}}
"""

EXTRACT_FACTS_PROMPT = """
Извлеки ключевые факты.

Заголовок: {title}
Текст: {content}

Макс. фактов: {max_facts}
Мин. важность (1-10): {min_importance}

Верни JSON:
{{
  "facts": [
    {{"content": "факт", "importance": 8, "source_text": "источник", "confidence": 0.9}}
  ]
}}
"""

EXTRACT_ENTITIES_PROMPT = """
Найди упоминания сущностей (NER).

Текст: {content}
Типы: {filter_types}

Типы: person, organization, location, date, money, percent, event, product

Верни JSON:
{{
  "entities": [
    {{"name": "Apple", "type": "organization", "normalized_name": "Apple Inc."}}
  ]
}}
"""

EXTRACT_QUOTES_PROMPT = """
Извлеки цитаты.

Текст: {content}
Макс. цитат: {max_quotes}

Верни JSON:
{{
  "quotes": [
    {{"text": "цитата", "author": "автор", "context": "контекст", "is_direct": true}}
  ]
}}
"""

ANALYZE_SENTIMENT_PROMPT = """
Определи тональность текста.

Текст: {content}

Верни JSON:
{{
  "sentiment": "positive|negative|neutral|mixed",
  "score": 0.5,
  "confidence": 0.85,
  "aspects": [{{"aspect": "тема", "sentiment": "positive", "score": 0.7}}]
}}
"""

SUMMARIZE_PROMPT = """
Создай краткое содержание.

Текст: {content}
Макс. слов: {max_length}
Стиль: {style}

Верни JSON:
{{
  "summary": "краткое содержание"
}}
"""

GENERATE_POST_PROMPT = """
Ты - профессиональный SMM-специалист. Создай качественный пост для социальной сети на основе предоставленной статьи.

ПАРАМЕТРЫ ПОСТА:
- Платформа: {platform}
- Стиль: {style}
- Уровень формальности (1-10): {formality_level}

КОНТЕНТ:
{custom_instructions}

ТРЕБОВАНИЯ К ПОСТУ:
- TELEGRAM: 200-500 символов, 2-3 уместных эмодзи, 2-3 хештега
- VK: 300-800 символов, разбей на абзацы, 3-5 хештегов
- INSTAGRAM: 150-300 символов, много эмодзи, 5-10 хештегов
- LINKEDIN: 600-1200 символов, деловой тон, 0-3 хештега
- TWITTER: до 280 символов, краткость, 1-2 хештега

ВАЖНО:
- Адаптируй текст для выбранной платформы
- Сохраняй ключевую информацию из статьи
- Добавь призыв к действию или вопрос для вовлечения
- Хештеги должны быть релевантными теме

Верни ТОЛЬКО валидный JSON без markdown:
{{
  "content": "готовый текст поста с эмодзи и хештегами",
  "hashtags": ["хештег1", "хештег2"],
  "estimated_reach": 5000,
  "quality_score": 0.85,
  "warnings": {{
    "potentially_offensive": false,
    "factual_uncertainty": false,
    "needs_review": false,
    "messages": []
  }}
}}
"""
