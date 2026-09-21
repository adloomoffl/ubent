# UB Entertainment

Standard Next.js 16 App Router website for the Kochi, kerala production company established in 2026. Includes a protected admin editor with username-and-password login.

## Open locally

While the local server is running, visit http://localhost:3001/.
To start it again, double-click `start-local.cmd` and open the Local address shown in the window. Keep that window open while viewing the website.

The website is hosted only on the local computer. No public site was created or deployed. Manrope and the default photos are saved locally. Google sign-in requires an internet connection.

## Admin panel

Open http://localhost:3001/admin. Sign in with username **ubentertainment** and the password supplied by the owner. The password is stored only as a salted scrypt hash in the ignored `.env.local` file; it is not saved in plaintext in source or documentation.

Password login is ready and does not need Google credentials. Optional Google login remains available if configured later, restricted to **ubentertainments2026@gmail.com**; follow [GOOGLE-SETUP.md](GOOGLE-SETUP.md).

Five failed password attempts trigger a 15-minute cooldown. This limit covers all submitted usernames and persists across restarts. Sessions expire after two hours, and password hash changes invalidate earlier password sessions. Authentication uses encrypted, HttpOnly, SameSite session cookies, CSRF protection, and server-side authorization on every admin request. The server binds only to the local computer; HTTP cookies are appropriate only for this loopback setup. Internet hosting would require HTTPS and a hosting-specific security configuration.

See [ADMIN-ACCESS.md](ADMIN-ACCESS.md) for access details.

Image upload buttons are available for the hero, services, gallery, and news. Choose a JPG, PNG, or WebP image up to 8 MB, then select **Save changes**. Uploads are decoded and re-encoded as optimized WebP images, with metadata stripped, random filenames, request size limits, image dimension limits, and server-side authentication/origin checks. Files persist in `data/uploads/` and are served by `/media/[filename]` in both development and production modes.

After sign-in, edit Studio, Services, Gallery, News & events, and Contact. Click **Save changes** to update the public page. Data persists locally in `data/site-content.json`; a backup of the previous saved version is retained alongside it. New visits to the public page load the saved content.

## Next.js project

- `app/page.tsx`: server-rendered public route.
- `components/site-home.tsx`: existing website design and navigation.
- `app/admin/`: protected editor and Google sign-in page.
- `app/api/admin/content/route.ts`: authenticated content reads and writes.
- `lib/auth.ts`: Google identity and session configuration.
- `lib/content-store.ts`: atomic local persistence with conflict checks.

Commands: `npm run dev` for local development; `npm run build` followed by `npm start` for a production-mode local server. Both servers bind only to `127.0.0.1:3001`; use `http://localhost:3001` in the browser for Google callbacks. Stop one server before starting the other.

## Content to add

- Official email address, phone number, and social profiles in the Contact section.
- UB Entertainment project stills to replace the clearly labeled representative gallery images.
- Actual project announcements and event dates as they become available.

The establishment announcement uses the company facts supplied for this website. No portfolio credits, testimonials, clients, or event dates have been invented.

## Design and assets

Design inspiration: https://palettestudios.in/ — adapted into a white, black, and gold visual direction with Manrope throughout. All UB copy is original to this site.

Brand logo: supplied by the user.
Manrope: Google Fonts, SIL Open Font License (see public/assets/Manrope-OFL.txt).
Representative images, used under the Unsplash License https://unsplash.com/license:
- Film crew: Oleg Brovchenko — https://unsplash.com/photos/a-group-of-people-standing-around-a-camera-iXYP5bkc-Bs
- Mountain road: Weichao Deng — https://unsplash.com/photos/a-winding-road-in-the-middle-of-a-desert-yYjk2bfqgUU
- Music performance: Pravin Shinde — https://unsplash.com/photos/a-man-singing-on-stage-with-yellow-lights-CbnG4eGAtz8

## Checks

The Next.js production build and TypeScript checks pass. Twelve automated checks cover identity restrictions, password verification, persistent throttling, request origins, content validation, persistence, concurrent saves, and corrupt-file handling. Run them with `node --experimental-strip-types --test tests/admin-security.test.ts tests/password-auth.test.ts`.

Four additional image-upload tests cover decoding/optimization, accepted formats, invalid and oversized files, and media path validation. Run them with `node --experimental-strip-types --test tests/image-upload.test.ts`. Local HTTP checks also verify authenticated upload, image serving, and rejection of unauthorized, cross-origin, unsupported, and disguised-file uploads.

Local HTTP checks confirm successful password login, rejection of an incorrect password, authenticated editor access, a successful unchanged-content save, rejection of cross-origin writes and invalid content, and loss of API access after sign-out. Anonymous admin reads/writes return 401. Dependency audit reported no known vulnerabilities at the time of implementation. The optional Google sign-in flow remains unverified until Google credentials are configured.
