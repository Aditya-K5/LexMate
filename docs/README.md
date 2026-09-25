# LexMate
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Aditya-K5/LexMate)

LexMate is a comprehensive, mobile-first legal practice management platform designed for modern lawyers and law firms. It centralizes case management, client information, scheduling, and document handling into a single, organized workspace, enabling legal professionals to manage their practice efficiently from anywhere.

The project is built as a monorepo, featuring a React Native (Expo) mobile application and a NestJS backend powered by Prisma and PostgreSQL.

## Core Features

- **Multi-Tenant Architecture:** Securely manages data for multiple law practices/organizations.
- **Authentication & Authorization:** Robust user registration, login, and role-based access control (Admin, Lawyer, etc.).
- **Case Management:** Track case details, status, associated clients, and court information.
- **Client Management:** Maintain a centralized directory of clients with contact details and case history.
- **Calendar & Hearings:** Schedule and manage hearings, meetings, and important deadlines.
- **Document Management:** Organize case and client-related documents.
- **Task Management:** Create, assign, and track tasks with priorities and due dates.
- **Financials:** Basic payment and invoice tracking per client or case.
- **Audit Logging:** Logs important actions for security and compliance.

## Technology Stack

| Category      | Technology                                                              |
|---------------|-------------------------------------------------------------------------|
| **Mobile App**  | React Native, Expo, TypeScript, Expo Router, TanStack Query, Zustand    |
| **Backend API** | NestJS, TypeScript, Prisma, Passport.js (JWT)                           |
| **Database**    | PostgreSQL                                                              |
| **Monorepo**    | pnpm Workspaces, Turborepo                                              |
| **Tooling**     | ESLint, Prettier, TypeScript                                            |

## Project Structure

This project is a monorepo managed with pnpm and Turborepo.

```
.
├── apps
│   ├── api/      # NestJS backend application
│   └── mobile/   # Expo (React Native) mobile application
├── packages
│   ├── config/   # Shared configuration and design tokens
│   ├── shared/   # Shared utility functions (e.g., formatters)
│   ├── types/    # Core TypeScript types and interfaces
│   └── validation/ # Shared Zod validation schemas
└── tsconfig.base.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v12.6.0 or higher)

### 1. Installation

Clone the repository and install the dependencies using pnpm:

```bash
git clone https://github.com/aditya-k5/lexmate.git
cd lexmate
pnpm install
```

### 2. Configure Environment

The backend API requires environment variables. Copy the example file and update it with your database credentials.

```bash
cp apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` and set your `DATABASE_URL` and `DIRECT_URL`.

### 3. Set Up the Database

Generate the Prisma client based on your schema:

```bash
pnpm db:generate
```

Push the schema to your database. This will create the necessary tables.

```bash
pnpm db:push
```

## Running the Application

You can run the API and mobile app concurrently from the root directory.

### Run the Backend API

This command starts the NestJS server in watch mode.

```bash
pnpm dev:api
```
The API will be available at `http://localhost:4000/api/v1`.

### Run the Mobile App

This command starts the Expo development server.

```bash
pnpm dev:mobile
```

From the Expo CLI, you can open the app on an iOS simulator (`i`), Android emulator (`a`), or in a web browser (`w`).

## Available Scripts

The following scripts are available at the root of the monorepo:

- `pnpm build`: Build all applications and packages.
- `pnpm typecheck`: Run TypeScript to check for type errors across the monorepo.
- `pnpm lint`: Lint all source files using ESLint.
- `pnpm format`: Format all source files using Prettier.
- `pnpm dev:api`: Start the NestJS API in development mode.
- `pnpm dev:mobile`: Start the Expo development server for the mobile app.
- `pnpm db:generate`: Generate the Prisma client.
- `pnpm db:push`: Push the current Prisma schema to the database.
- `pnpm clean`: Remove all `dist`, `build`, and `.expo` directories.
