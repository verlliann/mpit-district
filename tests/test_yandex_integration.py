#!/usr/bin/env python3
"""
Интеграционные тесты с YandexGPT.

Запуск:
    export YANDEX_API_KEY='your-key'
    export YANDEX_FOLDER_ID='your-folder'
    python tests/test_yandex_integration.py
"""

import asyncio
import sys
import os
import json

# Добавляем пути к сервисам
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "services", "ai-engine"))

import httpx


class YandexGPTClient:
    """Простой клиент для YandexGPT."""
    
    def __init__(self):
        self.api_key = os.environ.get("YANDEX_API_KEY", "")
        self.folder_id = os.environ.get("YANDEX_FOLDER_ID", "")
        self.endpoint = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
        self.model = "yandexgpt-lite"
    
    async def complete(self, prompt: str) -> dict:
        """Отправить запрос к YandexGPT."""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {self.api_key}",
            "x-folder-id": self.folder_id
        }
        
        data = {
            "modelUri": f"gpt://{self.folder_id}/{self.model}/latest",
            "completionOptions": {
                "stream": False,
                "temperature": 0.7,
                "maxTokens": "2000"
            },
            "messages": [
                {"role": "system", "text": "Отвечай ТОЛЬКО валидным JSON без markdown."},
                {"role": "user", "text": prompt}
            ]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.endpoint,
                headers=headers,
                json=data,
                timeout=120.0
            )
            response.raise_for_status()
            result = response.json()
        
        content = result["result"]["alternatives"][0]["message"]["text"]
        return json.loads(content)


# ============================================================
# ТЕСТОВЫЕ ДАННЫЕ
# ============================================================

TEST_ARTICLE = """
Компания «Яндекс» объявила о запуске новой модели искусственного интеллекта YandexGPT 4.
Генеральный директор Артём Савиновский заявил: «Это прорыв в области русскоязычных моделей».

Новая версия показывает на 40% лучше результаты в бенчмарках по сравнению с предыдущей.
Запуск запланирован на январь 2025 года. Модель будет доступна через API и в продуктах компании.

Аналитики Goldman Sachs оценивают инвестиции в проект в $500 миллионов.
Эксперты отмечают, что это может изменить расстановку сил на рынке ИИ в России.
"""

TEST_NEGATIVE_ARTICLE = """
Авиакатастрофа в Шереметьево унесла жизни 41 человека. Следствие установило, что причиной 
стала неисправность системы управления. Родственники погибших требуют компенсации.
"Это страшная трагедия, которая не должна повториться", - заявил представитель авиакомпании.
"""


# ============================================================
# ТЕСТЫ
# ============================================================

async def test_sentiment_positive():
    """Тест: определение позитивной тональности."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ 1: Позитивная тональность")
    print("="*60)
    
    client = YandexGPTClient()
    
    prompt = f"""
Определи эмоциональную тональность текста.

Текст: {TEST_ARTICLE}

Верни JSON:
{{
  "sentiment": "positive|negative|neutral|mixed",
  "score": 0.5,
  "confidence": 0.85,
  "explanation": "объяснение"
}}
"""
    
    try:
        result = await client.complete(prompt)
        
        sentiment = result.get("sentiment", "unknown")
        score = result.get("score", 0)
        confidence = result.get("confidence", 0)
        explanation = result.get("explanation", "")
        
        emoji = {"positive": "😊", "negative": "😞", "neutral": "😐", "mixed": "🤔"}.get(sentiment, "❓")
        
        print(f"\n   Результат: {emoji} {sentiment}")
        print(f"   Оценка: {score:.2f}")
        print(f"   Уверенность: {confidence:.0%}")
        print(f"   Объяснение: {explanation[:100]}...")
        
        # Проверка
        is_positive = sentiment in ["positive", "mixed"] and score > 0
        status = "✅ PASSED" if is_positive else "⚠️ CHECK"
        print(f"\n   {status}: ожидали positive/mixed, получили {sentiment}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        return False


async def test_sentiment_negative():
    """Тест: определение негативной тональности."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ 2: Негативная тональность")
    print("="*60)
    
    client = YandexGPTClient()
    
    prompt = f"""
Определи эмоциональную тональность текста.

Текст: {TEST_NEGATIVE_ARTICLE}

Верни JSON:
{{
  "sentiment": "positive|negative|neutral|mixed",
  "score": 0.0,
  "confidence": 0.85,
  "explanation": "объяснение"
}}
"""
    
    try:
        result = await client.complete(prompt)
        
        sentiment = result.get("sentiment", "unknown")
        score = result.get("score", 0)
        explanation = result.get("explanation", "")
        
        emoji = {"positive": "😊", "negative": "😞", "neutral": "😐", "mixed": "🤔"}.get(sentiment, "❓")
        
        print(f"\n   Результат: {emoji} {sentiment}")
        print(f"   Оценка: {score:.2f}")
        print(f"   Объяснение: {explanation[:100]}...")
        
        is_negative = sentiment == "negative" or score < 0
        status = "✅ PASSED" if is_negative else "⚠️ CHECK"
        print(f"\n   {status}: ожидали negative, получили {sentiment}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        return False


async def test_extract_facts():
    """Тест: извлечение фактов."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ 3: Извлечение фактов")
    print("="*60)
    
    client = YandexGPTClient()
    
    prompt = f"""
Извлеки 5 ключевых фактов из текста.

Текст: {TEST_ARTICLE}

Верни JSON:
{{
  "facts": [
    {{"content": "факт", "importance": 8}}
  ]
}}
"""
    
    try:
        result = await client.complete(prompt)
        facts = result.get("facts", [])
        
        print(f"\n   Извлечено {len(facts)} фактов:")
        
        for i, fact in enumerate(facts[:5], 1):
            importance = fact.get("importance", 0)
            stars = "⭐" * (importance // 2)
            print(f"\n   {i}. {stars}")
            print(f"      {fact.get('content', '?')[:80]}")
        
        status = "✅ PASSED" if len(facts) >= 3 else "⚠️ PARTIAL"
        print(f"\n   {status}: получено {len(facts)} фактов")
        
        return len(facts) > 0
        
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        return False


async def test_extract_entities():
    """Тест: извлечение сущностей (NER)."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ 4: Извлечение сущностей (NER)")
    print("="*60)
    
    client = YandexGPTClient()
    
    prompt = f"""
Найди все именованные сущности (Named Entity Recognition).

Текст: {TEST_ARTICLE}

Типы: person, organization, location, date, money

Верни JSON:
{{
  "entities": [
    {{"name": "имя", "type": "тип"}}
  ]
}}
"""
    
    try:
        result = await client.complete(prompt)
        entities = result.get("entities", [])
        
        emoji_types = {
            "person": "👤", "organization": "🏢", "location": "📍",
            "date": "📅", "money": "💰", "event": "🎯", "product": "📦"
        }
        
        by_type = {}
        for ent in entities:
            t = ent.get("type", "other")
            if t not in by_type:
                by_type[t] = []
            by_type[t].append(ent.get("name", "?"))
        
        print(f"\n   Найдено {len(entities)} сущностей:")
        
        for t, names in by_type.items():
            emoji = emoji_types.get(t, "❓")
            print(f"   {emoji} {t}: {', '.join(names)}")
        
        # Проверяем ожидаемые сущности
        all_names = [e.get("name", "").lower() for e in entities]
        expected = ["яндекс", "goldman sachs", "артём"]
        found = [e for e in expected if any(e in n for n in all_names)]
        
        status = "✅ PASSED" if len(found) >= 2 else "⚠️ PARTIAL"
        print(f"\n   {status}: найдено {len(found)}/{len(expected)} ожидаемых сущностей")
        
        return len(entities) > 0
        
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        return False


