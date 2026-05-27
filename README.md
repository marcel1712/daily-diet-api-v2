# Daily Diet API v2

REST API for tracking daily meals and diet goals, built with Fastify, Knex, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js 24 (LTS)
- **Framework:** Fastify 5
- **Database:** PostgreSQL 18 (Docker)
- **Query Builder:** Knex 3
- **Validation:** Zod 4
- **Auth:** Cookie-based sessions (`@fastify/cookie`)
- **Password Hashing:** bcrypt
- **Testing:** Vitest + Supertest
- **Language:** TypeScript 6

## Prerequisites

- Node.js 24+
- Docker and Docker Compose
- nvm (recommended)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/marcel1712/daily-diet-api-v2
cd daily-diet-api-v2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.development` file in the root:

```env
POSTGRES_USER=docker
POSTGRES_PASSWORD=your_password
POSTGRES_DB=daily_diet
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_CLIENT=pg
COOKIE_SECRET=your_cookie_secret
NODE_ENV=development
```

### 4. Start the database

```bash
npm run services:up
```

### 5. Run migrations

```bash
npm run knex:migrate
```

### 6. Start the development server

```bash
npm run dev
```

The server will be available at `http://localhost:8080`.

## API Routes

### Users

| Method | Route            | Description                      | Auth |
| ------ | ---------------- | -------------------------------- | ---- |
| POST   | `/users`         | Create a new user                | No   |
| POST   | `/users/login`   | Login and receive session cookie | No   |
| GET    | `/users/metrics` | Get diet metrics for logged user | Yes  |

### Sessions

| Method | Route       | Description      | Auth |
| ------ | ----------- | ---------------- | ---- |
| POST   | `/sessions` | Create a session | No   |

### Meals

| Method | Route        | Description                     | Auth |
| ------ | ------------ | ------------------------------- | ---- |
| POST   | `/meals`     | Create a meal                   | Yes  |
| GET    | `/meals`     | List all meals from logged user | Yes  |
| GET    | `/meals/:id` | Get a specific meal             | Yes  |
| PUT    | `/meals/:id` | Update a meal                   | Yes  |
| DELETE | `/meals/:id` | Delete a meal                   | Yes  |

### Status

| Method | Route     | Description              |
| ------ | --------- | ------------------------ |
| GET    | `/status` | Database connection info |

## Request Examples

### Create user

```json
POST /users
{
  "username": "marcelhrb",
  "email": "marcel@email.com",
  "password": "yourpassword"
}
```

### Login

```json
POST /users/login
{
  "email": "marcel@email.com",
  "password": "yourpassword"
}
```

### Create meal

```json
POST /meals
Cookie: session_id=<your_session_id>

{
  "name": "Grilled chicken",
  "description": "Post-workout lunch",
  "date": "2026-05-20T12:00:00.000Z",
  "is_on_diet": true
}
```

### Metrics response

```json
GET /users/metrics

{
  "total": 10,
  "on_diet": 7,
  "off_diet": 3,
  "best_streak": 4
}
```

## Authentication

Authentication is done via cookie-based sessions. After logging in, a `session_id` cookie is automatically set and sent on subsequent requests. All meal routes and the metrics route require a valid session.

## Running Tests

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

## Available Scripts

| Script                        | Description                              |
| ----------------------------- | ---------------------------------------- |
| `npm run dev`                 | Start development server with hot reload |
| `npm run test`                | Run all tests                            |
| `npm run test:watch`          | Run tests in watch mode                  |
| `npm run knex:migrate`        | Run pending migrations                   |
| `npm run services:up`         | Start Docker containers                  |
| `npm run services:down`       | Stop Docker containers                   |
| `npm run lint:eslint:check`   | Run ESLint                               |
| `npm run lint:prettier:check` | Run Prettier check                       |

## Project Structure

```
daily-diet-api-v2/
├── db/
│   ├── migrations/
│   ├── database.ts
│   └── knexfile.ts
├── infra/
│   └── compose.yaml
├── src/
│   ├── env/
│   │   └── env.ts
│   ├── meals/
│   │   ├── meals.controller.ts
│   │   └── meals.route.ts
│   ├── middleware/
│   │   └── check-session-id.ts
│   ├── types/
│   │   └── fastify.d.ts
│   ├── users/
│   │   ├── sessions.controller.ts
│   │   ├── sessions.routes.ts
│   │   ├── users.controller.ts
│   │   ├── users.password.ts
│   │   └── users.routes.ts
│   ├── app.ts
│   └── server.ts
└── test/
    ├── meals/
    ├── sessions/
    ├── users/
    └── server.test.ts
```
