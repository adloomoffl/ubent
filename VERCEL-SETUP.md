# Vercel hosting

Production: https://www.ubentertainments.in
Admin: https://www.ubentertainments.in/admin

The username is defined in lib/admin-policy.ts. The owner's existing password is
stored only as a salted scrypt hash in Vercel's server-only ADMIN_PASSWORD_HASH.
NEXTAUTH_SECRET encrypts sessions. NEXTAUTH_URL is the trusted HTTPS production
origin. Never commit secret values or prefix them with NEXT_PUBLIC_.

The connected ubent-admin Upstash Redis database supplies KV_REST_API_URL and
KV_REST_API_TOKEN. All usernames and function instances share five password
attempts per 15-minute window, including successful attempts. Storage failures
deny password login. Content saves atomically compare revisions, retain the
previous version as a backup, and persist beyond deployments. Production and
preview use separate key namespaces.

The connected ubent-images private Blob store supplies BLOB_STORE_ID. The SDK
uses Vercel's rotating OIDC credentials; no static Blob token is required.
Uploads accept JPG, PNG and WebP up to 4 MB. Images are decoded, bounded and
re-encoded as WebP with metadata removed. Draft uploads are visible only to the
administrator. Saving the image into website content makes it visible through
/media/[filename]. Removed images stop being served to anonymous visitors.

Local development still uses data/site-content.json and data/uploads. It has
its own ignored .env.local. Vercel hosts the production runtime; the local start
commands are for development only.

Google sign-in is optional and remains restricted to the approved Gmail
account. Its OAuth callback is
https://www.ubentertainments.in/api/auth/callback/google.

Validation: production build, 21 automated checks, dependency audit, and live
login/content/upload checks. Run the checks in tests/ with Node's type stripping.