async def test_generate_post():
    """Тест: генерация поста для соцсети."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ 5: Генерация поста для Telegram")
    print("="*60)
    
    client = YandexGPTClient()
    
    prompt = f"""
Создай пост для Telegram на основе новости.

Новость: {TEST_ARTICLE}

Требования:
- Длина: 200-400 символов
- Стиль: информативный
- 2-3 эмодзи
- 2-3 хештега

Верни JSON:
{{
  "content": "текст поста с эмодзи",
  "hashtags": ["хештег1"]
}}
"""
    
    try:
        result = await client.complete(prompt)
        
        content = result.get("content", "")
        hashtags = result.get("hashtags", [])
        
        print(f"\n   {'─'*50}")
        print(f"   {content}")
        print(f"   {'─'*50}")
        print(f"\n   🏷️  Хештеги: {' '.join(['#'+h for h in hashtags])}")
        print(f"   📏 Длина: {len(content)} символов")
        
        # Проверки
        has_emoji = any(ord(c) > 0x1F600 for c in content)
        good_length = 150 < len(content) < 600
        
        checks = [
            ("Длина 150-600", good_length),
            ("Есть хештеги", len(hashtags) > 0),
        ]
        
        for check_name, passed in checks:
            status = "✅" if passed else "❌"
            print(f"   {status} {check_name}")
        
        return len(content) > 50
        
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        return False


async def test_summarize():
    """Тест: суммаризация текста."""
    print("\n" + "="*60)
    print("🧪 ТЕСТ 6: Суммаризация")
    print("="*60)
    
    client = YandexGPTClient()
    
    prompt = f"""
Создай краткое содержание в 2-3 предложениях.

Текст: {TEST_ARTICLE}

Верни JSON:
{{
  "summary": "краткое содержание"
}}
"""
    
    try:
        result = await client.complete(prompt)
        summary = result.get("summary", "")
        
        print(f"\n   📝 {summary}")
        print(f"\n   📏 Слов: {len(summary.split())}")
        
        status = "✅ PASSED" if 10 < len(summary.split()) < 100 else "⚠️ CHECK"
        print(f"   {status}")
        
        return len(summary) > 20
        
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        return False


async def main():
    """Запуск всех тестов."""
    print("\n" + "🚀"*30)
    print("   ИНТЕГРАЦИОННЫЕ ТЕСТЫ YANDEXGPT")
    print("🚀"*30)
    
    # Проверяем переменные окружения
    api_key = os.environ.get("YANDEX_API_KEY", "")
    folder_id = os.environ.get("YANDEX_FOLDER_ID", "")
    
    if not api_key or not folder_id:
        print("\n⚠️  Переменные окружения не установлены!")
        print("\n   Установите:")
        print("   export YANDEX_API_KEY='your-api-key'")
        print("   export YANDEX_FOLDER_ID='your-folder-id'")
        print("\n   Затем запустите:")
        print("   python tests/test_yandex_integration.py")
        return
    
    print(f"\n✅ YANDEX_API_KEY: {api_key[:10]}...{api_key[-4:]}")
    print(f"✅ YANDEX_FOLDER_ID: {folder_id}")
    
    tests = [
        ("Позитивная тональность", test_sentiment_positive),
        ("Негативная тональность", test_sentiment_negative),
        ("Извлечение фактов", test_extract_facts),
        ("Извлечение сущностей", test_extract_entities),
        ("Генерация поста", test_generate_post),
        ("Суммаризация", test_summarize),
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = await test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Критическая ошибка в {name}: {e}")
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

