# State Management

## Обзор

Используется комбинация Apollo Client (для server state) и Zustand (для local state).

---

## Apollo Client Setup

### Configuration

```typescript
// lib/apollo/client.ts
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  credentials: 'include'
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL!,
    connectionParams: () => ({
      authorization: `Bearer ${getToken()}`
    })
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});
```

### Queries & Mutations

```typescript
// lib/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_ARTICLES = gql`
  query GetArticles($limit: Int, $offset: Int) {
    articles(limit: $limit, offset: $offset) {
      nodes {
        id
        title
        url
        sentiment
        createdAt
      }
      totalCount
    }
  }
`;

// lib/graphql/mutations.ts
export const PARSE_ARTICLE = gql`
  mutation ParseArticle($url: String!) {
    parseArticle(url: $url) {
      article {
        id
        title
        sentiment
        facts {
          text
          importance
        }
      }
    }
  }
`;
```

### Usage in Components

```typescript
// components/ArticleList.tsx
import { useQuery } from '@apollo/client';
import { GET_ARTICLES } from '@/lib/graphql/queries';

export function ArticleList() {
  const { data, loading, error } = useQuery(GET_ARTICLES, {
    variables: { limit: 20, offset: 0 }
  });
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {data.articles.nodes.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

---

## Zustand Stores

### User Store

```typescript
// stores/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null })
    }),
    {
      name: 'user-storage'
    }
  )
);
```

### UI Store

```typescript
// stores/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeModal: string | null;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null })
}));
```

---

## GraphQL Subscriptions

```typescript
// hooks/usePostStatus.ts
import { useSubscription } from '@apollo/client';
import { POST_STATUS_CHANGED } from '@/lib/graphql/subscriptions';

export function usePostStatus(postId: string) {
  const { data } = useSubscription(POST_STATUS_CHANGED, {
    variables: { postId }
  });
  
  return data?.postStatusChanged;
}

// Usage in component
function PostStatusBadge({ postId }: { postId: string }) {
  const status = usePostStatus(postId);
  
  return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
}
```

---

**См. также:**
- [Frontend Structure](./structure.md)
- [GraphQL API](../api/graphql/operations.md)

