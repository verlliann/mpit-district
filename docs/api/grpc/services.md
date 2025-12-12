# gRPC Services

## Обзор

Описание методов gRPC сервисов и примеры использования.

---

## Parser Service

### Endpoints

| Method | Type | Description |
|--------|------|-------------|
| `ParseArticle` | Unary | Парсинг одной статьи |
| `BatchParseArticles` | Bidirectional Streaming | Пакетный парсинг |
| `ValidateURL` | Unary | Валидация URL |
| `GetSupportedSources` | Unary | Список поддерживаемых источников |

### ParseArticle

**Синхронный парсинг одной статьи**

```protobuf
rpc ParseArticle(ParseRequest) returns (ParsedArticle);
```

**Пример (Go):**

```go
import (
    pb "github.com/ai-newsmaker/proto/parser"
    "google.golang.org/grpc"
)

client := pb.NewParserServiceClient(conn)

req := &pb.ParseRequest{
    Url:            "https://example.com/article",
    UserId:         "user-123",
    ExtractImages:  true,
    ExtractMetadata: true,
}

article, err := client.ParseArticle(ctx, req)
if err != nil {
    log.Fatalf("Error: %v", err)
}

fmt.Printf("Title: %s\n", article.Title)
fmt.Printf("Content length: %d\n", len(article.Content))
```

**Пример (Python):**

```python
import grpc
from proto import parser_pb2, parser_pb2_grpc

channel = grpc.insecure_channel('localhost:50051')
client = parser_pb2_grpc.ParserServiceStub(channel)

request = parser_pb2.ParseRequest(
    url="https://example.com/article",
    user_id="user-123",
    extract_images=True
)

article = client.ParseArticle(request)
print(f"Title: {article.title}")
print(f"Content: {article.content[:100]}...")
```

### BatchParseArticles

**Bidirectional streaming для пакетного парсинга**

```protobuf
rpc BatchParseArticles(stream ParseRequest) returns (stream ParsedArticle);
```

**Пример (Go):**

```go
stream, err := client.BatchParseArticles(ctx)
if err != nil {
    log.Fatalf("Error: %v", err)
}

// Отправка запросов
urls := []string{
    "https://example.com/article1",
    "https://example.com/article2",
    "https://example.com/article3",
}

go func() {
    for _, url := range urls {
        req := &pb.ParseRequest{
            Url:    url,
            UserId: "user-123",
        }
        if err := stream.Send(req); err != nil {
            log.Fatalf("Send error: %v", err)
        }
    }
    stream.CloseSend()
}()

// Получение результатов
for {
    article, err := stream.Recv()
    if err == io.EOF {
        break
    }
    if err != nil {
        log.Fatalf("Receive error: %v", err)
    }
    fmt.Printf("Parsed: %s\n", article.Title)
}
```

---

## AI Engine Service

### Endpoints

| Method | Type | Description |
|--------|------|-------------|
| `AnalyzeContent` | Unary | Анализ контента |
| `GeneratePost` | Unary | Генерация одного поста |
| `BatchGeneratePosts` | Server Streaming | Пакетная генерация |
| `CheckFacts` | Unary | Fact-checking |
| `ImproveContent` | Unary | Улучшение контента |

### AnalyzeContent

**Анализ статьи с извлечением фактов и тональности**

```protobuf
rpc AnalyzeContent(ContentRequest) returns (AnalysisResult);
```

**Пример (Python):**

```python
request = ai_engine_pb2.ContentRequest(
    content=article.content,
    title=article.title,
    url=article.url,
    language="ru"
)

result = client.AnalyzeContent(request)

print(f"Sentiment: {result.sentiment}")
print(f"Score: {result.sentiment_score}")
print(f"Facts: {len(result.facts)}")

for fact in result.facts:
    print(f"  - {fact.text} (importance: {fact.importance})")

for entity in result.entities:
    print(f"  - {entity.name} ({entity.type})")
```

### GeneratePost

**Генерация одного поста для платформы**

```protobuf
rpc GeneratePost(GenerationRequest) returns (GeneratedPost);
```

**Пример (Node.js):**

