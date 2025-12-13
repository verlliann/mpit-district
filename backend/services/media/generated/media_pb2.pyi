import common_pb2 as _common_pb2
import storage_pb2 as _storage_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class OperationType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    OPERATION_TYPE_UNSPECIFIED: _ClassVar[OperationType]
    OPERATION_TYPE_RESIZE: _ClassVar[OperationType]
    OPERATION_TYPE_CROP: _ClassVar[OperationType]
    OPERATION_TYPE_ROTATE: _ClassVar[OperationType]
    OPERATION_TYPE_COMPRESS: _ClassVar[OperationType]
    OPERATION_TYPE_WATERMARK: _ClassVar[OperationType]
    OPERATION_TYPE_FILTER: _ClassVar[OperationType]
    OPERATION_TYPE_FORMAT_CONVERT: _ClassVar[OperationType]

class ImageGenerationProvider(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    IMAGE_GENERATION_PROVIDER_UNSPECIFIED: _ClassVar[ImageGenerationProvider]
    IMAGE_GENERATION_PROVIDER_DALLE: _ClassVar[ImageGenerationProvider]
    IMAGE_GENERATION_PROVIDER_STABLE_DIFFUSION: _ClassVar[ImageGenerationProvider]
    IMAGE_GENERATION_PROVIDER_MIDJOURNEY: _ClassVar[ImageGenerationProvider]
    IMAGE_GENERATION_PROVIDER_KANDINSKY: _ClassVar[ImageGenerationProvider]

class ImageStyle(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    IMAGE_STYLE_UNSPECIFIED: _ClassVar[ImageStyle]
    IMAGE_STYLE_PHOTOREALISTIC: _ClassVar[ImageStyle]
    IMAGE_STYLE_ILLUSTRATION: _ClassVar[ImageStyle]
    IMAGE_STYLE_ABSTRACT: _ClassVar[ImageStyle]
    IMAGE_STYLE_MINIMAL: _ClassVar[ImageStyle]
    IMAGE_STYLE_ARTISTIC: _ClassVar[ImageStyle]

class ImageSize(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    IMAGE_SIZE_UNSPECIFIED: _ClassVar[ImageSize]
    IMAGE_SIZE_SQUARE_1024: _ClassVar[ImageSize]
    IMAGE_SIZE_SQUARE_512: _ClassVar[ImageSize]
    IMAGE_SIZE_LANDSCAPE: _ClassVar[ImageSize]
    IMAGE_SIZE_PORTRAIT: _ClassVar[ImageSize]
    IMAGE_SIZE_WIDE: _ClassVar[ImageSize]

class ElementType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    ELEMENT_TYPE_UNSPECIFIED: _ClassVar[ElementType]
    ELEMENT_TYPE_HEADER: _ClassVar[ElementType]
    ELEMENT_TYPE_FACT: _ClassVar[ElementType]
    ELEMENT_TYPE_STAT: _ClassVar[ElementType]
    ELEMENT_TYPE_QUOTE: _ClassVar[ElementType]
    ELEMENT_TYPE_IMAGE: _ClassVar[ElementType]

class InfographicTemplate(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    INFOGRAPHIC_TEMPLATE_UNSPECIFIED: _ClassVar[InfographicTemplate]
    INFOGRAPHIC_TEMPLATE_MODERN: _ClassVar[InfographicTemplate]
    INFOGRAPHIC_TEMPLATE_MINIMAL: _ClassVar[InfographicTemplate]
    INFOGRAPHIC_TEMPLATE_BOLD: _ClassVar[InfographicTemplate]
    INFOGRAPHIC_TEMPLATE_ELEGANT: _ClassVar[InfographicTemplate]

class InfographicStyle(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    INFOGRAPHIC_STYLE_UNSPECIFIED: _ClassVar[InfographicStyle]
    INFOGRAPHIC_STYLE_NEWS: _ClassVar[InfographicStyle]
    INFOGRAPHIC_STYLE_BUSINESS: _ClassVar[InfographicStyle]
    INFOGRAPHIC_STYLE_TECH: _ClassVar[InfographicStyle]
    INFOGRAPHIC_STYLE_SOCIAL: _ClassVar[InfographicStyle]

class PlatformImageType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    PLATFORM_IMAGE_TYPE_UNSPECIFIED: _ClassVar[PlatformImageType]
    PLATFORM_IMAGE_TYPE_POST: _ClassVar[PlatformImageType]
    PLATFORM_IMAGE_TYPE_STORY: _ClassVar[PlatformImageType]
    PLATFORM_IMAGE_TYPE_COVER: _ClassVar[PlatformImageType]
    PLATFORM_IMAGE_TYPE_PROFILE: _ClassVar[PlatformImageType]
OPERATION_TYPE_UNSPECIFIED: OperationType
OPERATION_TYPE_RESIZE: OperationType
OPERATION_TYPE_CROP: OperationType
OPERATION_TYPE_ROTATE: OperationType
OPERATION_TYPE_COMPRESS: OperationType
OPERATION_TYPE_WATERMARK: OperationType
OPERATION_TYPE_FILTER: OperationType
OPERATION_TYPE_FORMAT_CONVERT: OperationType
IMAGE_GENERATION_PROVIDER_UNSPECIFIED: ImageGenerationProvider
IMAGE_GENERATION_PROVIDER_DALLE: ImageGenerationProvider
IMAGE_GENERATION_PROVIDER_STABLE_DIFFUSION: ImageGenerationProvider
IMAGE_GENERATION_PROVIDER_MIDJOURNEY: ImageGenerationProvider
IMAGE_GENERATION_PROVIDER_KANDINSKY: ImageGenerationProvider
IMAGE_STYLE_UNSPECIFIED: ImageStyle
IMAGE_STYLE_PHOTOREALISTIC: ImageStyle
IMAGE_STYLE_ILLUSTRATION: ImageStyle
IMAGE_STYLE_ABSTRACT: ImageStyle
IMAGE_STYLE_MINIMAL: ImageStyle
IMAGE_STYLE_ARTISTIC: ImageStyle
IMAGE_SIZE_UNSPECIFIED: ImageSize
IMAGE_SIZE_SQUARE_1024: ImageSize
IMAGE_SIZE_SQUARE_512: ImageSize
IMAGE_SIZE_LANDSCAPE: ImageSize
IMAGE_SIZE_PORTRAIT: ImageSize
IMAGE_SIZE_WIDE: ImageSize
ELEMENT_TYPE_UNSPECIFIED: ElementType
ELEMENT_TYPE_HEADER: ElementType
ELEMENT_TYPE_FACT: ElementType
ELEMENT_TYPE_STAT: ElementType
ELEMENT_TYPE_QUOTE: ElementType
ELEMENT_TYPE_IMAGE: ElementType
INFOGRAPHIC_TEMPLATE_UNSPECIFIED: InfographicTemplate
INFOGRAPHIC_TEMPLATE_MODERN: InfographicTemplate
INFOGRAPHIC_TEMPLATE_MINIMAL: InfographicTemplate
INFOGRAPHIC_TEMPLATE_BOLD: InfographicTemplate
INFOGRAPHIC_TEMPLATE_ELEGANT: InfographicTemplate
INFOGRAPHIC_STYLE_UNSPECIFIED: InfographicStyle
INFOGRAPHIC_STYLE_NEWS: InfographicStyle
INFOGRAPHIC_STYLE_BUSINESS: InfographicStyle
INFOGRAPHIC_STYLE_TECH: InfographicStyle
INFOGRAPHIC_STYLE_SOCIAL: InfographicStyle
PLATFORM_IMAGE_TYPE_UNSPECIFIED: PlatformImageType
PLATFORM_IMAGE_TYPE_POST: PlatformImageType
PLATFORM_IMAGE_TYPE_STORY: PlatformImageType
PLATFORM_IMAGE_TYPE_COVER: PlatformImageType
PLATFORM_IMAGE_TYPE_PROFILE: PlatformImageType

class UploadImageRequest(_message.Message):
    __slots__ = ("metadata", "chunk")
    METADATA_FIELD_NUMBER: _ClassVar[int]
    CHUNK_FIELD_NUMBER: _ClassVar[int]
    metadata: ImageMetadata
    chunk: bytes
    def __init__(self, metadata: _Optional[_Union[ImageMetadata, _Mapping]] = ..., chunk: _Optional[bytes] = ...) -> None: ...

class ImageMetadata(_message.Message):
    __slots__ = ("filename", "mime_type", "file_size", "article_id", "alt_text", "caption")
    FILENAME_FIELD_NUMBER: _ClassVar[int]
    MIME_TYPE_FIELD_NUMBER: _ClassVar[int]
    FILE_SIZE_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    ALT_TEXT_FIELD_NUMBER: _ClassVar[int]
    CAPTION_FIELD_NUMBER: _ClassVar[int]
    filename: str
    mime_type: str
    file_size: int
    article_id: str
    alt_text: str
    caption: str
    def __init__(self, filename: _Optional[str] = ..., mime_type: _Optional[str] = ..., file_size: _Optional[int] = ..., article_id: _Optional[str] = ..., alt_text: _Optional[str] = ..., caption: _Optional[str] = ...) -> None: ...

class UploadImageResponse(_message.Message):
    __slots__ = ("success", "error", "image")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    image: _storage_pb2.Image
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., image: _Optional[_Union[_storage_pb2.Image, _Mapping]] = ...) -> None: ...

class DownloadImageRequest(_message.Message):
    __slots__ = ("image_id", "url")
    IMAGE_ID_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    image_id: str
    url: str
    def __init__(self, image_id: _Optional[str] = ..., url: _Optional[str] = ...) -> None: ...

class DownloadImageResponse(_message.Message):
    __slots__ = ("chunk",)
    CHUNK_FIELD_NUMBER: _ClassVar[int]
    chunk: bytes
    def __init__(self, chunk: _Optional[bytes] = ...) -> None: ...

class ProcessImageRequest(_message.Message):
    __slots__ = ("image_id", "image_data", "operations")
    IMAGE_ID_FIELD_NUMBER: _ClassVar[int]
    IMAGE_DATA_FIELD_NUMBER: _ClassVar[int]
    OPERATIONS_FIELD_NUMBER: _ClassVar[int]
    image_id: str
    image_data: bytes
    operations: _containers.RepeatedCompositeFieldContainer[ImageOperation]
    def __init__(self, image_id: _Optional[str] = ..., image_data: _Optional[bytes] = ..., operations: _Optional[_Iterable[_Union[ImageOperation, _Mapping]]] = ...) -> None: ...

class ImageOperation(_message.Message):
    __slots__ = ("type", "params")
    class ParamsEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    TYPE_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    type: OperationType
    params: _containers.ScalarMap[str, str]
    def __init__(self, type: _Optional[_Union[OperationType, str]] = ..., params: _Optional[_Mapping[str, str]] = ...) -> None: ...

class ProcessImageResponse(_message.Message):
    __slots__ = ("success", "error", "processed_image", "image", "metadata")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    PROCESSED_IMAGE_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    processed_image: bytes
    image: _storage_pb2.Image
    metadata: ProcessingMetadata
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., processed_image: _Optional[bytes] = ..., image: _Optional[_Union[_storage_pb2.Image, _Mapping]] = ..., metadata: _Optional[_Union[ProcessingMetadata, _Mapping]] = ...) -> None: ...

class ProcessingMetadata(_message.Message):
    __slots__ = ("original_size_bytes", "processed_size_bytes", "compression_ratio_percent", "processing_time_ms")
    ORIGINAL_SIZE_BYTES_FIELD_NUMBER: _ClassVar[int]
    PROCESSED_SIZE_BYTES_FIELD_NUMBER: _ClassVar[int]
    COMPRESSION_RATIO_PERCENT_FIELD_NUMBER: _ClassVar[int]
    PROCESSING_TIME_MS_FIELD_NUMBER: _ClassVar[int]
    original_size_bytes: int
    processed_size_bytes: int
    compression_ratio_percent: int
    processing_time_ms: int
    def __init__(self, original_size_bytes: _Optional[int] = ..., processed_size_bytes: _Optional[int] = ..., compression_ratio_percent: _Optional[int] = ..., processing_time_ms: _Optional[int] = ...) -> None: ...

class GenerateImageRequest(_message.Message):
    __slots__ = ("prompt", "provider", "style", "size", "quality", "article_id", "negative_prompts")
    PROMPT_FIELD_NUMBER: _ClassVar[int]
    PROVIDER_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    SIZE_FIELD_NUMBER: _ClassVar[int]
    QUALITY_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    NEGATIVE_PROMPTS_FIELD_NUMBER: _ClassVar[int]
    prompt: str
    provider: ImageGenerationProvider
    style: ImageStyle
    size: ImageSize
    quality: int
    article_id: str
    negative_prompts: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, prompt: _Optional[str] = ..., provider: _Optional[_Union[ImageGenerationProvider, str]] = ..., style: _Optional[_Union[ImageStyle, str]] = ..., size: _Optional[_Union[ImageSize, str]] = ..., quality: _Optional[int] = ..., article_id: _Optional[str] = ..., negative_prompts: _Optional[_Iterable[str]] = ...) -> None: ...

class GenerateImageResponse(_message.Message):
    __slots__ = ("success", "error", "image", "metadata")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    image: _storage_pb2.Image
    metadata: ImageGenerationMetadata
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., image: _Optional[_Union[_storage_pb2.Image, _Mapping]] = ..., metadata: _Optional[_Union[ImageGenerationMetadata, _Mapping]] = ...) -> None: ...

class ImageGenerationMetadata(_message.Message):
    __slots__ = ("provider", "model", "prompt_used", "generation_time_ms", "cost_usd")
    PROVIDER_FIELD_NUMBER: _ClassVar[int]
    MODEL_FIELD_NUMBER: _ClassVar[int]
    PROMPT_USED_FIELD_NUMBER: _ClassVar[int]
    GENERATION_TIME_MS_FIELD_NUMBER: _ClassVar[int]
    COST_USD_FIELD_NUMBER: _ClassVar[int]
    provider: ImageGenerationProvider
    model: str
    prompt_used: str
    generation_time_ms: int
    cost_usd: float
    def __init__(self, provider: _Optional[_Union[ImageGenerationProvider, str]] = ..., model: _Optional[str] = ..., prompt_used: _Optional[str] = ..., generation_time_ms: _Optional[int] = ..., cost_usd: _Optional[float] = ...) -> None: ...

class CreateInfographicRequest(_message.Message):
    __slots__ = ("title", "elements", "template", "style")
    TITLE_FIELD_NUMBER: _ClassVar[int]
    ELEMENTS_FIELD_NUMBER: _ClassVar[int]
    TEMPLATE_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    title: str
    elements: _containers.RepeatedCompositeFieldContainer[InfographicElement]
    template: InfographicTemplate
    style: InfographicStyle
    def __init__(self, title: _Optional[str] = ..., elements: _Optional[_Iterable[_Union[InfographicElement, _Mapping]]] = ..., template: _Optional[_Union[InfographicTemplate, str]] = ..., style: _Optional[_Union[InfographicStyle, str]] = ...) -> None: ...

class InfographicElement(_message.Message):
    __slots__ = ("type", "content", "order", "icon", "color")
    TYPE_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    ICON_FIELD_NUMBER: _ClassVar[int]
    COLOR_FIELD_NUMBER: _ClassVar[int]
    type: ElementType
    content: str
    order: int
    icon: str
    color: str
    def __init__(self, type: _Optional[_Union[ElementType, str]] = ..., content: _Optional[str] = ..., order: _Optional[int] = ..., icon: _Optional[str] = ..., color: _Optional[str] = ...) -> None: ...

class CreateInfographicResponse(_message.Message):
    __slots__ = ("success", "error", "image")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    image: _storage_pb2.Image
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., image: _Optional[_Union[_storage_pb2.Image, _Mapping]] = ...) -> None: ...

