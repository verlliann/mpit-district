import { gql } from '@apollo/client';

// ==================== ARTICLES ====================

export const GET_ARTICLES = gql`
  query GetArticles($limit: Int, $offset: Int, $filter: ArticleFilter) {
    articles(limit: $limit, offset: $offset, filter: $filter) {
      nodes {
        id
        url
        title
        excerpt
        source
        author
        publishedAt
        parsedAt
        sentiment
        sentimentScore
        images {
          id
          url
          thumbnailUrl
        }
        posts {
          id
          platform
          status
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_ARTICLE = gql`
  query GetArticle($id: ID!) {
    article(id: $id) {
      id
      url
      title
      content
      excerpt
      source
      author
      publishedAt
      parsedAt
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
        width
        height
        altText
      }
      posts {
        id
        platform
        content
        style
        status
        scheduledAt
        publishedAt
        images {
          id
          url
          thumbnailUrl
        }
        metrics {
          views
          likes
          comments
          shares
          engagement
        }
      }
    }
  }
`;

// ==================== POSTS ====================

export const GET_POSTS = gql`
  query GetPosts($limit: Int, $offset: Int, $filter: PostFilter) {
    posts(limit: $limit, offset: $offset, filter: $filter) {
      nodes {
        id
        platform
        content
        style
        status
        scheduledAt
        publishedAt
        externalUrl
        images {
          id
          url
          thumbnailUrl
        }
        metrics {
          views
          likes
          comments
          shares
          clicks
          engagement
          reach
          impressions
        }
        article {
          id
          title
          source
        }
        user {
          id
          name
        }
        createdAt
        updatedAt
      }
      totalCount
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      platform
      content
      style
      status
      scheduledAt
      publishedAt
      externalId
      externalUrl
      images {
        id
        url
        width
        height
        altText
      }
      metrics {
        views
        likes
        comments
        shares
        clicks
        engagement
        reach
        impressions
        updatedAt
      }
      article {
        id
        title
        url
        source
      }
      user {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SCHEDULED_POSTS = gql`
  query GetScheduledPosts($from: DateTime, $to: DateTime) {
    scheduledPosts(from: $from, to: $to) {
      id
      platform
      content
      scheduledAt
      status
      article {
        id
        title
      }
      images {
        id
        thumbnailUrl
      }
    }
  }
`;

// ==================== ANALYTICS ====================

export const GET_ANALYTICS = gql`
  query GetAnalytics(
    $from: DateTime!
    $to: DateTime!
    $platforms: [Platform!]
  ) {
    analytics(from: $from, to: $to, platforms: $platforms) {
      totalPosts
      totalReach
      totalEngagement
      averageEngagement
      topPosts {
        id
        content
        platform
        publishedAt
        externalUrl
        metrics {
          views
          likes
          comments
          shares
          engagement
        }
      }
      platformBreakdown {
        platform
        posts
        reach
        engagement
        avgViews
        avgLikes
      }
      timeline {
        date
        posts
        reach
        engagement
        views
        likes
      }
    }
  }
`;

// ==================== USER ====================

export const GET_ME = gql`
  query Me {
    me {
      id
      email
      name
      role
      avatar
      createdAt
      team {
        id
        name
        members {
          user {
            id
            name
            email
          }
          role
        }
      }
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

// ==================== TEMPLATES ====================

export const GET_TEMPLATES = gql`
  query GetTemplates($platform: Platform) {
    templates(platform: $platform) {
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
      usageCount
      createdBy {
        id
        name
      }
      createdAt
    }
  }
`;

// ==================== SOCIAL ACCOUNTS ====================

export const GET_SOCIAL_ACCOUNTS = gql`
  query GetSocialAccounts {
    socialAccounts {
      id
      platform
      username
      displayName
      avatar
      isActive
      connectedAt
      expiresAt
      tokenStatus
    }
  }
`;

// ==================== NOTIFICATIONS ====================

export const GET_NOTIFICATIONS = gql`
  query GetNotifications(
    $limit: Int
    $offset: Int
    $unreadOnly: Boolean
  ) {
    notifications(
      limit: $limit
      offset: $offset
      unreadOnly: $unreadOnly
    ) {
      id
      type
      title
      message
      data
      read
      createdAt
    }
  }
`;

