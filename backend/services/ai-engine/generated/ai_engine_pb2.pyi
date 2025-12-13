import common_pb2 as _common_pb2
import storage_pb2 as _storage_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class LLMProvider(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    LLM_PROVIDER_UNSPECIFIED: _ClassVar[LLMProvider]
    LLM_PROVIDER_OPENAI: _ClassVar[LLMProvider]
    LLM_PROVIDER_ANTHROPIC: _ClassVar[LLMProvider]
    LLM_PROVIDER_YANDEX: _ClassVar[LLMProvider]
    LLM_PROVIDER_OLLAMA: _ClassVar[LLMProvider]

class SummaryStyle(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    SUMMARY_STYLE_UNSPECIFIED: _ClassVar[SummaryStyle]
    SUMMARY_STYLE_BRIEF: _ClassVar[SummaryStyle]
    SUMMARY_STYLE_NORMAL: _ClassVar[SummaryStyle]
    SUMMARY_STYLE_DETAILED: _ClassVar[SummaryStyle]
    SUMMARY_STYLE_BULLET: _ClassVar[SummaryStyle]
LLM_PROVIDER_UNSPECIFIED: LLMProvider
LLM_PROVIDER_OPENAI: LLMProvider
LLM_PROVIDER_ANTHROPIC: LLMProvider
LLM_PROVIDER_YANDEX: LLMProvider
LLM_PROVIDER_OLLAMA: LLMProvider
SUMMARY_STYLE_UNSPECIFIED: SummaryStyle
SUMMARY_STYLE_BRIEF: SummaryStyle
SUMMARY_STYLE_NORMAL: SummaryStyle
SUMMARY_STYLE_DETAILED: SummaryStyle
SUMMARY_STYLE_BULLET: SummaryStyle

class AnalyzeContentRequest(_message.Message):
    __slots__ = ("article_id", "content", "title", "options")
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    OPTIONS_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    content: str
    title: str
    options: AnalysisOptions
    def __init__(self, article_id: _Optional[str] = ..., content: _Optional[str] = ..., title: _Optional[str] = ..., options: _Optional[_Union[AnalysisOptions, _Mapping]] = ...) -> None: ...

class AnalysisOptions(_message.Message):
    __slots__ = ("extract_facts", "extract_entities", "extract_quotes", "analyze_sentiment", "generate_summary", "max_facts", "min_fact_importance")
    EXTRACT_FACTS_FIELD_NUMBER: _ClassVar[int]
    EXTRACT_ENTITIES_FIELD_NUMBER: _ClassVar[int]
    EXTRACT_QUOTES_FIELD_NUMBER: _ClassVar[int]
    ANALYZE_SENTIMENT_FIELD_NUMBER: _ClassVar[int]
    GENERATE_SUMMARY_FIELD_NUMBER: _ClassVar[int]
    MAX_FACTS_FIELD_NUMBER: _ClassVar[int]
    MIN_FACT_IMPORTANCE_FIELD_NUMBER: _ClassVar[int]
    extract_facts: bool
    extract_entities: bool
    extract_quotes: bool
    analyze_sentiment: bool
    generate_summary: bool
    max_facts: int
    min_fact_importance: int
    def __init__(self, extract_facts: bool = ..., extract_entities: bool = ..., extract_quotes: bool = ..., analyze_sentiment: bool = ..., generate_summary: bool = ..., max_facts: _Optional[int] = ..., min_fact_importance: _Optional[int] = ...) -> None: ...

class AnalyzeContentResponse(_message.Message):
    __slots__ = ("success", "error", "facts", "entities", "quotes", "sentiment", "summary", "metadata")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    FACTS_FIELD_NUMBER: _ClassVar[int]
    ENTITIES_FIELD_NUMBER: _ClassVar[int]
    QUOTES_FIELD_NUMBER: _ClassVar[int]
    SENTIMENT_FIELD_NUMBER: _ClassVar[int]
    SUMMARY_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    facts: _containers.RepeatedCompositeFieldContainer[_storage_pb2.Fact]
    entities: _containers.RepeatedCompositeFieldContainer[_storage_pb2.Entity]
    quotes: _containers.RepeatedCompositeFieldContainer[_storage_pb2.Quote]
    sentiment: SentimentResult
    summary: str
    metadata: AnalysisMetadata
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., facts: _Optional[_Iterable[_Union[_storage_pb2.Fact, _Mapping]]] = ..., entities: _Optional[_Iterable[_Union[_storage_pb2.Entity, _Mapping]]] = ..., quotes: _Optional[_Iterable[_Union[_storage_pb2.Quote, _Mapping]]] = ..., sentiment: _Optional[_Union[SentimentResult, _Mapping]] = ..., summary: _Optional[str] = ..., metadata: _Optional[_Union[AnalysisMetadata, _Mapping]] = ...) -> None: ...

class AnalysisMetadata(_message.Message):
    __slots__ = ("provider", "model", "total_tokens", "prompt_tokens", "completion_tokens", "cost_usd", "processing_time_ms")
    PROVIDER_FIELD_NUMBER: _ClassVar[int]
    MODEL_FIELD_NUMBER: _ClassVar[int]
    TOTAL_TOKENS_FIELD_NUMBER: _ClassVar[int]
    PROMPT_TOKENS_FIELD_NUMBER: _ClassVar[int]
    COMPLETION_TOKENS_FIELD_NUMBER: _ClassVar[int]
    COST_USD_FIELD_NUMBER: _ClassVar[int]
    PROCESSING_TIME_MS_FIELD_NUMBER: _ClassVar[int]
    provider: LLMProvider
    model: str
    total_tokens: int
    prompt_tokens: int
    completion_tokens: int
    cost_usd: float
    processing_time_ms: int
    def __init__(self, provider: _Optional[_Union[LLMProvider, str]] = ..., model: _Optional[str] = ..., total_tokens: _Optional[int] = ..., prompt_tokens: _Optional[int] = ..., completion_tokens: _Optional[int] = ..., cost_usd: _Optional[float] = ..., processing_time_ms: _Optional[int] = ...) -> None: ...

class GeneratePostsRequest(_message.Message):
    __slots__ = ("article_id", "platforms", "style", "formality_level", "key_facts", "custom_instructions")
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORMS_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    FORMALITY_LEVEL_FIELD_NUMBER: _ClassVar[int]
    KEY_FACTS_FIELD_NUMBER: _ClassVar[int]
    CUSTOM_INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    platforms: _containers.RepeatedScalarFieldContainer[_common_pb2.Platform]
    style: _common_pb2.PostStyle
    formality_level: int
    key_facts: _containers.RepeatedCompositeFieldContainer[_storage_pb2.Fact]
    custom_instructions: str
    def __init__(self, article_id: _Optional[str] = ..., platforms: _Optional[_Iterable[_Union[_common_pb2.Platform, str]]] = ..., style: _Optional[_Union[_common_pb2.PostStyle, str]] = ..., formality_level: _Optional[int] = ..., key_facts: _Optional[_Iterable[_Union[_storage_pb2.Fact, _Mapping]]] = ..., custom_instructions: _Optional[str] = ...) -> None: ...

class GeneratePostsResponse(_message.Message):
    __slots__ = ("success", "error", "posts", "metadata")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    POSTS_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    posts: _containers.RepeatedCompositeFieldContainer[GeneratedPost]
    metadata: AnalysisMetadata
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., posts: _Optional[_Iterable[_Union[GeneratedPost, _Mapping]]] = ..., metadata: _Optional[_Union[AnalysisMetadata, _Mapping]] = ...) -> None: ...

