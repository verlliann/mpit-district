import { useQuery } from '@apollo/client';
import { GET_ANALYTICS } from '../graphql/queries';
import { subDays } from 'date-fns';

export const useAnalytics = (days: number = 30, platforms?: string[]) => {
  const to = new Date();
  const from = subDays(to, days);

  return useQuery(GET_ANALYTICS, {
    variables: {
      from: from.toISOString(),
      to: to.toISOString(),
      platforms
    }
  });
};