```javascript
const request = {
  articleId: 'article-123',
  facts: ['Fact 1', 'Fact 2', 'Fact 3'],
  platform: 'TELEGRAM',
  style: 'ENGAGING',
  formalityLevel: 7,
  options: {
    maxLength: 500,
    includeHashtags: true,
    includeEmojis: true,
    includeCta: true
  }
};

client.GeneratePost(request, (err, response) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Generated Post:');
  console.log(response.content);
  console.log('Hashtags:', response.hashtags);
  console.log('Quality:', response.qualityScore);
});
```

### BatchGeneratePosts

**Server streaming для генерации нескольких постов**

```protobuf
rpc BatchGeneratePosts(PostGenerationBatch) returns (stream GeneratedPost);
```

**Пример (Python):**

```python
request = ai_engine_pb2.PostGenerationBatch(
    article_id="article-123",
    platforms=["TELEGRAM", "VK", "INSTAGRAM"],
    style="ENGAGING",
    count=5,
    formality_level=7
)

# Получение stream результатов
for post in client.BatchGeneratePosts(request):
    print(f"Platform: {post.platform}")
    print(f"Content: {post.content}")
    print(f"Quality: {post.quality_score}")
    print("---")
```

---

## Media Service

### Endpoints

| Method | Type | Description |
|--------|------|-------------|
| `ProcessImage` | Unary | Обработка изображения |
| `GenerateAIImage` | Unary | AI-генерация |
| `CreateInfographic` | Unary | Создание инфографики |
| `OptimizeForPlatform` | Unary | Оптимизация под платформу |
| `BatchProcessImages` | Bidirectional Streaming | Пакетная обработка |

### ProcessImage

**Обработка и оптимизация изображения**

```protobuf
rpc ProcessImage(ImageRequest) returns (ProcessedImage);
```

**Пример (Go):**

```go
req := &pb.ImageRequest{
    ImageUrl: "https://example.com/image.jpg",
    Operations: []string{"resize", "optimize", "watermark"},
    Options: &pb.ProcessingOptions{
        Quality:             85,
        Format:              "webp",
        MaxWidth:            1200,
        MaxHeight:           800,
        MaintainAspectRatio: true,
        Watermark: &pb.WatermarkOptions{
            LogoUrl:  "https://brand.com/logo.png",
            Position: "bottom-right",
            Opacity:  0.7,
            Size:     50,
        },
    },
}

image, err := client.ProcessImage(ctx, req)
if err != nil {
    log.Fatalf("Error: %v", err)
}

fmt.Printf("Processed: %s\n", image.Url)
fmt.Printf("Size: %dx%d, %d bytes\n", image.Width, image.Height, image.Size)
fmt.Printf("Compression: %.2f%%\n", image.Stats.CompressionRatio*100)
```

### GenerateAIImage

**Генерация изображения с помощью AI**

```protobuf
rpc GenerateAIImage(AIImageRequest) returns (GeneratedImage);
```

**Пример (Python):**

```python
request = media_pb2.AIImageRequest(
    prompt="Modern office workspace with laptop",
    negative_prompt="blurry, low quality",
    style="photorealistic",
    width=1024,
    height=768,
    options=media_pb2.AIGenerationOptions(
        model="stable-diffusion",
        steps=50,
        guidance_scale=7.5,
        num_images=1
    )
)

image = client.GenerateAIImage(request)
print(f"Generated: {image.url}")
print(f"Model: {image.metadata.model_used}")
print(f"Time: {image.metadata.generation_time_ms}ms")
```

---

## Publishing Service

### Endpoints

| Method | Type | Description |
|--------|------|-------------|
| `PublishPost` | Unary | Публикация поста |
| `SchedulePost` | Unary | Планирование публикации |
| `GetPublicationStatus` | Unary | Статус публикации |
| `CancelScheduledPost` | Unary | Отмена публикации |
| `GetMetrics` | Unary | Получение метрик |
| `RefreshToken` | Unary | Обновление токена |

### PublishPost

**Публикация поста на платформу**

```protobuf
rpc PublishPost(PublishRequest) returns (PublishResult);
```

**Пример (Node.js):**

