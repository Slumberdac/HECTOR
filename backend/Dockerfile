# syntax=docker/dockerfile:1
#
# Build context is the REPOSITORY ROOT, not backend/. npm workspaces keep one
# lockfile there, and `npm ci` needs it:
#
#   docker build -f backend/Dockerfile .
#
# docker-compose.yml already does this.

# ---- dependencies -----------------------------------------------------------
# Its own stage so a source-only change does not re-run npm ci.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --omit=dev --workspace @hector/api

# ---- runtime ----------------------------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production

# tini reaps zombies and forwards SIGTERM, which is what makes the graceful
# shutdown in server.js actually fire on `docker compose down`.
RUN apk add --no-cache tini curl

WORKDIR /app
# The whole resolved tree, not just /app/node_modules: npm hoists most packages
# to the root but nests a few under backend/node_modules, and copying only the
# root would silently drop them.
COPY --from=deps /app ./
COPY backend/src ./backend/src
# Operational scripts ship with the image so they can be run without a Node
# toolchain on the host:
#   docker compose exec api node backend/scripts/check-database.js
#   docker compose exec api node backend/scripts/migrate-from-v1.js --dry-run
COPY backend/scripts ./backend/scripts

# The base image ships an unprivileged `node` user; use it rather than root.
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD curl -fsS http://127.0.0.1:5000/healthz || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/src/server.js"]
