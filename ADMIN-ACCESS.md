# Admin access

Visit http://localhost:3001/admin.

- Username: **ubentertainment**
- Password: the password supplied by the owner, intentionally not repeated in this document.

The login is active without Google configuration. Once signed in, edit your content and select **Save changes**. Use **Sign out** when finished.

## Upload images

1. Open Studio, Services, Gallery, or News & events.
2. For a new gallery item, select **Add gallery image** first.
3. Select **Upload image** beside the image preview and choose a photo from your computer.
4. Add a title and image description where applicable.
5. Select **Save changes** to display the image on the website.

Supported uploads: JPG, PNG, and WebP, up to 8 MB and 40 megapixels. Photos are automatically oriented, optimized, and stripped of metadata. Image links remain available under **Or use an image link**.

Uploads are stored in `data/uploads/` on this computer. Include that folder with `data/site-content.json` in backups. Uploading changes the editor's draft; saving applies it to the website. Discarding a draft does not delete its uploaded file. Uploaded images are accessible by their generated local media URL.

## Protection implemented

- Salted scrypt password hashing (N=131072, r=8, p=1); constant-time comparisons.
- Only the hash is stored in the ignored `.env.local` file.
- Five failed attempts cause a 15-minute cooldown, shared across submitted usernames and persisted in `data/login-attempts.json`.
- Encrypted HttpOnly, SameSite sessions with a two-hour expiry.
- CSRF protection for authentication and exact-origin checks for content changes.
- Server-side session checks for the editor and every content API operation.
- Password hash changes invalidate existing password sessions on their next request.
- The website remains bound to the local computer at port 3001.

After five failed attempts, wait 15 minutes before trying again. If the application crashes during login and all attempts continue to fail after the cooldown, stop the server, confirm no second instance is running, and remove only the stale `data/login-attempts.lock` file before restarting. Preserve the content files and `.env.local`.

Optional Google sign-in can be enabled separately using [GOOGLE-SETUP.md](GOOGLE-SETUP.md). It remains restricted to the previously specified Google account.
