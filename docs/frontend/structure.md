# Frontend Structure

## Обзор

Frontend построен на React 18+ и Next.js 14+ с использованием Apollo Client для GraphQL.

---

## Структура проекта

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   ├── create/
│   │   ├── calendar/
│   │   ├── library/
│   │   ├── analytics/
│   │   └── settings/
│   ├── components/             # React компоненты
│   │   ├── ui/                # shadcn/ui компоненты
│   │   ├── layout/
│   │   ├── features/
│   │   └── shared/
│   ├── lib/                    # Утилиты
│   │   ├── apollo/            # Apollo Client setup
│   │   ├── graphql/           # GraphQL queries/mutations
│   │   └── utils/
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand stores
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── public/                     # Статические файлы
├── tests/                      # Тесты
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Основные страницы

### 1. Dashboard `/dashboard`

Главная страница с обзором активности.

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentArticles } from '@/components/dashboard/RecentArticles';
import { UpcomingPosts } from '@/components/dashboard/UpcomingPosts';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <RecentArticles />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <UpcomingPosts />
        </Suspense>
      </div>
    </div>
  );
}
```

### 2. Create Content `/create`

Создание контент-плана из статьи.

```tsx
// app/create/page.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { PARSE_ARTICLE, GENERATE_POSTS } from '@/lib/graphql/mutations';

export default function CreatePage() {
  const [step, setStep] = useState<'input' | 'analyze' | 'generate'>('input');
  const [parseArticle] = useMutation(PARSE_ARTICLE);
  const [generatePosts] = useMutation(GENERATE_POSTS);
  
  return (
    <div className="max-w-4xl mx-auto">
      {step === 'input' && <InputStep onNext={handleParse} />}
      {step === 'analyze' && <AnalyzeStep article={article} onNext={handleGenerate} />}
      {step === 'generate' && <GenerateStep posts={posts} />}
    </div>
  );
}
```

### 3. Calendar `/calendar`

Визуальный календарь публикаций.

```tsx
// app/calendar/page.tsx
'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useQuery } from '@apollo/client';
import { GET_SCHEDULED_POSTS } from '@/lib/graphql/queries';

export default function CalendarPage() {
  const { data } = useQuery(GET_SCHEDULED_POSTS);
  
  const events = data?.scheduledPosts.map(post => ({
    id: post.id,
    title: post.content.substring(0, 50),
    start: post.scheduledAt,
    backgroundColor: getPlatformColor(post.platform)
  }));
  
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      eventClick={handleEventClick}
    />
  );
}
```

---

## Компоненты

### UI Components (shadcn/ui)

```tsx
// components/ui/button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'default', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        {
          'bg-primary text-white hover:bg-primary/90': variant === 'default',
          'border border-input hover:bg-accent': variant === 'outline',
          'hover:bg-accent': variant === 'ghost',
        },
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-11 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

### Feature Components

```tsx
// components/features/PostEditor.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PostEditorProps {
  post: Post;
  onSave: (content: string) => void;
}

export function PostEditor({ post, onSave }: PostEditorProps) {
  const [content, setContent] = useState(post.content);
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{post.platform}</h3>
          <StatusBadge status={post.status} />
        </div>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
        />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setContent(post.content)}>
            Reset
          </Button>
          <Button onClick={() => onSave(content)}>
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

---

## Routing

### App Router (Next.js 14)

```tsx
// app/layout.tsx
import { ApolloWrapper } from '@/lib/apollo/wrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ApolloWrapper>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </ApolloWrapper>
      </body>
    </html>
  );
}
```

### Protected Routes

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/create/:path*', '/calendar/:path*']
};
```

---

**См. также:**
- [Components](./components.md)
- [State Management](./state-management.md)
- [Routing](./routing.md)

