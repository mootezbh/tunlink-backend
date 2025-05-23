# TunLink Backend

A URL shortener backend service built with NestJS, featuring PostgreSQL for data persistence and Redis for caching.

## Features

- URL shortening with custom slug support
- PostgreSQL database for storing URL mappings
- Built with NestJS framework
- Docker containerization
- Comprehensive testing setup (Unit, Integration, E2E)

## Prerequisites

- Node.js
- pnpm
- Docker and Docker Compose

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start the Docker containers (PostgreSQL and Redis):

   ```bash
   pnpm docker:start
   ```

4. Run database migrations:

   ```bash
   pnpm db:migrate:dev
   ```

5. Start the development server:

   ```bash
   pnpm start:dev
   ```

   The server will be running at `http://localhost:3000` by default.

## Testing

The project includes different types of tests:

- Unit tests: `pnpm test`
- Integration tests: `pnpm test:int`
- E2E tests: `pnpm test:e2e`

## Project Structure

```
src/
├── modules/url/         # URL shortening module
├── core/               # Core functionality (caching, logging)
├── database/           # Database configuration and Prisma setup
├── config/            # Application configuration
└── services/          # Shared services
```

## Technologies

- NestJS - Backend framework
- Prisma - Database ORM
- PostgreSQL - Primary database
- Redis - Caching layer
- Docker - Containerization
- Jest - Testing framework
