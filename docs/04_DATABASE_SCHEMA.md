# TPMForge — Database Schema (PostgreSQL + pgvector)

**Stack:** Supabase (PostgreSQL 15+), pgvector for embeddings, Row Level Security (RLS) for multi-tenancy.

---

## Design Principles

1. **Competency Graph is Data** — Competencies, assets, relationships live in tables, not code.
2. **RLS Everywhere** — Users only see their data; enterprise sees their org's data.
3. **Versioned Competencies** — Schema changes migrate data; history preserved.
4. **Asset-Centric** — All generated content (questions, rubrics, cases) stored as queryable rows.
5. **Audit Trail** — Assessment attempts, coach sessions, roadmap versions fully tracked.

---

## Enum Types

```sql
-- User & Auth
CREATE TYPE user_role AS ENUM ('user', 'admin', 'enterprise_admin', 'enterprise_user');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Competency Graph
CREATE TYPE competency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE competency_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE bloom_level AS ENUM ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');
CREATE TYPE assessment_dimension AS ENUM ('knowledge', 'understanding', 'application', 'communication', 'decision_making', 'execution');
CREATE TYPE asset_type AS ENUM ('theory', 'example', 'real_world_example', 'case_study', 'mcq', 'scenario', 'voice_question', 'assignment', 'project', 'interview_question', 'star_question', 'rubric', 'template', 'download', 'reading');
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Assessments & Learning
CREATE TYPE assessment_type AS ENUM ('mcq', 'scenario', 'case_study', 'short_answer', 'assignment', 'project', 'interview', 'voice', 'presentation');
CREATE TYPE assessment_status AS ENUM ('in_progress', 'submitted', 'graded', 'reviewed');
CREATE TYPE roadmap_status AS ENUM ('active', 'completed', 'paused', 'regenerating');
CREATE TYPE certification_level AS ENUM ('associate', 'tpms', 'senior', 'principal', 'enterprise');
CREATE TYPE certification_status AS ENUM ('in_progress', 'submitted', 'approved', 'rejected', 'expired');

-- Content Pipeline
CREATE TYPE content_generation_status AS ENUM ('pending', 'generating', 'generated', 'review', 'approved', 'rejected');
```

---

## Core Tables

### 1. Users & Profiles

```sql
-- Extends auth.users (Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,                    -- "Senior Engineer → TPM"
  current_role TEXT,
  target_role TEXT,
  target_companies TEXT[],          -- Company names
  timeline_weeks INT,               -- Target timeline
  weekly_hours INT,                 -- Commitment
  career_goal_certification certification_level, -- associate/tpm/senior/principal/enterprise
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 2. Subscriptions & Payments

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  razorpay_subscription_id TEXT UNIQUE,
  razorpay_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  amount_paise INT NOT NULL,        -- Amount in paise (₹ * 100)
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL,             -- captured, failed, refunded
  description TEXT,
  receipt_email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payment_history FOR SELECT USING (auth.uid() = user_id);
```

