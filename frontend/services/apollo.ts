import { ApolloClient, InMemoryCache, HttpLink, split, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';

// HTTP link для queries и mutations
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
  headers: {
    'Content-Type': 'application/json',
  }
});

// WebSocket link для subscriptions
const wsLink = typeof window !== 'undefined' 
  ? new GraphQLWsLink(
      createClient({
        url: import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
        connectionParams: () => {
          const token = localStorage.getItem('auth_token');
          return token ? { authorization: `Bearer ${token}` } : {};
        },
        retryAttempts: 5,
        shouldRetry: () => true,
      })
    )
  : null;

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Redirect to login on authentication errors
      if (message.includes('authentication') || message.includes('unauthorized')) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Split link - HTTP для queries/mutations, WebSocket для subscriptions
const splitLink = wsLink 
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          articles: {
            keyArgs: ['filter'],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;
              
              // Pagination merge
              const offset = args?.offset || 0;
              const merged = existing.nodes ? [...existing.nodes] : [];
              
              if (incoming.nodes) {
                incoming.nodes.forEach((node: any, index: number) => {
                  merged[offset + index] = node;
                });
              }
              
              return {
                ...incoming,
                nodes: merged,
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper для получения токена
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper для установки токена
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Helper для удаления токена
export const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

