# TPMForge — Competency Graph Specification

**This is the crown jewel. The single source of truth for every feature.**

---

## Graph Model

### Hierarchy
```
Category (Level 1) → Domain (Level 2) → Competency (Level 3) → Sub-Competency (Level 4) → Atomic Skill (Level 5)
```

### Level 1 — Categories (Homepage Navigation)
| ID | Name | Description |
|----|------|-------------|
| CAT-TECH | Technology | Computer science, infrastructure, tools |
| CAT-SYS | System Design | Distributed systems, architecture patterns |
| CAT-CLOUD | Cloud & DevOps | Containers, orchestration, CI/CD, observability |
| CAT-AI | AI & ML | Fundamentals, GenAI, LLMs, RAG, agents |
| CAT-PROD | Product | Strategy, discovery, roadmap, metrics, growth |
| CAT-BIZ | Business | Finance, strategy, markets, unit economics |
| CAT-PROG | Program Management | Planning, governance, risk, dependencies, release |
| CAT-LEAD | Leadership | Communication, influence, conflict, hiring, coaching |
| CAT-COMM | Communication | Storytelling, presentations, documentation, facilitation |
| CAT-EXEC | Execution | Delivery, prioritization, incident mgmt, vendor mgmt |
| CAT-CAREER | Career | Resume, interviews, promotion, networking, salary |

### Level 2 — Domains (Examples)

**Technology (CAT-TECH)**
- DOM-CS: Computer Science
- DOM-NET: Networking
- DOM-OS: Operating Systems
- DOM-DB: Databases
- DOM-API: APIs & Protocols
- DOM-AUTH: Authentication & Authorization
- DOM-CACHE: Caching
- DOM-MSG: Messaging & Event Streaming
- DOM-CONT: Containers & Orchestration
- DOM-CICD: CI/CD
- DOM-SEC: Security

**System Design (CAT-SYS)**
- DOM-SCALE: Scalability Patterns
- DOM-CAP: CAP Theorem & Consistency
- DOM-REPL: Replication & Consensus
- DOM-SHARD: Sharding & Partitioning
- DOM-CACHE-SYS: Caching Strategies
- DOM-QUEUE: Queue Systems
- DOM-EVENT: Event-Driven Architecture
- DOM-MICRO: Microservices
- DOM-MONO: Modular Monoliths
- DOM-OBS: Observability
- DOM-RESIL: Resiliency Patterns

**Cloud & DevOps (CAT-CLOUD)**
- DOM-DOCKER: Docker
- DOM-K8S: Kubernetes
- DOM-CICD: CI/CD Pipelines
- DOM-OBS: Observability Stack
- DOM-IAC: Infrastructure as Code
- DOM-GITOPS: GitOps

**AI & ML (CAT-AI)**
- DOM-AI-FUND: AI Fundamentals
- DOM-GENAI: Generative AI
- DOM-LLM: LLMs & Prompting
- DOM-RAG: RAG & Knowledge Retrieval
- DOM-AGENTS: AI Agents

**Product (CAT-PROD)**
- DOM-PROD-THINK: Product Thinking
- DOM-DISCOVERY: Discovery & Research
- DOM-ROADMAP: Roadmapping
- DOM-METRICS: Product Metrics
- DOM-GROWTH: Growth & Experimentation
- DOM-PRIOR: Prioritization Frameworks
- DOM-STRATEGY: Product Strategy

**Business (CAT-BIZ)**
- DOM-FIN: Finance & Accounting
- DOM-UNIT: Unit Economics
- DOM-PRICING: Pricing Strategy
- DOM-BIZMODEL: Business Models
- DOM-STRATEGY: Business Strategy
- DOM-MARKET: Market Analysis
- DOM-COMP: Competitive Analysis

**Program Management (CAT-PROG)**
- DOM-PLAN: Planning & Estimation
- DOM-GOV: Governance & Cadence
- DOM-DEP: Dependency Management
- DOM-RISK: Risk Management
- DOM-BUDGET: Budgeting & Finance
- DOM-PORTFOLIO: Portfolio Management
- DOM-RELEASE: Release Management
- DOM-INCIDENT: Incident Management
- DOM-VENDOR: Vendor Management
- DOM-METRICS: Program Metrics

