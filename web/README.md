# Task Manager Web

Next.js App Router frontend for the Section 1 Task Manager.

## Development

From the repository root, start the API in one terminal:

```bash
cd api
npm ci
npm run start:dev
```

In another terminal, start the frontend:

```bash
cd web
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API defaults to
`http://localhost:3001`; change `NEXT_PUBLIC_API_URL` in `.env.local` if needed.

## Verification

```bash
npm run lint
npm run build
```
