# Security notes

What was wrong with the original course version, and what replaced it. Kept in
the repo because the fixes are only legible next to the problems.

## 1. A live database credential in the source

`backend/app.js` contained a MongoDB Atlas connection string with username and
password in plain text, committed and pushed to a public repository.

**Fixed:** the connection string is now `MONGODB_URI`, read from the environment
and validated at boot. Nothing secret is in the source tree, and `.env` is
gitignored.

**Still outstanding:** the old credential remains in git history and will remain
there for anyone who clones the repository. Rotating the credential is the only
real remedy; rewriting history does not help once a repository has been public,
because clones and forks keep the old objects. That Atlas user must be deleted.

## 2. Passwords stored in plaintext

The `User` schema stored `password` as a `String` with a complexity validator
and nothing else. Sign-in compared with `user.password !== password`.

**Fixed:** the field is now `passwordHash`, populated with bcrypt (cost 12 by
default), and compared with `bcrypt.compare`, which is constant-time. The field
is declared `select: false`, so it is not loaded unless a query explicitly asks
for it.

## 3. Every response leaked every password

`getResponseUser()` included `password` in its output, and `GET /api/v1/users`
mapped every user through it, so a single unauthenticated request returned the
credentials of every account on the service.

**Fixed:** each model owns a `toPublicJSON()` method that is the single
definition of what the outside world may see, and no response path bypasses it.
A test asserts the plaintext password appears nowhere in a registration
response, and that `/users` contains no password material.

## 4. No authentication

`jsonwebtoken` was a dependency but was never imported. "Signing in" returned
the user's id, the browser stored it in a readable cookie, and every subsequent
request was trusted on the strength of that cookie's contents.

**Fixed:** login issues a signed JWT delivered as an httpOnly, `SameSite=strict`
cookie. httpOnly means page JavaScript cannot read it, so an XSS bug cannot
exfiltrate a session; `SameSite=strict` means another site cannot make the
browser send it, which is what removes the need for a separate CSRF token. A
bearer token is also accepted so the API stays usable from curl and Postman.

## 5. No authorisation

Every mutating endpoint was open to anonymous callers:

- `DELETE /api/v1/users/:uid` deleted any account.
- `PATCH /api/v1/users/:uid` passed `req.body` straight into
  `findByIdAndUpdate`, so a caller could rewrite any field of any user.
- `POST`, `PATCH` and `DELETE` on `/api/v1/rocks` were entirely unguarded.

**Fixed:** `requireAuth` and `requireSelf` guard the user routes; rocks may be
edited or deleted only by the person who added them or the person who currently
has them. Updates go through an explicit allow-list of fields rather than
accepting the whole body.

## 6. `Access-Control-Allow-Origin: *`

Set unconditionally on every response.

**Fixed:** in production the frontend and API share one origin behind Caddy, so
no CORS headers are emitted at all. `CORS_ORIGINS` exists for the cases that
need it and takes an explicit list, never a wildcard.

## 7. Error handling that always returned 500

`HttpError` set `this.statusCode`; the error handler read `error.code`. Since
those never matched, every deliberate 4xx reached the client as a 500, and
several controllers called `res.status().json()` _and_ `next(err)`, producing an
"headers already sent" crash on the way.

**Fixed:** one error handler, reading the right property, that distinguishes a
known `HttpError` (message shown) from an unexpected throw (generic message, no
stack in production). Controllers are wrapped in an async handler so a rejected
promise reaches it instead of hanging the request.

## 8. Smaller things

- `new URL(url)` accepted `javascript:` as a valid image "URL", and the frontend
  put it straight into an `<img src>`. Now restricted to `http`/`https`.
- Username uniqueness was enforced by a `findOne` check, which loses the race
  between two simultaneous registrations. Now a unique index, with the duplicate
  key error mapped to a 409.
- Adoption was a read-then-write, so two people could adopt the same rock at
  once. Now a conditional update matching `owner: null`.
- Login distinguished "user not found" (404) from "wrong password" (401), which
  let anyone enumerate valid usernames. Both now return the same 401.
- No rate limiting anywhere. Now 300 requests/minute across the API and 10 per
  15 minutes on the credential endpoints.
- No security headers. Now `helmet` on the API and an explicit CSP plus
  `X-Frame-Options`, `X-Content-Type-Options` and `Referrer-Policy` from Caddy.
- Malformed ids produced a mongoose `CastError` and a 500. Now a 404.
- Request bodies were unbounded. Now capped at 16 kB.

## Deliberately not done

- **Password reset.** There is no email infrastructure, and a reset flow without
  one is worse than none.
- **Refresh tokens.** A 7-day session on a pet rock registry does not justify
  the rotation machinery.
- **Forcing a password reset on imported accounts.** `docs/MIGRATION.md`
  describes importing the v1 data and bcrypt-hashing the plaintext passwords in
  place, so old accounts keep working. That is a continuity decision, not a
  security one: those passwords sat in plaintext behind a public credential and
  should be assumed known. Anyone who cares about their account should change
  it, and since there is no password-change endpoint yet, that currently means
  deleting the account and registering again.