**Leadership (CAT-LEAD)**
- DOM-COMM: Executive Communication
- DOM-INFLUENCE: Influence Without Authority
- DOM-CONFLICT: Conflict Resolution
- DOM-NEGOTIATE: Negotiation
- DOM-HIRING: Hiring & Team Building
- DOM-MENTOR: Mentoring & Coaching
- DOM-DECIDE: Decision Making

**Communication (CAT-COMM)**
- DOM-STORY: Storytelling
- DOM-PRESENT: Presentations
- DOM-EXEC-COMM: Executive Updates
- DOM-DIFFICULT: Difficult Conversations
- DOM-DOCS: Documentation
- DOM-FACILITATE: Meeting Facilitation

**Execution (CAT-EXEC)**
- DOM-DELIVER: Delivery Management
- DOM-PRIORITIZE: Prioritization
- DOM-INCIDENT: Incident Response
- DOM-VENDOR: Vendor Management

**Career (CAT-CAREER)**
- DOM-RESUME: Resume & LinkedIn
- DOM-INTERVIEW: Interview Preparation
- DOM-PROMO: Promotion Planning
- DOM-SALARY: Salary Negotiation
- DOM-NETWORK: Networking

---

## Standard Competency Structure (26 Fields)

Every competency node — atomic or composite — follows this exact schema.

```typescript
interface Competency {
  // Identity
  id: string;                    // e.g., "TECH-API-REST-001"
  slug: string;                  // URL-friendly: "rest-api-fundamentals"
  title: string;                 // "REST API Design"
  description: string;           // 2–3 sentence summary
  
  // Taxonomy
  categoryId: string;            // CAT-TECH
  domainId: string;              // DOM-API
  parentId?: string;             // Parent competency ID (for sub-competencies)
  level: 1 | 2 | 3 | 4 | 5;      // Graph depth
  
  // Difficulty & Effort
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  importance: 1 | 2 | 3 | 4 | 5; // 5 = critical for TPM
  estimatedStudyHours: number;   // Total hours to mastery
  
  // Prerequisites (graph edges)
  prerequisites: string[];       // Competency IDs required before this
  
  // Learning Objectives (Bloom's taxonomy aligned)
  learningObjectives: LearningObjective[];
  
  // Content Assets (pre-generated, stored in DB)
  theory: TheoryAsset;           // Structured markdown + diagrams
  examples: ExampleAsset[];      // Code snippets, config, diagrams
  realWorldExamples: RealWorldExample[]; // Company case references
  caseStudy: CaseStudyAsset;     // Full case with decision points
  quiz: QuizAsset;               // MCQ bank (50 questions)
  scenarioQuestions: ScenarioAsset[]; // 20 scenario questions
  voiceQuestions: VoiceQuestionAsset[]; // 10 voice prompts
  assignments: AssignmentAsset[]; // 5 practical assignments
  projects: ProjectAsset[];      // 5 project templates (subset)
  interviewQuestions: InterviewQuestionAsset[]; // 10 typed questions
  starQuestions: STARQuestionAsset[]; // 10 behavioral prompts
  
  // Evaluation
  rubrics: Rubric[];             // One per assessment dimension
  templates: TemplateAsset[];    // Downloadable templates
  downloads: DownloadAsset[];    // PDFs, checklists, worksheets
  
  // References
  furtherReading: ReadingAsset[]; // Books, articles, papers
  certificationMapping: CertificationMapping[]; // Which cert levels map here
  
  // Relationships
  relatedCompetencies: string[]; // Competency IDs (cross-links)
  supersedes?: string[];         // Deprecated competency IDs
  version: number;               // Schema version for migrations
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'review' | 'published' | 'archived';
  authorIds: string[];           // Content contributors
  reviewStatus: ReviewStatus;    // Quality gate tracking
}
```

### Supporting Types