class GeneratePostRequest(_message.Message):
    __slots__ = ("article_id", "platform", "style", "formality_level", "key_facts", "custom_instructions", "image_urls")
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    FORMALITY_LEVEL_FIELD_NUMBER: _ClassVar[int]
    KEY_FACTS_FIELD_NUMBER: _ClassVar[int]
    CUSTOM_INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    IMAGE_URLS_FIELD_NUMBER: _ClassVar[int]
    article_id: str
    platform: _common_pb2.Platform
    style: _common_pb2.PostStyle
    formality_level: int
    key_facts: _containers.RepeatedCompositeFieldContainer[_storage_pb2.Fact]
    custom_instructions: str
    image_urls: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, article_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., style: _Optional[_Union[_common_pb2.PostStyle, str]] = ..., formality_level: _Optional[int] = ..., key_facts: _Optional[_Iterable[_Union[_storage_pb2.Fact, _Mapping]]] = ..., custom_instructions: _Optional[str] = ..., image_urls: _Optional[_Iterable[str]] = ...) -> None: ...

class GeneratePostResponse(_message.Message):
    __slots__ = ("success", "error", "post", "metadata")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    POST_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    post: GeneratedPost
    metadata: AnalysisMetadata
    def __init__(self, success: bool = ..., error: _Optional[str] = ..., post: _Optional[_Union[GeneratedPost, _Mapping]] = ..., metadata: _Optional[_Union[AnalysisMetadata, _Mapping]] = ...) -> None: ...

