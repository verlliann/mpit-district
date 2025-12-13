from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Sentiment(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    SENTIMENT_UNSPECIFIED: _ClassVar[Sentiment]
    SENTIMENT_POSITIVE: _ClassVar[Sentiment]
    SENTIMENT_NEUTRAL: _ClassVar[Sentiment]
    SENTIMENT_NEGATIVE: _ClassVar[Sentiment]

class Platform(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    PLATFORM_UNSPECIFIED: _ClassVar[Platform]
    PLATFORM_TELEGRAM: _ClassVar[Platform]
    PLATFORM_VK: _ClassVar[Platform]
    PLATFORM_FACEBOOK: _ClassVar[Platform]
    PLATFORM_INSTAGRAM: _ClassVar[Platform]
    PLATFORM_LINKEDIN: _ClassVar[Platform]
    PLATFORM_TWITTER: _ClassVar[Platform]
    PLATFORM_TIKTOK: _ClassVar[Platform]
    PLATFORM_YANDEX_ZEN: _ClassVar[Platform]
    PLATFORM_OK_RU: _ClassVar[Platform]

class PostStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    POST_STATUS_UNSPECIFIED: _ClassVar[PostStatus]
    POST_STATUS_DRAFT: _ClassVar[PostStatus]
    POST_STATUS_PENDING: _ClassVar[PostStatus]
    POST_STATUS_SCHEDULED: _ClassVar[PostStatus]
    POST_STATUS_PUBLISHED: _ClassVar[PostStatus]
    POST_STATUS_FAILED: _ClassVar[PostStatus]
    POST_STATUS_CANCELLED: _ClassVar[PostStatus]

class PostStyle(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    POST_STYLE_UNSPECIFIED: _ClassVar[PostStyle]
    POST_STYLE_NEUTRAL: _ClassVar[PostStyle]
    POST_STYLE_FORMAL: _ClassVar[PostStyle]
    POST_STYLE_ENGAGING: _ClassVar[PostStyle]
    POST_STYLE_INFORMAL: _ClassVar[PostStyle]
    POST_STYLE_BUSINESS: _ClassVar[PostStyle]
    POST_STYLE_CREATIVE: _ClassVar[PostStyle]

class EntityType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    ENTITY_TYPE_UNSPECIFIED: _ClassVar[EntityType]
    ENTITY_TYPE_PERSON: _ClassVar[EntityType]
    ENTITY_TYPE_ORGANIZATION: _ClassVar[EntityType]
    ENTITY_TYPE_LOCATION: _ClassVar[EntityType]
    ENTITY_TYPE_EVENT: _ClassVar[EntityType]
    ENTITY_TYPE_PRODUCT: _ClassVar[EntityType]
    ENTITY_TYPE_OTHER: _ClassVar[EntityType]

class UserRole(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    USER_ROLE_UNSPECIFIED: _ClassVar[UserRole]
    USER_ROLE_ADMIN: _ClassVar[UserRole]
    USER_ROLE_EDITOR: _ClassVar[UserRole]
    USER_ROLE_VIEWER: _ClassVar[UserRole]
SENTIMENT_UNSPECIFIED: Sentiment
SENTIMENT_POSITIVE: Sentiment
SENTIMENT_NEUTRAL: Sentiment
SENTIMENT_NEGATIVE: Sentiment
PLATFORM_UNSPECIFIED: Platform
PLATFORM_TELEGRAM: Platform
PLATFORM_VK: Platform
PLATFORM_FACEBOOK: Platform
PLATFORM_INSTAGRAM: Platform
PLATFORM_LINKEDIN: Platform
PLATFORM_TWITTER: Platform
PLATFORM_TIKTOK: Platform
PLATFORM_YANDEX_ZEN: Platform
PLATFORM_OK_RU: Platform
POST_STATUS_UNSPECIFIED: PostStatus
POST_STATUS_DRAFT: PostStatus
POST_STATUS_PENDING: PostStatus
POST_STATUS_SCHEDULED: PostStatus
POST_STATUS_PUBLISHED: PostStatus
POST_STATUS_FAILED: PostStatus
POST_STATUS_CANCELLED: PostStatus
POST_STYLE_UNSPECIFIED: PostStyle
POST_STYLE_NEUTRAL: PostStyle
POST_STYLE_FORMAL: PostStyle
POST_STYLE_ENGAGING: PostStyle
POST_STYLE_INFORMAL: PostStyle
POST_STYLE_BUSINESS: PostStyle
POST_STYLE_CREATIVE: PostStyle
ENTITY_TYPE_UNSPECIFIED: EntityType
ENTITY_TYPE_PERSON: EntityType
ENTITY_TYPE_ORGANIZATION: EntityType
ENTITY_TYPE_LOCATION: EntityType
ENTITY_TYPE_EVENT: EntityType
ENTITY_TYPE_PRODUCT: EntityType
ENTITY_TYPE_OTHER: EntityType
USER_ROLE_UNSPECIFIED: UserRole
USER_ROLE_ADMIN: UserRole
USER_ROLE_EDITOR: UserRole
USER_ROLE_VIEWER: UserRole

class Timestamp(_message.Message):
    __slots__ = ("seconds", "nanos")
    SECONDS_FIELD_NUMBER: _ClassVar[int]
    NANOS_FIELD_NUMBER: _ClassVar[int]
    seconds: int
    nanos: int
    def __init__(self, seconds: _Optional[int] = ..., nanos: _Optional[int] = ...) -> None: ...

class PaginationRequest(_message.Message):
    __slots__ = ("limit", "offset")
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    limit: int
    offset: int
    def __init__(self, limit: _Optional[int] = ..., offset: _Optional[int] = ...) -> None: ...

class PaginationResponse(_message.Message):
    __slots__ = ("total_count", "offset", "limit", "has_next_page", "has_previous_page")
    TOTAL_COUNT_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    HAS_NEXT_PAGE_FIELD_NUMBER: _ClassVar[int]
    HAS_PREVIOUS_PAGE_FIELD_NUMBER: _ClassVar[int]
    total_count: int
    offset: int
    limit: int
    has_next_page: bool
    has_previous_page: bool
    def __init__(self, total_count: _Optional[int] = ..., offset: _Optional[int] = ..., limit: _Optional[int] = ..., has_next_page: bool = ..., has_previous_page: bool = ...) -> None: ...

class StatusResponse(_message.Message):
    __slots__ = ("success", "message", "error_code")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    ERROR_CODE_FIELD_NUMBER: _ClassVar[int]
    success: bool
    message: str
    error_code: str
    def __init__(self, success: bool = ..., message: _Optional[str] = ..., error_code: _Optional[str] = ...) -> None: ...

class HealthCheckRequest(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class HealthCheckResponse(_message.Message):
    __slots__ = ("status", "service", "version", "timestamp")
    STATUS_FIELD_NUMBER: _ClassVar[int]
    SERVICE_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    status: str
    service: str
    version: str
    timestamp: Timestamp
    def __init__(self, status: _Optional[str] = ..., service: _Optional[str] = ..., version: _Optional[str] = ..., timestamp: _Optional[_Union[Timestamp, _Mapping]] = ...) -> None: ...