class OptimizeForPlatformRequest(_message.Message):
    __slots__ = ("image_id", "image_data", "platform", "image_type")
    IMAGE_ID_FIELD_NUMBER: _ClassVar[int]
    IMAGE_DATA_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    IMAGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    image_id: str
    image_data: bytes
    platform: _common_pb2.Platform
    image_type: PlatformImageType
    def __init__(self, image_id: _Optional[str] = ..., image_data: _Optional[bytes] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., image_type: _Optional[_Union[PlatformImageType, str]] = ...) -> None: ...

class OptimizeForPlatformResponse(_message.Message):
    __slots__ = ("success", "error", "optimized_image", "image", "optimization")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    OPTIMIZED_IMAGE_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    OPTIMIZATION_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    optimized_image: bytes
    image: _storage_pb2.Image
    optimization: PlatformOptimization
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., optimized_image: _Optional[bytes] = ..., image: _Optional[_Union[_storage_pb2.Image, _Mapping]] = ..., optimization: _Optional[_Union[PlatformOptimization, _Mapping]] = ...) -> None: ...

class PlatformOptimization(_message.Message):
    __slots__ = ("width", "height", "format", "quality", "max_file_size", "aspect_ratio")
    WIDTH_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    FORMAT_FIELD_NUMBER: _ClassVar[int]
    QUALITY_FIELD_NUMBER: _ClassVar[int]
    MAX_FILE_SIZE_FIELD_NUMBER: _ClassVar[int]
    ASPECT_RATIO_FIELD_NUMBER: _ClassVar[int]
    width: int
    height: int
    format: str
    quality: int
    max_file_size: int
    aspect_ratio: str
    def __init__(self, width: _Optional[int] = ..., height: _Optional[int] = ..., format: _Optional[str] = ..., quality: _Optional[int] = ..., max_file_size: _Optional[int] = ..., aspect_ratio: _Optional[str] = ...) -> None: ...

