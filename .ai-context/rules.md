# LexMate - Coding Rules

## 1. Development Rules

1. Use TypeScript throughout the project.
2. Keep TypeScript strict mode enabled.
3. Prefer small, focused modules.
4. Keep business logic out of UI components.
5. Validate external input at system boundaries.
6. Never trust client-side authorization.
7. Never commit secrets or credentials.
8. Add tests for important business logic.
9. Keep PRs focused and reviewable.
10. Update documentation when architecture changes.

## 2. General Principles

### Single Responsibility
A component, service, hook, or module should have a clear responsibility.

### Reuse
Create reusable components for repeated UI patterns and shared business utilities.

### Explicitness
Prefer readable, explicit code over clever abstractions.

### Composition
Prefer composition over deeply coupled inheritance.

### Error Handling
Errors should be handled deliberately. Avoid silently swallowing exceptions.

### Logging
Use structured logging on the backend. Never log passwords, tokens, private document contents, or other sensitive information.

## 3. Technology & Coding Standards

### TypeScript
- `strict: true`
- Avoid `any`.
- Prefer `unknown` for unknown external values.
- Use explicit domain types.
- Use Zod for runtime validation where appropriate.

### Naming
Components:
```text
CaseCard.tsx
ClientProfile.tsx
HearingCard.tsx
```

Hooks:
```text
useCases.ts
useCase.ts
useAuth.ts
```

Functions:
```text
getCase()
createCase()
updateCase()
deleteCase()
```

Booleans:
```text
isLoading
isActive
hasPermission
canEdit
```

### React Native
- Keep screens focused on composition and presentation.
- Move API/business logic into feature modules.
- Use reusable design-system components.
- Maintain accessible touch targets.
- Avoid duplicated inline design constants.

### State Management

Server state:
```text
TanStack Query
```

Application/UI state:
```text
Zustand
```

Local component state:
```text
React useState/useReducer
```

Do not put all application data into a global Zustand store.

### Forms
Use:
- React Hook Form
- Zod schemas

Validate on both client and server.

## 4. Project Structure Rules

Use feature/domain-based organization.

Good:
```text
features/cases/
  api/
  components/
  hooks/
  schemas/
  types.ts
```

Avoid:
```text
components/
services/
utils/
screens/
```

when those folders become dumping grounds for unrelated business domains.

## 5. API Rules

- Version public APIs.
- Validate DTOs.
- Use consistent response/error formats.
- Never rely on client-side permissions.
- Return only data the requesting user is authorized to access.
- Use pagination for potentially large collections.
- Use idempotent operations where appropriate.
- Do not expose internal database implementation details.

## 6. Security Rules

- HTTPS in non-local environments.
- Secure token/session handling.
- Server-side authorization.
- Organization/tenant isolation.
- Rate limiting where appropriate.
- Audit sensitive operations.
- Validate file type, size, and access.
- Use signed/controlled URLs for private documents.
- Never expose secrets in source control or logs.

## 7. Git Rules

Branch examples:
```text
feature/case-management
feature/hearing-reminders
fix/document-upload
refactor/auth-module
```

Commit examples:
```text
feat(cases): add case creation
fix(auth): handle expired refresh token
refactor(documents): separate storage service
```

Pull requests should pass:
- Type checking
- Linting
- Tests
- Build validation

## 8. Definition of Done

A feature is not complete until:
- UI is implemented
- API/business logic is implemented
- Validation exists
- Authorization is checked
- Loading/error/empty states are handled
- Relevant tests exist
- No secrets are introduced
- Code passes lint/type checks
- Documentation is updated when needed
