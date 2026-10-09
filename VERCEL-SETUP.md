# Hosted admin login

Set `NEXTAUTH_URL` to `https://www.ubentertainments.in` in Production.
Keep `NEXTAUTH_SECRET` (at least 32 characters) and the owner's existing
`ADMIN_PASSWORD_HASH` as server-only secrets. Never commit their values.

Connect an Upstash Redis database to this Vercel project. The login limiter
accepts either `KV_REST_API_URL` / `KV_REST_API_TOKEN` or
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. All submitted usernames
share five attempts per 15-minute window, including successful attempts.
Redis atomically reserves attempts before password verification, across all
function instances. A Redis outage denies password login.

Redeploy after configuration. Verify password sign-in, authenticated access,
sign-out, and anonymous API rejection on the production domain. Google remains
optional and restricted to the existing approved Gmail account. Its OAuth
callback must use `https://www.ubentertainments.in/api/auth/callback/google`.

This change fixes hosted authentication and request origins. The existing
content saves and image uploads still use local files; migrating those to
durable hosted storage is a separate required step before relying on the live
editor for content changes. No website content is changed by this patch.
