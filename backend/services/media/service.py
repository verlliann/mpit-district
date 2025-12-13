"""Media Service gRPC implementation."""
import io
import time
import uuid
from typing import AsyncIterator
import structlog

import grpc
from PIL import Image as PILImage

from generated import media_pb2, media_pb2_grpc
from generated import common_pb2, storage_pb2

from config import settings
from minio_client import MinioStorage
from image_processor import ImageProcessor
from image_generator import ImageGenerator

logger = structlog.get_logger(__name__)
SERVICE_START_TIME = time.time()


class MediaServicer(media_pb2_grpc.MediaServiceServicer):
    """Media gRPC Service."""
    
    def __init__(self, lazy_storage: bool = False):
        self.logger = logger.bind(service="media")
        self.version = "1.0.0"
        self.storage = MinioStorage(lazy_init=lazy_storage)
        self.processor = ImageProcessor()
        self.generator = ImageGenerator()
    
    # ============================================================
    # RPC METHODS
    # ============================================================
    
    async def HealthCheck(self, request, context):
        return common_pb2.HealthCheckResponse(
            status="serving",
            service="media",
            version=self.version
        )
    
    async def UploadImage(self, request_iterator: AsyncIterator, context) -> media_pb2.UploadImageResponse:
        """Upload image via streaming."""
        self.logger.info("UploadImage")
        
        try:
            metadata = None
            chunks = []
            
            async for request in request_iterator:
                if request.HasField("metadata"):
                    metadata = request.metadata
                elif request.chunk:
                    chunks.append(request.chunk)
            
            if not metadata:
                return media_pb2.UploadImageResponse(success=False, error="No metadata")
            
            image_data = b"".join(chunks)
            image_id = str(uuid.uuid4())
            
            storage_path = await self.storage.upload(
                data=image_data, filename=metadata.filename,
                content_type=metadata.mime_type, folder=metadata.article_id or "general"
            )
            
            pil_image = PILImage.open(io.BytesIO(image_data))
            width, height = pil_image.size
            url = await self.storage.get_url(storage_path)
            
            image = storage_pb2.Image(
                id=image_id, url=url, storage_path=storage_path,
                mime_type=metadata.mime_type, file_size_bytes=len(image_data), 
                width=width, height=height,
                alt_text=metadata.alt_text, caption=metadata.caption
            )
            
            self.logger.info("Uploaded", image_id=image_id, size=len(image_data))
            return media_pb2.UploadImageResponse(success=True, image=image)
            
        except Exception as e:
            self.logger.error("UploadImage failed", error=str(e))
            return media_pb2.UploadImageResponse(success=False, error=str(e))
    
    async def DownloadImage(self, request, context) -> AsyncIterator[media_pb2.DownloadImageResponse]:
        """Download image via streaming."""
        self.logger.info("DownloadImage", image_id=request.image_id)
        
        try:
            if request.url:
                data = await self.storage.download_from_url(request.url)
            else:
                data = await self.storage.download(request.image_id)
            
            chunk_size = settings.CHUNK_SIZE
            for i in range(0, len(data), chunk_size):
                yield media_pb2.DownloadImageResponse(chunk=data[i:i + chunk_size])
                
        except Exception as e:
            self.logger.error("DownloadImage failed", error=str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
    
    async def ProcessImage(self, request, context) -> media_pb2.ProcessImageResponse:
        """Process image with operations."""
        start = time.time()
        self.logger.info("ProcessImage", image_id=request.image_id)
        
        try:
            if request.image_data:
                image_data = request.image_data
            else:
                image_data = await self.storage.download(request.image_id)
            
            original_size = len(image_data)
            processed_data = await self.processor.process(image_data, list(request.operations))
            processed_size = len(processed_data)
            
            processing_time = int((time.time() - start) * 1000)
            compression_ratio = int((1 - processed_size / original_size) * 100) if original_size > 0 else 0
            
            metadata = media_pb2.ProcessingMetadata(
                original_size_bytes=original_size, processed_size_bytes=processed_size,
                compression_ratio_percent=compression_ratio, processing_time_ms=processing_time
            )
            
            self.logger.info("Processed", original=original_size, processed=processed_size)
            return media_pb2.ProcessImageResponse(success=True, processed_image=processed_data, metadata=metadata)
            
        except Exception as e:
            self.logger.error("ProcessImage failed", error=str(e))
            return media_pb2.ProcessImageResponse(success=False, error=str(e))
    
    async def GenerateImage(self, request, context) -> media_pb2.GenerateImageResponse:
        """Generate image using AI."""
        start = time.time()
        self.logger.info("GenerateImage", prompt=request.prompt[:100], provider=request.provider)
        
        try:
            result = await self.generator.generate(
                prompt=request.prompt,
                provider=request.provider,
                style=request.style,
                size=request.size,
                quality=request.quality or 85,
                negative_prompts=list(request.negative_prompts)
            )
            
            # Upload to storage
            image_id = str(uuid.uuid4())
            storage_path = await self.storage.upload(
                data=result.image_data, filename=f"{image_id}.png",
                content_type="image/png", folder=request.article_id or "generated"
            )
            url = await self.storage.get_url(storage_path)
            
            pil_image = PILImage.open(io.BytesIO(result.image_data))
            width, height = pil_image.size
            generation_time = int((time.time() - start) * 1000)
            
            image = storage_pb2.Image(
                id=image_id, url=url, storage_path=storage_path,
                mime_type="image/png", file_size_bytes=len(result.image_data), 
                width=width, height=height
            )
            
            metadata = media_pb2.ImageGenerationMetadata(
                provider=request.provider, model=result.model, prompt_used=result.prompt_used,
                generation_time_ms=generation_time, cost_usd=result.cost
            )
            
            self.logger.info("Generated", image_id=image_id, model=result.model, cost=result.cost)
            return media_pb2.GenerateImageResponse(success=True, image=image, metadata=metadata)
            
        except Exception as e:
            self.logger.error("GenerateImage failed", error=str(e))
            return media_pb2.GenerateImageResponse(success=False, error=str(e))
    
    async def CreateInfographic(self, request, context) -> media_pb2.CreateInfographicResponse:
        """Create infographic from elements."""
        self.logger.info("CreateInfographic", title=request.title)
        
        try:
            image_data = await self.processor.create_infographic(
                title=request.title, elements=list(request.elements),
                template=request.template, style=request.style
            )
            
            image_id = str(uuid.uuid4())
            storage_path = await self.storage.upload(
                data=image_data, filename=f"infographic_{image_id}.png",
                content_type="image/png", folder="infographics"
            )
            url = await self.storage.get_url(storage_path)
            
            pil_image = PILImage.open(io.BytesIO(image_data))
            width, height = pil_image.size
            
            image = storage_pb2.Image(
                id=image_id, url=url, storage_path=storage_path,
                mime_type="image/png", file_size_bytes=len(image_data), 
                width=width, height=height
            )
            
            return media_pb2.CreateInfographicResponse(success=True, image=image)
            
        except Exception as e:
            self.logger.error("CreateInfographic failed", error=str(e))
            return media_pb2.CreateInfographicResponse(success=False, error=str(e))
    
    async def OptimizeForPlatform(self, request, context) -> media_pb2.OptimizeForPlatformResponse:
        """Optimize image for platform."""
        self.logger.info("OptimizeForPlatform", platform=request.platform)
        
        try:
            if request.image_data:
                image_data = request.image_data
            else:
                image_data = await self.storage.download(request.image_id)
            
            specs = self._get_platform_specs(request.platform, request.image_type)
            
            optimized_data = await self.processor.optimize_for_platform(
                image_data=image_data, width=specs["width"], height=specs["height"],
                max_size=specs["max_size"], format=specs["format"], quality=specs["quality"]
            )
            
            optimization = media_pb2.PlatformOptimization(
                width=specs["width"], height=specs["height"], format=specs["format"],
                quality=specs["quality"], max_file_size=specs["max_size"], aspect_ratio=specs["aspect_ratio"]
            )
            
            return media_pb2.OptimizeForPlatformResponse(success=True, optimized_image=optimized_data, optimization=optimization)
            
        except Exception as e:
            self.logger.error("OptimizeForPlatform failed", error=str(e))
            return media_pb2.OptimizeForPlatformResponse(success=False, error=str(e))
    
    async def ExtractText(self, request, context) -> media_pb2.ExtractTextResponse:
        """Extract text from image (OCR)."""
        self.logger.info("ExtractText", image_id=request.image_id)
        
        try:
            if request.image_data:
                image_data = request.image_data
            else:
                image_data = await self.storage.download(request.image_id)
            
            result = await self.processor.extract_text(image_data, request.language or "rus+eng")
            
            regions = [
                media_pb2.TextRegion(
                    text=r["text"],
                    box=media_pb2.BoundingBox(x=r["box"]["x"], y=r["box"]["y"], width=r["box"]["width"], height=r["box"]["height"]),
                    confidence=r["confidence"]
                ) for r in result.get("regions", [])
            ]
            
            return media_pb2.ExtractTextResponse(success=True, text=result.get("text", ""), regions=regions, confidence=result.get("confidence", 0.0))
            
        except Exception as e:
            self.logger.error("ExtractText failed", error=str(e))
            return media_pb2.ExtractTextResponse(success=False, error=str(e))
    
    async def GetImageMetadata(self, request, context) -> media_pb2.GetImageMetadataResponse:
        """Get image metadata."""
        self.logger.info("GetImageMetadata", image_id=request.image_id)
        
        try:
            if request.url:
                image_data = await self.storage.download_from_url(request.url)
            else:
                image_data = await self.storage.download(request.image_id)
            
            meta = await self.processor.get_metadata(image_data)
            
            metadata = media_pb2.ImageMetadataInfo(
                filename=meta.get("filename", ""), mime_type=meta.get("mime_type", ""),
                file_size_bytes=len(image_data), width=meta.get("width", 0), height=meta.get("height", 0),
                format=meta.get("format", ""), color_space=meta.get("color_space", ""),
                has_alpha=meta.get("has_alpha", False), dpi=meta.get("dpi", 72), exif_data=meta.get("exif", {})
            )
            
            return media_pb2.GetImageMetadataResponse(success=True, metadata=metadata)
            
        except Exception as e:
            self.logger.error("GetImageMetadata failed", error=str(e))
            return media_pb2.GetImageMetadataResponse(success=False, error=str(e))
    
    # ============================================================
    # HELPERS
    # ============================================================
    
    def _get_platform_specs(self, platform: int, image_type: int) -> dict:
        """Get platform-specific specs."""
        specs = {"width": 1200, "height": 630, "max_size": 5 * 1024 * 1024, "format": "JPEG", "quality": 85, "aspect_ratio": "1.91:1"}
        
        platform_specs = {
            common_pb2.PLATFORM_TELEGRAM: {
                media_pb2.PLATFORM_IMAGE_TYPE_POST: {"width": 1280, "height": 720, "aspect_ratio": "16:9"},
                media_pb2.PLATFORM_IMAGE_TYPE_STORY: {"width": 1080, "height": 1920, "aspect_ratio": "9:16"}
            },
            common_pb2.PLATFORM_VK: {
                media_pb2.PLATFORM_IMAGE_TYPE_POST: {"width": 1200, "height": 630, "aspect_ratio": "1.91:1"},
                media_pb2.PLATFORM_IMAGE_TYPE_COVER: {"width": 1590, "height": 400, "aspect_ratio": "3.975:1"}
            },
            common_pb2.PLATFORM_INSTAGRAM: {
                media_pb2.PLATFORM_IMAGE_TYPE_POST: {"width": 1080, "height": 1080, "aspect_ratio": "1:1"},
                media_pb2.PLATFORM_IMAGE_TYPE_STORY: {"width": 1080, "height": 1920, "aspect_ratio": "9:16"}
            },
            common_pb2.PLATFORM_LINKEDIN: {
                media_pb2.PLATFORM_IMAGE_TYPE_POST: {"width": 1200, "height": 627, "aspect_ratio": "1.91:1"}
            }
        }
        
        if platform in platform_specs and image_type in platform_specs[platform]:
            specs.update(platform_specs[platform][image_type])
        
        return specs