```typescript
interface LearningObjective {
  id: string;
  competencyId: string;
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  statement: string;              // "Design a REST API with proper versioning and error handling"
  measurable: boolean;            // Can be assessed via rubric
  assessmentTypes: AssessmentType[]; // Which assessment types cover this
}

type AssessmentType = 'mcq' | 'scenario' | 'case_study' | 'short_answer' | 'assignment' | 'project' | 'interview' | 'voice' | 'presentation';

interface TheoryAsset {
  markdown: string;               // Structured: Concept → Principles → Patterns → Tradeoffs → Anti-patterns
  diagrams: DiagramAsset[];       // Mermaid/PlantUML source
  glossary: GlossaryEntry[];
}

interface QuizAsset {
  questions: MCQQuestion[];
  // Exactly 50 questions per competency
}

interface MCQQuestion {
  id: string;
  competencyId: string;
  stem: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;            // Why correct + why distractors wrong
  bloomLevel: 'remember' | 'understand' | 'apply';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface ScenarioAsset {
  id: string;
  competencyId: string;
  context: string;                // Realistic situation (2–3 paragraphs)
  question: string;               // "What do you do first?" / "How do you handle X?"
  rubricId: string;               // Links to rubric for grading
  expectedOutcomes: string[];     // Key decision points
  bloomLevel: 'apply' | 'analyze' | 'evaluate';
}

interface VoiceQuestionAsset {
  id: string;
  competencyId: string;
  prompt: string;                 // "Explain REST to a Product Manager in 2 minutes"
  timeLimitSeconds: number;       // 60–180
  rubricId: string;
  followUpPrompts: string[];      // Dynamic based on answer
}

interface AssignmentAsset {
  id: string;
  competencyId: string;
  title: string;
  description: string;            // Task specification
  deliverable: string;            // What to submit (code, doc, diagram)
  rubricId: string;
  estimatedHours: number;
  starterKit?: StarterKitAsset;   // Repo template, dataset, scaffold
}

interface ProjectAsset {
  id: string;
  competencyId: string;
  title: string;                  // "Design a Rate Limiter for a Public API"
  description: string;
  deliverables: string[];         // ["API Spec", "Architecture Diagram", "Tradeoff Doc"]
  rubricId: string;
  estimatedHours: number;
  templateIds: string[];          // Links to template assets
}

interface Rubric {
  id: string;
  competencyId: string;
  dimension: 'knowledge' | 'understanding' | 'application' | 'communication' | 'decision_making' | 'execution';
  levels: RubricLevel[];          // 0, 25, 50, 75, 100 descriptors
}

interface RubricLevel {
  score: 0 | 25 | 50 | 75 | 100;
  descriptor: string;             // Observable behavior at this level
  examples: string[];             // Concrete answer snippets
}
```

---

## Question Engine Specification

**Every competency MUST have these pre-generated assets. No on-the-fly generation.**

| Asset | Count | Generation | Storage |
|-------|-------|------------|---------|
| MCQ Questions | 50 | Batch (GitHub Actions) | `competency_assets.mcq_questions` |
| Scenario Questions | 20 | Batch | `competency_assets.scenarios` |
| Voice Questions | 10 | Batch | `competency_assets.voice_questions` |
| Case Studies | 10 | Batch | `competency_assets.case_studies` |
| Practical Assignments | 5 | Batch | `competency_assets.assignments` |
| Project Templates | 5 | Batch | `competency_assets.projects` |
| Interview Questions | 10 | Batch | `competency_assets.interview_questions` |
| STAR Questions | 10 | Batch | `competency_assets.star_questions` |
| Rubrics | 6 (one per dimension) | Hand-crafted per competency | `competency_assets.rubrics` |
| Templates | 3–5 | Hand-crafted | `competency_assets.templates` |

**Total per competency: ~120+ assets.**

---

## Assessment Dimensions (6D Scoring)

Every assessment maps to these 6 dimensions. Each scored 0–100.

| Dimension | Weight (Default) | What It Measures |
|-----------|------------------|------------------|
| **Knowledge** | 1.0 | Recall, recognition, terminology |
| **Understanding** | 1.0 | Explain, connect, paraphrase |
| **Application** | 1.5 | Solve in context, adapt patterns |
| **Communication** | 1.0 | Structure, clarity, audience awareness |
| **Decision Making** | 1.5 | Tradeoffs, rationale, risk awareness |
| **Execution** | 1.0 | Completeness, pragmatism, follow-through |

