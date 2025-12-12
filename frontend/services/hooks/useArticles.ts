import { useQuery, useMutation } from '@apollo/client';
import { GET_ARTICLES, GET_ARTICLE } from '../graphql/queries';
import { PARSE_ARTICLE, DELETE_ARTICLE } from '../graphql/mutations';
import { PARSING_PROGRESS } from '../graphql/subscriptions';

export const useArticles = (variables?: any) => {
  return useQuery(GET_ARTICLES, {
    variables: {
      limit: 20,
      offset: 0,
      ...variables
    }
  });
};

export const useArticle = (id: string) => {
  return useQuery(GET_ARTICLE, {
    variables: { id },
    skip: !id
  });
};

export const useParseArticle = () => {
  return useMutation(PARSE_ARTICLE, {
    refetchQueries: [{ query: GET_ARTICLES }],
    awaitRefetchQueries: true
  });
};

export const useDeleteArticle = () => {
  return useMutation(DELETE_ARTICLE, {
    refetchQueries: [{ query: GET_ARTICLES }],
    awaitRefetchQueries: true
  });
};

export const useParsingProgress = (articleId: string) => {
  return useQuery(PARSING_PROGRESS, {
    variables: { articleId },
    skip: !articleId
  });
};

