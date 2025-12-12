#!/usr/bin/env python3
"""Тесты AI Engine Service с YandexGPT."""

import asyncio
import sys
import os

# Добавляем путь к сервису
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm_providers import YandexGPTProvider, get_llm_provider


# Тестовые данные
TEST_ARTICLE = """
Компания «Яндекс» объявила о запуске новой модели искусственного интеллекта YandexGPT 4.
Генеральный директор Артём Савиновский заявил: «Это прорыв в области русскоязычных моделей».

Новая версия показывает на 40% лучше результаты в бенчмарках по сравнению с предыдущей.
Запуск запланирован на январь 2025 года. Модель будет доступна через API и в продуктах компании.

Аналитики Goldman Sachs оценивают инвестиции в проект в $500 миллионов.
Эксперты отмечают, что это может изменить расстановку сил на рынке ИИ в России.
"""

TEST_ARTICLE_NEGATIVE = """
Сегодня на заводе в Ярославле произошла крупная авария. По данным МЧС, пострадали 12 человек.
Директор завода Иван Петров отказался от комментариев. 

"Это ужасная трагедия, которая не должна была случиться", - заявил губернатор области.
Прокуратура начала проверку. Ущерб оценивается в 2 миллиарда рублей.
"""

TEST_ARTICLE_MIXED = """
Несмотря на экономический кризис, IT-сектор показывает рост на 15%.
Однако эксперты предупреждают о возможных рисках в следующем квартале.

Позитивные сигналы: рост выручки, новые инвестиции, расширение штата.
Негативные факторы: отток кадров, санкционное давление, инфляция.
"""


async def test_sentiment_analysis():
    """Тест анализа тональности."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ: Анализ эмоциональной тональности (YandexGPT)")
    print("="*60)
    
    try:
        provider = get_llm_provider("yandex")
        print(f"✅ Провайдер: {provider.name}, модель: {provider.model}")
    except Exception as e:
        print(f"❌ Ошибка инициализации провайдера: {e}")
        print("⚠️  Убедитесь что YANDEX_API_KEY и YANDEX_FOLDER_ID установлены")
        return False
    
    test_cases = [
        ("Позитивная новость", TEST_ARTICLE, "positive"),
        ("Негативная новость", TEST_ARTICLE_NEGATIVE, "negative"),
        ("Смешанная тональность", TEST_ARTICLE_MIXED, "mixed/neutral"),
    ]
    
    prompt_template = """
Определи эмоциональную тональность текста.

Текст: {content}

Проанализируй:
1. Общую тональность (positive, negative, neutral, mixed)
2. Числовую оценку от -1.0 (очень негативно) до 1.0 (очень позитивно)
3. Уверенность оценки от 0 до 1
4. Аспекты текста и их тональность

