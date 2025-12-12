"""AI Image generation for Media Service.

Поддерживаемые провайдеры:
- DALL-E 3 (OpenAI)
- Stable Diffusion XL (через Replicate)
- Kandinsky 3 (Yandex)
"""
import asyncio
import base64
from typing import List
from dataclasses import dataclass
import structlog

from openai import AsyncOpenAI
import httpx

from generated import media_pb2
from config import settings

logger = structlog.get_logger(__name__)


@dataclass
class GenerationResult:
    """Image generation result."""
    image_data: bytes
    model: str
    prompt_used: str
    cost: float


class ImageGenerator:
    """AI image generator with multiple providers."""
    
    def __init__(self):
        self.logger = logger.bind(service="image-generator")
        
        # OpenAI DALL-E client
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
    
    async def generate(
        self,
        prompt: str,
        provider: int,
        style: int,
        size: int,
        quality: int,
        negative_prompts: List[str] = None
    ) -> GenerationResult:
        """Generate image using specified provider."""
        
        # Enhance prompt with style
        enhanced_prompt = self._enhance_prompt(prompt, style)
        
        if provider == media_pb2.IMAGE_GENERATION_PROVIDER_DALLE:
            return await self._generate_dalle(enhanced_prompt, size, quality)
        
        elif provider == media_pb2.IMAGE_GENERATION_PROVIDER_STABLE_DIFFUSION:
            return await self._generate_stable_diffusion(enhanced_prompt, size, quality, negative_prompts)
        
        elif provider == media_pb2.IMAGE_GENERATION_PROVIDER_KANDINSKY:
            return await self._generate_kandinsky(enhanced_prompt, size, quality)
        
        else:
            # Default to DALL-E
            return await self._generate_dalle(enhanced_prompt, size, quality)
    
    def _enhance_prompt(self, prompt: str, style: int) -> str:
        """Add style keywords to prompt."""
        style_additions = {
            media_pb2.IMAGE_STYLE_PHOTOREALISTIC: ", photorealistic, high quality, detailed, 8k",
            media_pb2.IMAGE_STYLE_ILLUSTRATION: ", digital illustration, artistic, vibrant",
            media_pb2.IMAGE_STYLE_ABSTRACT: ", abstract art, modern, conceptual",
            media_pb2.IMAGE_STYLE_MINIMAL: ", minimal design, clean, simple",
            media_pb2.IMAGE_STYLE_ARTISTIC: ", artistic, expressive, creative"
        }
        
        return f"{prompt}{style_additions.get(style, '')}"
    
    def _get_size(self, size: int) -> str:
        """Convert size enum to dimensions."""
        sizes = {
            media_pb2.IMAGE_SIZE_SQUARE_1024: "1024x1024",
            media_pb2.IMAGE_SIZE_SQUARE_512: "1024x1024",  # DALL-E 3 min
            media_pb2.IMAGE_SIZE_LANDSCAPE: "1792x1024",
            media_pb2.IMAGE_SIZE_PORTRAIT: "1024x1792",
            media_pb2.IMAGE_SIZE_WIDE: "1792x1024"
        }
        return sizes.get(size, "1024x1024")
    
    # ============================================================
    # DALL-E 3 (OpenAI)
    # ============================================================
    
    async def _generate_dalle(self, prompt: str, size: int, quality: int) -> GenerationResult:
        """Generate image using DALL-E 3."""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")
        
        self.logger.info("Generating with DALL-E 3", prompt=prompt[:100])
        
        size_str = self._get_size(size)
        quality_str = "hd" if quality > 75 else "standard"
        
        response = await self.openai_client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size_str,
            quality=quality_str,
            n=1
        )
        
        image_url = response.data[0].url
        revised_prompt = response.data[0].revised_prompt or prompt
        
        # Download image
        async with httpx.AsyncClient() as client:
            img_response = await client.get(image_url, timeout=60.0)
            img_response.raise_for_status()
            image_data = img_response.content
        
        # Calculate cost
        cost = 0.04 if quality_str == "standard" else 0.08
        if size_str != "1024x1024":
            cost *= 1.5 if quality_str == "hd" else 2
        
        self.logger.info("DALL-E 3 done", cost=cost, size=len(image_data))
        
        return GenerationResult(image_data, "dall-e-3", revised_prompt, cost)
    
    # ============================================================
    # Stable Diffusion XL (через Replicate)
    # ============================================================
    
    async def _generate_stable_diffusion(self, prompt: str, size: int, quality: int, negative_prompts: List[str] = None) -> GenerationResult:
        """Generate image using Stable Diffusion XL via Replicate."""
        self.logger.info("Generating with Stable Diffusion XL", prompt=prompt[:100])
        
        # Replicate API
        replicate_token = getattr(settings, 'REPLICATE_API_TOKEN', None)
        if not replicate_token:
            raise ValueError("Replicate API token not configured")
        
        size_str = self._get_size(size)
        width, height = map(int, size_str.split("x"))
        
        headers = {
            "Authorization": f"Token {replicate_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "version": "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",  # SDXL
            "input": {
                "prompt": prompt,
                "negative_prompt": ", ".join(negative_prompts or ["low quality", "blurry"]),
                "width": min(width, 1024),
                "height": min(height, 1024),
                "num_outputs": 1,
                "guidance_scale": 7.5,
                "num_inference_steps": 50 if quality > 75 else 30
            }
        }
        
        async with httpx.AsyncClient() as client:
            # Create prediction
            response = await client.post("https://api.replicate.com/v1/predictions", headers=headers, json=data, timeout=10.0)
            response.raise_for_status()
            prediction = response.json()
            
            # Poll for result
            prediction_url = prediction["urls"]["get"]
            for _ in range(60):  # Max 60 seconds
                await asyncio.sleep(1)
                response = await client.get(prediction_url, headers=headers, timeout=10.0)
                result = response.json()
                
                if result["status"] == "succeeded":
                    image_url = result["output"][0]
                    break
                elif result["status"] == "failed":
                    raise Exception(f"Generation failed: {result.get('error')}")
            else:
                raise Exception("Generation timeout")
            
            # Download image
            img_response = await client.get(image_url, timeout=60.0)
            img_response.raise_for_status()
            image_data = img_response.content
        
        cost = 0.01  # ~$0.01 per generation on Replicate
        
        self.logger.info("Stable Diffusion done", cost=cost, size=len(image_data))
        
        return GenerationResult(image_data, "stable-diffusion-xl", prompt, cost)
    
    # ============================================================
    # Kandinsky 3 (Yandex)
    # ============================================================
    
    async def _generate_kandinsky(self, prompt: str, size: int, quality: int) -> GenerationResult:
        """Generate image using Kandinsky 3 (Yandex Art)."""
        self.logger.info("Generating with Kandinsky 3", prompt=prompt[:100])
        
        yandex_api_key = getattr(settings, 'YANDEX_API_KEY', None)
        yandex_folder_id = getattr(settings, 'YANDEX_FOLDER_ID', None)
        
        if not yandex_api_key or not yandex_folder_id:
            raise ValueError("Yandex API key or folder ID not configured")
        
        size_str = self._get_size(size)
        width, height = map(int, size_str.split("x"))
        
        headers = {
            "Authorization": f"Api-Key {yandex_api_key}",
            "x-folder-id": yandex_folder_id,
            "Content-Type": "application/json"
        }
        
        # Yandex Art API endpoint
        endpoint = "https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync"
        
        data = {
            "modelUri": f"art://{yandex_folder_id}/yandex-art/latest",
            "generationOptions": {
                "seed": None,
                "aspectRatio": {"widthRatio": width // 64, "heightRatio": height // 64}
            },
            "messages": [{"weight": 1, "text": prompt}]
        }
        
        async with httpx.AsyncClient() as client:
            # Start generation
            response = await client.post(endpoint, headers=headers, json=data, timeout=30.0)
            response.raise_for_status()
            operation = response.json()
            
            operation_id = operation.get("id")
            
            # Poll for result
            poll_url = f"https://llm.api.cloud.yandex.net/operations/{operation_id}"
            for _ in range(120):  # Max 2 minutes
                await asyncio.sleep(1)
                response = await client.get(poll_url, headers=headers, timeout=10.0)
                result = response.json()
                
                if result.get("done"):
                    if "response" in result:
                        image_base64 = result["response"]["image"]
                        image_data = base64.b64decode(image_base64)
                        break
                    else:
                        raise Exception(f"Generation failed: {result.get('error')}")
            else:
                raise Exception("Generation timeout")
        
        cost = 0.005  # ~$0.005 per generation
        
        self.logger.info("Kandinsky done", cost=cost, size=len(image_data))
        
        return GenerationResult(image_data, "kandinsky-3", prompt, cost)
