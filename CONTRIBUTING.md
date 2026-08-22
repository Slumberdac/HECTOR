# Contributing

## Getting set up

```bash
npm install
npm run dev:db      # MongoDB in Docker
cp .env.example backend/.env
npm run dev
```

`backend/.env` needs at minimum:

```
MONGODB_URI=mongodb://localhost:27017/hector
JWT_SECRET=any-string-of-at-least-32-characters
```

## Before opening a pull request

```bash
npm run lint
npm run format
npm test
```

CI runs all three plus an arm64 image build, so anything that fails locally
fails there too.

## Conventions

- Tabs, width 4. Prettier owns formatting; do not argue with it by hand.
- Backend is CommonJS, frontend is ES modules. Do not mix.
- Comments explain **why**, not what. If a line needs a comment saying what it
  does, rewrite the line.
- Every response shape goes through a model's `toPublicJSON()`. Do not build
  response objects ad hoc — that is how passwords ended up in the API once.
- Controllers are wrapped in `asyncHandler` and `throw HttpError`. Do not call
  `res.status().json()` for errors and do not call `next(err)` after already
  responding.
- New endpoints need a route-level auth decision. If it mutates anything, say
  explicitly who may call it.
- Frontend components never call `fetch` directly — add the endpoint to
  `frontend/src/api/hector.js`.

## Adding an endpoint

1. Route in `backend/src/routes/`, with its guards and validation rules.
2. Handler in `backend/src/controllers/`.
3. Validation rules in `backend/src/middleware/validate.js`.
4. A test in `backend/tests/` — at minimum, one asserting that the wrong caller
   gets a 401 or 403.
5. The wrapper in `frontend/src/api/hector.js`.
6. A row in `docs/API.md` and in the Postman collection.

## Secrets

Never commit `.env`. If you leak a credential, rotate it — deleting the commit
does not help once it has been pushed. See `docs/SECURITY-NOTES.md`.
