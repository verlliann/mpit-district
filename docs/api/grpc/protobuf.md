# gRPC Protocol Buffers

## Обзор

Protocol Buffers (protobuf) - язык описания структуры данных для gRPC коммуникации между микросервисами.

---

## Common Types (common.proto)

### Базовые типы для всех сервисов

```protobuf
syntax = "proto3";

package common;

option go_package = "github.com/ai-newsmaker/proto/common";

// Timestamp
message Timestamp {
  int64 seconds = 1;
  int32 nanos = 2;
}

// Error response
message Error {
  string code = 1;
  string message = 2;
  map<string, string> details = 3;
}

// Pagination
message Pagination {
  int32 page = 1;
  int32 page_size = 2;
  int32 total = 3;
  int32 total_pages = 4;
}

// Image
message Image {
  string id = 1;
  string url = 2;
  string thumbnail_url = 3;
  int32 width = 4;
  int32 height = 5;
  string alt_text = 6;
  int64 size = 7;
  string format = 8;
}

// Status
enum Status {
  STATUS_UNSPECIFIED = 0;
  STATUS_PENDING = 1;
  STATUS_IN_PROGRESS = 2;
  STATUS_COMPLETED = 3;
  STATUS_FAILED = 4;
}
```

---

## Parser Service (parser.proto)

```protobuf
syntax = "proto3";

package parser;

import "common.proto";

option go_package = "github.com/ai-newsmaker/proto/parser";

service ParserService {
  // Парсинг одной статьи
  rpc ParseArticle(ParseRequest) returns (ParsedArticle);
  
  // Пакетный парсинг (streaming)
  rpc BatchParseArticles(stream ParseRequest) returns (stream ParsedArticle);
  
  // Валидация URL
  rpc ValidateURL(URLRequest) returns (ValidationResponse);
  
  // Получить список поддерживаемых источников
  rpc GetSupportedSources(Empty) returns (SourcesList);
}

// Запрос на парсинг
message ParseRequest {
  string url = 1;
  string user_id = 2;
  bool extract_images = 3;
  bool extract_metadata = 4;
  ParserOptions options = 5;
}

message ParserOptions {
  int32 timeout_seconds = 1;
  bool use_headless_browser = 2;
  string user_agent = 3;
  repeated string custom_headers = 4;
}

// Результат парсинга
message ParsedArticle {
  string id = 1;
  string url = 2;
  string normalized_url = 3;
  string title = 4;
  string content = 5;
  string excerpt = 6;
  string source = 7;
  string author = 8;
  int64 published_at = 9;
  repeated common.Image images = 10;
  map<string, string> metadata = 11;
  string html = 12;
  ParsingStats stats = 13;
}

message ParsingStats {
  int64 parsing_time_ms = 1;
  int32 content_length = 2;
  int32 images_count = 3;
  string parser_version = 4;
}

// Валидация URL
message URLRequest {
  string url = 1;
}

message ValidationResponse {
  bool valid = 1;
  string normalized_url = 2;
  string error = 3;
  SourceInfo source_info = 4;
}

message SourceInfo {
  string name = 1;
  string domain = 2;
  bool supported = 3;
  string parser_type = 4;
}

// Список источников
message Empty {}

message SourcesList {
  repeated Source sources = 1;
}

message Source {
  string name = 1;
  string domain = 2;
  string country = 3;
  string language = 4;
  bool requires_auth = 5;
}
```

---

## AI Engine Service (ai_engine.proto)

