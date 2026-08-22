# syntax=docker/dockerfile:1
#
# Build context is the REPOSITORY ROOT — see backend/Dockerfile for why:
#
#   docker build -f frontend/Dockerfile .

# ---- build ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
RUN npm ci --workspace @hector/web

COPY frontend ./frontend

# Baked in at build time: a Vite bundle is static files, so this cannot be an
# environment variable read at container start. The default is a relative path,
# which is what you want when Caddy serves the app and the API on one origin.
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build --workspace @hector/web

# ---- runtime ----------------------------------------------------------------
# Caddy serves the built bundle and proxies /api to the backend, so the browser
# only ever talks to a single origin and no CORS is involved.
FROM caddy:2-alpine AS runtime
COPY frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/frontend/build /srv

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
