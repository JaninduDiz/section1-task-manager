# Section 1: Task Manager

A small task manager built with a NestJS REST API and a Next.js App Router
frontend. The UI uses shadcn components.

## Requirements

- Node.js 24.x
- npm 11.x

## Run from a fresh clone

Clone the repository and enter its root:

```bash
git clone https://github.com/JaninduDiz/section1-task-manager.git
cd section1-task-manager
```

Install and start the API in one terminal:

```bash
cd api
npm ci
npm run start:dev
```

The API starts at `http://localhost:3001`.

In another terminal, install and start the frontend:

```bash
cd web
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No database setup is
required.

## Environment variables

| Variable | App | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | API | `3001` | API listening port |
| `WEB_ORIGIN` | API | `http://localhost:3000` | Allowed browser origin for CORS |
| `NEXT_PUBLIC_API_URL` | Web | `http://localhost:3001` | Base URL used by the API client |

Defaults work for local development. Set a variable in the relevant process
environment to override it.

## API

- `GET /tasks` and `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

Tasks are kept in memory and reset when the API process restarts.

## Verification

Run these commands from the relevant app directory:

```bash
# api/
npm test
npm run test:e2e
npm run build
npm run lint

# web/
npm run build
npm run lint
```

## Decisions

1. **In-memory storage:** the assignment permits it, and it keeps this small
   task manager free of database setup; data resets when the API restarts.
2. **DTO validation at the API boundary:** `class-validator` and a global
   `ValidationPipe` reject invalid and unknown input before it reaches task
   operations.
3. **A small typed API client and local UI state:** the app has a few CRUD
   screens, so this avoids adding a server-state library while keeping
   networking and error messages in one place.
4. **shadcn UI primitives and next-themes:** shadcn supplies the interface
   components, while next-themes handles the saved, system-aware light/dark
   preference.
5. **Explicit recovery feedback:** load failures offer a retry, form failures
   stay visible in the dialog, and successful actions show toasts.

## How I used AI

I used GitHub Copilot in VS Code to help plan, scaffold, implement, and
troubleshoot Section 1. I replaced the generated starter screens and API
controller with the task manager, reviewed the generated shadcn components,
configured validation and CORS, and ran tests, builds, lint, and browser checks.

One early AI-assisted date-picker implementation closed its popover before a
day could be selected. I noticed this while testing the calendar in the
browser, changed it to a controlled shadcn Popover and Calendar, and verified
that a selected date is retained.
