"""Image processing utilities."""
import io
from typing import List, Dict, Any, Optional
import structlog
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import cv2
import numpy as np

from generated import media_pb2
from config import settings

logger = structlog.get_logger(__name__)


class ImageProcessor:
    """Image processing operations."""
    
    def __init__(self):
        self.logger = logger.bind(service="image-processor")
    
    async def process(
        self,
        image_data: bytes,
        operations: List[media_pb2.ImageOperation]
    ) -> bytes:
        """Process image with multiple operations."""
        try:
            # Load image
            img = Image.open(io.BytesIO(image_data))
            
            # Apply operations in sequence
            for operation in operations:
                op_type = operation.type
                params = dict(operation.params)
                
                if op_type == media_pb2.OPERATION_TYPE_RESIZE:
                    img = self._resize(img, params)
                elif op_type == media_pb2.OPERATION_TYPE_CROP:
                    img = self._crop(img, params)
                elif op_type == media_pb2.OPERATION_TYPE_ROTATE:
                    img = self._rotate(img, params)
                elif op_type == media_pb2.OPERATION_TYPE_COMPRESS:
                    img = self._compress(img, params)
                elif op_type == media_pb2.OPERATION_TYPE_WATERMARK:
                    img = self._add_watermark(img, params)
                elif op_type == media_pb2.OPERATION_TYPE_FILTER:
                    img = self._apply_filter(img, params)
                elif op_type == media_pb2.OPERATION_TYPE_FORMAT_CONVERT:
                    img = self._convert_format(img, params)
            
            # Convert to bytes
            output = io.BytesIO()
            format_type = img.format or "PNG"
            img.save(output, format=format_type, quality=settings.JPEG_QUALITY, optimize=True)
            
            return output.getvalue()
            
        except Exception as e:
            self.logger.error("Failed to process image", error=str(e))
            raise
    
    def _resize(self, img: Image.Image, params: Dict[str, str]) -> Image.Image:
        """Resize image."""
        width = int(params.get("width", img.width))
        height = int(params.get("height", img.height))
        maintain_aspect = params.get("maintain_aspect", "true").lower() == "true"
        
        if maintain_aspect:
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
        else:
            img = img.resize((width, height), Image.Resampling.LANCZOS)
        
        self.logger.info("Image resized", width=width, height=height)
        return img
    
    def _crop(self, img: Image.Image, params: Dict[str, str]) -> Image.Image:
        """Crop image."""
        x = int(params.get("x", 0))
        y = int(params.get("y", 0))
        width = int(params.get("width", img.width))
        height = int(params.get("height", img.height))
        
        img = img.crop((x, y, x + width, y + height))
        
        self.logger.info("Image cropped", x=x, y=y, width=width, height=height)
        return img
    
    def _rotate(self, img: Image.Image, params: Dict[str, str]) -> Image.Image:
        """Rotate image."""
        angle = float(params.get("angle", 0))
        expand = params.get("expand", "true").lower() == "true"
        
        img = img.rotate(angle, expand=expand, resample=Image.Resampling.BICUBIC)
        
        self.logger.info("Image rotated", angle=angle)
        return img
    
    def _compress(self, img: Image.Image, params: Dict[str, str]) -> Image.Image:
        """Compress image (quality adjustment)."""
        # This operation doesn't change the image itself,
        # but will be applied during save
        self.logger.info("Compression will be applied on save")
        return img
    
    def _add_watermark(self, img: Image.Image, params: Dict[str, str]) -> Image.Image:
        """Add watermark to image."""
        text = params.get("text", "© AI Newsmaker")
        position = params.get("position", "bottom-right")
        opacity = int(params.get("opacity", 128))
        
        # Create watermark layer
        watermark = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(watermark)
        
        # Try to use a font, fallback to default
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        margin = 20
        if position == "bottom-right":
            x = img.width - text_width - margin
            y = img.height - text_height - margin
        elif position == "bottom-left":
            x = margin
            y = img.height - text_height - margin
        elif position == "top-right":
            x = img.width - text_width - margin
            y = margin
        elif position == "top-left":
            x = margin
            y = margin
        else:  # center
            x = (img.width - text_width) // 2
            y = (img.height - text_height) // 2
        
        # Draw text with opacity
        draw.text((x, y), text, fill=(255, 255, 255, opacity), font=font)
        
        # Composite watermark on image
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        
        img = Image.alpha_composite(img, watermark)
        
        self.logger.info("Watermark added", text=text, position=position)
        return img
    
    def _apply_filter(self, img: Image.Image, params: Dict[str, str]) -> Image.Image:
        """Apply image filter."""
        filter_type = params.get("type", "none")
        
        if filter_type == "blur":
            radius = int(params.get("radius", 2))
            img = img.filter(ImageFilter.GaussianBlur(radius))
        elif filter_type == "sharpen":
            img = img.filter(ImageFilter.SHARPEN)
        elif filter_type == "enhance":
            factor = float(params.get("factor", 1.5))
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(factor)
        elif filter_type == "brightness":
            factor = float(params.get("factor", 1.2))
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(factor)
        elif filter_type == "contrast":
            factor = float(params.get("factor", 1.2))
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(factor)
        
        self.logger.info("Filter applied", filter_type=filter_type)
        return img
    
    def _convert_format(self, img: Image.Image, params: Dict[str, str]) -> Image.Image:
        """Convert image format."""
        target_format = params.get("format", "PNG").upper()
        
        if target_format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
            # Convert RGBA to RGB for JPEG
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
            img = background
        
        img.format = target_format
        
        self.logger.info("Format converted", format=target_format)
        return img
    
    async def optimize_for_platform(
        self,
        image_data: bytes,
        width: int,
        height: int,
        max_size: int,
        format: str = "JPEG",
        quality: int = 85
    ) -> bytes:
        """Optimize image for specific platform."""
        try:
            img = Image.open(io.BytesIO(image_data))
            
            # Resize to target dimensions
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
            
            # Convert format if needed
            if format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background
            
            # Save with quality adjustment to meet size limit
            output = io.BytesIO()
            current_quality = quality
            
            while current_quality > 10:
                output.seek(0)
                output.truncate()
                img.save(output, format=format, quality=current_quality, optimize=True)
                
                if output.tell() <= max_size:
                    break
                
                current_quality -= 5
            
            self.logger.info(
                "Image optimized for platform",
                width=width,
                height=height,
                final_quality=current_quality,
                final_size=output.tell()
            )
            
            return output.getvalue()
            
        except Exception as e:
            self.logger.error("Failed to optimize image", error=str(e))
            raise
    
    async def create_infographic(
        self,
        title: str,
        elements: List[media_pb2.InfographicElement],
        template: int,
        style: int
    ) -> bytes:
        """Create infographic from elements."""
        try:
            # Create canvas
            width, height = 1200, 1600
            img = Image.new("RGB", (width, height), color=(255, 255, 255))
            draw = ImageDraw.Draw(img)
            
            # Load fonts
            try:
                title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
                header_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
                text_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
            except:
                title_font = ImageFont.load_default()
                header_font = ImageFont.load_default()
                text_font = ImageFont.load_default()
            
            # Draw title
            y_offset = 50
            draw.text((width // 2, y_offset), title, fill=(0, 0, 0), font=title_font, anchor="mt")
            y_offset += 100
            
            # Sort elements by order
            sorted_elements = sorted(elements, key=lambda e: e.order)
            
            # Draw elements
            for element in sorted_elements:
                element_type = element.type
                content = element.content
                
                if element_type == media_pb2.ELEMENT_TYPE_HEADER:
                    draw.text((100, y_offset), content, fill=(0, 0, 0), font=header_font)
                    y_offset += 60
                elif element_type == media_pb2.ELEMENT_TYPE_FACT:
                    # Draw bullet point
                    draw.ellipse((100, y_offset + 5, 115, y_offset + 20), fill=(52, 152, 219))
                    # Draw text
                    draw.text((130, y_offset), content, fill=(0, 0, 0), font=text_font)
                    y_offset += 50
                elif element_type == media_pb2.ELEMENT_TYPE_STAT:
                    # Draw in a box
                    draw.rectangle((100, y_offset, width - 100, y_offset + 80), outline=(52, 152, 219), width=3)
                    draw.text((width // 2, y_offset + 40), content, fill=(52, 152, 219), font=header_font, anchor="mm")
                    y_offset += 100
                elif element_type == media_pb2.ELEMENT_TYPE_QUOTE:
                    # Draw quote with background
                    draw.rectangle((100, y_offset, width - 100, y_offset + 100), fill=(240, 240, 240))
                    draw.text((120, y_offset + 20), f'"{content}"', fill=(0, 0, 0), font=text_font)
                    y_offset += 120
            
            # Convert to bytes
            output = io.BytesIO()
            img.save(output, format="PNG", optimize=True)
            
            self.logger.info("Infographic created", title=title, elements_count=len(elements))
            
            return output.getvalue()
            
        except Exception as e:
            self.logger.error("Failed to create infographic", error=str(e))
            raise
    
    async def extract_text(
        self,
        image_data: bytes,
        language: str = "rus+eng"
    ) -> Dict[str, Any]:
        """Extract text from image using OCR."""
        try:
            # Note: This is a placeholder implementation
            # Real OCR would require tesseract or similar
            self.logger.info("OCR extraction requested", language=language)
            
            # Placeholder response
            return {
                "text": "",
                "regions": [],
                "confidence": 0.0
            }
            
        except Exception as e:
            self.logger.error("Failed to extract text", error=str(e))
            raise
    
    async def get_metadata(self, image_data: bytes) -> Dict[str, Any]:
        """Get image metadata."""
        try:
            img = Image.open(io.BytesIO(image_data))
            
            metadata = {
                "width": img.width,
                "height": img.height,
                "format": img.format or "Unknown",
                "mode": img.mode,
                "color_space": img.mode,
                "has_alpha": img.mode in ("RGBA", "LA"),
                "dpi": img.info.get("dpi", (72, 72))[0] if "dpi" in img.info else 72,
                "exif": {}
            }
            
            # Extract EXIF data if available
            if hasattr(img, "_getexif") and img._getexif():
                exif_data = img._getexif()
                for tag_id, value in exif_data.items():
                    metadata["exif"][str(tag_id)] = str(value)
            
            self.logger.info("Metadata extracted", format=metadata["format"], size=f"{metadata['width']}x{metadata['height']}")
            
            return metadata
            
        except Exception as e:
            self.logger.error("Failed to get metadata", error=str(e))
            raise