```javascript
const request = {
  postId: 'post-123',
  platform: 'TELEGRAM',
  accountId: 'account-456',
  content: '🚀 Exciting news! Check out our latest update.',
  mediaUrls: ['https://cdn.example.com/image1.jpg'],
  options: {
    disableNotification: false,
    disableLinkPreview: false,
    hashtags: ['news', 'update']
  }
};

client.PublishPost(request, (err, result) => {
  if (err) {
    console.error('Publish error:', err);
    return;
  }
  
  if (result.success) {
    console.log('Published successfully!');
    console.log('External URL:', result.externalUrl);
    console.log('External ID:', result.externalId);
  } else {
    console.error('Publish failed:', result.error);
  }
});
```

### SchedulePost

**Планирование публикации на будущее**

```protobuf
rpc SchedulePost(ScheduleRequest) returns (ScheduleResult);
```

**Пример (Python):**

```python
from datetime import datetime, timedelta

scheduled_time = datetime.now() + timedelta(hours=2)

request = publishing_pb2.ScheduleRequest(
    post_id="post-123",
    scheduled_at=int(scheduled_time.timestamp()),
    publish_request=publishing_pb2.PublishRequest(
        post_id="post-123",
        platform="VK",
        account_id="account-789",
        content="Scheduled post content"
    )
)

result = client.SchedulePost(request)
if result.success:
    print(f"Scheduled with job ID: {result.job_id}")
else:
    print(f"Schedule failed: {result.error}")
```

### GetMetrics

**Получение метрик опубликованного поста**

```protobuf
rpc GetMetrics(MetricsRequest) returns (MetricsResponse);
```

**Пример (Go):**

```go
req := &pb.MetricsRequest{
    PostId:     "post-123",
    ExternalId: "telegram-msg-456",
    Platform:   "TELEGRAM",
}

metrics, err := client.GetMetrics(ctx, req)
if err != nil {
    log.Fatalf("Error: %v", err)
}

fmt.Printf("Views: %d\n", metrics.Views)
fmt.Printf("Likes: %d\n", metrics.Likes)
fmt.Printf("Comments: %d\n", metrics.Comments)
fmt.Printf("Engagement: %.2f%%\n", metrics.Engagement)
fmt.Printf("Reach: %d\n", metrics.Reach)
```

---

## Storage Service

### Endpoints

| Method | Type | Description |
|--------|------|-------------|
| `SaveArticle` | Unary | Сохранить статью |
| `GetArticle` | Unary | Получить статью |
| `ListArticles` | Unary | Список статей |
| `SavePost` | Unary | Сохранить пост |
| `GetPost` | Unary | Получить пост |
| `UploadFile` | Client Streaming | Загрузка файла |
| `DownloadFile` | Server Streaming | Скачивание файла |

### SaveArticle / GetArticle

**CRUD операции для статей**

```protobuf
rpc SaveArticle(Article) returns (SaveResult);
rpc GetArticle(GetRequest) returns (Article);
```

**Пример (Python):**

```python
# Сохранение
article = storage_pb2.Article(
    id="article-123",
    user_id="user-456",
    url="https://example.com/article",
    title="Article Title",
    content="Full article content...",
    sentiment="POSITIVE",
    sentiment_score=0.87
)

result = client.SaveArticle(article)
if result.success:
    print(f"Saved with ID: {result.id}")

# Получение
req = storage_pb2.GetRequest(
    id="article-123",
    user_id="user-456"
)

article = client.GetArticle(req)
print(f"Title: {article.title}")
print(f"Content: {article.content}")
```

### UploadFile

**Client streaming для загрузки больших файлов**

```protobuf
rpc UploadFile(stream FileChunk) returns (FileUploadResult);
```

**Пример (Go):**

```go
stream, err := client.UploadFile(ctx)
if err != nil {
    log.Fatalf("Error: %v", err)
}

file, err := os.Open("image.jpg")
if err != nil {
    log.Fatalf("Error opening file: %v", err)
}
defer file.Close()

buf := make([]byte, 1024*64) // 64KB chunks
chunkNumber := 0

for {
    n, err := file.Read(buf)
    if err == io.EOF {
        break
    }
    if err != nil {
        log.Fatalf("Read error: %v", err)
    }

    chunk := &pb.FileChunk{
        FileId:      "file-123",
        Data:        buf[:n],
        ChunkNumber: int32(chunkNumber),
        Metadata: &pb.FileMetadata{
            Filename:    "image.jpg",
            ContentType: "image/jpeg",
            UserId:      "user-456",
        },
    }

    if err := stream.Send(chunk); err != nil {
        log.Fatalf("Send error: %v", err)
    }
    chunkNumber++
}

result, err := stream.CloseAndRecv()
if err != nil {
    log.Fatalf("Error: %v", err)
}

fmt.Printf("Uploaded: %s\n", result.Url)
```

