# Data Protection

## Encryption

### At Rest

```bash
# PostgreSQL encryption
# Enable encryption in postgresql.conf
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
```

### In Transit

```yaml
# Kubernetes TLS
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-cert>
  tls.key: <base64-encoded-key>
```

---

## Sensitive Data

### Encrypting Fields

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedText] = encrypted.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## GDPR Compliance

### Data Anonymization

```sql
-- Anonymize user data
UPDATE users
SET 
  email = CONCAT('deleted_', id, '@example.com'),
  name = 'Deleted User',
  avatar_url = NULL
WHERE id = ?;
```

### Data Export

```typescript
export async function exportUserData(userId: string) {
  const user = await getUser(userId);
  const articles = await getArticles(userId);
  const posts = await getPosts(userId);
  
  return {
    user,
    articles,
    posts
  };
}
```

---

**См. также:**
- [Authentication](./auth.md)
- [API Security](./api-security.md)

