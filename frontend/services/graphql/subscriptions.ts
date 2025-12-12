import { gql } from '@apollo/client';

// ==================== POST STATUS ====================

export const POST_STATUS_CHANGED = gql`
  subscription OnPostStatusChanged($postId: ID!) {
    postStatusChanged(postId: $postId) {
      id
      status
      publishedAt
      externalId
      externalUrl
      error
      updatedAt
    }
  }
`;

// ==================== METRICS ====================

export const METRICS_UPDATED = gql`
  subscription OnMetricsUpdated($postId: ID!) {
    metricsUpdated(postId: $postId) {
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
  }
`;

// ==================== NOTIFICATIONS ====================

export const NOTIFICATION_RECEIVED = gql`
  subscription OnNotificationReceived {
    notificationReceived {
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

// ==================== PARSING PROGRESS ====================

export const PARSING_PROGRESS = gql`
  subscription OnParsingProgress($articleId: ID!) {
    parsingProgress(articleId: $articleId) {
      status
      progress
      message
      currentStep
      totalSteps
      error
    }
  }
`;

// ==================== GENERATION PROGRESS ====================

export const GENERATION_PROGRESS = gql`
  subscription OnGenerationProgress($jobId: ID!) {
    generationProgress(jobId: $jobId) {
      status
      progress
      message
      completedPosts
      totalPosts
      currentPlatform
      error
    }
  }
`;

// ==================== PUBLISHING PROGRESS ====================

export const PUBLISHING_PROGRESS = gql`
  subscription OnPublishingProgress($postId: ID!) {
    publishingProgress(postId: $postId) {
      status
      progress
      message
      attempt
      maxAttempts
      error
    }
  }
`;