Верни ТОЛЬКО валидный JSON:
{{
  "sentiment": "positive|negative|neutral|mixed",
  "score": 0.5,
  "confidence": 0.85,
  "aspects": [
    {{"aspect": "тема/аспект", "sentiment": "positive", "score": 0.7}},
    {{"aspect": "другая тема", "sentiment": "negative", "score": -0.3}}
  ],
  "explanation": "краткое объяснение почему такая тональность"
}}
"""
    
    results = []
    
    for name, content, expected in test_cases:
        print(f"\n📝 {name}:")
        print(f"   Ожидаемая тональность: {expected}")
        
        try:
            prompt = prompt_template.format(content=content[:3000])
            response = await provider.complete(prompt)
            
            import json
            result = json.loads(response.content)
            
            sentiment = result.get("sentiment", "unknown")
            score = result.get("score", 0)
            confidence = result.get("confidence", 0)
            explanation = result.get("explanation", "")
            aspects = result.get("aspects", [])
            
            # Emoji для тональности
            emoji_map = {
                "positive": "😊",
                "negative": "😞",
                "neutral": "😐",
                "mixed": "🤔"
            }
            
            print(f"   Результат: {emoji_map.get(sentiment, '❓')} {sentiment}")
            print(f"   Оценка: {score:.2f} (уверенность: {confidence:.0%})")
            print(f"   Объяснение: {explanation[:100]}...")
            
            if aspects:
                print(f"   Аспекты:")
                for asp in aspects[:3]:
                    asp_emoji = emoji_map.get(asp.get("sentiment", "neutral"), "❓")
                    print(f"      - {asp_emoji} {asp.get('aspect', '?')}: {asp.get('score', 0):.2f}")
            
            print(f"   Токены: {response.total_tokens}, стоимость: ${response.cost:.5f}")
            results.append(True)
            
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            results.append(False)
    
    return all(results)


async def test_extract_facts():
    """Тест извлечения фактов."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ: Извлечение ключевых фактов (YandexGPT)")
    print("="*60)
    
    try:
        provider = get_llm_provider("yandex")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False
    
    prompt = f"""
Извлеки ключевые факты из текста.

Текст: {TEST_ARTICLE}

Максимум фактов: 5
Минимальная важность: 6 (из 10)

Верни ТОЛЬКО валидный JSON:
{{
  "facts": [
    {{"content": "описание факта", "importance": 8, "source_text": "цитата из текста", "confidence": 0.9}}
  ]
}}
"""
    
    try:
        response = await provider.complete(prompt)
        import json
        result = json.loads(response.content)
        
        facts = result.get("facts", [])
        print(f"\n✅ Извлечено {len(facts)} фактов:")
        
        for i, fact in enumerate(facts, 1):
            importance = fact.get("importance", 0)
            stars = "⭐" * (importance // 2)
            print(f"\n   {i}. {stars} (важность: {importance}/10)")
            print(f"      {fact.get('content', '?')}")
            print(f"      📎 \"{fact.get('source_text', '')[:60]}...\"")
        
        print(f"\n   Токены: {response.total_tokens}")
        return len(facts) > 0
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False


async def test_extract_entities():
    """Тест извлечения сущностей (NER)."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ: Извлечение сущностей NER (YandexGPT)")
    print("="*60)
    
    try:
        provider = get_llm_provider("yandex")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False
    
    prompt = f"""
Найди и классифицируй все упоминания сущностей (Named Entity Recognition).

Текст: {TEST_ARTICLE}

Типы сущностей:
- person (люди)
- organization (компании, организации)
- location (места, города, страны)
- date (даты, временные периоды)
- money (суммы денег)
- event (события)
- product (продукты, сервисы)

Верни ТОЛЬКО валидный JSON:
{{
  "entities": [
    {{"name": "имя сущности", "type": "тип", "normalized_name": "нормализованное имя"}}
  ]
}}
"""
    
    try:
        response = await provider.complete(prompt)
        import json
        result = json.loads(response.content)
        
        entities = result.get("entities", [])
        print(f"\n✅ Найдено {len(entities)} сущностей:")
        
        # Группируем по типам
        by_type = {}
        for ent in entities:
            t = ent.get("type", "other")
            if t not in by_type:
                by_type[t] = []
            by_type[t].append(ent.get("name", "?"))
        
        emoji_types = {
            "person": "👤",
            "organization": "🏢",
            "location": "📍",
            "date": "📅",
            "money": "💰",
            "event": "🎯",
            "product": "📦"
        }
        
        for t, names in by_type.items():
            emoji = emoji_types.get(t, "❓")
            print(f"\n   {emoji} {t.upper()}: {', '.join(names)}")
        
        print(f"\n   Токены: {response.total_tokens}")
        return len(entities) > 0
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False


async def test_extract_quotes():
    """Тест извлечения цитат."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ: Извлечение цитат (YandexGPT)")
    print("="*60)
    
    try:
        provider = get_llm_provider("yandex")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False
    
    prompt = f"""
Извлеки цитаты из текста.

Текст: {TEST_ARTICLE}

Максимум цитат: 5

Верни ТОЛЬКО валидный JSON:
{{
  "quotes": [
    {{"text": "текст цитаты", "author": "автор", "context": "контекст цитаты", "is_direct": true}}
  ]
}}
"""
    
    try:
        response = await provider.complete(prompt)
        import json
        result = json.loads(response.content)
        
        quotes = result.get("quotes", [])
        print(f"\n✅ Извлечено {len(quotes)} цитат:")
        
        for i, quote in enumerate(quotes, 1):
            direct = "💬" if quote.get("is_direct", True) else "📝"
            print(f"\n   {i}. {direct} \"{quote.get('text', '?')}\"")
            print(f"      — {quote.get('author', 'Неизвестный')}")
            if quote.get("context"):
                print(f"      📎 Контекст: {quote.get('context')[:50]}...")
        
        print(f"\n   Токены: {response.total_tokens}")
        return len(quotes) > 0
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False


