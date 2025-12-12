-- AI-Newsmaker Database Schema
-- PostgreSQL 15+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For better indexing

-- Create ENUM types
CREATE TYPE sentiment_type AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');
CREATE TYPE platform_type AS ENUM ('TELEGRAM', 'VK', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YANDEX_ZEN', 'OK_RU');
CREATE TYPE post_status AS ENUM ('DRAFT', 'PENDING', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'CANCELLED');
CREATE TYPE post_style AS ENUM ('NEUTRAL', 'FORMAL', 'ENGAGING', 'INFORMAL', 'BUSINESS', 'CREATIVE');
CREATE TYPE user_role AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE entity_type AS ENUM ('PERSON', 'ORGANIZATION', 'LOCATION', 'EVENT', 'PRODUCT', 'OTHER');

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'VIEWER' NOT NULL,
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- User preferences (JSONB for flexibility)
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    default_platforms platform_type[] DEFAULT '{}',
    default_style post_style DEFAULT 'NEUTRAL',
    formality_level INTEGER DEFAULT 5 CHECK (formality_level BETWEEN 1 AND 10),
    auto_publish BOOLEAN DEFAULT FALSE,
    notifications JSONB DEFAULT '{"email": true, "push": false, "newMentions": true, "publishSuccess": true, "publishFailure": true}'::jsonb,
    ui_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ARTICLES (Parsed news content)
-- ============================================================

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    source VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- AI Analysis results
    sentiment sentiment_type,
    sentiment_score FLOAT CHECK (sentiment_score BETWEEN -1 AND 1),
    
    -- Metadata
    language VARCHAR(10) DEFAULT 'ru',
    word_count INTEGER,
    reading_time_minutes INTEGER,
    
    -- Housekeeping
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full-text search
    search_vector tsvector
);

CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_parsed_at ON articles(parsed_at DESC);
CREATE INDEX idx_articles_sentiment ON articles(sentiment);
CREATE INDEX idx_articles_search_vector ON articles USING gin(search_vector);
CREATE INDEX idx_articles_is_archived ON articles(is_archived) WHERE is_archived = FALSE;

