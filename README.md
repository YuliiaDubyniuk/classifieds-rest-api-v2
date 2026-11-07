# Classifieds Board REST API

A REST API for a classifieds board with JWT authentication, authorization, and access control. Developed as part of a Master's degree coursework project.

## Overview

A JSON-only API without HTML rendering. The backend serves clients (React applications, mobile applications, etc.) through HTTP requests.

Users can create, update, and delete their own announcements. Anonymous visitors can browse the list of announcements and view individual announcement details.

User registration is required to create announcements. Users can only update and delete their own announcements.

Authentication is implemented using JWT:

- Access token lifetime: 15 minutes.
- Refresh token lifetime: 7 days.
- Refresh token rotation is implemented when tokens are renewed.

## Tech Stack

| Technology                     | Description                          |
| ------------------------------ | ------------------------------------ |
| Node.js                        | JavaScript runtime                   |
| TypeScript                     | JavaScript with static typing        |
| Express 5                      | Web framework                        |
| Prisma 7                       | ORM for PostgreSQL                   |
| PostgreSQL 17                  | Relational database                  |
| Docker                         | Application containerization         |
| Docker Compose                 | Running the application and database |
| Zod                            | Input validation                     |
| bcrypt                         | Password hashing                     |
| jsonwebtoken                   | JWT authentication                   |
| @asteasolutions/zod-to-openapi | OpenAPI documentation generation     |
| swagger-ui-express             | Swagger UI                           |
| dotenv                         | Environment variable management      |

## Installation and Setup

### Option 1: Run with Docker Compose (Recommended)

Requirements:

- Docker Desktop
- Git

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

2. Create a `.env` file in the project root directory.

3. Configure the environment variables in `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=classfields

DATABASE_URL=postgresql://postgres:your-password@postgres:5432/classfields?schema=public

JWT_SECRET=your-secret-key
```

Make sure that the PostgreSQL credentials in `DATABASE_URL` match the values configured in `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`.

The hostname `postgres` is used because it is the PostgreSQL service name in Docker Compose.

4. Build and start the application:

```bash
docker compose up --build
```

Docker Compose will:

- Start the PostgreSQL container.
- Wait until the database is ready.
- Build the application Docker image.
- Generate Prisma Client.
- Start the REST API.

5. Open the API documentation:

```text
http://localhost:3000/api-docs
```

To stop the containers:

```bash
docker compose down
```

To check migration status:

```bash
docker compose exec app npx prisma migrate status
```

To create and apply a new migration:

```bash
docker compose exec app npx prisma migrate dev --name migration_name
```

To view application logs:

```bash
docker compose logs -f app
```

### Option 2: Run Locally

Requirements:

- Node.js
- PostgreSQL

1. Install dependencies:

```bash
npm install
```

2. Create and configure the `.env` file in the project root directory.

3. For local execution, use `localhost` as the database hostname in `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/classfields?schema=public
```

4. Apply database migrations:

```bash
npm run prisma:migrate
```

5. Start the application in development mode:

```bash
npm run dev
```

## API Routes

### Authentication

| Method | Endpoint         | Description                    | Auth Required |
| ------ | ---------------- | ------------------------------ | ------------- |
| POST   | `/auth/register` | Register a new user            | No            |
| POST   | `/auth/login`    | Log in                         | No            |
| POST   | `/auth/refresh`  | Refresh authentication tokens  | No            |
| POST   | `/auth/logout`   | Log out                        | Yes           |
| GET    | `/auth/me`       | Get the current user's profile | Yes           |

### Announcements

| Method | Endpoint             | Description                                            | Auth Required |
| ------ | -------------------- | ------------------------------------------------------ | ------------- |
| GET    | `/announcements`     | Get announcements with pagination, search, and sorting | No            |
| GET    | `/announcements/:id` | Get announcement details                               | No            |
| POST   | `/announcements`     | Create an announcement                                 | Yes           |
| PATCH  | `/announcements/:id` | Partially update an owned announcement                 | Yes           |
| DELETE | `/announcements/:id` | Delete an owned announcement                           | Yes           |

## Request Parameters

### GET /announcements

| Parameter | Type  | Description                                               |
| --------- | ----- | --------------------------------------------------------- |
| `search`  | query | Search by title (case-insensitive)                        |
| `sort`    | query | `newest` (default) or `oldest`                            |
| `page`    | query | Page number (must be greater than 0); 10 records per page |

### POST /auth/register

| Field      | Requirements                           |
| ---------- | -------------------------------------- |
| `username` | Required string, 3–30 characters       |
| `email`    | Required valid email address           |
| `password` | Required string, at least 6 characters |
| `name`     | Required string, at least 2 characters |

### POST /announcements

| Field         | Requirements                                         |
| ------------- | ---------------------------------------------------- |
| `title`       | Required string, 5–50 characters                     |
| `description` | Required string, at least 10 characters              |
| `price`       | Required number greater than 0                       |
| `category`    | Required value: `sale`, `service`, `job`, or `other` |

PATCH uses the same validation rules, but all fields are optional. At least one field must be provided.

## Project Structure

```text
project/
├── prisma/
│   ├── schema.prisma
│   ├── client.ts
│   └── migrations/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── announcements.controller.ts
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   └── validate.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── announcements.routes.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── announcements.validator.ts
│   └── openapi.ts
├── app.ts
├── prisma.config.ts
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

Prisma Client is generated into the `generated/prisma` directory during the Docker image build. This generated directory is not stored in Git.

## Boilerplate

The project includes the following initial configuration:

- `package.json` — dependencies and npm scripts.
- `tsconfig.json` — TypeScript configuration.
- `src/openapi.ts` — initialized OpenAPI registry and `bearerAuth` configuration.
- `prisma/client.ts` — Prisma Client initialization using PostgreSQL through `@prisma/adapter-pg`.
- `prisma.config.ts` — Prisma configuration.
- `.env` — environment variables required to run the application.

## Available Scripts

| Command                   | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| `npm run dev`             | Start the application in development mode with hot reload |
| `npm start`               | Start the application                                     |
| `npm run prisma:migrate`  | Create and apply database migrations                      |
| `npm run prisma:generate` | Generate Prisma Client                                    |

## API Documentation

Swagger UI is available at:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The documentation includes API endpoints, request parameters, data schemas, and authorization requirements.

## Prisma Schema

The database contains three models:

- `User` — `username` (unique), hashed `password`, `email` (unique), `name`, and `createdAt`.
- `RefreshToken` — unique `token` associated with a `User`.
- `Announcement` — `title`, `description`, `price`, `category`, associated `User`, `createdAt`, and `updatedAt`.

## License

ISC
