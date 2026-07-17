# TaskFlow - Task Management Application

A full-stack task management application built with Next.js 14, Express, Prisma, and PostgreSQL, following SOLID design principles.

## Architecture

```
Proj1/
├── frontend/                    # Next.js 14 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── shared/          # Reusable UI components (Modal)
│   │   │   └── tasks/           # Task-specific components
│   │   │       ├── TaskDashboard.tsx   # Main orchestrator
│   │   │       ├── TaskList.tsx        # Filtered task grid
│   │   │       ├── TaskCard.tsx        # Individual task display
│   │   │       └── TaskForm.tsx        # Create/edit form
│   │   ├── lib/
│   │   │   ├── api/             # Axios API client
│   │   │   ├── hooks/           # React Query hooks
│   │   │   ├── providers/       # React Query provider
│   │   │   └── store/           # Zustand filter state
│   │   └── types/               # TypeScript type definitions
│   └── ...
├── backend/                     # Express + Prisma + TypeScript
│   ├── prisma/schema.prisma     # Database schema
│   ├── src/
│   │   ├── lib/
│   │   │   ├── controllers/     # Request handling & response formatting
│   │   │   ├── database/        # Prisma client singleton
│   │   │   ├── repositories/    # Data access layer
│   │   │   ├── routes/          # RESTful route definitions
│   │   │   └── services/        # Business logic & validation
│   │   ├── types/               # Domain types and DTOs
│   │   ├── __tests__/           # Unit tests (27 passing)
│   │   ├── app.ts               # Express app factory
│   │   └── server.ts            # Entry point
│   └── ...
└── README.md
```

## Prerequisites

- **Node.js** v18+ (verify with `node --version`)
- **PostgreSQL** running locally (verify with `psql --version`)
- **npm** (verify with `npm --version`)

---

## Setup Instructions

### Step 1: Set Up PostgreSQL Database

1. Open **pgAdmin** or your PostgreSQL terminal
2. Create the database:
   ```sql
   CREATE DATABASE taskflow;
   ```
   Or via command line:
   ```bash
   psql -U postgres -c "CREATE DATABASE taskflow;"
   ```
3. Verify the connection string in `backend/.env` matches your credentials:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow?schema=public"
   PORT=3001
   NODE_ENV=development
   ```
   Change `postgres:postgres` to `your_username:your_password` if different.

---

### Step 2: Start the Backend

Open **Terminal 1** and navigate to the backend:

```bash
cd backend
```

**2a. Install dependencies:**
```bash
npm install
```

**2b. Generate Prisma client and push schema to the database:**
```bash
npx prisma generate
npx prisma db push
```

Expected output: *"Your database is now in sync with your Prisma schema."*

**2c. Start the development server:**
```bash
npm run dev
```

Expected output:
```
Database connected successfully
Server running on port 3001
```

**2d. Verify the backend is running:**

Open `http://localhost:3001/api/health` in your browser or run:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-07-16T..."}
```

---

### Step 3: Start the Frontend

Open **Terminal 2** and navigate to the frontend:

```bash
cd frontend
```

**3a. Install dependencies:**
```bash
npm install
```

**3b. Start the development server:**
```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.2.35
- Local: http://localhost:3000
```

**3c. Open the application:**

Navigate to `http://localhost:3000` in your browser.

---

## How to Use the Application

| Action | How |
|--------|-----|
| **Create a task** | Click **"+ New Task"** button, fill in the form, click **"Create Task"** |
| **Edit a task** | Click **"Edit"** on any task card |
| **Delete a task** | Click **"Delete"** on any task card (confirmation required) |
| **Change status** | Click **"Move to IN PROGRESS"** or **"Move to DONE"** on a task card |
| **Search tasks** | Type in the search box to filter by title/description |
| **Filter by status** | Use the **"All Statuses"** dropdown |
| **Filter by priority** | Use the **"All Priorities"** dropdown |
| **Clear filters** | Click **"Clear Filters"** link |

---

## Running Tests

```bash
cd backend
npm test
```

Expected output:
```
PASS  src/__tests__/TaskController.test.ts
PASS  src/__tests__/TaskService.test.ts

Test Suites: 2 passed, 2 total
Tests:       27 passed, 27 total
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | Get all tasks |
| `GET` | `/api/tasks/:id` | Get task by ID |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Request/Response Examples

**Create a task:**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My Task", "description": "Task description", "priority": "HIGH"}'
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "title": "My Task",
    "description": "Task description",
    "status": "TODO",
    "priority": "HIGH",
    "createdAt": "2026-07-16T...",
    "updatedAt": "2026-07-16T..."
  }
}
```

---

## SOLID Design Principles

This project follows SOLID principles throughout the codebase:

| Principle | Implementation |
|-----------|---------------|
| **Single Responsibility** | Each class (Repository, Service, Controller) has one clear purpose |
| **Open/Closed** | Interfaces (`ITaskRepository`, `ITaskService`, `ITaskController`) allow extension without modification |
| **Liskov Substitution** | Mock implementations are interchangeable with real Prisma implementations |
| **Interface Segregation** | Focused interfaces per architectural layer with minimal surface area |
| **Dependency Inversion** | High-level modules (Service, Controller) depend on abstractions, not concretions |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED :5432` | PostgreSQL isn't running. Start it via Services or `pg_ctl start` |
| `Database "taskflow" does not exist` | Run `CREATE DATABASE taskflow;` in PostgreSQL |
| Port 3000 already in use | Kill the process: `netstat -ano \| findstr :3000`, then `taskkill /PID <PID> /F` |
| Port 3001 already in use | Change `PORT` in `backend/.env` to another value (e.g., 3002) |
| Prisma client errors | Run `npx prisma generate` in the `backend` directory |
| Frontend shows empty state | Ensure the backend is running on port 3001 |
| `npm install` peer dependency errors | Use `npm install --legacy-peer-deps` |