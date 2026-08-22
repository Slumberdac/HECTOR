# API reference

Base path: `/api/v1`. All requests and responses are JSON.

## Authentication

Signing in sets `hector_session`, an httpOnly `SameSite=strict` cookie holding a
signed JWT. Browsers send it automatically; the frontend's fetch wrapper uses
`credentials: "include"`.

Non-browser clients may instead send `Authorization: Bearer <token>`. The token
is in the login response body.

`self` in the tables below means the session must belong to the `:uid` in the
path. `owner/author` means the session must belong to either the rock's current
owner or the account that created it.

## Errors

Every failure has the same shape:

```json
{ "message": "Please check the submitted fields", "details": [ ... ] }
```

`details` is present only for validation failures (422) and is an array of
`{ "field": "password", "message": "…" }`.

| Status | Meaning                                               |
| ------ | ----------------------------------------------------- |
| 400    | Malformed body                                        |
| 401    | No session, or an invalid/expired one                 |
| 403    | Authenticated, but not allowed to touch this resource |
| 404    | No such resource (also returned for a malformed id)   |
| 409    | Conflict — username taken, rock already adopted       |
| 413    | Body over 16 kB                                       |
| 422    | Validation failed; see `details`                      |
| 429    | Rate limited                                          |
| 500    | Unexpected; the message is deliberately generic       |

Rate limits: 300 requests/minute across `/api`, and 10 per 15 minutes on
`/auth/register` and `/auth/login`.

## Objects

A user, everywhere one is returned. There is no password field in any response.

```json
{
  "_id": "3f2a…",
  "name": "Jacob",
  "username": "slumberdac",
  "pfp_eyes": 4,
  "pfp_mouth": 7,
  "pfp_color": "#8FCF9A"
}
```

A rock:

```json
{
  "_id": "11ba…",
  "name": "Hector",
  "gender": "N/A",
  "personality": "stoic",
  "description": "Quiet, dependable, slightly mossy.",
  "image": "https://example.com/hector.jpg",
  "owner": "3f2a…",
  "createdBy": "3f2a…"
}
```

`owner` is `null` when the rock is up for adoption.

## Auth

### `POST /auth/register`

```json
{ "name": "Jacob", "username": "slumberdac", "password": "…" }
```

Username: 3–30 characters, `a-z A-Z 0-9 _ . -`.
Password: 8–128 characters, at least one letter, one digit and one of
`!@#$%^&*=`.

`201` with `{ "user": … }` and a session cookie. `409` if the username is taken,
`422` if a field fails validation.

### `POST /auth/login`

```json
{ "username": "slumberdac", "password": "…" }
```

`200` with `{ "user": … }` and a session cookie. `401` on bad credentials — the
same message whether the username exists or not.

### `POST /auth/logout`

`204`, and the cookie is cleared.

### `GET /auth/me`

Session required. `200` with `{ "user": … }`, or `401`.

## Users

| Method   | Path                     | Auth | Notes                                                     |
| -------- | ------------------------ | ---- | --------------------------------------------------------- |
| `GET`    | `/users`                 | —    | `?limit=` (default 100, max 200)                          |
| `GET`    | `/users/:uid`            | —    |                                                           |
| `PATCH`  | `/users/:uid`            | self | Accepts only `name`, `pfp_eyes`, `pfp_mouth`, `pfp_color` |
| `DELETE` | `/users/:uid`            | self | Releases the account's rocks first                        |
| `GET`    | `/users/:uid/rocks`      | —    |                                                           |
| `POST`   | `/users/:uid/rocks/:rid` | self | Adopt. `409` if already adopted                           |
| `DELETE` | `/users/:uid/rocks/:rid` | self | Release                                                   |

Fields outside the `PATCH` allow-list are ignored, not rejected — sending
`username` or `passwordHash` has no effect.

## Rocks

| Method   | Path          | Auth         | Notes                                                                  |
| -------- | ------------- | ------------ | ---------------------------------------------------------------------- |
| `GET`    | `/rocks`      | —            | `?available=true` for unadopted only; `?limit=` (default 200, max 500) |
| `GET`    | `/rocks/:rid` | —            |                                                                        |
| `POST`   | `/rocks`      | session      | Sets `createdBy` to the caller                                         |
| `PATCH`  | `/rocks/:rid` | owner/author | Partial; `owner` and `createdBy` are not writable                      |
| `DELETE` | `/rocks/:rid` | owner/author |                                                                        |

Create/update body:

```json
{
  "name": "Hector",
  "gender": "N/A",
  "personality": "stoic",
  "description": "At least five characters.",
  "image": "https://example.com/hector.jpg"
}
```

`image` must be an `http` or `https` URL. `name` ≤ 60, `personality` ≤ 120,
`description` 5–2000 characters.

## Health

### `GET /healthz`

Outside `/api`, unauthenticated, not rate limited.

```json
{ "status": "ok", "database": "connected", "uptime": 4213 }
```

`200` when the database is connected, `503` otherwise. This is what the Docker
healthcheck polls.
