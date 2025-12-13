#!/usr/bin/env python3
"""Тест структуры AI Engine Service (без API вызовов)."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_imports():
    """Тест импортов модулей."""
    print("🧪 Тест импортов...")
    
    try:
        from config import settings
        print(f"   ✅ config.py - OK")
        print(f"      DEFAULT_LLM_PROVIDER: {settings.DEFAULT_LLM_PROVIDER}")
        print(f"      OPENAI_MODEL: {settings.OPENAI_MODEL}")
        print(f"      ANTHROPIC_MODEL: {settings.ANTHROPIC_MODEL}")
        print(f"      YANDEX_MODEL: {settings.YANDEX_MODEL}")
    except Exception as e:
        print(f"   ❌ config.py - FAILED: {e}")
        return False
    
    try:
        from prompts import (
            ANALYZE_CONTENT_PROMPT,
            EXTRACT_FACTS_PROMPT,
            EXTRACT_ENTITIES_PROMPT,
            EXTRACT_QUOTES_PROMPT,
            ANALYZE_SENTIMENT_PROMPT,
            SUMMARIZE_PROMPT,
            GENERATE_POST_PROMPT,
        )
        print(f"   ✅ prompts.py - OK ({len(ANALYZE_CONTENT_PROMPT)} chars in main prompt)")
    except Exception as e:
        print(f"   ❌ prompts.py - FAILED: {e}")
        return False
    
    try:
        from llm_providers import (
            LLMProvider,
            LLMResponse,
            OpenAIProvider,
            AnthropicProvider,
            YandexGPTProvider,
            get_llm_provider,
        )
        print(f"   ✅ llm_providers.py - OK")
    except Exception as e:
        print(f"   ❌ llm_providers.py - FAILED: {e}")
        return False
    
    try:
        from generated import ai_engine_pb2, ai_engine_pb2_grpc
        from generated import common_pb2, storage_pb2
        print(f"   ✅ generated proto modules - OK")
    except Exception as e:
        print(f"   ❌ generated proto modules - FAILED: {e}")
        return False
    
    try:
        from service import AIEngineServicer
        print(f"   ✅ service.py - OK")
    except Exception as e:
        print(f"   ❌ service.py - FAILED: {e}")
        return False
    
    return True


def test_proto_enums():
    """Тест proto enum значений."""
    print("\n🧪 Тест proto enums...")
    
    from generated import ai_engine_pb2, common_pb2
    
    # LLM Providers
    providers = [
        ("UNSPECIFIED", ai_engine_pb2.LLM_PROVIDER_UNSPECIFIED, 0),
        ("OPENAI", ai_engine_pb2.LLM_PROVIDER_OPENAI, 1),
        ("ANTHROPIC", ai_engine_pb2.LLM_PROVIDER_ANTHROPIC, 2),
        ("YANDEX", ai_engine_pb2.LLM_PROVIDER_YANDEX, 3),
    ]
    
    print("   LLM Providers:")
    for name, val, expected in providers:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    # Platforms
    platforms = [
        ("TELEGRAM", common_pb2.PLATFORM_TELEGRAM, 1),
        ("VK", common_pb2.PLATFORM_VK, 2),
        ("INSTAGRAM", common_pb2.PLATFORM_INSTAGRAM, 4),
        ("LINKEDIN", common_pb2.PLATFORM_LINKEDIN, 5),
    ]
    
    print("   Platforms:")
    for name, val, expected in platforms:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    # Sentiments
    sentiments = [
        ("POSITIVE", common_pb2.SENTIMENT_POSITIVE, 1),
        ("NEUTRAL", common_pb2.SENTIMENT_NEUTRAL, 2),
        ("NEGATIVE", common_pb2.SENTIMENT_NEGATIVE, 3),
    ]
    
    print("   Sentiments:")
    for name, val, expected in sentiments:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    # Post Styles
    styles = [
        ("NEUTRAL", common_pb2.POST_STYLE_NEUTRAL, 1),
        ("FORMAL", common_pb2.POST_STYLE_FORMAL, 2),
        ("ENGAGING", common_pb2.POST_STYLE_ENGAGING, 3),
        ("INFORMAL", common_pb2.POST_STYLE_INFORMAL, 4),
        ("BUSINESS", common_pb2.POST_STYLE_BUSINESS, 5),
        ("CREATIVE", common_pb2.POST_STYLE_CREATIVE, 6),
    ]
    
    print("   Post Styles:")
    for name, val, expected in styles:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    # Entity Types
    entities = [
        ("PERSON", common_pb2.ENTITY_TYPE_PERSON, 1),
        ("ORGANIZATION", common_pb2.ENTITY_TYPE_ORGANIZATION, 2),
        ("LOCATION", common_pb2.ENTITY_TYPE_LOCATION, 3),
        ("EVENT", common_pb2.ENTITY_TYPE_EVENT, 4),
        ("PRODUCT", common_pb2.ENTITY_TYPE_PRODUCT, 5),
        ("OTHER", common_pb2.ENTITY_TYPE_OTHER, 6),
    ]
    
    print("   Entity Types:")
    for name, val, expected in entities:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    return True


def test_service_methods():
    """Тест наличия всех RPC методов."""
    print("\n🧪 Тест RPC методов сервиса...")
    
    from service import AIEngineServicer
    
    required_methods = [
        "HealthCheck",
        "AnalyzeContent",
        "GeneratePosts",
        "GeneratePost",
        "RegeneratePost",
        "ExtractFacts",
        "ExtractEntities",
        "ExtractQuotes",
        "AnalyzeSentiment",
        "Summarize",
    ]
    
    servicer = AIEngineServicer()
    
    all_ok = True
    for method in required_methods:
        has_method = hasattr(servicer, method) and callable(getattr(servicer, method))
        status = "✅" if has_method else "❌"
        print(f"   {status} {method}")
        if not has_method:
            all_ok = False
    
    return all_ok


def test_provider_classes():
    """Тест классов провайдеров."""
    print("\n🧪 Тест классов LLM провайдеров...")
    
    from llm_providers import OpenAIProvider, AnthropicProvider, YandexGPTProvider
    
    providers = [
        ("OpenAI", OpenAIProvider, "gpt-4o"),
        ("Anthropic", AnthropicProvider, "claude-sonnet-4-20250514"),
        ("YandexGPT", YandexGPTProvider, "yandexgpt-lite"),
    ]
    
    for name, cls, expected_model in providers:
        try:
            # Не создаем инстанс - просто проверяем класс
            has_complete = hasattr(cls, 'complete')
            has_models = hasattr(cls, 'MODELS')
            
            print(f"   ✅ {name}Provider:")
            print(f"      - has complete(): {has_complete}")
            print(f"      - has MODELS: {has_models}")
            if has_models:
                print(f"      - models: {list(cls.MODELS.keys())}")
        except Exception as e:
            print(f"   ❌ {name}Provider: {e}")
    
    return True


def main():
    """Запуск всех структурных тестов."""
    print("\n" + "="*60)
    print("🔍 AI ENGINE SERVICE - СТРУКТУРНЫЕ ТЕСТЫ")
    print("="*60)
    
    results = []
    
    results.append(("Импорты", test_imports()))
    results.append(("Proto Enums", test_proto_enums()))
    results.append(("RPC методы", test_service_methods()))
    results.append(("LLM провайдеры", test_provider_classes()))
    
    print("\n" + "="*60)
    print("📊 ИТОГИ")
    print("="*60)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {status}: {name}")
    
    print(f"\n   Всего: {passed}/{total}")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