-- Trigger to update search_vector
CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('russian', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('russian', COALESCE(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('russian', COALESCE(NEW.content, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_search_vector_trigger
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();

-- ============================================================
-- FACTS (Extracted from articles)
-- ============================================================

CREATE TABLE facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    importance INTEGER CHECK (importance BETWEEN 1 AND 10),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_facts_article_id ON facts(article_id);
CREATE INDEX idx_facts_importance ON facts(importance DESC);

-- ============================================================
-- ENTITIES (Named entities from articles)
-- ============================================================

CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type entity_type NOT NULL,
    mentions INTEGER DEFAULT 1,
    confidence FLOAT CHECK (confidence BETWEEN 0 AND 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_entities_article_id ON entities(article_id);
CREATE INDEX idx_entities_name ON entities(name);
CREATE INDEX idx_entities_type ON entities(type);

-- ============================================================
-- QUOTES (Extracted quotes from articles)
-- ============================================================

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    author VARCHAR(255),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quotes_article_id ON quotes(article_id);

-- ============================================================
-- IMAGES (Article images and generated media)
-- ============================================================

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    original_url TEXT,
    
    -- File info
    filename VARCHAR(255),
    mime_type VARCHAR(100),
    file_size_bytes INTEGER,
    width INTEGER,
    height INTEGER,
    
    -- Storage
    storage_bucket VARCHAR(255),
    storage_key TEXT,
    
    -- AI generation
    is_generated BOOLEAN DEFAULT FALSE,
    generation_prompt TEXT,
    
    -- Metadata
    alt_text TEXT,
    caption TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_images_article_id ON images(article_id);
CREATE INDEX idx_images_is_generated ON images(is_generated);

-- ============================================================
-- SOCIAL ACCOUNTS (Connected social media accounts)
-- ============================================================

CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    
    -- Account info
    username VARCHAR(255),
    display_name VARCHAR(255),
    avatar TEXT,
    external_id VARCHAR(255),
    
    -- OAuth tokens (encrypted in application layer)
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, platform, external_id)
);

CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_is_active ON social_accounts(is_active) WHERE is_active = TRUE;

-- ============================================================
-- POSTS (Generated social media posts)
-- ============================================================

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
    
    -- Post content
    platform platform_type NOT NULL,
    content TEXT NOT NULL,
    style post_style DEFAULT 'NEUTRAL',
    
    -- Publishing
    status post_status DEFAULT 'DRAFT' NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- External platform data
    external_id VARCHAR(255),
    external_url TEXT,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_article_id ON posts(article_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at) WHERE status = 'SCHEDULED';
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_external_id ON posts(platform, external_id);

-- ============================================================
-- POST_IMAGES (Many-to-many: posts to images)
-- ============================================================

CREATE TABLE post_images (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    PRIMARY KEY (post_id, image_id)
);

CREATE INDEX idx_post_images_post_id ON post_images(post_id);
CREATE INDEX idx_post_images_image_id ON post_images(image_id);

-- ============================================================
-- METRICS (Post performance metrics)
-- ============================================================

CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Engagement metrics
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Reach metrics
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    
    -- Calculated metrics
    engagement_rate FLOAT,
    
    -- Timestamps
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(post_id, collected_at)
);

CREATE INDEX idx_metrics_post_id ON metrics(post_id);
CREATE INDEX idx_metrics_collected_at ON metrics(collected_at DESC);

-- ============================================================
-- TEMPLATES (Reusable post templates)
-- ============================================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Template info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    platform platform_type,
    style post_style,
    content TEXT NOT NULL,
    
    -- Template variables (e.g., {{title}}, {{fact1}})
    variables TEXT[] DEFAULT '{}',
    
    -- Usage tracking
    tags TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Sharing
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_platform ON templates(platform);
CREATE INDEX idx_templates_is_public ON templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_templates_tags ON templates USING gin(tags);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities (optional)
    related_article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Metadata
    data JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================
-- AUDIT LOG (For important operations)
-- ============================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- ============================================================
-- TRIGGERS for updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS (Convenient queries)
-- ============================================================

-- Active posts with full info
CREATE VIEW v_active_posts AS
SELECT 
    p.*,
    a.title AS article_title,
    a.source AS article_source,
    u.name AS user_name,
    sa.username AS social_account_username,
    (SELECT json_agg(img_data ORDER BY img_data.order_index) 
     FROM (
         SELECT i.*, pi.order_index
         FROM images i 
         JOIN post_images pi ON i.id = pi.image_id 
         WHERE pi.post_id = p.id
     ) img_data
    ) AS images,
    (SELECT row_to_json(m.*) FROM metrics m 
     WHERE m.post_id = p.id 
     ORDER BY m.collected_at DESC LIMIT 1) AS latest_metrics
FROM posts p
JOIN articles a ON p.article_id = a.id
JOIN users u ON p.user_id = u.id
LEFT JOIN social_accounts sa ON p.social_account_id = sa.id
WHERE p.status != 'CANCELLED';

-- Scheduled posts calendar view
CREATE VIEW v_scheduled_posts AS
SELECT 
    p.id,
    p.platform,
    p.content,
    p.scheduled_at,
    p.status,
    a.id AS article_id,
    a.title AS article_title,
    u.name AS user_name
FROM posts p
JOIN articles a ON p.article_id = a.id
JOIN users u ON p.user_id = u.id
WHERE p.status = 'SCHEDULED'
ORDER BY p.scheduled_at ASC;

-- Analytics summary
CREATE VIEW v_analytics_summary AS
SELECT 
    p.platform,
    COUNT(*) AS total_posts,
    COUNT(*) FILTER (WHERE p.status = 'PUBLISHED') AS published_posts,
    AVG(m.views) AS avg_views,
    AVG(m.likes) AS avg_likes,
    AVG(m.comments) AS avg_comments,
    AVG(m.shares) AS avg_shares,
    AVG(m.engagement_rate) AS avg_engagement_rate
FROM posts p
LEFT JOIN LATERAL (
    SELECT * FROM metrics WHERE post_id = p.id ORDER BY collected_at DESC LIMIT 1
) m ON TRUE
GROUP BY p.platform;

-- ============================================================
-- SEED DATA (Default admin user)
-- ============================================================

-- Password: 'admin123' (bcrypt hash)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@newsmaker.dev', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYuP8KvEiMW', 'Admin User', 'ADMIN');

-- Default preferences for admin
INSERT INTO user_preferences (user_id, default_platforms, default_style)
SELECT id, ARRAY['TELEGRAM', 'VK']::platform_type[], 'NEUTRAL'::post_style
FROM users WHERE email = 'admin@newsmaker.dev';

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE articles IS 'Parsed news articles from various sources';
COMMENT ON TABLE facts IS 'Key facts extracted from articles by AI';
COMMENT ON TABLE entities IS 'Named entities (people, organizations, etc.) extracted from articles';
COMMENT ON TABLE posts IS 'Generated social media posts for various platforms';
COMMENT ON TABLE metrics IS 'Performance metrics collected from social media platforms';
COMMENT ON TABLE templates IS 'Reusable post templates for quick content generation';
COMMENT ON TABLE social_accounts IS 'Connected social media accounts for publishing';

-- ============================================================
-- GRANTS (Adjust based on your needs)
-- ============================================================

-- Grant necessary permissions to application user
-- CREATE USER newsmaker_app WITH PASSWORD 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO newsmaker_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO newsmaker_app;