async def test_generate_post():
    """Тест генерации поста для соцсети."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ: Генерация поста для Telegram (YandexGPT)")
    print("="*60)
    
    try:
        provider = get_llm_provider("yandex")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False
    
    prompt = f"""
Создай пост для Telegram на основе новости.

Исходная новость: {TEST_ARTICLE}

Требования:
- Платформа: Telegram
- Стиль: информативный
- Длина: 200-500 символов
- Добавь 2-3 эмодзи
- Добавь 2-3 хештега
- Формальность: 6/10

Верни ТОЛЬКО валидный JSON:
{{
  "content": "текст поста с эмодзи",
  "hashtags": ["хештег1", "хештег2"],
  "estimated_reach": 5000,
  "quality_score": 0.85
}}
"""
    
    try:
        response = await provider.complete(prompt)
        import json
        result = json.loads(response.content)
        
        content = result.get("content", "")
        hashtags = result.get("hashtags", [])
        quality = result.get("quality_score", 0)
        
        print(f"\n✅ Сгенерирован пост:")
        print(f"\n   {'─'*40}")
        print(f"   {content}")
        print(f"   {'─'*40}")
        print(f"\n   🏷️  Хештеги: {' '.join(['#'+h for h in hashtags])}")
        print(f"   📊 Качество: {quality:.0%}")
        print(f"   📏 Длина: {len(content)} символов")
        print(f"\n   Токены: {response.total_tokens}")
        
        return len(content) > 50
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False


async def test_summarize():
    """Тест суммаризации."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ: Суммаризация текста (YandexGPT)")
    print("="*60)
    
    try:
        provider = get_llm_provider("yandex")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False
    
    prompt = f"""
Создай краткое содержание текста.

Текст: {TEST_ARTICLE}

Максимум слов: 50
Стиль: brief (1-2 предложения)

Верни ТОЛЬКО валидный JSON:
{{
  "summary": "краткое содержание"
}}
"""
    
    try:
        response = await provider.complete(prompt)
        import json
        result = json.loads(response.content)
        
        summary = result.get("summary", "")
        word_count = len(summary.split())
        
        print(f"\n✅ Резюме:")
        print(f"\n   📝 {summary}")
        print(f"\n   📏 Слов: {word_count}")
        print(f"   Токены: {response.total_tokens}")
        
        return len(summary) > 10
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False


async def main():
    """Запуск всех тестов."""
    print("\n" + "🚀 AI ENGINE SERVICE - ТЕСТЫ С YANDEX GPT " + "🚀")
    print("="*60)
    
    # Проверяем переменные окружения
    api_key = os.environ.get("YANDEX_API_KEY", "")
    folder_id = os.environ.get("YANDEX_FOLDER_ID", "")
    
    if not api_key or not folder_id:
        print("\n⚠️  Переменные окружения не установлены!")
        print("   Установите YANDEX_API_KEY и YANDEX_FOLDER_ID")
        print("\n   Пример:")
        print("   export YANDEX_API_KEY='your-api-key'")
        print("   export YANDEX_FOLDER_ID='your-folder-id'")
        return
    
    print(f"\n✅ YANDEX_API_KEY: {api_key[:10]}...")
    print(f"✅ YANDEX_FOLDER_ID: {folder_id}")
    
    tests = [
        ("Анализ тональности", test_sentiment_analysis),
        ("Извлечение фактов", test_extract_facts),
        ("Извлечение сущностей", test_extract_entities),
        ("Извлечение цитат", test_extract_quotes),
        ("Генерация поста", test_generate_post),
        ("Суммаризация", test_summarize),
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = await test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Критическая ошибка в тесте {name}: {e}")
            results.append((name, False))
    
    # Итоги
    print("\n" + "="*60)
    print("📊 ИТОГИ ТЕСТИРОВАНИЯ")
    print("="*60)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {status}: {name}")
    
    print(f"\n   Всего: {passed}/{total} тестов пройдено")
    
    if passed == total:
        print("\n🎉 Все тесты успешно пройдены!")
    else:
        print(f"\n⚠️  {total - passed} тестов провалено")


if __name__ == "__main__":
    asyncio.run(main())