### 3. Competency Graph

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,              -- CAT-TECH, CAT-SYS, etc.
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,                        -- Lucide icon name
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE domains (
  id TEXT PRIMARY KEY,              -- DOM-API, DOM-SCALE, etc.
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE competencies (
  id TEXT PRIMARY KEY,              -- TECH-API-REST-001
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  domain_id TEXT NOT NULL REFERENCES domains(id),
  parent_id TEXT REFERENCES competencies(id),  -- For sub-competencies
  level INT NOT NULL CHECK (level BETWEEN 1 AND 5),
  difficulty competency_level NOT NULL,
  importance INT NOT NULL CHECK (importance BETWEEN 1 AND 5),
  estimated_study_hours INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  status competency_status NOT NULL DEFAULT 'draft',
  author_ids UUID[] DEFAULT '{}',
  review_status JSONB DEFAULT '{}', -- { "theory": "approved", "mcq": "pending" }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competencies_category ON competencies(category_id);
CREATE INDEX idx_competencies_domain ON competencies(domain_id);
CREATE INDEX idx_competencies_parent ON competencies(parent_id);
CREATE INDEX idx_competencies_status ON competencies(status);

-- Prerequisites (graph edges)
CREATE TABLE competency_prerequisites (
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  prerequisite_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  is_hard_requirement BOOLEAN DEFAULT TRUE,  -- FALSE = recommended
  PRIMARY KEY (competency_id, prerequisite_id)
);

-- Learning Objectives
CREATE TABLE learning_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  bloom_level bloom_level NOT NULL,
  statement TEXT NOT NULL,
  measurable BOOLEAN DEFAULT TRUE,
  assessment_types assessment_type[] DEFAULT '{}',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_objectives_competency ON learning_objectives(competency_id);

-- Related Competencies (cross-links)
CREATE TABLE competency_relations (
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  related_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'related', -- 'related', 'complementary', 'alternative'
  PRIMARY KEY (competency_id, related_id)
);
```

### 4. Competency Assets (Pre-generated Content)

```sql
-- Master asset table (polymorphic via asset_type)
CREATE TABLE competency_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  asset_type asset_type NOT NULL,
  version INT NOT NULL DEFAULT 1,
  status content_generation_status NOT NULL DEFAULT 'pending',
  content JSONB NOT NULL,           -- Structured content per asset type
  metadata JSONB DEFAULT '{}',      -- Tokens used, model, generation params
  generated_by TEXT,                -- Model ID or 'human'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_competency_type ON competency_assets(competency_id, asset_type);
CREATE INDEX idx_assets_status ON competency_assets(status);

-- Specialized views for common queries
CREATE VIEW mcq_questions AS
SELECT id, competency_id, content->>'stem' AS stem,
       content->'options' AS options,
       content->>'explanation' AS explanation,
       (content->>'bloom_level')::bloom_level AS bloom_level,
       (content->>'difficulty')::question_difficulty AS difficulty,
       content->'tags' AS tags
FROM competency_assets
WHERE asset_type = 'mcq' AND status = 'published';

CREATE VIEW scenarios AS
SELECT id, competency_id, content->>'context' AS context,
       content->>'question' AS question,
       content->>'rubric_id' AS rubric_id,
       content->'expected_outcomes' AS expected_outcomes,
       (content->>'bloom_level')::bloom_level AS bloom_level
FROM competency_assets
WHERE asset_type = 'scenario' AND status = 'published';

-- Similar views for: voice_questions, case_studies, assignments, projects, interview_questions, star_questions, rubrics, templates
```

### 5. Rubrics (Structured for Grading)

```sql
CREATE TABLE rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  dimension assessment_dimension NOT NULL,
  level_0 TEXT NOT NULL,    -- Score 0 descriptor
  level_25 TEXT NOT NULL,   -- Score 25 descriptor
  level_50 TEXT NOT NULL,   -- Score 50 descriptor
  level_75 TEXT NOT NULL,   -- Score 75 descriptor
  level_100 TEXT NOT NULL,  -- Score 100 descriptor
  examples_0 TEXT[],
  examples_25 TEXT[],
  examples_50 TEXT[],
  examples_75 TEXT[],
  examples_100 TEXT[],
  weight NUMERIC(3,2) DEFAULT 1.0, -- Dimension weight for overall score
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (competency_id, dimension)
);
```

### 6. User Competency Progress

```sql
-- Snapshots of user's competency scores over time
CREATE TABLE user_competency_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  knowledge_score INT CHECK (knowledge_score BETWEEN 0 AND 100),
  understanding_score INT CHECK (understanding_score BETWEEN 0 AND 100),
  application_score INT CHECK (application_score BETWEEN 0 AND 100),
  communication_score INT CHECK (communication_score BETWEEN 0 AND 100),
  decision_making_score INT CHECK (decision_making_score BETWEEN 0 AND 100),
  execution_score INT CHECK (execution_score BETWEEN 0 AND 100),
  overall_score INT GENERATED ALWAYS AS (
    ROUND(
      (knowledge_score * 1.0 + understanding_score * 1.0 + application_score * 1.5 +
       communication_score * 1.0 + decision_making_score * 1.5 + execution_score * 1.0) / 7.0
    )
  ) STORED,
  scored_at TIMESTAMPTZ DEFAULT NOW(),
  scoring_method TEXT DEFAULT 'rubric', -- 'rubric', 'llm', 'hybrid', 'manual'
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_user_scores_user ON user_competency_scores(user_id);
CREATE INDEX idx_user_scores_competency ON user_competency_scores(competency_id);
CREATE INDEX idx_user_scores_scored_at ON user_competency_scores(scored_at DESC);

-- Latest score per user per competency (materialized view refreshed daily)
CREATE MATERIALIZED VIEW latest_user_competency_scores AS
SELECT DISTINCT ON (user_id, competency_id)
  user_id, competency_id, overall_score,
  knowledge_score, understanding_score, application_score,
  communication_score, decision_making_score, execution_score,
  scored_at
FROM user_competency_scores
ORDER BY user_id, competency_id, scored_at DESC;

CREATE UNIQUE INDEX idx_latest_scores_user_comp ON latest_user_competency_scores(user_id, competency_id);
```

### 7. Assessments

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  type assessment_type NOT NULL,
  status assessment_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'  -- e.g., { "question_ids": [...], "mode": "practice" }
);

CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL, -- References asset ID (mcq, scenario, etc.)
  question_type asset_type NOT NULL,
  user_response JSONB NOT NULL, -- { "answer": "A", "text": "..." }
  is_correct BOOLEAN,           -- For MCQ
  dimension_scores JSONB,       -- { "knowledge": 75, "application": 60, ... }
  graded_by TEXT,               -- 'code', 'llm', 'human', 'hybrid'
  grading_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_competency ON assessments(competency_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_responses_assessment ON assessment_responses(assessment_id);
```

### 8. Resume Analysis

```sql
CREATE TABLE resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INT,
  file_type TEXT,                -- 'pdf', 'docx'
  raw_text TEXT,                 -- Extracted text (PII-stripped version stored)
  pii_stripped BOOLEAN DEFAULT FALSE,
  parsed_data JSONB,             -- Structured: roles, skills, projects, education
  competency_scores JSONB,       -- { "TECH-API-REST-001": 72, ... }
  readiness_score INT CHECK (readiness_score BETWEEN 0 AND 100),
  radar_data JSONB,              -- 6 dimension scores
  gap_report JSONB,              -- Ranked missing competencies
  target_role TEXT,
  model_used TEXT,               -- OpenRouter model ID
  tokens_used INT,
  status TEXT DEFAULT 'completed', -- 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resume_user ON resume_analyses(user_id);
CREATE INDEX idx_resume_created ON resume_analyses(created_at DESC);
```

### 9. Roadmaps

```sql
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resume_analysis_id UUID REFERENCES resume_analyses(id) ON DELETE SET NULL,
  target_role TEXT NOT NULL,
  target_certification certification_level,
  timeline_weeks INT NOT NULL,
  weekly_hours INT NOT NULL,
  status roadmap_status NOT NULL DEFAULT 'active',
  version INT DEFAULT 1,
  previous_version_id UUID REFERENCES roadmaps(id),
  generated_by TEXT DEFAULT 'engine', -- 'engine', 'manual'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roadmap_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  theme TEXT,                    -- "Networking & REST APIs"
  focus_areas TEXT[],            -- Competency IDs
  estimated_hours INT,
  milestones JSONB DEFAULT '[]', -- [{ "title": "Complete REST assessment", "type": "assessment" }]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (roadmap_id, week_number)
);

CREATE TABLE roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_week_id UUID NOT NULL REFERENCES roadmap_weeks(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,       -- 'theory', 'quiz', 'assignment', 'project', 'interview_practice'
  asset_id UUID,                 -- Specific asset to use
  estimated_hours INT,
  order_index INT DEFAULT 0,
  is_milestone BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roadmaps_user ON roadmaps(user_id);
CREATE INDEX idx_roadmap_weeks_roadmap ON roadmap_weeks(roadmap_id);
CREATE INDEX idx_roadmap_items_week ON roadmap_items(roadmap_week_id);
```

### 10. AI Coach Sessions

```sql
CREATE TABLE coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competency_id TEXT REFERENCES competencies(id) ON DELETE SET NULL,
  mode TEXT NOT NULL,            -- 'explain', 'quiz', 'scenario', 'review', 'next_step'
  title TEXT,
  status TEXT DEFAULT 'active',  -- 'active', 'ended'
  message_count INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES coach_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,            -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',   -- { "model": "...", "tokens": 123, "cached": false, "assets_used": [...] }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coach_sessions_user ON coach_sessions(user_id);
CREATE INDEX idx_coach_messages_session ON coach_messages(session_id);
```

### 11. Certifications

```sql
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level certification_level NOT NULL,
  status certification_status NOT NULL DEFAULT 'in_progress',
  required_competencies TEXT[] NOT NULL, -- Competency IDs required for this level
  completed_competencies TEXT[] DEFAULT '{}',
  assessment_scores JSONB,       -- { "TECH-API-REST-001": 72, ... }
  project_submissions UUID[],    -- Project IDs
  interview_scores JSONB,
  capstone_project_id UUID,
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,        -- 2 years from approval
  certificate_url TEXT,          -- Signed PDF URL
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certifications_user ON certifications(user_id);
CREATE INDEX idx_certifications_status ON certifications(status);
```

### 12. Projects (Project Studio)

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competency_id TEXT REFERENCES competencies(id) ON DELETE SET NULL,
  template_id UUID REFERENCES competency_assets(id), -- Project template used
  title TEXT NOT NULL,
  description TEXT,
  deliverables JSONB,            -- { "prd": "url", "architecture": "url", ... }
  status TEXT DEFAULT 'draft',   -- 'draft', 'submitted', 'under_review', 'approved', 'rejected'
  ai_review JSONB,               -- AI rubric scores + feedback
  human_reviewer UUID REFERENCES profiles(id),
  human_review JSONB,
  score INT CHECK (score BETWEEN 0 AND 100),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
```

### 13. Blog & Newsletter

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_mdx TEXT NOT NULL,     -- MDX content
  competency_tags TEXT[],        -- Competency IDs this post relates to
  category TEXT NOT NULL,        -- Technology, System Design, Cloud, AI, Product, Business, Program, Leadership, Career, Interview, Templates, Case Studies, Industry News, Books, Reviews
  author_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft',   -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  reading_time_minutes INT,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_competencies ON blog_posts USING GIN(competency_tags);

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  source TEXT,                   -- 'landing', 'blog', 'dashboard', 'import'
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{"frequency": "weekly", "categories": []}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE newsletter_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  status TEXT DEFAULT 'draft',   -- 'draft', 'scheduled', 'sent'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INT DEFAULT 0,
  open_rate NUMERIC(5,2),
  click_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 14. Enterprise (Future Phase)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,            -- For SSO / email verification
  plan TEXT DEFAULT 'team',      -- 'team', 'business', 'enterprise'
  max_seats INT DEFAULT 50,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',    -- 'owner', 'admin', 'manager', 'member'
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

CREATE TABLE enterprise_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  competency_ids TEXT[] NOT NULL,
  assignee_ids UUID[] NOT NULL,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',   -- 'draft', 'active', 'completed'
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 15. System & Audit

```sql
-- LLM Usage Tracking (cost monitoring)
CREATE TABLE llm_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  feature TEXT NOT NULL,         -- 'resume_mapping', 'coach_chat', 'grading', 'content_generation'
  model TEXT NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  latency_ms INT,
  status TEXT,                   -- 'success', 'error', 'rate_limited'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_llm_logs_user ON llm_usage_logs(user_id);
CREATE INDEX idx_llm_logs_feature ON llm_usage_logs(feature);
CREATE INDEX idx_llm_logs_created ON llm_usage_logs(created_at DESC);

-- Rate Limit Tracking (per user per feature)
CREATE TABLE rate_limit_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT DEFAULT 0,
  UNIQUE (user_id, feature, window_start)
);