class ExtractTextRequest(_message.Message):
    __slots__ = ("image_id", "image_data", "language")
    IMAGE_ID_FIELD_NUMBER: _ClassVar[int]
    IMAGE_DATA_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    image_id: str
    image_data: bytes
    language: str
    def __init__(self, image_id: _Optional[str] = ..., image_data: _Optional[bytes] = ..., language: _Optional[str] = ...) -> None: ...

class ExtractTextResponse(_message.Message):
    __slots__ = ("success", "error", "text", "regions", "confidence")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    TEXT_FIELD_NUMBER: _ClassVar[int]
    REGIONS_FIELD_NUMBER: _ClassVar[int]
    CONFIDENCE_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    text: str
    regions: _containers.RepeatedCompositeFieldContainer[TextRegion]
    confidence: float
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., text: _Optional[str] = ..., regions: _Optional[_Iterable[_Union[TextRegion, _Mapping]]] = ..., confidence: _Optional[float] = ...) -> None: ...

class TextRegion(_message.Message):
    __slots__ = ("text", "box", "confidence")
    TEXT_FIELD_NUMBER: _ClassVar[int]
    BOX_FIELD_NUMBER: _ClassVar[int]
    CONFIDENCE_FIELD_NUMBER: _ClassVar[int]
    text: str
    box: BoundingBox
    confidence: float
    def __init__(self, text: _Optional[str] = ..., box: _Optional[_Union[BoundingBox, _Mapping]] = ..., confidence: _Optional[float] = ...) -> None: ...

