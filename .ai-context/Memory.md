# LexMate - Project Memory

## 1. Project Memory

Project name: LexMate

Product type: Mobile-first legal practice management SaaS.

Primary users:
- Lawyers
- Advocates
- Associates
- Small/medium law firms
- Legal staff

Core promise:
A lawyer should be able to manage important practice workflows from one organized workspace.

## 2. Current Status

- Product concept defined.
- Core MVP feature set identified.
- Mobile UI direction created in Figma.
- Technology direction selected:
  - React Native
  - Expo
  - TypeScript
  - Expo Router
  - TanStack Query
  - Zustand
  - NestJS
  - PostgreSQL
  - Prisma
- Monorepo architecture selected.
- Feature/domain-based architecture selected.
- Multi-tenant SaaS foundation is part of the architecture.
- AI is planned as a backend-controlled capability.

## 3. Completed Tasks

- Defined the legal practice management product concept.
- Identified dashboard, cases, calendar, clients, documents, tasks, payments, notifications, and AI workflows.
- Designed mobile UI concepts including:
  - Dashboard
  - My Cases
  - Case Details
  - Calendar
  - Documents
  - Client Profile
  - AI Assistant
  - Case Timeline
- Created an initial technical architecture.
- Defined coding and security standards.

## 4. In Progress

Next implementation sequence:

1. Create monorepo.
2. Initialize React Native + Expo mobile application.
3. Initialize NestJS API.
4. Configure PostgreSQL and Prisma.
5. Establish authentication.
6. Implement shared types/validation packages.
7. Implement the mobile design system from Figma.
8. Implement navigation and app shell.
9. Implement Cases module.
10. Implement Clients module.
11. Implement Hearings/Calendar.
12. Implement Documents.
13. Implement Tasks.
14. Implement Payments.
15. Implement Notifications.
16. Implement initial AI workflows.

## 5. Important Decisions

### Frontend
React Native + Expo + TypeScript.

### Backend
NestJS + TypeScript.

### Database
PostgreSQL + Prisma.

### Architecture
Monorepo with:
```text
apps/mobile
apps/api
packages/*
```

### State
- TanStack Query for server state.
- Zustand for app/UI state.
- React state for local component state.

### Documents
Store document metadata in PostgreSQL and document binaries in object storage.

### AI
AI requests must go through the backend. The mobile client must not contain provider secrets.

### Security
Authorization must be enforced server-side. Organization/tenant isolation is mandatory.

## 6. Agent Instructions

When working on LexMate:
- Read this memory before making architectural decisions.
- Treat `prd.md` as the product requirements source.
- Treat `architecture.md` as the technical architecture source.
- Treat `rules.md` as the coding standards source.
- Treat `design.md` as the UI/UX source.
- Do not introduce a new technology when an existing approved technology already solves the requirement unless there is a documented reason.
- Preserve existing architecture unless a change is explicitly requested or a concrete technical problem requires it.
- Before implementing a new feature, identify its domain/module.
- Consider loading, empty, error, offline, authorization, and success states.
- Keep security and tenant isolation in mind for every backend feature.
- Prefer incremental, testable changes.
- Do not claim a feature is complete unless the implementation, validation, tests, and relevant states are addressed.
