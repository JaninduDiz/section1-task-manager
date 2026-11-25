# Task Manager API

NestJS API for the Section 1 Task Manager.

## Development

```bash
npm ci
npm run start:dev
```

The API listens on `http://localhost:3001` by default. Set `PORT` to override
the port or `WEB_ORIGIN` to change the allowed frontend origin.

## Endpoints

- `GET /tasks` and `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

Tasks are stored in memory and reset when the API process restarts.

## Verification

```bash
npm test
npm run test:e2e
npm run build
npm run lint
```
