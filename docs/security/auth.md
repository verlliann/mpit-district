# Authentication & Authorization

## JWT Authentication

### Token Generation

```typescript
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    SECRET,
    {
      expiresIn: '24h',
      issuer: 'ai-newsmaker'
    }
  );
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
}
```

### Middleware

```typescript
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new AuthenticationError('No token provided');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  
  req.user = payload;
  next();
}
```

---

## RBAC (Role-Based Access Control)

### Roles

- **ADMIN** - Полный доступ
- **EDITOR** - Создание и редактирование контента
- **PUBLISHER** - Публикация контента
- **VIEWER** - Только просмотр

### Permission Check

```typescript
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }
    
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }
    
    next();
  };
}

// Usage
app.post('/api/posts/publish', requireRole('PUBLISHER', 'ADMIN'), publishPost);
```

---

## OAuth 2.0 (Social Platforms)

### Telegram OAuth

```typescript
import TelegramBot from 'node-telegram-bot-api';

export async function connectTelegram(userId: string, botToken: string) {
  const bot = new TelegramBot(botToken);
  
  try {
    const me = await bot.getMe();
    
    // Save to database
    await saveSocialAccount({
      userId,
      platform: 'TELEGRAM',
      username: me.username,
      accessToken: botToken
    });
    
    return { success: true };
  } catch (error) {
    throw new Error('Invalid bot token');
  }
}
```

### VK OAuth

```typescript
import { VK } from 'vk-io';

export async function connectVK(userId: string, accessToken: string) {
  const vk = new VK({ token: accessToken });
  
  try {
    const [user] = await vk.api.users.get({});
    
    await saveSocialAccount({
      userId,
      platform: 'VK',
      username: `id${user.id}`,
      displayName: `${user.first_name} ${user.last_name}`,
      accessToken
    });
    
    return { success: true };
  } catch (error) {
    throw new Error('Invalid access token');
  }
}
```

---

## Password Hashing

```typescript
import argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
```

---

**См. также:**
- [Data Protection](./data-protection.md)
- [API Security](./api-security.md)