---

## Error Handling

### Standard Error Codes

```go
import "google.golang.org/grpc/codes"
import "google.golang.org/grpc/status"

// Server-side
if article == nil {
    return nil, status.Errorf(
        codes.NotFound,
        "Article not found: %s",
        req.Id,
    )
}

// Client-side
article, err := client.GetArticle(ctx, req)
if err != nil {
    st, ok := status.FromError(err)
    if ok {
        switch st.Code() {
        case codes.NotFound:
            fmt.Println("Article not found")
        case codes.PermissionDenied:
            fmt.Println("Access denied")
        default:
            fmt.Printf("Error: %v\n", st.Message())
        }
    }
}
```

### Custom Error Details

```go
import "google.golang.org/genproto/googleapis/rpc/errdetails"

// Server-side
st := status.New(codes.InvalidArgument, "Invalid URL format")
v := &errdetails.BadRequest{
    FieldViolations: []*errdetails.BadRequest_FieldViolation{
        {
            Field:       "url",
            Description: "URL must start with http:// or https://",
        },
    },
}
st, err := st.WithDetails(v)
return st.Err()

// Client-side
st := status.Convert(err)
for _, detail := range st.Details() {
    switch t := detail.(type) {
    case *errdetails.BadRequest:
        for _, violation := range t.GetFieldViolations() {
            fmt.Printf("Field: %s, Error: %s\n", 
                violation.GetField(), 
                violation.GetDescription())
        }
    }
}
```

---

## Interceptors

### Client Interceptor (Auth)

```go
func authInterceptor(token string) grpc.UnaryClientInterceptor {
    return func(
        ctx context.Context,
        method string,
        req, reply interface{},
        cc *grpc.ClientConn,
        invoker grpc.UnaryInvoker,
        opts ...grpc.CallOption,
    ) error {
        ctx = metadata.AppendToOutgoingContext(ctx, "authorization", "Bearer "+token)
        return invoker(ctx, method, req, reply, cc, opts...)
    }
}

// Usage
conn, err := grpc.Dial(
    "localhost:50051",
    grpc.WithUnaryInterceptor(authInterceptor(token)),
)
```

### Server Interceptor (Logging)

```go
func loggingInterceptor() grpc.UnaryServerInterceptor {
    return func(
        ctx context.Context,
        req interface{},
        info *grpc.UnaryServerInfo,
        handler grpc.UnaryHandler,
    ) (interface{}, error) {
        start := time.Now()
        resp, err := handler(ctx, req)
        duration := time.Since(start)
        
        log.Printf(
            "Method: %s, Duration: %v, Error: %v",
            info.FullMethod,
            duration,
            err,
        )
        
        return resp, err
    }
}

// Usage
server := grpc.NewServer(
    grpc.UnaryInterceptor(loggingInterceptor()),
)
```

---

## Best Practices

### 1. Context Management

```go
// Always use context with timeout
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

result, err := client.ParseArticle(ctx, req)
```

### 2. Connection Pooling

```go
// Reuse connections
var conn *grpc.ClientConn
var once sync.Once

func getConnection() (*grpc.ClientConn, error) {
    once.Do(func() {
        conn, _ = grpc.Dial(
            "localhost:50051",
            grpc.WithInsecure(),
            grpc.WithKeepaliveParams(keepalive.ClientParameters{
                Time:    30 * time.Second,
                Timeout: 10 * time.Second,
            }),
        )
    })
    return conn, nil
}
```

### 3. Retry Logic

```go
import "github.com/grpc-ecosystem/go-grpc-middleware/retry"

conn, err := grpc.Dial(
    "localhost:50051",
    grpc.WithUnaryInterceptor(
        retry.UnaryClientInterceptor(
            retry.WithMax(3),
            retry.WithBackoff(retry.BackoffLinear(100*time.Millisecond)),
        ),
    ),
)
```

---

**См. также:**
- [Protocol Buffers](./protobuf.md)
- [Микросервисы](../../architecture/microservices.md)
- [Development Guide](../../development/guidelines.md)

