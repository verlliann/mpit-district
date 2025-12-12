# Frontend Components

## Компоненты UI (shadcn/ui)

Используется библиотека shadcn/ui на базе Radix UI и Tailwind CSS.

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Publish</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Analytics</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>
```

### Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  url: z.string().url(),
  platforms: z.array(z.string())
});

function ArticleForm() {
  const form = useForm({
    resolver: zodResolver(formSchema)
  });
  
  return (
    <Form {...form}>
      <FormField name="url" render={({ field }) => (
        <FormItem>
          <FormLabel>Article URL</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
        </FormItem>
      )} />
    </Form>
  );
}
```

---

## Feature Components

### PostCard

```tsx
export function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <PlatformIcon platform={post.platform} />
          <StatusBadge status={post.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{post.content}</p>
        {post.scheduledAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Scheduled: {formatDate(post.scheduledAt)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### MetricsChart

```tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';

export function MetricsChart({ data }: { data: TimelineMetrics[] }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="reach" stroke="#8884d8" />
      <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
    </LineChart>
  );
}
```

---

**См. также:**
- [Frontend Structure](./structure.md)
- [State Management](./state-management.md)