**Overall Competency Score = Weighted Average**

```typescript
function calculateOverallScore(dimensions: DimensionScores): number {
  const weights = { knowledge: 1, understanding: 1, application: 1.5, communication: 1, decision_making: 1.5, execution: 1 };
  const sum = Object.entries(dimensions).reduce((acc, [dim, score]) => acc + score * weights[dim], 0);
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
  return Math.round(sum / weightSum);
}
```

**Example Output:**
```
Competency: REST API Design (TECH-API-REST-001)
┌──────────────────┬───────┐
│ Dimension        │ Score │
├──────────────────┼───────┤
│ Knowledge        │  82   │
│ Understanding    │  75   │
│ Application      │  60   │
│ Communication    │  78   │
│ Decision Making  │  68   │
│ Execution        │  70   │
├──────────────────┼───────┤
│ OVERALL          │  71   │
└──────────────────┴───────┘
```

---

## Level Definitions (Per Competency)

Each competency has 4 proficiency levels. Rubrics define each.

| Level | Label | Description | Typical Role |
|-------|-------|-------------|--------------|
| 1 | **Beginner** | Knows terminology, can follow guided examples, identifies basic concepts | Junior Engineer, APM |
| 2 | **Intermediate** | Applies independently in standard scenarios, explains tradeoffs, writes acceptable artifacts | Engineer, PM, TPM |
| 3 | **Advanced** | Handles ambiguity, designs novel solutions, mentors others, makes architectural decisions | Senior TPM, Tech Lead |
| 4 | **Expert** | Creates new patterns, organizational influence, industry recognition, handles crisis | Principal TPM, Director |

---

## Certification Mapping

| Certification | Required Competencies (Sample) | Min Overall Score |
|---------------|--------------------------------|-------------------|
| **Associate TPM** | 40 core competencies (all Level 1–2) | ≥ 60 |
| **TPM** | 70 competencies (Level 2–3) | ≥ 70 |
| **Senior TPM** | 100 competencies (Level 3) | ≥ 75 |
| **Principal TPM** | 130 competencies (Level 3–4) | ≥ 80 |
| **Enterprise TPM** | 150+ (incl. Leadership, Business, Strategy at Level 4) | ≥ 85 |

---

## 5 Hand-Worked Competencies (Quality Bar)

These 5 are authored manually to establish the gold standard. All other competencies follow this pattern.

### 1. TECH-API-REST-001 — REST API Design
- **Category:** Technology | **Domain:** APIs & Protocols
- **Difficulty:** Intermediate | **Importance:** 5 | **Study Hours:** 8
- **Prerequisites:** TECH-NET-HTTP-001, TECH-API-FUND-001
- **Objectives (6):** Design resource-oriented APIs, Implement versioning, Handle errors consistently, Apply pagination/filtering, Secure with auth, Document with OpenAPI
- **Assets:** 50 MCQ, 20 Scenarios, 10 Voice, 5 Assignments, 5 Projects, 10 Interview, 10 STAR, 6 Rubrics, 3 Templates
- **Key Rubric (Application - 75):** "Designs API handling versioning, pagination, error envelopes, and auth; justifies REST vs RPC tradeoffs for given use case"

### 2. TECH-DB-SQL-003 — SQL Joins & Query Optimization
- **Category:** Technology | **Domain:** Databases
- **Difficulty:** Intermediate | **Importance:** 4 | **Study Hours:** 10
- **Prerequisites:** TECH-DB-SQL-001 (Basics), TECH-DB-SQL-002 (Schema Design)
- **Objectives (5):** Write complex joins, Analyze query plans, Create effective indexes, Handle transaction isolation, Optimize slow queries
- **Assets:** Full set per spec
- **Key Rubric (Decision Making - 75):** "Chooses join type and index strategy based on query plan analysis; explains tradeoffs between read/write optimization"