class BoundingBox(_message.Message):
    __slots__ = ("x", "y", "width", "height")
    X_FIELD_NUMBER: _ClassVar[int]
    Y_FIELD_NUMBER: _ClassVar[int]
    WIDTH_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    x: int
    y: int
    width: int
    height: int
    def __init__(self, x: _Optional[int] = ..., y: _Optional[int] = ..., width: _Optional[int] = ..., height: _Optional[int] = ...) -> None: ...

class GetImageMetadataRequest(_message.Message):
    __slots__ = ("image_id", "url")
    IMAGE_ID_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    image_id: str
    url: str
    def __init__(self, image_id: _Optional[str] = ..., url: _Optional[str] = ...) -> None: ...

class GetImageMetadataResponse(_message.Message):
    __slots__ = ("success", "error", "metadata")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    metadata: ImageMetadataInfo
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., metadata: _Optional[_Union[ImageMetadataInfo, _Mapping]] = ...) -> None: ...

class ImageMetadataInfo(_message.Message):
    __slots__ = ("filename", "mime_type", "file_size_bytes", "width", "height", "format", "color_space", "has_alpha", "dpi", "exif_data")
    class ExifDataEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    FILENAME_FIELD_NUMBER: _ClassVar[int]
    MIME_TYPE_FIELD_NUMBER: _ClassVar[int]
    FILE_SIZE_BYTES_FIELD_NUMBER: _ClassVar[int]
    WIDTH_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    FORMAT_FIELD_NUMBER: _ClassVar[int]
    COLOR_SPACE_FIELD_NUMBER: _ClassVar[int]
    HAS_ALPHA_FIELD_NUMBER: _ClassVar[int]
    DPI_FIELD_NUMBER: _ClassVar[int]
    EXIF_DATA_FIELD_NUMBER: _ClassVar[int]
    filename: str
    mime_type: str
    file_size_bytes: int
    width: int
    height: int
    format: str
    color_space: str
    has_alpha: bool
    dpi: int
    exif_data: _containers.ScalarMap[str, str]
    def __init__(self, filename: _Optional[str] = ..., mime_type: _Optional[str] = ..., file_size_bytes: _Optional[int] = ..., width: _Optional[int] = ..., height: _Optional[int] = ..., format: _Optional[str] = ..., color_space: _Optional[str] = ..., has_alpha: bool = ..., dpi: _Optional[int] = ..., exif_data: _Optional[_Mapping[str, str]] = ...) -> None: ...