```protobuf
syntax = "proto3";

package ai_engine;

import "common.proto";

option go_package = "github.com/ai-newsmaker/proto/ai_engine";

service AIService {
  // Анализ контента
  rpc AnalyzeContent(ContentRequest) returns (AnalysisResult);
  
  // Генерация одного поста
  rpc GeneratePost(GenerationRequest) returns (GeneratedPost);
  
  // Пакетная генерация постов (streaming)
  rpc BatchGeneratePosts(PostGenerationBatch) returns (stream GeneratedPost);
  
  // Проверка фактов (fact-checking)
  rpc CheckFacts(FactCheckRequest) returns (FactCheckResult);
  
  // Улучшение существующего контента
  rpc ImproveContent(ImproveContentRequest) returns (ImprovedContent);
}

// Анализ контента
message ContentRequest {
  string content = 1;
  string title = 2;
  string url = 3;
  string language = 4;
}

message AnalysisResult {
  Sentiment sentiment = 1;
  double sentiment_score = 2;
  repeated Fact facts = 3;
  repeated Entity entities = 4;
  repeated Quote quotes = 5;
  string summary = 6;
  repeated string keywords = 7;
  string category = 8;
  double confidence = 9;
}

enum Sentiment {
  SENTIMENT_UNSPECIFIED = 0;
  SENTIMENT_POSITIVE = 1;
  SENTIMENT_NEUTRAL = 2;
  SENTIMENT_NEGATIVE = 3;
}

message Fact {
  string text = 1;
  double importance = 2;
  string source = 3;
}

message Entity {
  string name = 1;
  string type = 2;  // PERSON, ORGANIZATION, LOCATION, etc.
  int32 mentions = 3;
  double confidence = 4;
}

message Quote {
  string text = 1;
  string author = 2;
  string context = 3;
}

// Генерация постов
message GenerationRequest {
  string article_id = 1;
  repeated string facts = 2;
  string platform = 3;
  string style = 4;
  int32 formality_level = 5;
  GenerationOptions options = 6;
}

message GenerationOptions {
  int32 max_length = 1;
  int32 min_length = 2;
  bool include_hashtags = 3;
  bool include_emojis = 4;
  bool include_cta = 5;
  string tone_of_voice = 6;
  string target_audience = 7;
  string brand_voice = 8;
}

message GeneratedPost {
  string content = 1;
  string platform = 2;
  string style = 3;
  repeated string hashtags = 4;
  int32 length = 5;
  double quality_score = 6;
  GenerationMetadata metadata = 7;
}

message GenerationMetadata {
  string model_used = 1;
  int32 tokens_used = 2;
  int64 generation_time_ms = 3;
  int32 prompt_tokens = 4;
  int32 completion_tokens = 5;
  double temperature = 6;
}

// Пакетная генерация
message PostGenerationBatch {
  string article_id = 1;
  repeated string platforms = 2;
  string style = 3;
  int32 count = 4;
  int32 formality_level = 5;
  GenerationOptions options = 6;
}

// Fact-checking
message FactCheckRequest {
  repeated string claims = 1;
  string original_content = 2;
  string source_url = 3;
}

message FactCheckResult {
  repeated FactCheck checks = 1;
  double overall_accuracy = 2;
}

message FactCheck {
  string claim = 1;
  bool accurate = 2;
  double confidence = 3;
  string explanation = 4;
  repeated string sources = 5;
}

// Улучшение контента
message ImproveContentRequest {
  string content = 1;
  string platform = 2;
  repeated string improvement_goals = 3;  // "engagement", "clarity", "seo"
}

message ImprovedContent {
  string original = 1;
  string improved = 2;
  repeated Improvement improvements = 3;
  double quality_improvement = 4;
}

message Improvement {
  string type = 1;
  string description = 2;
  string before = 3;
  string after = 4;
}
```

---

## Media Service (media.proto)