class RegeneratePostRequest(_message.Message):
    __slots__ = ("post_id", "article_id", "platform", "new_style", "formality_level", "feedback")
    POST_ID_FIELD_NUMBER: _ClassVar[int]
    ARTICLE_ID_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    NEW_STYLE_FIELD_NUMBER: _ClassVar[int]
    FORMALITY_LEVEL_FIELD_NUMBER: _ClassVar[int]
    FEEDBACK_FIELD_NUMBER: _ClassVar[int]
    post_id: str
    article_id: str
    platform: _common_pb2.Platform
    new_style: _common_pb2.PostStyle
    formality_level: int
    feedback: str
    def __init__(self, post_id: _Optional[str] = ..., article_id: _Optional[str] = ..., platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., new_style: _Optional[_Union[_common_pb2.PostStyle, str]] = ..., formality_level: _Optional[int] = ..., feedback: _Optional[str] = ...) -> None: ...

class GeneratedPost(_message.Message):
    __slots__ = ("platform", "content", "style", "estimated_reach", "quality_score", "hashtags", "warnings")
    PLATFORM_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    ESTIMATED_REACH_FIELD_NUMBER: _ClassVar[int]
    QUALITY_SCORE_FIELD_NUMBER: _ClassVar[int]
    HASHTAGS_FIELD_NUMBER: _ClassVar[int]
    WARNINGS_FIELD_NUMBER: _ClassVar[int]
    platform: _common_pb2.Platform
    content: str
    style: _common_pb2.PostStyle
    estimated_reach: int
    quality_score: float
    hashtags: _containers.RepeatedScalarFieldContainer[str]
    warnings: ContentWarnings
    def __init__(self, platform: _Optional[_Union[_common_pb2.Platform, str]] = ..., content: _Optional[str] = ..., style: _Optional[_Union[_common_pb2.PostStyle, str]] = ..., estimated_reach: _Optional[int] = ..., quality_score: _Optional[float] = ..., hashtags: _Optional[_Iterable[str]] = ..., warnings: _Optional[_Union[ContentWarnings, _Mapping]] = ...) -> None: ...

class ContentWarnings(_message.Message):
    __slots__ = ("potentially_offensive", "factual_uncertainty", "needs_review", "messages")
    POTENTIALLY_OFFENSIVE_FIELD_NUMBER: _ClassVar[int]
    FACTUAL_UNCERTAINTY_FIELD_NUMBER: _ClassVar[int]
    NEEDS_REVIEW_FIELD_NUMBER: _ClassVar[int]
    MESSAGES_FIELD_NUMBER: _ClassVar[int]
    potentially_offensive: bool
    factual_uncertainty: bool
    needs_review: bool
    messages: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, potentially_offensive: bool = ..., factual_uncertainty: bool = ..., needs_review: bool = ..., messages: _Optional[_Iterable[str]] = ...) -> None: ...

class ExtractFactsRequest(_message.Message):
    __slots__ = ("content", "title", "max_facts", "min_importance")
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    MAX_FACTS_FIELD_NUMBER: _ClassVar[int]
    MIN_IMPORTANCE_FIELD_NUMBER: _ClassVar[int]
    content: str
    title: str
    max_facts: int
    min_importance: int
    def __init__(self, content: _Optional[str] = ..., title: _Optional[str] = ..., max_facts: _Optional[int] = ..., min_importance: _Optional[int] = ...) -> None: ...

class ExtractFactsResponse(_message.Message):
    __slots__ = ("facts", "metadata")
    FACTS_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    facts: _containers.RepeatedCompositeFieldContainer[_storage_pb2.Fact]
    metadata: AnalysisMetadata
    def __init__(self, facts: _Optional[_Iterable[_Union[_storage_pb2.Fact, _Mapping]]] = ..., metadata: _Optional[_Union[AnalysisMetadata, _Mapping]] = ...) -> None: ...

class ExtractEntitiesRequest(_message.Message):
    __slots__ = ("content", "filter_types")
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    FILTER_TYPES_FIELD_NUMBER: _ClassVar[int]
    content: str
    filter_types: _containers.RepeatedScalarFieldContainer[_common_pb2.EntityType]
    def __init__(self, content: _Optional[str] = ..., filter_types: _Optional[_Iterable[_Union[_common_pb2.EntityType, str]]] = ...) -> None: ...

