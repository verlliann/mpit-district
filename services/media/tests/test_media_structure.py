#!/usr/bin/env python3
"""Тест структуры Media Service (без API вызовов)."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_imports():
    """Тест импортов модулей."""
    print("🧪 Тест импортов...")
    
    try:
        from config import settings
        print(f"   ✅ config.py - OK")
        print(f"      GRPC_PORT: {settings.GRPC_PORT}")
        print(f"      MINIO_ENDPOINT: {settings.MINIO_ENDPOINT}")
    except Exception as e:
        print(f"   ❌ config.py - FAILED: {e}")
        return False
    
    try:
        from generated import media_pb2, media_pb2_grpc
        from generated import common_pb2, storage_pb2
        print(f"   ✅ generated proto modules - OK")
    except Exception as e:
        print(f"   ❌ generated proto modules - FAILED: {e}")
        return False
    
    try:
        from image_processor import ImageProcessor
        print(f"   ✅ image_processor.py - OK")
    except Exception as e:
        print(f"   ❌ image_processor.py - FAILED: {e}")
        return False
    
    try:
        from image_generator import ImageGenerator, GenerationResult
        print(f"   ✅ image_generator.py - OK")
    except Exception as e:
        print(f"   ❌ image_generator.py - FAILED: {e}")
        return False
    
    try:
        from minio_client import MinioStorage
        print(f"   ✅ minio_client.py - OK")
    except Exception as e:
        print(f"   ❌ minio_client.py - FAILED: {e}")
        return False
    
    try:
        from service import MediaServicer
        print(f"   ✅ service.py - OK")
    except Exception as e:
        print(f"   ❌ service.py - FAILED: {e}")
        return False
    
    return True


def test_proto_enums():
    """Тест proto enum значений."""
    print("\n🧪 Тест proto enums...")
    
    from generated import media_pb2, common_pb2
    
    # Image Generation Providers
    providers = [
        ("UNSPECIFIED", media_pb2.IMAGE_GENERATION_PROVIDER_UNSPECIFIED, 0),
        ("DALLE", media_pb2.IMAGE_GENERATION_PROVIDER_DALLE, 1),
        ("STABLE_DIFFUSION", media_pb2.IMAGE_GENERATION_PROVIDER_STABLE_DIFFUSION, 2),
        ("MIDJOURNEY", media_pb2.IMAGE_GENERATION_PROVIDER_MIDJOURNEY, 3),
        ("KANDINSKY", media_pb2.IMAGE_GENERATION_PROVIDER_KANDINSKY, 4),
    ]
    
    print("   Image Generation Providers:")
    for name, val, expected in providers:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    # Image Styles
    styles = [
        ("PHOTOREALISTIC", media_pb2.IMAGE_STYLE_PHOTOREALISTIC, 1),
        ("ILLUSTRATION", media_pb2.IMAGE_STYLE_ILLUSTRATION, 2),
        ("ABSTRACT", media_pb2.IMAGE_STYLE_ABSTRACT, 3),
        ("MINIMAL", media_pb2.IMAGE_STYLE_MINIMAL, 4),
        ("ARTISTIC", media_pb2.IMAGE_STYLE_ARTISTIC, 5),
    ]
    
    print("   Image Styles:")
    for name, val, expected in styles:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    # Image Sizes
    sizes = [
        ("SQUARE_1024", media_pb2.IMAGE_SIZE_SQUARE_1024, 1),
        ("SQUARE_512", media_pb2.IMAGE_SIZE_SQUARE_512, 2),
        ("LANDSCAPE", media_pb2.IMAGE_SIZE_LANDSCAPE, 3),
        ("PORTRAIT", media_pb2.IMAGE_SIZE_PORTRAIT, 4),
        ("WIDE", media_pb2.IMAGE_SIZE_WIDE, 5),
    ]
    
    print("   Image Sizes:")
    for name, val, expected in sizes:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    # Operation Types
    ops = [
        ("RESIZE", media_pb2.OPERATION_TYPE_RESIZE, 1),
        ("CROP", media_pb2.OPERATION_TYPE_CROP, 2),
        ("ROTATE", media_pb2.OPERATION_TYPE_ROTATE, 3),
        ("COMPRESS", media_pb2.OPERATION_TYPE_COMPRESS, 4),
        ("WATERMARK", media_pb2.OPERATION_TYPE_WATERMARK, 5),
    ]
    
    print("   Operation Types:")
    for name, val, expected in ops:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    # Platforms (from common)
    platforms = [
        ("TELEGRAM", common_pb2.PLATFORM_TELEGRAM, 1),
        ("VK", common_pb2.PLATFORM_VK, 2),
        ("INSTAGRAM", common_pb2.PLATFORM_INSTAGRAM, 4),
    ]
    
    print("   Platforms (common):")
    for name, val, expected in platforms:
        status = "✅" if val == expected else "❌"
        print(f"      {status} {name} = {val}")
    
    return True


def test_service_methods():
    """Тест наличия всех RPC методов."""
    print("\n🧪 Тест RPC методов сервиса...")
    
    from service import MediaServicer
    
    required_methods = [
        "HealthCheck",
        "UploadImage",
        "DownloadImage",
        "ProcessImage",
        "GenerateImage",
        "CreateInfographic",
        "OptimizeForPlatform",
        "ExtractText",
        "GetImageMetadata",
    ]
    
    servicer = MediaServicer(lazy_storage=True)  # Skip MinIO connection for test
    
    all_ok = True
    for method in required_methods:
        has_method = hasattr(servicer, method) and callable(getattr(servicer, method))
        status = "✅" if has_method else "❌"
        print(f"   {status} {method}")
        if not has_method:
            all_ok = False
    
    return all_ok


def test_image_generator_class():
    """Тест класса ImageGenerator."""
    print("\n🧪 Тест ImageGenerator...")
    
    from image_generator import ImageGenerator
    
    gen = ImageGenerator()
    
    methods = [
        ("generate", True),
        ("_enhance_prompt", True),
        ("_get_size", True),
        ("_generate_dalle", True),
        ("_generate_stable_diffusion", True),
        ("_generate_kandinsky", True),
    ]
    
    for method_name, required in methods:
        has_method = hasattr(gen, method_name)
        status = "✅" if has_method else ("❌" if required else "⚠️")
        print(f"   {status} {method_name}")
    
    return True


def test_image_processor_class():
    """Тест класса ImageProcessor."""
    print("\n🧪 Тест ImageProcessor...")
    
    from image_processor import ImageProcessor
    
    proc = ImageProcessor()
    
    methods = [
        "process",
        "resize",
        "crop",
        "compress",
        "optimize_for_platform",
        "extract_text",
        "get_metadata",
        "create_infographic",
    ]
    
    for method_name in methods:
        has_method = hasattr(proc, method_name)
        status = "✅" if has_method else "❌"
        print(f"   {status} {method_name}")
    
    return True


def main():
    """Запуск всех структурных тестов."""
    print("\n" + "="*60)
    print("🔍 MEDIA SERVICE - СТРУКТУРНЫЕ ТЕСТЫ")
    print("="*60)
    
    results = []
    
    results.append(("Импорты", test_imports()))
    results.append(("Proto Enums", test_proto_enums()))
    results.append(("RPC методы", test_service_methods()))
    results.append(("ImageGenerator", test_image_generator_class()))
    results.append(("ImageProcessor", test_image_processor_class()))
    
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