```protobuf
syntax = "proto3";

package media;

import "common.proto";

option go_package = "github.com/ai-newsmaker/proto/media";

service MediaService {
  // Обработка изображения
  rpc ProcessImage(ImageRequest) returns (ProcessedImage);
  
  // AI-генерация изображения
  rpc GenerateAIImage(AIImageRequest) returns (GeneratedImage);
  
  // Создание инфографики
  rpc CreateInfographic(InfographicRequest) returns (Infographic);
  
  // Оптимизация под платформу
  rpc OptimizeForPlatform(OptimizationRequest) returns (OptimizedMedia);
  
  // Пакетная обработка
  rpc BatchProcessImages(stream ImageRequest) returns (stream ProcessedImage);
}

// Обработка изображения
message ImageRequest {
  string image_url = 1;
  bytes image_data = 2;
  repeated string operations = 3;  // "resize", "crop", "optimize", "watermark"
  ProcessingOptions options = 4;
}

message ProcessingOptions {
  int32 quality = 1;
  string format = 2;  // "jpg", "png", "webp"
  int32 max_width = 3;
  int32 max_height = 4;
  bool maintain_aspect_ratio = 5;
  WatermarkOptions watermark = 6;
}

message WatermarkOptions {
  string logo_url = 1;
  string position = 2;  // "bottom-right", "bottom-left", etc.
  double opacity = 3;
  int32 size = 4;
}

message ProcessedImage {
  string id = 1;
  string url = 2;
  string thumbnail_url = 3;
  int32 width = 4;
  int32 height = 5;
  int64 size = 6;
  string format = 7;
  ProcessingStats stats = 8;
}

message ProcessingStats {
  int64 processing_time_ms = 1;
  int64 original_size = 2;
  int64 compressed_size = 3;
  double compression_ratio = 4;
}

// AI-генерация
message AIImageRequest {
  string prompt = 1;
  string negative_prompt = 2;
  string style = 3;
  int32 width = 4;
  int32 height = 5;
  AIGenerationOptions options = 6;
}

message AIGenerationOptions {
  string model = 1;  // "stable-diffusion", "dall-e", "midjourney"
  int32 steps = 2;
  double guidance_scale = 3;
  int64 seed = 4;
  int32 num_images = 5;
}

message GeneratedImage {
  string id = 1;
  string url = 2;
  int32 width = 3;
  int32 height = 4;
  string prompt_used = 5;
  AIGenerationMetadata metadata = 6;
}

message AIGenerationMetadata {
  string model_used = 1;
  int64 generation_time_ms = 2;
  int64 seed = 3;
  double guidance_scale = 4;
  int32 steps = 5;
}

// Инфографика
message InfographicRequest {
  string template_id = 1;
  map<string, string> data = 2;
  InfographicOptions options = 3;
}

message InfographicOptions {
  string color_scheme = 1;
  string font_family = 2;
  int32 width = 3;
  int32 height = 4;
  string brand_colors = 5;
}

message Infographic {
  string id = 1;
  string url = 2;
  int32 width = 3;
  int32 height = 4;
  string format = 5;
}

// Оптимизация под платформу
message OptimizationRequest {
  string image_url = 1;
  string platform = 2;  // "telegram", "instagram", "facebook"
  string post_type = 3;  // "feed", "story", "profile"
}

message OptimizedMedia {
  string original_url = 1;
  repeated PlatformVariant variants = 2;
}

message PlatformVariant {
  string platform = 1;
  string url = 2;
  int32 width = 3;
  int32 height = 4;
  string format = 5;
  int64 size = 6;
}
```

---

## Publishing Service (publishing.proto)

```protobuf
syntax = "proto3";

package publishing;

import "common.proto";

option go_package = "github.com/ai-newsmaker/proto/publishing";

service PublishingService {
  // Публикация поста
  rpc PublishPost(PublishRequest) returns (PublishResult);
  
  // Планирование публикации
  rpc SchedulePost(ScheduleRequest) returns (ScheduleResult);
  
  // Получить статус публикации
  rpc GetPublicationStatus(StatusRequest) returns (PublicationStatus);
  
  // Отменить запланированную публикацию
  rpc CancelScheduledPost(CancelRequest) returns (CancelResult);
  
  // Получить метрики
  rpc GetMetrics(MetricsRequest) returns (MetricsResponse);
  
  // Обновить токен соцсети
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResult);
}

// Публикация
message PublishRequest {
  string post_id = 1;
  string platform = 2;
  string account_id = 3;
  string content = 4;
  repeated string media_urls = 5;
  PublishOptions options = 6;
}

message PublishOptions {
  bool disable_notification = 1;
  bool disable_link_preview = 2;
  string reply_to = 3;
  repeated string hashtags = 4;
  string scheduled_for = 5;
}

message PublishResult {
  bool success = 1;
  string external_id = 2;
  string external_url = 3;
  string error = 4;
  PublishMetadata metadata = 5;
}

message PublishMetadata {
  string platform = 1;
  int64 published_at = 2;
  int64 processing_time_ms = 3;
  int32 retry_count = 4;
}

// Планирование
message ScheduleRequest {
  string post_id = 1;
  int64 scheduled_at = 2;
  PublishRequest publish_request = 3;
}

message ScheduleResult {
  bool success = 1;
  string job_id = 2;
  int64 scheduled_at = 3;
  string error = 4;
}

// Статус публикации
message StatusRequest {
  string post_id = 1;
  string external_id = 2;
}

message PublicationStatus {
  string post_id = 1;
  string status = 2;  // "pending", "published", "failed"
  string external_id = 3;
  string external_url = 4;
  int64 published_at = 5;
  string error = 6;
  int32 retry_count = 7;
  int64 next_retry_at = 8;
}

// Отмена
message CancelRequest {
  string post_id = 1;
  string job_id = 2;
}

message CancelResult {
  bool success = 1;
  string error = 2;
}

// Метрики
message MetricsRequest {
  string post_id = 1;
  string external_id = 2;
  string platform = 3;
}

message MetricsResponse {
  string post_id = 1;
  int32 views = 2;
  int32 likes = 3;
  int32 comments = 4;
  int32 shares = 5;
  int32 clicks = 6;
  int32 reach = 7;
  int32 impressions = 8;
  double engagement = 9;
  int64 updated_at = 10;
}

// Обновление токена
message RefreshTokenRequest {
  string account_id = 1;
  string platform = 2;
  string refresh_token = 3;
}

message RefreshTokenResult {
  bool success = 1;
  string access_token = 2;
  string refresh_token = 3;
  int64 expires_at = 4;
  string error = 5;
}
```

