import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_POSTS, GET_POST, GET_SCHEDULED_POSTS } from '../graphql/queries';
import { 
  GENERATE_POSTS, 
  UPDATE_POST, 
  DELETE_POST, 
  PUBLISH_POST, 
  SCHEDULE_POST,
  CANCEL_SCHEDULED_POST,
  PUBLISH_BATCH
} from '../graphql/mutations';
import { 
  POST_STATUS_CHANGED, 
  METRICS_UPDATED, 
  GENERATION_PROGRESS,
  PUBLISHING_PROGRESS
} from '../graphql/subscriptions';

export const usePosts = (variables?: any) => {
  return useQuery(GET_POSTS, {
    variables: {
      limit: 20,
      offset: 0,
      ...variables
    }
  });
};

export const usePost = (id: string) => {
  return useQuery(GET_POST, {
    variables: { id },
    skip: !id
  });
};

export const useScheduledPosts = (from?: Date, to?: Date) => {
  return useQuery(GET_SCHEDULED_POSTS, {
    variables: { from, to }
  });
};

export const useGeneratePosts = () => {
  return useMutation(GENERATE_POSTS, {
    refetchQueries: [{ query: GET_POSTS }]
  });
};

export const useUpdatePost = () => {
  return useMutation(UPDATE_POST);
};

export const useDeletePost = () => {
  return useMutation(DELETE_POST, {
    refetchQueries: [{ query: GET_POSTS }]
  });
};

export const usePublishPost = () => {
  return useMutation(PUBLISH_POST);
};

export const usePublishBatch = () => {
  return useMutation(PUBLISH_BATCH);
};

export const useSchedulePost = () => {
  return useMutation(SCHEDULE_POST);
};

export const useCancelScheduledPost = () => {
  return useMutation(CANCEL_SCHEDULED_POST);
};

// Subscriptions
export const usePostStatus = (postId: string) => {
  return useSubscription(POST_STATUS_CHANGED, {
    variables: { postId },
    skip: !postId
  });
};

export const useMetricsUpdates = (postId: string) => {
  return useSubscription(METRICS_UPDATED, {
    variables: { postId },
    skip: !postId
  });
};

export const useGenerationProgress = (jobId: string) => {
  return useSubscription(GENERATION_PROGRESS, {
    variables: { jobId },
    skip: !jobId
  });
};

export const usePublishingProgress = (postId: string) => {
  return useSubscription(PUBLISHING_PROGRESS, {
    variables: { postId },
    skip: !postId
  });
};

