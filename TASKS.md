# Section 1 Task Manager Checklist

The repository root should contain `api/` and `web/`. This checklist stays at
the root while the application is rebuilt from a clean start.

## Repository setup

- [x] Create a new public repository.
- [x] Initialize Git in this directory and set the author identity locally.
- [x] Add a root `.gitignore` for dependencies, build output, and environment
      files; confirm the repository root is this directory.
- [x] Commit the initial repository setup with a clear message.

## Project scaffolding

- [x] Create the `api/` NestJS application and `web/` Next.js App Router
      application directly under the repository root.
- [x] Initialize shadcn/ui in `web/` and add only the components the task
      manager needs.
- [x] Choose non-conflicting local ports and confirm the frontend can reach the
      API.

## Backend

- [x] Define the Task model: `id`, required `title`, optional `description`,
      `status` (`TODO`, `IN_PROGRESS`, `DONE`), optional `dueDate`, and `createdAt`.
- [x] Implement in-memory task storage and service operations.
- [x] Implement `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PATCH /tasks/:id`,
      and `DELETE /tasks/:id`.
- [x] Add create/update DTO validation with `class-validator`; return 400 for
      invalid input and 404 for missing task IDs.
- [x] Test CRUD behavior, validation failures, missing IDs, and optional field
      updates.

## Frontend

- [x] Define shared Task types and an API client.
- [x] Fetch and display tasks in a responsive table with status badges.
- [x] Add a shadcn dialog for creating and editing tasks.
- [x] Add delete confirmation.
- [x] Show loading and error states and success toasts for completed actions.
- [x] Add a persistent, animated light/dark theme toggle.
- [x] Verify keyboard access, labelled controls, visible focus, and date
      selection.

## Finish and submit

- [x] Run API tests, build, and lint; run frontend build and lint.
- [x] Verify the fresh-clone setup instructions from the README.
- [x] Document 3–5 implementation decisions and how AI was used, including a
      mistake found and corrected.
- [x] Review the final worktree diff and checks.
- [ ] Commit locally and push the completed code to the new public GitHub
      repository.