class ExtractEntitiesResponse(_message.Message):
    __slots__ = ("entities", "metadata")
    ENTITIES_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    entities: _containers.RepeatedCompositeFieldContainer[_storage_pb2.Entity]
    metadata: AnalysisMetadata
    def __init__(self, entities: _Optional[_Iterable[_Union[_storage_pb2.Entity, _Mapping]]] = ..., metadata: _Optional[_Union[AnalysisMetadata, _Mapping]] = ...) -> None: ...

class ExtractQuotesRequest(_message.Message):
    __slots__ = ("content", "max_quotes")
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    MAX_QUOTES_FIELD_NUMBER: _ClassVar[int]
    content: str
    max_quotes: int
    def __init__(self, content: _Optional[str] = ..., max_quotes: _Optional[int] = ...) -> None: ...

class ExtractQuotesResponse(_message.Message):
    __slots__ = ("quotes", "metadata")
    QUOTES_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    quotes: _containers.RepeatedCompositeFieldContainer[_storage_pb2.Quote]
    metadata: AnalysisMetadata
    def __init__(self, quotes: _Optional[_Iterable[_Union[_storage_pb2.Quote, _Mapping]]] = ..., metadata: _Optional[_Union[AnalysisMetadata, _Mapping]] = ...) -> None: ...

class AnalyzeSentimentRequest(_message.Message):
    __slots__ = ("content",)
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    content: str
    def __init__(self, content: _Optional[str] = ...) -> None: ...

class AnalyzeSentimentResponse(_message.Message):
    __slots__ = ("sentiment", "metadata")
    SENTIMENT_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    sentiment: SentimentResult
    metadata: AnalysisMetadata
    def __init__(self, sentiment: _Optional[_Union[SentimentResult, _Mapping]] = ..., metadata: _Optional[_Union[AnalysisMetadata, _Mapping]] = ...) -> None: ...

class SentimentResult(_message.Message):
    __slots__ = ("sentiment", "score", "confidence", "aspects")
    SENTIMENT_FIELD_NUMBER: _ClassVar[int]
    SCORE_FIELD_NUMBER: _ClassVar[int]
    CONFIDENCE_FIELD_NUMBER: _ClassVar[int]
    ASPECTS_FIELD_NUMBER: _ClassVar[int]
    sentiment: _common_pb2.Sentiment
    score: float
    confidence: float
    aspects: _containers.RepeatedCompositeFieldContainer[AspectSentiment]
    def __init__(self, sentiment: _Optional[_Union[_common_pb2.Sentiment, str]] = ..., score: _Optional[float] = ..., confidence: _Optional[float] = ..., aspects: _Optional[_Iterable[_Union[AspectSentiment, _Mapping]]] = ...) -> None: ...

class AspectSentiment(_message.Message):
    __slots__ = ("aspect", "sentiment", "score")
    ASPECT_FIELD_NUMBER: _ClassVar[int]
    SENTIMENT_FIELD_NUMBER: _ClassVar[int]
    SCORE_FIELD_NUMBER: _ClassVar[int]
    aspect: str
    sentiment: _common_pb2.Sentiment
    score: float
    def __init__(self, aspect: _Optional[str] = ..., sentiment: _Optional[_Union[_common_pb2.Sentiment, str]] = ..., score: _Optional[float] = ...) -> None: ...

class SummarizeRequest(_message.Message):
    __slots__ = ("content", "max_length", "style")
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    MAX_LENGTH_FIELD_NUMBER: _ClassVar[int]
    STYLE_FIELD_NUMBER: _ClassVar[int]
    content: str
    max_length: int
    style: SummaryStyle
    def __init__(self, content: _Optional[str] = ..., max_length: _Optional[int] = ..., style: _Optional[_Union[SummaryStyle, str]] = ...) -> None: ...

class SummarizeResponse(_message.Message):
    __slots__ = ("summary", "word_count", "metadata")
    SUMMARY_FIELD_NUMBER: _ClassVar[int]
    WORD_COUNT_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    summary: str
    word_count: int
    metadata: AnalysisMetadata
    def __init__(self, summary: _Optional[str] = ..., word_count: _Optional[int] = ..., metadata: _Optional[_Union[AnalysisMetadata, _Mapping]] = ...) -> None: ...