---

## Storage Service (storage.proto)

```protobuf
syntax = "proto3";

package storage;

import "common.proto";

option go_package = "github.com/ai-newsmaker/proto/storage";

service StorageService {
  // Articles
  rpc SaveArticle(Article) returns (SaveResult);
  rpc GetArticle(GetRequest) returns (Article);
  rpc ListArticles(ListRequest) returns (ArticlesList);
  rpc DeleteArticle(DeleteRequest) returns (DeleteResult);
  
  // Posts
  rpc SavePost(Post) returns (SaveResult);
  rpc GetPost(GetRequest) returns (Post);
  rpc ListPosts(ListRequest) returns (PostsList);
  rpc UpdatePost(UpdatePostRequest) returns (Post);
  rpc DeletePost(DeleteRequest) returns (DeleteResult);
  
  // Files
  rpc UploadFile(stream FileChunk) returns (FileUploadResult);
  rpc DownloadFile(FileRequest) returns (stream FileChunk);
  rpc DeleteFile(FileRequest) returns (DeleteResult);
  rpc GetFileInfo(FileRequest) returns (FileInfo);
}

// Article operations
message Article {
  string id = 1;
  string user_id = 2;
  string url = 3;
  string title = 4;
  string content = 5;
  string excerpt = 6;
  string source = 7;
  string author = 8;
  int64 published_at = 9;
  int64 parsed_at = 10;
  string sentiment = 11;
  double sentiment_score = 12;
  bytes metadata = 13;  // JSON
  repeated string image_ids = 14;
}

message Post {
  string id = 1;
  string article_id = 2;
  string user_id = 3;
  string platform = 4;
  string content = 5;
  string style = 6;
  string status = 7;
  int64 scheduled_at = 8;
  int64 published_at = 9;
  string external_id = 10;
  string external_url = 11;
  repeated string image_ids = 12;
  int64 created_at = 13;
  int64 updated_at = 14;
}

// Generic operations
message SaveResult {
  bool success = 1;
  string id = 2;
  string error = 3;
}

message GetRequest {
  string id = 1;
  string user_id = 2;
}

message ListRequest {
  string user_id = 1;
  int32 limit = 2;
  int32 offset = 3;
  string filter = 4;  // JSON filter
  string sort_by = 5;
  bool ascending = 6;
}

message ArticlesList {
  repeated Article articles = 1;
  int32 total = 2;
  common.Pagination pagination = 3;
}

message PostsList {
  repeated Post posts = 1;
  int32 total = 2;
  common.Pagination pagination = 3;
}

message UpdatePostRequest {
  string id = 1;
  string user_id = 2;
  map<string, string> fields = 3;
}

message DeleteRequest {
  string id = 1;
  string user_id = 2;
}

message DeleteResult {
  bool success = 1;
  string error = 2;
}

// File operations
message FileChunk {
  string file_id = 1;
  bytes data = 2;
  int32 chunk_number = 3;
  int32 total_chunks = 4;
  FileMetadata metadata = 5;
}

message FileMetadata {
  string filename = 1;
  string content_type = 2;
  int64 size = 3;
  string user_id = 4;
}

message FileUploadResult {
  bool success = 1;
  string file_id = 2;
  string url = 3;
  string error = 4;
}

message FileRequest {
  string file_id = 1;
  string user_id = 2;
}

message FileInfo {
  string file_id = 1;
  string filename = 2;
  string content_type = 3;
  int64 size = 4;
  string url = 5;
  int64 created_at = 6;
}
```

---

## Code Generation

### Go

```bash
protoc --go_out=. --go_opt=paths=source_relative \
  --go-grpc_out=. --go-grpc_opt=paths=source_relative \
  parser.proto
```

### Python

```bash
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. \
  parser.proto
```

### Node.js/TypeScript

```bash
grpc_tools_node_protoc --js_out=import_style=commonjs,binary:. \
  --grpc_out=grpc_js:. --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
  parser.proto
```

---

**См. также:**
- [gRPC Services](./services.md)
- [Микросервисы](../../architecture/microservices.md)
- [Development Setup](../../development/setup.md)

