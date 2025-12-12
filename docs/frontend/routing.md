# Routing

## Next.js App Router

### Структура routes

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── dashboard/
│   └── page.tsx
├── create/
│   └── page.tsx
├── calendar/
│   └── page.tsx
├── library/
│   ├── page.tsx
│   └── [id]/page.tsx
├── analytics/
│   └── page.tsx
└── settings/
    ├── page.tsx
    ├── profile/page.tsx
    ├── team/page.tsx
    └── social/page.tsx
```

### Dynamic Routes

```tsx
// app/library/[id]/page.tsx
export default function ArticlePage({ params }: { params: { id: string } }) {
  const { data } = useQuery(GET_ARTICLE, {
    variables: { id: params.id }
  });
  
  return <ArticleDetail article={data.article} />;
}
```

### Navigation

```tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const router = useRouter();
  
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/create">Create</Link>
      <button onClick={() => router.push('/calendar')}>Calendar</button>
    </nav>
  );
}
```

---

**См. также:**
- [Frontend Structure](./structure.md)