-- Content Generation Queue (GitHub Actions writes here)
CREATE TABLE content_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  asset_type asset_type NOT NULL,
  model TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  status content_generation_status NOT NULL DEFAULT 'pending',
  priority INT DEFAULT 0,
  attempts INT DEFAULT 0,
  result_asset_id UUID REFERENCES competency_assets(id),
  error_message TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_jobs_status ON content_generation_jobs(status);
CREATE INDEX idx_content_jobs_competency ON content_generation_jobs(competency_id);
```

---

## pgvector Embeddings (RAG)

```sql
-- Enable extension (run once in Supabase SQL editor)
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings for competency assets (for Coach RAG)
CREATE TABLE asset_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES competency_assets(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,      -- For chunked content
  content TEXT NOT NULL,         -- Text chunk
  embedding vector(768),         -- Dimension depends on model (Nemotron 3 Embed = 768)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_embeddings_asset ON asset_embeddings(asset_id);
-- HNSW index for similarity search (create after data loaded)
-- CREATE INDEX idx_asset_embeddings_hnsw ON asset_embeddings USING hnsw (embedding vector_cosine_ops);

-- Embeddings for blog posts (semantic search)
CREATE TABLE blog_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## RLS Policies Summary

| Table | Policy |
|-------|--------|
| `profiles` | Users see/edit own |
| `subscriptions` | Users see own |
| `payment_history` | Users see own |
| `user_competency_scores` | Users see own |
| `assessments` | Users see own |
| `assessment_responses` | Users see own (via assessment) |
| `resume_analyses` | Users see own |
| `roadmaps` | Users see own |
| `roadmap_weeks/items` | Users see own (via roadmap) |
| `coach_sessions/messages` | Users see own |
| `certifications` | Users see own |
| `projects` | Users see own |
| `organizations` | Members see their org |
| `organization_members` | Members see their org |
| `enterprise_assessments` | Org admins/managers see |
| `competencies/domains/categories` | Public read (published only) |
| `competency_assets` | Public read (published only) |
| `learning_objectives` | Public read |
| `rubrics` | Public read (published competencies) |
| `blog_posts` | Public read (published only) |
| `newsletter_subscribers` | User sees own; admins see all |

---

## Migration Strategy

1. **Initial migration** creates all tables, indexes, RLS
2. **Table ordering:** this document presents sections for readability, not execution order. FKs that reference later tables must wait — in particular `user_competency_scores.assessment_id`, `assessments`-dependent indexes, and all `*_embeddings` tables depend on their parents. Create dependency order: enums → categories/domains → competencies (+prereqs/objectives/relations) → competency_assets → rubrics → assessments → user_competency_scores → resume_analyses → roadmaps → coach → certifications → projects → blog → newsletter → subscriptions/payments → organizations → llm/rate/content tables → pgvector tables. Use `ALTER TABLE ... ADD CONSTRAINT` for any cross-order FK you miss.
3. **Seed data:** Categories, Domains, 5 hand-worked competencies + assets
4. **Content generation jobs** queued for remaining 35 competencies
5. **Daily cron** refreshes `latest_user_competency_scores` materialized view
6. **Schema changes** → new migration file, version bump on affected competencies

---

*This schema is the single source of truth for data. All APIs, workers, and agents read/write these tables.*