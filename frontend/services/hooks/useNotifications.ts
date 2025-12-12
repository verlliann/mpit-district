import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import { MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from '../graphql/mutations';
import { NOTIFICATION_RECEIVED } from '../graphql/subscriptions';

export const useNotifications = (unreadOnly: boolean = false) => {
  return useQuery(GET_NOTIFICATIONS, {
    variables: {
      limit: 20,
      offset: 0,
      unreadOnly
    },
    pollInterval: 30000 // Poll every 30 seconds
  });
};

export const useMarkNotificationRead = () => {
  return useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: [{ query: GET_NOTIFICATIONS }]
  });
};

export const useMarkAllNotificationsRead = () => {
  return useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: [{ query: GET_NOTIFICATIONS }]
  });
};

export const useNotificationSubscription = () => {
  return useSubscription(NOTIFICATION_RECEIVED);
};

