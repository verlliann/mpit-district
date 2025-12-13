"""MinIO client for object storage."""
import io
import uuid
from typing import Optional
import structlog
from minio import Minio
from minio.error import S3Error
import httpx

from config import settings

logger = structlog.get_logger(__name__)


class MinioStorage:
    """MinIO storage client."""
    
    def __init__(self, lazy_init: bool = False):
        self._client = None
        self.bucket = settings.MINIO_BUCKET
        self.logger = logger.bind(service="minio", bucket=self.bucket)
        self._initialized = False
        
        # Optionally defer connection for testing
        if not lazy_init:
            self._init_client()
    
    @property
    def client(self):
        """Lazy client initialization."""
        if self._client is None:
            self._init_client()
        return self._client
    
    def _init_client(self):
        """Initialize MinIO client and ensure bucket."""
        self._client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self._ensure_bucket()
    
    def _ensure_bucket(self):
        """Create bucket if it doesn't exist."""
        try:
            if not self._client.bucket_exists(self.bucket):
                self._client.make_bucket(self.bucket)
                self.logger.info("Bucket created", bucket=self.bucket)
            else:
                self.logger.info("Bucket exists", bucket=self.bucket)
            self._initialized = True
        except S3Error as e:
            self.logger.warning("MinIO not available", error=str(e))
            # Don't raise - allow service to start without MinIO
    
    async def upload(
        self,
        data: bytes,
        filename: str,
        content_type: str = "application/octet-stream",
        folder: str = ""
    ) -> str:
        """Upload file to MinIO."""
        try:
            # Generate object name
            file_ext = filename.split(".")[-1] if "." in filename else ""
            object_id = str(uuid.uuid4())
            object_name = f"{folder}/{object_id}.{file_ext}" if folder else f"{object_id}.{file_ext}"
            
            # Upload
            self.client.put_object(
                bucket_name=self.bucket,
                object_name=object_name,
                data=io.BytesIO(data),
                length=len(data),
                content_type=content_type
            )
            
            self.logger.info(
                "File uploaded",
                object_name=object_name,
                size=len(data),
                content_type=content_type
            )
            
            return object_name
            
        except S3Error as e:
            self.logger.error("Failed to upload file", error=str(e))
            raise
    
    async def download(self, object_name: str) -> bytes:
        """Download file from MinIO."""
        try:
            response = self.client.get_object(self.bucket, object_name)
            data = response.read()
            response.close()
            response.release_conn()
            
            self.logger.info("File downloaded", object_name=object_name, size=len(data))
            
            return data
            
        except S3Error as e:
            self.logger.error("Failed to download file", error=str(e))
            raise
    
    async def download_from_url(self, url: str) -> bytes:
        """Download file from external URL."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=60.0)
                response.raise_for_status()
                data = response.content
            
            self.logger.info("File downloaded from URL", url=url[:100], size=len(data))
            
            return data
            
        except Exception as e:
            self.logger.error("Failed to download from URL", url=url[:100], error=str(e))
            raise
    
    async def delete(self, object_name: str) -> bool:
        """Delete file from MinIO."""
        try:
            self.client.remove_object(self.bucket, object_name)
            self.logger.info("File deleted", object_name=object_name)
            return True
            
        except S3Error as e:
            self.logger.error("Failed to delete file", error=str(e))
            return False
    
    async def get_url(self, object_name: str, expires_seconds: int = 3600 * 24 * 7) -> str:
        """Get presigned URL for object."""
        try:
            # For public access, construct direct URL
            if settings.MINIO_SECURE:
                protocol = "https"
            else:
                protocol = "http"
            
            url = f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket}/{object_name}"
            
            self.logger.info("Generated URL", object_name=object_name)
            
            return url
            
        except Exception as e:
            self.logger.error("Failed to generate URL", error=str(e))
            raise
    
    async def list_objects(self, prefix: str = "") -> list:
        """List objects in bucket."""
        try:
            objects = self.client.list_objects(
                self.bucket,
                prefix=prefix,
                recursive=True
            )
            
            object_list = [obj.object_name for obj in objects]
            
            self.logger.info("Objects listed", count=len(object_list), prefix=prefix)
            
            return object_list
            
        except S3Error as e:
            self.logger.error("Failed to list objects", error=str(e))
            raise
    
    def get_object_info(self, object_name: str) -> dict:
        """Get object metadata."""
        try:
            stat = self.client.stat_object(self.bucket, object_name)
            
            return {
                "size": stat.size,
                "etag": stat.etag,
                "content_type": stat.content_type,
                "last_modified": stat.last_modified,
                "metadata": stat.metadata
            }
            
        except S3Error as e:
            self.logger.error("Failed to get object info", error=str(e))
            raise
