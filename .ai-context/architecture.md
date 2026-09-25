# LexMate - Project Architecture

## 1. High-Level Architecture

LexMate uses a monorepo with a React Native mobile client and a modular NestJS backend.

```text
                    React Native + Expo
                           |
                    TanStack Query
                           |
                           v
                     NestJS API
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
     PostgreSQL       Redis / Queue    Object Storage
       + Prisma           |             Documents
                          v
                       Workers
                          |
                    AI / OCR / Search
```

## 2. Technology Stack

### Mobile
- React Native
- Expo
- TypeScript
- Expo Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Expo SecureStore
- Expo Notifications
- Expo FileSystem

### Backend
- Node.js
- NestJS
- TypeScript
- Prisma

### Data
- PostgreSQL
- S3-compatible object storage
- Redis for caching/queues when required

### Testing
- Jest
- React Native Testing Library
- E2E testing with a suitable mobile E2E framework

### Tooling
- pnpm
- Turborepo
- Git
- GitHub
- ESLint
- Prettier
- CI/CD

## 3. Repository Structure

```text
LexMate/
├── apps/
│   ├── mobile/
│   └── api/
├── packages/
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── shared/
├── infrastructure/
├── docs/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 4. Mobile Structure

```text
apps/mobile/
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   ├── (tabs)/
│   ├── cases/
│   └── clients/
└── src/
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── cases/
    │   ├── calendar/
    │   ├── clients/
    │   ├── documents/
    │   ├── tasks/
    │   ├── payments/
    │   └── ai/
    ├── components/
    │   ├── ui/
    │   ├── forms/
    │   └── layout/
    ├── lib/
    ├── hooks/
    ├── stores/
    ├── constants/
    ├── types/
    └── utils/
```

Use feature/domain-based organization. Avoid a large global folder containing unrelated screens and business logic.

## 5. Backend Structure

```text
apps/api/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── organizations/
│   ├── cases/
│   ├── clients/
│   ├── hearings/
│   ├── documents/
│   ├── tasks/
│   ├── payments/
│   ├── notifications/
│   ├── ai/
│   └── audit/
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── decorators/
│   ├── filters/
│   └── pipes/
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## 6. API

Use versioned REST APIs initially.

Example:
```text
/api/v1/cases
/api/v1/hearings
/api/v1/clients
/api/v1/documents
/api/v1/tasks
/api/v1/payments
/api/v1/ai
```

Use DTO validation at the API boundary.

## 7. Data Architecture

PostgreSQL stores structured application data.

Object storage stores uploaded files. PostgreSQL stores document metadata and storage references, not large document binaries.

Important domain relationships:

```text
Organization
 ├── Users
 ├── Clients
 ├── Cases
 │    ├── Hearings
 │    ├── Documents
 │    ├── Tasks
 │    ├── Timeline Events
 │    └── Notes
 ├── Payments
 └── Audit Logs
```

## 8. Multi-tenancy

Organization/tenant isolation must exist from the beginning.

Sensitive records should be associated with an organization and access must be authorized server-side.

Authentication identifies the user. Authorization determines whether the user may access a specific resource.

## 9. AI Architecture

Do not call an AI provider directly from the mobile app.

```text
Mobile
  -> LexMate API
  -> AI module/service
  -> LLM provider
```

For document intelligence:

```text
Document
 -> Object Storage
 -> Text extraction/OCR
 -> Chunking
 -> Indexing/Embeddings
 -> Retrieval
 -> AI response
```

AI output must remain reviewable by the lawyer.

## 10. Asynchronous Work

Use background jobs for operations such as:
- OCR
- Document processing
- Search indexing
- Embedding generation
- Scheduled notifications
- Other long-running work

The API should not wait unnecessarily for these jobs.

## 11. Environments

Maintain separate:
- Development
- Staging
- Production

Each environment should have separate secrets, databases, storage resources, and external credentials.