### 3. PROG-PLAN-QUARTERLY-001 — Quarterly Planning & Capacity
- **Category:** Program Management | **Domain:** Planning & Estimation
- **Difficulty:** Advanced | **Importance:** 5 | **Study Hours:** 12
- **Prerequisites:** PROG-PLAN-ROADMAP-001, PROG-DEP-MGMT-001, LEAD-INFLUENCE-001
- **Objectives (6):** Align quarterly goals to strategy, Model team capacity, Negotiate scope with stakeholders, Build dependency graph, Define measurable OKRs, Communicate plan to execs
- **Key Rubric (Execution - 75):** "Produces quarterly plan with capacity-backed commitments, identified risks with mitigations, and stakeholder sign-off"

### 4. LEAD-COMM-EXECUTIVE-001 — Executive Communication
- **Category:** Leadership | **Domain:** Executive Communication
- **Difficulty:** Advanced | **Importance:** 5 | **Study Hours:** 8
- **Prerequisites:** COMM-STORY-001, COMM-PRESENT-001, BIZ-STRATEGY-001
- **Objectives (5):** Translate technical status to business impact, Deliver executive updates (written + verbal), Handle Q&A under pressure, Frame asks with ROI, Build executive presence
- **Key Rubric (Communication - 100):** "Delivers concise, business-outcome-focused update; anticipates exec questions; maintains composure under challenge"

### 5. PROD-ROADMAP-PRIORITIZATION-001 — Roadmap Prioritization Frameworks
- **Category:** Product | **Domain:** Roadmapping
- **Difficulty:** Intermediate | **Importance:** 5 | **Study Hours:** 6
- **Prerequisites:** PROD-METRICS-001, PROD-DISCOVERY-001, BIZ-UNIT-ECON-001
- **Objectives (5):** Apply RICE/WSJF/ICE, Balance quick wins vs strategic bets, Incorporate technical debt, Communicate prioritization rationale, Re-prioritize on new data
- **Key Rubric (Decision Making - 75):** "Applies framework correctly; explains why chosen; adjusts weights based on org context; communicates tradeoffs to stakeholders"

---

## Graph Traversal Rules

```typescript
// Topological sort for roadmap generation
function getLearningOrder(targetCompetencies: string[], userCompleted: string[]): Competency[] {
  const graph = loadCompetencyGraph();
  const required = new Set<string>();
  
  // Collect all prerequisites recursively
  for (const target of targetCompetencies) {
    collectPrereqs(graph, target, required);
  }
  
  // Remove already completed
  for (const done of userCompleted) required.delete(done);
  
  // Topological sort (Kahn's algorithm)
  return topologicalSort(Array.from(required), graph);
}

function collectPrereqs(graph: Graph, nodeId: string, acc: Set<string>) {
  const node = graph.nodes[nodeId];
  for (const prereq of node.prerequisites) {
    if (!acc.has(prereq)) {
      acc.add(prereq);
      collectPrereqs(graph, prereq, acc);
    }
  }
}
```

---

## Content Pipeline (GitHub Actions)

```yaml
# .github/workflows/generate-content.yml
name: Generate Competency Content
on:
  workflow_dispatch:
    inputs:
      competency_ids:
        description: 'Comma-separated competency IDs (empty = all unpublished)'
        required: false
      model:
        description: 'OpenRouter model ID'
        required: true
        default: 'nvidia/nemotron-3-ultra:free'
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run content:generate -- --competencies=${{ github.event.inputs.competency_ids }} --model=${{ github.event.inputs.model }}
      - name: Create Review PR
        uses: peter-evans/create-pull-request@v6
        with:
          branch: content-generation/${{ github.run_id }}
          title: 'Generated content for review'
          body: 'Auto-generated competency assets. Requires human review before merge.'
```

**Review Gate:** No content goes to `published` status without human approval on PR.

---

## Versioning & Migrations

- `version` field on every competency (starts at 1)
- Breaking changes (removed objectives, changed prerequisites) → new version + migration script
- Non-breaking (added examples, fixed typos) → patch version, no migration
- Supabase `competency_versions` table tracks history for audit

---

*This graph schema is the contract. All engines (Assessment, Roadmap, Coach, Interview, Certification) read from this structure. No engine invents its own taxonomy.*