import common_pb2 as _common_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Article(_message.Message):
    __slots__ = ("id", "url", "title", "content", "excerpt", "source", "author", "published_at", "parsed_at", "sentiment", "sentiment_score", "language", "word_count", "reading_time_minutes", "is_archived", "created_at", "updated_at", "facts", "entities", "quotes", "images")
    ID_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    EXCERPT_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    AUTHOR_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_AT_FIELD_NUMBER: _ClassVar[int]
    PARSED_AT_FIELD_NUMBER: _ClassVar[int]
    SENTIMENT_FIELD_NUMBER: _ClassVar[int]
    SENTIMENT_SCORE_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    WORD_COUNT_FIELD_NUMBER: _ClassVar[int]
    READING_TIME_MINUTES_FIELD_NUMBER: _ClassVar[int]
    IS_ARCHIVED_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    FACTS_FIELD_NUMBER: _ClassVar[int]
    ENTITIES_FIELD_NUMBER: _ClassVar[int]
    QUOTES_FIELD_NUMBER: _ClassVar[int]
    IMAGES_FIELD_NUMBER: _ClassVar[int]
    id: str
    url: str
    title: str
    content: str
    excerpt: str
    source: str
    author: str
    published_at: _common_pb2.Timestamp
    parsed_at: _common_pb2.Timestamp
    sentiment: _common_pb2.Sentiment
    sentiment_score: float
    language: str
    word_count: int
    reading_time_minutes: int
    is_archived: bool
    created_at: _common_pb2.Timestamp
    updated_at: _common_pb2.Timestamp
    facts: _containers.RepeatedCompositeFieldContainer[Fact]
    entities: _containers.RepeatedCompositeFieldContainer[Entity]
    quotes: _containers.RepeatedCompositeFieldContainer[Quote]
    images: _containers.RepeatedCompositeFieldContainer[Image]
    def __init__(self, id: _Optional[str] = ..., url: _Optional[str] = ..., title: _Optional[str] = ..., content: _Optional[str] = ..., excerpt: _Optional[str] = ..., source: _Optional[str] = ..., author: _Optional[str] = ..., published_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., parsed_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., sentiment: _Optional[_Union[_common_pb2.Sentiment, str]] = ..., sentiment_score: _Optional[float] = ..., language: _Optional[str] = ..., word_count: _Optional[int] = ..., reading_time_minutes: _Optional[int] = ..., is_archived: bool = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., updated_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., facts: _Optional[_Iterable[_Union[Fact, _Mapping]]] = ..., entities: _Optional[_Iterable[_Union[Entity, _Mapping]]] = ..., quotes: _Optional[_Iterable[_Union[Quote, _Mapping]]] = ..., images: _Optional[_Iterable[_Union[Image, _Mapping]]] = ...) -> None: ...

class SaveArticleRequest(_message.Message):
    __slots__ = ("url", "title", "content", "excerpt", "source", "author", "published_at", "language")
    URL_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    EXCERPT_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    AUTHOR_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_AT_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    url: str
    title: str
    content: str
    excerpt: str
    source: str
    author: str
    published_at: _common_pb2.Timestamp
    language: str
    def __init__(self, url: _Optional[str] = ..., title: _Optional[str] = ..., content: _Optional[str] = ..., excerpt: _Optional[str] = ..., source: _Optional[str] = ..., author: _Optional[str] = ..., published_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., language: _Optional[str] = ...) -> None: ...

class GetArticleRequest(_message.Message):
    __slots__ = ("id", "url")
    ID_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    id: str
    url: str
    def __init__(self, id: _Optional[str] = ..., url: _Optional[str] = ...) -> None: ...

class UpdateArticleRequest(_message.Message):
    __slots__ = ("id", "title", "content", "excerpt", "sentiment", "sentiment_score", "is_archived")
    ID_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    EXCERPT_FIELD_NUMBER: _ClassVar[int]
    SENTIMENT_FIELD_NUMBER: _ClassVar[int]
    SENTIMENT_SCORE_FIELD_NUMBER: _ClassVar[int]
    IS_ARCHIVED_FIELD_NUMBER: _ClassVar[int]
    id: str
    title: str
    content: str
    excerpt: str
    sentiment: _common_pb2.Sentiment
    sentiment_score: float
    is_archived: bool
    def __init__(self, id: _Optional[str] = ..., title: _Optional[str] = ..., content: _Optional[str] = ..., excerpt: _Optional[str] = ..., sentiment: _Optional[_Union[_common_pb2.Sentiment, str]] = ..., sentiment_score: _Optional[float] = ..., is_archived: bool = ...) -> None: ...

class DeleteArticleRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class ListArticlesRequest(_message.Message):
    __slots__ = ("pagination", "source", "sentiment", "is_archived", "from_date", "to_date")
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    SENTIMENT_FIELD_NUMBER: _ClassVar[int]
    IS_ARCHIVED_FIELD_NUMBER: _ClassVar[int]
    FROM_DATE_FIELD_NUMBER: _ClassVar[int]
    TO_DATE_FIELD_NUMBER: _ClassVar[int]
    pagination: _common_pb2.PaginationRequest
    source: str
    sentiment: _common_pb2.Sentiment
    is_archived: bool
    from_date: _common_pb2.Timestamp
    to_date: _common_pb2.Timestamp
    def __init__(self, pagination: _Optional[_Union[_common_pb2.PaginationRequest, _Mapping]] = ..., source: _Optional[str] = ..., sentiment: _Optional[_Union[_common_pb2.Sentiment, str]] = ..., is_archived: bool = ..., from_date: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., to_date: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class ListArticlesResponse(_message.Message):
    __slots__ = ("articles", "pagination")
    ARTICLES_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    articles: _containers.RepeatedCompositeFieldContainer[Article]
    pagination: _common_pb2.PaginationResponse
    def __init__(self, articles: _Optional[_Iterable[_Union[Article, _Mapping]]] = ..., pagination: _Optional[_Union[_common_pb2.PaginationResponse, _Mapping]] = ...) -> None: ...

class SearchArticlesRequest(_message.Message):
    __slots__ = ("query", "pagination")
    QUERY_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    query: str
    pagination: _common_pb2.PaginationRequest
    def __init__(self, query: _Optional[str] = ..., pagination: _Optional[_Union[_common_pb2.PaginationRequest, _Mapping]] = ...) -> None: ...

class Fact(_message.Message):
    __slots__ = ("id", "article_id", "text", "importance", "order_index", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    TEXT_FIELD_NUMBER: _ClassVar[int]
    IMPORTANCE_FIELD_NUMBER: _ClassVar[int]
    ORDER_INDEX_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    article_id: str
    text: str
    importance: int
    order_index: int
    created_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., article_id: _Optional[str] = ..., text: _Optional[str] = ..., importance: _Optional[int] = ..., order_index: _Optional[int] = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class SaveFactsRequest(_message.Message):
    __slots__ = ("article_id", "facts")
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    FACTS_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    facts: _containers.RepeatedCompositeFieldContainer[FactInput]
    def __init__(self, article_id: _Optional[str] = ..., facts: _Optional[_Iterable[_Union[FactInput, _Mapping]]] = ...) -> None: ...

class FactInput(_message.Message):
    __slots__ = ("text", "importance", "order_index")
    TEXT_FIELD_NUMBER: _ClassVar[int]
    IMPORTANCE_FIELD_NUMBER: _ClassVar[int]
    ORDER_INDEX_FIELD_NUMBER: _ClassVar[int]
    text: str
    importance: int
    order_index: int
    def __init__(self, text: _Optional[str] = ..., importance: _Optional[int] = ..., order_index: _Optional[int] = ...) -> None: ...

class SaveFactsResponse(_message.Message):
    __slots__ = ("facts",)
    FACTS_FIELD_NUMBER: _ClassVar[int]
    facts: _containers.RepeatedCompositeFieldContainer[Fact]
    def __init__(self, facts: _Optional[_Iterable[_Union[Fact, _Mapping]]] = ...) -> None: ...

class GetFactsByArticleRequest(_message.Message):
    __slots__ = ("article_id",)
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    def __init__(self, article_id: _Optional[str] = ...) -> None: ...

class GetFactsResponse(_message.Message):
    __slots__ = ("facts",)
    FACTS_FIELD_NUMBER: _ClassVar[int]
    facts: _containers.RepeatedCompositeFieldContainer[Fact]
    def __init__(self, facts: _Optional[_Iterable[_Union[Fact, _Mapping]]] = ...) -> None: ...

class Entity(_message.Message):
    __slots__ = ("id", "article_id", "name", "type", "mentions", "confidence", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    MENTIONS_FIELD_NUMBER: _ClassVar[int]
    CONFIDENCE_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    article_id: str
    name: str
    type: _common_pb2.EntityType
    mentions: int
    confidence: float
    created_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., article_id: _Optional[str] = ..., name: _Optional[str] = ..., type: _Optional[_Union[_common_pb2.EntityType, str]] = ..., mentions: _Optional[int] = ..., confidence: _Optional[float] = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class SaveEntitiesRequest(_message.Message):
    __slots__ = ("article_id", "entities")
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    ENTITIES_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    entities: _containers.RepeatedCompositeFieldContainer[EntityInput]
    def __init__(self, article_id: _Optional[str] = ..., entities: _Optional[_Iterable[_Union[EntityInput, _Mapping]]] = ...) -> None: ...

class EntityInput(_message.Message):
    __slots__ = ("name", "type", "mentions", "confidence")
    NAME_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    MENTIONS_FIELD_NUMBER: _ClassVar[int]
    CONFIDENCE_FIELD_NUMBER: _ClassVar[int]
    name: str
    type: _common_pb2.EntityType
    mentions: int
    confidence: float
    def __init__(self, name: _Optional[str] = ..., type: _Optional[_Union[_common_pb2.EntityType, str]] = ..., mentions: _Optional[int] = ..., confidence: _Optional[float] = ...) -> None: ...

class SaveEntitiesResponse(_message.Message):
    __slots__ = ("entities",)
    ENTITIES_FIELD_NUMBER: _ClassVar[int]
    entities: _containers.RepeatedCompositeFieldContainer[Entity]
    def __init__(self, entities: _Optional[_Iterable[_Union[Entity, _Mapping]]] = ...) -> None: ...

class GetEntitiesByArticleRequest(_message.Message):
    __slots__ = ("article_id",)
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    def __init__(self, article_id: _Optional[str] = ...) -> None: ...

class GetEntitiesResponse(_message.Message):
    __slots__ = ("entities",)
    ENTITIES_FIELD_NUMBER: _ClassVar[int]
    entities: _containers.RepeatedCompositeFieldContainer[Entity]
    def __init__(self, entities: _Optional[_Iterable[_Union[Entity, _Mapping]]] = ...) -> None: ...

class Quote(_message.Message):
    __slots__ = ("id", "article_id", "text", "author", "order_index", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    TEXT_FIELD_NUMBER: _ClassVar[int]
    AUTHOR_FIELD_NUMBER: _ClassVar[int]
    ORDER_INDEX_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    article_id: str
    text: str
    author: str
    order_index: int
    created_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., article_id: _Optional[str] = ..., text: _Optional[str] = ..., author: _Optional[str] = ..., order_index: _Optional[int] = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class SaveQuotesRequest(_message.Message):
    __slots__ = ("article_id", "quotes")
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    QUOTES_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    quotes: _containers.RepeatedCompositeFieldContainer[QuoteInput]
    def __init__(self, article_id: _Optional[str] = ..., quotes: _Optional[_Iterable[_Union[QuoteInput, _Mapping]]] = ...) -> None: ...

class QuoteInput(_message.Message):
    __slots__ = ("text", "author", "order_index")
    TEXT_FIELD_NUMBER: _ClassVar[int]
    AUTHOR_FIELD_NUMBER: _ClassVar[int]
    ORDER_INDEX_FIELD_NUMBER: _ClassVar[int]
    text: str
    author: str
    order_index: int
    def __init__(self, text: _Optional[str] = ..., author: _Optional[str] = ..., order_index: _Optional[int] = ...) -> None: ...

class SaveQuotesResponse(_message.Message):
    __slots__ = ("quotes",)
    QUOTES_FIELD_NUMBER: _ClassVar[int]
    quotes: _containers.RepeatedCompositeFieldContainer[Quote]
    def __init__(self, quotes: _Optional[_Iterable[_Union[Quote, _Mapping]]] = ...) -> None: ...

class GetQuotesByArticleRequest(_message.Message):
    __slots__ = ("article_id",)
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    def __init__(self, article_id: _Optional[str] = ...) -> None: ...

class GetQuotesResponse(_message.Message):
    __slots__ = ("quotes",)
    QUOTES_FIELD_NUMBER: _ClassVar[int]
    quotes: _containers.RepeatedCompositeFieldContainer[Quote]
    def __init__(self, quotes: _Optional[_Iterable[_Union[Quote, _Mapping]]] = ...) -> None: ...

class Image(_message.Message):
    __slots__ = ("id", "article_id", "url", "thumbnail_url", "original_url", "filename", "mime_type", "file_size_bytes", "width", "height", "storage_bucket", "storage_key", "is_generated", "generation_prompt", "alt_text", "caption", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    THUMBNAIL_URL_FIELD_NUMBER: _ClassVar[int]
    ORIGINAL_URL_FIELD_NUMBER: _ClassVar[int]
    FILENAME_FIELD_NUMBER: _ClassVar[int]
    MIME_TYPE_FIELD_NUMBER: _ClassVar[int]
    FILE_SIZE_BYTES_FIELD_NUMBER: _ClassVar[int]
    WIDTH_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    STORAGE_BUCKET_FIELD_NUMBER: _ClassVar[int]
    STORAGE_KEY_FIELD_NUMBER: _ClassVar[int]
    IS_GENERATED_FIELD_NUMBER: _ClassVar[int]
    GENERATION_PROMPT_FIELD_NUMBER: _ClassVar[int]
    ALT_TEXT_FIELD_NUMBER: _ClassVar[int]
    CAPTION_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    article_id: str
    url: str
    thumbnail_url: str
    original_url: str
    filename: str
    mime_type: str
    file_size_bytes: int
    width: int
    height: int
    storage_bucket: str
    storage_key: str
    is_generated: bool
    generation_prompt: str
    alt_text: str
    caption: str
    created_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., article_id: _Optional[str] = ..., url: _Optional[str] = ..., thumbnail_url: _Optional[str] = ..., original_url: _Optional[str] = ..., filename: _Optional[str] = ..., mime_type: _Optional[str] = ..., file_size_bytes: _Optional[int] = ..., width: _Optional[int] = ..., height: _Optional[int] = ..., storage_bucket: _Optional[str] = ..., storage_key: _Optional[str] = ..., is_generated: bool = ..., generation_prompt: _Optional[str] = ..., alt_text: _Optional[str] = ..., caption: _Optional[str] = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class SaveImageRequest(_message.Message):
    __slots__ = ("article_id", "url", "thumbnail_url", "original_url", "filename", "mime_type", "file_size_bytes", "width", "height", "storage_bucket", "storage_key", "is_generated", "generation_prompt", "alt_text", "caption")
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    THUMBNAIL_URL_FIELD_NUMBER: _ClassVar[int]
    ORIGINAL_URL_FIELD_NUMBER: _ClassVar[int]
    FILENAME_FIELD_NUMBER: _ClassVar[int]
    MIME_TYPE_FIELD_NUMBER: _ClassVar[int]
    FILE_SIZE_BYTES_FIELD_NUMBER: _ClassVar[int]
    WIDTH_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    STORAGE_BUCKET_FIELD_NUMBER: _ClassVar[int]
    STORAGE_KEY_FIELD_NUMBER: _ClassVar[int]
    IS_GENERATED_FIELD_NUMBER: _ClassVar[int]
    GENERATION_PROMPT_FIELD_NUMBER: _ClassVar[int]
    ALT_TEXT_FIELD_NUMBER: _ClassVar[int]
    CAPTION_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    url: str
    thumbnail_url: str
    original_url: str
    filename: str
    mime_type: str
    file_size_bytes: int
    width: int
    height: int
    storage_bucket: str
    storage_key: str
    is_generated: bool
    generation_prompt: str
    alt_text: str
    caption: str
    def __init__(self, article_id: _Optional[str] = ..., url: _Optional[str] = ..., thumbnail_url: _Optional[str] = ..., original_url: _Optional[str] = ..., filename: _Optional[str] = ..., mime_type: _Optional[str] = ..., file_size_bytes: _Optional[int] = ..., width: _Optional[int] = ..., height: _Optional[int] = ..., storage_bucket: _Optional[str] = ..., storage_key: _Optional[str] = ..., is_generated: bool = ..., generation_prompt: _Optional[str] = ..., alt_text: _Optional[str] = ..., caption: _Optional[str] = ...) -> None: ...

class GetImageRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class ListImagesByArticleRequest(_message.Message):
    __slots__ = ("article_id",)
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    def __init__(self, article_id: _Optional[str] = ...) -> None: ...

class ListImagesResponse(_message.Message):
    __slots__ = ("images",)
    IMAGES_FIELD_NUMBER: _ClassVar[int]
    images: _containers.RepeatedCompositeFieldContainer[Image]
    def __init__(self, images: _Optional[_Iterable[_Union[Image, _Mapping]]] = ...) -> None: ...

class Post(_message.Message):
    __slots__ = ("id", "article_id", "user_id", "social_account_id", "platform", "content", "style", "status", "scheduled_at", "published_at", "external_id", "external_url", "error_message", "retry_count", "last_retry_at", "created_at", "updated_at", "images", "metrics")
    ID_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    SOCIAL_ACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    SCHEDULED_AT_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_AT_FIELD_NUMBER: _ClassVar[int]
    EXTERNAL_ID_FIELD_NUMBER: _ClassVar[int]
    EXTERNAL_URL_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    RETRY_COUNT_FIELD_NUMBER: _ClassVar[int]
    LAST_RETRY_AT_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    IMAGES_FIELD_NUMBER: _ClassVar[int]
    METRICS_FIELD_NUMBER: _ClassVar[int]
    id: str
    article_id: str
    user_id: str
    social_account_id: str
    platform: _common_pb2.Platform
    content: str
    style: _common_pb2.PostStyle
    status: _common_pb2.PostStatus
    scheduled_at: _common_pb2.Timestamp
    published_at: _common_pb2.Timestamp
    external_id: str
    external_url: str
    error_message: str
    retry_count: int
    last_retry_at: _common_pb2.Timestamp
    created_at: _common_pb2.Timestamp
    updated_at: _common_pb2.Timestamp
    images: _containers.RepeatedCompositeFieldContainer[Image]
    metrics: Metrics
    def __init__(self, id: _Optional[str] = ..., article_id: _Optional[str] = ..., user_id: _Optional[str] = ..., social_account_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., content: _Optional[str] = ..., style: _Optional[_Union[_common_pb2.PostStyle, str]] = ..., status: _Optional[_Union[_common_pb2.PostStatus, str]] = ..., scheduled_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., published_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., external_id: _Optional[str] = ..., external_url: _Optional[str] = ..., error_message: _Optional[str] = ..., retry_count: _Optional[int] = ..., last_retry_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., updated_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., images: _Optional[_Iterable[_Union[Image, _Mapping]]] = ..., metrics: _Optional[_Union[Metrics, _Mapping]] = ...) -> None: ...

class SavePostRequest(_message.Message):
    __slots__ = ("article_id", "user_id", "social_account_id", "platform", "content", "style", "status", "scheduled_at", "image_ids")
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    SOCIAL_ACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    SCHEDULED_AT_FIELD_NUMBER: _ClassVar[int]
    IMAGE_IDS_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    user_id: str
    social_account_id: str
    platform: _common_pb2.Platform
    content: str
    style: _common_pb2.PostStyle
    status: _common_pb2.PostStatus
    scheduled_at: _common_pb2.Timestamp
    image_ids: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, article_id: _Optional[str] = ..., user_id: _Optional[str] = ..., social_account_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., content: _Optional[str] = ..., style: _Optional[_Union[_common_pb2.PostStyle, str]] = ..., status: _Optional[_Union[_common_pb2.PostStatus, str]] = ..., scheduled_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., image_ids: _Optional[_Iterable[str]] = ...) -> None: ...

class GetPostRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class UpdatePostRequest(_message.Message):
    __slots__ = ("id", "content", "status", "scheduled_at", "published_at", "external_id", "external_url", "error_message", "retry_count")
    ID_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    SCHEDULED_AT_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_AT_FIELD_NUMBER: _ClassVar[int]
    EXTERNAL_ID_FIELD_NUMBER: _ClassVar[int]
    EXTERNAL_URL_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    RETRY_COUNT_FIELD_NUMBER: _ClassVar[int]
    id: str
    content: str
    status: _common_pb2.PostStatus
    scheduled_at: _common_pb2.Timestamp
    published_at: _common_pb2.Timestamp
    external_id: str
    external_url: str
    error_message: str
    retry_count: int
    def __init__(self, id: _Optional[str] = ..., content: _Optional[str] = ..., status: _Optional[_Union[_common_pb2.PostStatus, str]] = ..., scheduled_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., published_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., external_id: _Optional[str] = ..., external_url: _Optional[str] = ..., error_message: _Optional[str] = ..., retry_count: _Optional[int] = ...) -> None: ...

class DeletePostRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class ListPostsRequest(_message.Message):
    __slots__ = ("pagination", "article_id", "user_id", "platform", "status", "from_date", "to_date")
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    FROM_DATE_FIELD_NUMBER: _ClassVar[int]
    TO_DATE_FIELD_NUMBER: _ClassVar[int]
    pagination: _common_pb2.PaginationRequest
    article_id: str
    user_id: str
    platform: _common_pb2.Platform
    status: _common_pb2.PostStatus
    from_date: _common_pb2.Timestamp
    to_date: _common_pb2.Timestamp
    def __init__(self, pagination: _Optional[_Union[_common_pb2.PaginationRequest, _Mapping]] = ..., article_id: _Optional[str] = ..., user_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., status: _Optional[_Union[_common_pb2.PostStatus, str]] = ..., from_date: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., to_date: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class ListPostsResponse(_message.Message):
    __slots__ = ("posts", "pagination")
    POSTS_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    posts: _containers.RepeatedCompositeFieldContainer[Post]
    pagination: _common_pb2.PaginationResponse
    def __init__(self, posts: _Optional[_Iterable[_Union[Post, _Mapping]]] = ..., pagination: _Optional[_Union[_common_pb2.PaginationResponse, _Mapping]] = ...) -> None: ...

class ListScheduledPostsRequest(_message.Message):
    __slots__ = ("from_date", "to_date", "platforms")
    FROM_DATE_FIELD_NUMBER: _ClassVar[int]
    TO_DATE_FIELD_NUMBER: _ClassVar[int]
    PLATFORMS_FIELD_NUMBER: _ClassVar[int]
    from_date: _common_pb2.Timestamp
    to_date: _common_pb2.Timestamp
    platforms: _containers.RepeatedScalarFieldContainer[_common_pb2.Platform]
    def __init__(self, from_date: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., to_date: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., platforms: _Optional[_Iterable[_Union[_common_pb2.Platform, str]]] = ...) -> None: ...

class Metrics(_message.Message):
    __slots__ = ("id", "post_id", "views", "likes", "comments", "shares", "saves", "clicks", "reach", "impressions", "engagement_rate", "collected_at", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    POST_ID_FIELD_NUMBER: _ClassVar[int]
    VIEWS_FIELD_NUMBER: _ClassVar[int]
    LIKES_FIELD_NUMBER: _ClassVar[int]
    COMMENTS_FIELD_NUMBER: _ClassVar[int]
    SHARES_FIELD_NUMBER: _ClassVar[int]
    SAVES_FIELD_NUMBER: _ClassVar[int]
    CLICKS_FIELD_NUMBER: _ClassVar[int]
    REACH_FIELD_NUMBER: _ClassVar[int]
    IMPRESSIONS_FIELD_NUMBER: _ClassVar[int]
    ENGAGEMENT_RATE_FIELD_NUMBER: _ClassVar[int]
    COLLECTED_AT_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    post_id: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    clicks: int
    reach: int
    impressions: int
    engagement_rate: float
    collected_at: _common_pb2.Timestamp
    created_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., post_id: _Optional[str] = ..., views: _Optional[int] = ..., likes: _Optional[int] = ..., comments: _Optional[int] = ..., shares: _Optional[int] = ..., saves: _Optional[int] = ..., clicks: _Optional[int] = ..., reach: _Optional[int] = ..., impressions: _Optional[int] = ..., engagement_rate: _Optional[float] = ..., collected_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class SaveMetricsRequest(_message.Message):
    __slots__ = ("post_id", "views", "likes", "comments", "shares", "saves", "clicks", "reach", "impressions")
    POST_ID_FIELD_NUMBER: _ClassVar[int]
    VIEWS_FIELD_NUMBER: _ClassVar[int]
    LIKES_FIELD_NUMBER: _ClassVar[int]
    COMMENTS_FIELD_NUMBER: _ClassVar[int]
    SHARES_FIELD_NUMBER: _ClassVar[int]
    SAVES_FIELD_NUMBER: _ClassVar[int]
    CLICKS_FIELD_NUMBER: _ClassVar[int]
    REACH_FIELD_NUMBER: _ClassVar[int]
    IMPRESSIONS_FIELD_NUMBER: _ClassVar[int]
    post_id: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    clicks: int
    reach: int
    impressions: int
    def __init__(self, post_id: _Optional[str] = ..., views: _Optional[int] = ..., likes: _Optional[int] = ..., comments: _Optional[int] = ..., shares: _Optional[int] = ..., saves: _Optional[int] = ..., clicks: _Optional[int] = ..., reach: _Optional[int] = ..., impressions: _Optional[int] = ...) -> None: ...

class GetLatestMetricsRequest(_message.Message):
    __slots__ = ("post_id",)
    POST_ID_FIELD_NUMBER: _ClassVar[int]
    post_id: str
    def __init__(self, post_id: _Optional[str] = ...) -> None: ...

class ListMetricsByPostRequest(_message.Message):
    __slots__ = ("post_id", "from_date", "to_date")
    POST_ID_FIELD_NUMBER: _ClassVar[int]
    FROM_DATE_FIELD_NUMBER: _ClassVar[int]
    TO_DATE_FIELD_NUMBER: _ClassVar[int]
    post_id: str
    from_date: _common_pb2.Timestamp
    to_date: _common_pb2.Timestamp
    def __init__(self, post_id: _Optional[str] = ..., from_date: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., to_date: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class ListMetricsResponse(_message.Message):
    __slots__ = ("metrics",)
    METRICS_FIELD_NUMBER: _ClassVar[int]
    metrics: _containers.RepeatedCompositeFieldContainer[Metrics]
    def __init__(self, metrics: _Optional[_Iterable[_Union[Metrics, _Mapping]]] = ...) -> None: ...

class Template(_message.Message):
    __slots__ = ("id", "user_id", "name", "description", "platform", "style", "content", "variables", "tags", "usage_count", "last_used_at", "is_public", "created_at", "updated_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    VARIABLES_FIELD_NUMBER: _ClassVar[int]
    TAGS_FIELD_NUMBER: _ClassVar[int]
    USAGE_COUNT_FIELD_NUMBER: _ClassVar[int]
    LAST_USED_AT_FIELD_NUMBER: _ClassVar[int]
    IS_PUBLIC_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    user_id: str
    name: str
    description: str
    platform: _common_pb2.Platform
    style: _common_pb2.PostStyle
    content: str
    variables: _containers.RepeatedScalarFieldContainer[str]
    tags: _containers.RepeatedScalarFieldContainer[str]
    usage_count: int
    last_used_at: _common_pb2.Timestamp
    is_public: bool
    created_at: _common_pb2.Timestamp
    updated_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., user_id: _Optional[str] = ..., name: _Optional[str] = ..., description: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., style: _Optional[_Union[_common_pb2.PostStyle, str]] = ..., content: _Optional[str] = ..., variables: _Optional[_Iterable[str]] = ..., tags: _Optional[_Iterable[str]] = ..., usage_count: _Optional[int] = ..., last_used_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., is_public: bool = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., updated_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class SaveTemplateRequest(_message.Message):
    __slots__ = ("user_id", "name", "description", "platform", "style", "content", "tags", "is_public")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    TAGS_FIELD_NUMBER: _ClassVar[int]
    IS_PUBLIC_FIELD_NUMBER: _ClassVar[int]
    user_id: str
    name: str
    description: str
    platform: _common_pb2.Platform
    style: _common_pb2.PostStyle
    content: str
    tags: _containers.RepeatedScalarFieldContainer[str]
    is_public: bool
    def __init__(self, user_id: _Optional[str] = ..., name: _Optional[str] = ..., description: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., style: _Optional[_Union[_common_pb2.PostStyle, str]] = ..., content: _Optional[str] = ..., tags: _Optional[_Iterable[str]] = ..., is_public: bool = ...) -> None: ...

class GetTemplateRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class UpdateTemplateRequest(_message.Message):
    __slots__ = ("id", "name", "description", "content", "usage_count")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    USAGE_COUNT_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    description: str
    content: str
    usage_count: int
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., description: _Optional[str] = ..., content: _Optional[str] = ..., usage_count: _Optional[int] = ...) -> None: ...

class DeleteTemplateRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class ListTemplatesRequest(_message.Message):
    __slots__ = ("pagination", "user_id", "platform", "is_public")
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    IS_PUBLIC_FIELD_NUMBER: _ClassVar[int]
    pagination: _common_pb2.PaginationRequest
    user_id: str
    platform: _common_pb2.Platform
    is_public: bool
    def __init__(self, pagination: _Optional[_Union[_common_pb2.PaginationRequest, _Mapping]] = ..., user_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., is_public: bool = ...) -> None: ...

class ListTemplatesResponse(_message.Message):
    __slots__ = ("templates", "pagination")
    TEMPLATES_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    templates: _containers.RepeatedCompositeFieldContainer[Template]
    pagination: _common_pb2.PaginationResponse
    def __init__(self, templates: _Optional[_Iterable[_Union[Template, _Mapping]]] = ..., pagination: _Optional[_Union[_common_pb2.PaginationResponse, _Mapping]] = ...) -> None: ...

class SocialAccount(_message.Message):
    __slots__ = ("id", "user_id", "platform", "username", "display_name", "avatar", "external_id", "access_token", "refresh_token", "token_expires_at", "is_active", "connected_at", "last_used_at", "created_at", "updated_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    USERNAME_FIELD_NUMBER: _ClassVar[int]
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    AVATAR_FIELD_NUMBER: _ClassVar[int]
    EXTERNAL_ID_FIELD_NUMBER: _ClassVar[int]
    ACCESS_TOKEN_FIELD_NUMBER: _ClassVar[int]
    REFRESH_TOKEN_FIELD_NUMBER: _ClassVar[int]
    TOKEN_EXPIRES_AT_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    CONNECTED_AT_FIELD_NUMBER: _ClassVar[int]
    LAST_USED_AT_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    user_id: str
    platform: _common_pb2.Platform
    username: str
    display_name: str
    avatar: str
    external_id: str
    access_token: str
    refresh_token: str
    token_expires_at: _common_pb2.Timestamp
    is_active: bool
    connected_at: _common_pb2.Timestamp
    last_used_at: _common_pb2.Timestamp
    created_at: _common_pb2.Timestamp
    updated_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., user_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., username: _Optional[str] = ..., display_name: _Optional[str] = ..., avatar: _Optional[str] = ..., external_id: _Optional[str] = ..., access_token: _Optional[str] = ..., refresh_token: _Optional[str] = ..., token_expires_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., is_active: bool = ..., connected_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., last_used_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., updated_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class SaveSocialAccountRequest(_message.Message):
    __slots__ = ("user_id", "platform", "username", "display_name", "avatar", "external_id", "access_token", "refresh_token", "token_expires_at")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    USERNAME_FIELD_NUMBER: _ClassVar[int]
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    AVATAR_FIELD_NUMBER: _ClassVar[int]
    EXTERNAL_ID_FIELD_NUMBER: _ClassVar[int]
    ACCESS_TOKEN_FIELD_NUMBER: _ClassVar[int]
    REFRESH_TOKEN_FIELD_NUMBER: _ClassVar[int]
    TOKEN_EXPIRES_AT_FIELD_NUMBER: _ClassVar[int]
    user_id: str
    platform: _common_pb2.Platform
    username: str
    display_name: str
    avatar: str
    external_id: str
    access_token: str
    refresh_token: str
    token_expires_at: _common_pb2.Timestamp
    def __init__(self, user_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., username: _Optional[str] = ..., display_name: _Optional[str] = ..., avatar: _Optional[str] = ..., external_id: _Optional[str] = ..., access_token: _Optional[str] = ..., refresh_token: _Optional[str] = ..., token_expires_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class GetSocialAccountRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class UpdateSocialAccountRequest(_message.Message):
    __slots__ = ("id", "access_token", "refresh_token", "token_expires_at", "is_active", "last_used_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    ACCESS_TOKEN_FIELD_NUMBER: _ClassVar[int]
    REFRESH_TOKEN_FIELD_NUMBER: _ClassVar[int]
    TOKEN_EXPIRES_AT_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    LAST_USED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    access_token: str
    refresh_token: str
    token_expires_at: _common_pb2.Timestamp
    is_active: bool
    last_used_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., access_token: _Optional[str] = ..., refresh_token: _Optional[str] = ..., token_expires_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., is_active: bool = ..., last_used_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class DeleteSocialAccountRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class ListSocialAccountsRequest(_message.Message):
    __slots__ = ("user_id", "platform", "is_active")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    user_id: str
    platform: _common_pb2.Platform
    is_active: bool
    def __init__(self, user_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., is_active: bool = ...) -> None: ...

class ListSocialAccountsResponse(_message.Message):
    __slots__ = ("accounts",)
    ACCOUNTS_FIELD_NUMBER: _ClassVar[int]
    accounts: _containers.RepeatedCompositeFieldContainer[SocialAccount]
    def __init__(self, accounts: _Optional[_Iterable[_Union[SocialAccount, _Mapping]]] = ...) -> None: ...

class User(_message.Message):
    __slots__ = ("id", "email", "name", "role", "avatar", "is_active", "created_at", "updated_at", "last_login_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    ROLE_FIELD_NUMBER: _ClassVar[int]
    AVATAR_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    LAST_LOGIN_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    email: str
    name: str
    role: _common_pb2.UserRole
    avatar: str
    is_active: bool
    created_at: _common_pb2.Timestamp
    updated_at: _common_pb2.Timestamp
    last_login_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., email: _Optional[str] = ..., name: _Optional[str] = ..., role: _Optional[_Union[_common_pb2.UserRole, str]] = ..., avatar: _Optional[str] = ..., is_active: bool = ..., created_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., updated_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ..., last_login_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class GetUserRequest(_message.Message):
    __slots__ = ("id", "email")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    id: str
    email: str
    def __init__(self, id: _Optional[str] = ..., email: _Optional[str] = ...) -> None: ...

class UpdateUserRequest(_message.Message):
    __slots__ = ("id", "name", "avatar", "last_login_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    AVATAR_FIELD_NUMBER: _ClassVar[int]
    LAST_LOGIN_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    avatar: str
    last_login_at: _common_pb2.Timestamp
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., avatar: _Optional[str] = ..., last_login_at: _Optional[_Union[_common_pb2.Timestamp, _Mapping]] = ...) -> None: ...
