# Online admin

Open https://www.ubentertainments.in/admin and sign in with the owner’s existing username and password. Content changes persist online. Uploaded images remain private until selected in saved website content. See VERCEL-SETUP.md for hosting configuration.

# UB Entertainments

Standard Next.js 16 App Router website for the Kochi, Keralam production company established in 2026. Includes a protected admin editor with username-and-password login.

## Open locally

While the local server is running, visit http://localhost:3001/.
To start it again, double-click `start-local.cmd` and open the Local address shown in the window. Keep that window open while viewing the website.

The website supports local development and production hosting at https://www.ubentertainments.in. Production uses Redis for saved content and login limits, plus private Vercel Blob storage for images. Manrope and the default photos are saved locally. Google sign-in requires an internet connection.

## Admin panel

Production admin: https://www.ubentertainments.in/admin. Sign in with username
**ubentertainment** and the owner’s existing password. The password is stored as
a salted scrypt hash in Vercel, with encrypted two-hour sessions and shared login
limits. Saved content persists in Redis, including a backup and conflict checks.

Upload JPG, PNG, or WebP images up to 4 MB, then select **Save changes**. Images
are optimized and stored in private Vercel Blob storage. Draft uploads are
visible only to the administrator; images selected in saved content display on
the website. See [VERCEL-SETUP.md](VERCEL-SETUP.md).

Local development uses its own ignored `.env.local`, `data/site-content.json`,
and `data/uploads/`. Optional Google access remains restricted to the approved
Gmail account.
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
- UB Entertainments project stills to replace the clearly labeled representative gallery images.
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


