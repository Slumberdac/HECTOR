# HECTOR

A registry where pet rocks find; the way home.

Browse the companions other people have found, adopt one, or add your own. Built
as a synthesis project for the 4A5 web development course and rebuilt since as a
self-hosted application running on a Raspberry Pi behind a Cloudflare tunnel.

![CI](https://github.com/Slumberdac/HECTOR/actions/workflows/ci.yml/badge.svg)

## Stack

| Layer         | Choice                                                               |
| ------------- | -------------------------------------------------------------------- |
| Frontend      | React 18, React Router 6, Vite                                       |
| API           | Node 22, Express 4, Mongoose 8                                       |
| Database      | MongoDB 8                                                            |
| Auth          | bcrypt password hashing, JWT in an httpOnly `SameSite=strict` cookie |
| Reverse proxy | Caddy (static files + `/api` proxy, one origin, no CORS)             |
| Ingress       | Cloudflare Tunnel (outbound only, no ports forwarded)                |
| Runtime       | Docker Compose on a Raspberry Pi                                     |

## Architecture

```
                    ┌───────────────────────────── Raspberry Pi ──────────────────────────────┐
                    │                                                                          │
  browser           │   cloudflared          web (Caddy :8080)          api :5000    mongo     │
    │               │       │                      │                       │           │       │
    │  https        │       │  outbound tunnel     │  static bundle        │  mongoose │       │
    ├──────────────────► Cloudflare ──────────►  /                         │           │       │
    │  hector.example       │                      │  reverse_proxy /api/* │           │       │
    │               │       │                      ├──────────────────────►│──────────►│       │
    │               │       │                      │                       │  internal │       │
                    │                              └── docker network "internal" ───────┘       │
                    └──────────────────────────────────────────────────────────────────────────┘
```

Nothing on the Pi listens on a public port. `cloudflared` dials out to
Cloudflare and the traffic comes back down that connection, so the router needs
no port forwarding and the home IP is never published.

## Quick start

Requires Node 20+ and Docker.

```bash
git clone https://github.com/Slumberdac/HECTOR.git
cd HECTOR
npm install

npm run dev:db      # MongoDB on localhost:27017
cp .env.example backend/.env   # then fill in JWT_SECRET and MONGODB_URI
npm run dev         # API on :5000, web on :3000
```

The Vite dev server proxies `/api` to the backend, so the browser sees a single
origin in development exactly as it does in production. That is what lets the
session cookie be `SameSite=strict` with no CORS configuration anywhere.

### Useful commands

| Command          | Does                                             |
| ---------------- | ------------------------------------------------ |
| `npm run dev`    | API and web dev servers together                 |
| `npm run dev:db` | MongoDB in Docker for local development          |
| `npm test`       | API test suite                                   |
| `npm run lint`   | ESLint over the whole repo                       |
| `npm run format` | Prettier write                                   |
| `npm run build`  | Production frontend bundle into `frontend/build` |
| `npm run deploy` | Build and start the full production stack        |

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full Raspberry Pi and
Cloudflare Tunnel walkthrough, plus backups and updates.
[docs/MIGRATION.md](docs/MIGRATION.md) covers importing the original Atlas data
if you want the registry to start populated.

The short version, once the Pi is prepared and `.env` is filled in:

```bash
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1:8080/api/v1/rocks | head
```

## Configuration

All configuration is environment variables, validated at boot by
`backend/src/config/index.js`. The process refuses to start with a bad or
missing value rather than failing later with an obscure error.
`.env.example` is the template; `.env` is gitignored and must stay that way.

| Variable         | Required | Default       | Notes                                          |
| ---------------- | -------- | ------------- | ---------------------------------------------- |
| `MONGODB_URI`    | yes      | none          | `mongodb://` or `mongodb+srv://`               |
| `JWT_SECRET`     | yes      | none          | 32+ characters; changing it signs everyone out |
| `PORT`           | no       | `5000`        |                                                |
| `NODE_ENV`       | no       | `development` |                                                |
| `JWT_EXPIRES_IN` | no       | `7d`          |                                                |
| `CORS_ORIGINS`   | no       | empty         | Comma-separated. Empty means no CORS at all    |
| `LOG_LEVEL`      | no       | `info`        |                                                |
| `TRUST_PROXY`    | no       | `0`           | Number of proxy hops in front of the API       |
| `BCRYPT_ROUNDS`  | no       | `12`          |                                                |

## API

Base path `/api/v1`. Full request and response shapes are in
[docs/API.md](docs/API.md), and `Hector.postman_collection.json` is importable
into Postman.

| Method   | Path                     | Auth         |
| -------- | ------------------------ | ------------ |
| `POST`   | `/auth/register`         | none         |
| `POST`   | `/auth/login`            | none         |
| `POST`   | `/auth/logout`           | none         |
| `GET`    | `/auth/me`               | session      |
| `GET`    | `/users`                 | none         |
| `GET`    | `/users/:uid`            | none         |
| `PATCH`  | `/users/:uid`            | self         |
| `DELETE` | `/users/:uid`            | self         |
| `GET`    | `/users/:uid/rocks`      | none         |
| `POST`   | `/users/:uid/rocks/:rid` | self         |
| `DELETE` | `/users/:uid/rocks/:rid` | self         |
| `GET`    | `/rocks`                 | none         |
| `GET`    | `/rocks/:rid`            | none         |
| `POST`   | `/rocks`                 | session      |
| `PATCH`  | `/rocks/:rid`            | owner/author |
| `DELETE` | `/rocks/:rid`            | owner/author |

`GET /healthz` reports process uptime and database connectivity, and is what the
container healthchecks poll.

## Project layout

```
backend/
  src/
    config/       validated environment configuration
    controllers/  request handling, one module per resource
    middleware/   auth, validation rules, error handler
    models/       mongoose schemas + the public JSON shape of each document
    routes/       route tables; who may call what is visible here
    util/         HttpError, async wrapper, uuid guard
    app.js        builds the express app (no listening socket)
    server.js     database connection, listen, graceful shutdown
  tests/          node:test + supertest
frontend/
  src/
    api/          the only place that knows API URLs
    context/      AuthContext, one source of truth for the signed-in user
    components/   feature-grouped components with their CSS
    assets/       SVG components generated with @svgr/cli, images
  Caddyfile       production static serving and /api proxy
ops/
  mongo-init/     first-boot creation of the least-privilege database user
docs/
```

## Security

The 2024 course version of this project shipped with problems that were fine for
a class demo and not fine on the public internet. They are documented in
[docs/SECURITY-NOTES.md](docs/SECURITY-NOTES.md) along with what replaced them:
a hardcoded database credential, plaintext password storage, passwords returned
in API responses, and no authorisation on any mutating endpoint.

## License

MIT. See [LICENSE](LICENSE).
