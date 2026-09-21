# Enable Google sign-in

Google login is optional. Username-and-password login is already configured; see [ADMIN-ACCESS.md](ADMIN-ACCESS.md).
The only permitted Google admin account is **ubentertainments2026@gmail.com**.
The site remains local at http://localhost:3001. Google sign-in itself needs an internet connection.

## One-time Google setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and select or create a project for UB Entertainments.
2. In **Google Auth Platform**, configure the app branding and OAuth consent screen. Use an External audience for the Gmail account. If the app is in testing, add **ubentertainments2026@gmail.com** as a test user.
3. Create an OAuth client with application type **Web application**.
4. Set the authorized JavaScript origin to:

   `http://localhost:3001`

5. Set the authorized redirect URI to exactly:

   `http://localhost:3001/api/auth/callback/google`

6. Open `.env.local` in this project folder and fill in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. A random `NEXTAUTH_SECRET` has already been generated locally. Keep it and `NEXTAUTH_URL=http://localhost:3001` unchanged.
7. Restart the website using `start-local.cmd`. Visit [Admin](http://localhost:3001/admin) and select **Continue with Google**. Choose **ubentertainments2026@gmail.com**.

Keep the client secret in `.env.local`; do not paste it into chat or commit it. `.env.local` is excluded from Git. Google account passwords are never entered into the website, and Gmail mailbox permissions are not requested.

## Access and editing

- Google must return a verified email that exactly matches the permitted account. Other accounts are refused.
- Admin pages and every content API request enforce the session on the server. The configured username-and-password login is also supported; there is no authentication bypass.
- Sessions expire after two hours. Use **Sign out** to remove the session in the browser.
- Content changes are drafts until **Save changes**. Changes then appear on a fresh visit or refresh of the public page.
- Content is stored in `data/site-content.json` on this computer. The previous version is retained in `data/site-content.backup.json`. Back up this folder when moving the project.
- Use **Upload image** to choose JPG, PNG, or WebP photos up to 8 MB. Image links remain available as an alternative. Uploaded images are stored in `data/uploads/`.
- Use `localhost`, not `127.0.0.1`, in the browser so the origin and callback match.

## Troubleshooting

- **Sign-in setup required:** ensure both Google fields are filled and restart the server.
- **redirect_uri_mismatch:** check that Google's authorized redirect URI exactly matches the one above, including port 3001.
- **AccessDenied:** use the authorized account; being a Google test user alone does not grant admin access.
- **Content changed in another tab:** keep a copy of your pending edits, reload the editor, then reapply them to the latest content.
- **Save remains busy after an unexpected crash:** stop the website, confirm no other instance is running, and remove only `data/site-content.lock` before restarting. Keep the JSON data files.

Implementation references: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [NextAuth Google provider](https://next-auth.js.org/providers/google).
