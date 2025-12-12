import { gql } from '@apollo/client';

// ==================== ARTICLES ====================

export const PARSE_ARTICLE = gql`
  mutation ParseArticle($url: String!) {
    parseArticle(url: $url) {
      article {
        id
        url
        title
        content
        excerpt
        source
        author
        publishedAt
        sentiment
        sentimentScore
        facts {
          id
          text
          importance
        }
        entities {
          id
          name
          type
          mentions
        }
        quotes {
          id
          text
          author
        }
        images {
          id
          url
          thumbnailUrl
        }
      }
      error
      progress
    }
  }
`;

export const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: ID!) {
    deleteArticle(id: $id)
  }
`;

// ==================== POSTS ====================

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      platform
      content
      style
      status
      scheduledAt
      createdAt
    }
  }
`;

export const GENERATE_POSTS = gql`
  mutation GeneratePosts($input: GeneratePostsInput!) {
    generatePosts(input: $input) {
      id
      platform
      content
      style
      scheduledAt
      status
      images {
        id
        url
        thumbnailUrl
      }
      createdAt
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      content
      scheduledAt
      status
      images {
        id
        url
      }
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const DUPLICATE_POST = gql`
  mutation DuplicatePost($id: ID!) {
    duplicatePost(id: $id) {
      id
      platform
      content
      style
      status
    }
  }
`;

// ==================== PUBLISHING ====================

export const PUBLISH_POST = gql`
  mutation PublishPost($id: ID!) {
    publishPost(id: $id) {
      post {
        id
        status
        publishedAt
        externalId
        externalUrl
      }
      success
      error
    }
  }
`;

export const PUBLISH_BATCH = gql`
  mutation PublishBatch($ids: [ID!]!) {
    publishBatch(ids: $ids) {
      successful {
        post {
          id
          platform
          externalUrl
        }
        success
      }
      failed {
        post {
          id
          platform
        }
        error
      }
      totalCount
    }
  }
`;

export const SCHEDULE_POST = gql`
  mutation SchedulePost($id: ID!, $scheduledAt: DateTime!) {
    schedulePost(id: $id, scheduledAt: $scheduledAt) {
      id
      status
      scheduledAt
    }
  }
`;

export const CANCEL_SCHEDULED_POST = gql`
  mutation CancelScheduledPost($id: ID!) {
    cancelScheduledPost(id: $id)
  }
`;

// ==================== SOCIAL ACCOUNTS ====================

export const CONNECT_SOCIAL_ACCOUNT = gql`
  mutation ConnectSocialAccount($input: ConnectSocialAccountInput!) {
    connectSocialAccount(input: $input) {
      id
      platform
      username
      displayName
      avatar
      isActive
      tokenStatus
      connectedAt
    }
  }
`;

export const DISCONNECT_SOCIAL_ACCOUNT = gql`
  mutation DisconnectSocialAccount($id: ID!) {
    disconnectSocialAccount(id: $id)
  }
`;

// ==================== TEMPLATES ====================

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!) {
    createTemplate(input: $input) {
      id
      name
      description
      platform
      style
      content
      tags
      variables {
        name
        description
        required
        defaultValue
      }
      createdAt
    }
  }
`;

export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: ID!, $content: String!) {
    updateTemplate(id: $id, content: $content) {
      id
      content
      updatedAt
    }
  }
`;

export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: ID!) {
    deleteTemplate(id: $id)
  }
`;

// ==================== USER PREFERENCES ====================

export const UPDATE_PREFERENCES = gql`
  mutation UpdatePreferences($preferences: JSON!) {
    updatePreferences(preferences: $preferences) {
      id
      preferences {
        defaultPlatforms
        defaultStyle
        formalityLevel
        autoPublish
        notifications {
          email
          push
          newMentions
          publishSuccess
          publishFailure
          teamActivity
        }
        brandSettings {
          brandName
          brandColors
          logo
          toneOfVoice
        }
      }
    }
  }
`;

// ==================== NOTIFICATIONS ====================

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

