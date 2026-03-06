# Meera Art Studio

An art studio web app for showcasing and selling paintings, managing uploads from an admin panel, collecting newsletter subscribers, and supporting Google sign-in with server-side session auth.

---

## What was added recently

- Converted the home page from static HTML to server-rendered EJS.
- Added Google Sign-In UI to the landing page.
- Added backend Google token verification using `google-auth-library`.
- Added a `users` table in SQLite.
- Added session-based auth using `express-session`.
- Added auth endpoints for:
  - `POST /auth/google`
  - `GET /auth/me`
  - `POST /auth/logout`
- Added frontend auth-state syncing so the UI restores logged-in state after refresh, popup return, and logout.
- Kept the existing Brevo newsletter subscription flow.

---

## App overview

The app currently has 4 main parts:

| Part         | Route               | Purpose                                                    |
| ------------ | ------------------- | ---------------------------------------------------------- |
| Landing page | `/`                 | Marketing page, swipers, Google sign-in, newsletter signup |
| Shop page    | `/shop`             | Server-rendered product listing                            |
| Admin page   | `/admin`            | Upload paintings and inspect stock                         |
| JSON APIs    | `/api/*`, `/auth/*` | Products, uploads, newsletter, auth/session                |

---

## Tech stack

| Layer               | Technology          |
| ------------------- | ------------------- |
| Runtime             | Node.js             |
| Backend             | Express 5           |
| Templates           | EJS                 |
| Database            | SQLite              |
| Image hosting       | Cloudinary          |
| Image processing    | Sharp               |
| File upload parsing | Multer              |
| Auth verification   | Google Auth Library |
| Sessions            | express-session     |
| Newsletter          | Brevo API           |
| Frontend slider     | Swiper.js           |

---

## Current project structure

```
├── server.js
├── package.json
├── createTable.js
├── logTable.js
├── seedTable.js
│
├── Auth/
│   └── handleAuth.js
│
├── DB/
│   └── db.js
│
├── Handlers/
│   ├── brevoSubscription.js
│   └── handleCloudinary.js
│
├── Admin/
│   ├── index.html
│   ├── index.js
│   └── renderStock.js
│
├── Public/
│   ├── index.css
│   ├── index.js
│   ├── handleSwiper.js
│   ├── swiper.css
│   ├── Images/
│   └── shared/
│       └── getProducts.js
│
└── views/
        ├── index.ejs
        └── shop.ejs
```

---

## Main features

### 1. Product upload flow

- Admin uploads a file plus metadata.
- Multer reads the file in memory.
- Sharp compresses/resizes large images before upload if needed.
- Cloudinary stores the image.
- Product metadata is stored in SQLite.

### 2. Public shop rendering

- `/shop` renders products on the server using EJS.
- Products are fetched from SQLite and shown newest first.

### 3. Google sign-in + app session

- Google renders the sign-in UI on the landing page.
- Google sends a credential to `POST /auth/google`.
- Backend verifies the Google ID token.
- Verified user is inserted or updated in the `users` table.
- `req.session.userId` stores the logged-in app user.
- Frontend calls `/auth/me` to restore sign-in state.
- Frontend calls `/auth/logout` to destroy the session.

### 4. Newsletter subscription

- Footer newsletter form posts email to `/api/subscribe`.
- Backend forwards the email to Brevo.

### 5. Shared product fetching

- `Public/shared/getProducts.js` is reused by the admin/public side when needed.

---

## Database

Running `node createTable.js` now creates 2 tables.

### `products`

| Column               | Type       | Purpose              |
| -------------------- | ---------- | -------------------- |
| `id`                 | INTEGER PK | Local product id     |
| `name`               | TEXT       | Painting name        |
| `media`              | TEXT       | Medium               |
| `cloudinaryPublicID` | TEXT       | Cloudinary public id |
| `price`              | REAL       | Price                |

### `users`

| Column      | Type        | Purpose                                  |
| ----------- | ----------- | ---------------------------------------- |
| `id`        | INTEGER PK  | Local user id                            |
| `googleId`  | TEXT UNIQUE | Stable Google account id (`payload.sub`) |
| `email`     | TEXT        | Google email                             |
| `name`      | TEXT        | Display name                             |
| `picture`   | TEXT        | Avatar URL                               |
| `createdAt` | TEXT        | Insert timestamp                         |

---

## Auth flow summary

1. User clicks Google sign-in on the landing page.
2. Google returns a credential.
3. Backend verifies it in [Auth/handleAuth.js](Auth/handleAuth.js).
4. User is upserted into SQLite.
5. Server stores `userId` in session.
6. Browser keeps the session cookie.
7. Later requests use `/auth/me` to restore login state.

---

## API routes

### Auth

| Method | Route          | Purpose                                               |
| ------ | -------------- | ----------------------------------------------------- |
| `POST` | `/auth/google` | Verify Google credential, upsert user, create session |
| `GET`  | `/auth/me`     | Return current logged-in user from session            |
| `POST` | `/auth/logout` | Destroy session and clear cookie                      |

### Products / uploads

| Method | Route                  | Purpose                            |
| ------ | ---------------------- | ---------------------------------- |
| `GET`  | `/api/products`        | Return all products                |
| `POST` | `/api/painting-upload` | Upload painting image and metadata |

### Newsletter

| Method | Route            | Purpose                        |
| ------ | ---------------- | ------------------------------ |
| `POST` | `/api/subscribe` | Add an email to Brevo contacts |

### Pages

| Method | Route    | Purpose           |
| ------ | -------- | ----------------- |
| `GET`  | `/`      | Landing page      |
| `GET`  | `/shop`  | Shop page         |
| `GET`  | `/admin` | Admin static page |

---

## Environment variables

Create a `.env` file in the root.

```env
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
BREVO_API_KEY=your_brevo_api_key
GOOGLE_CLIENT_ID=your_google_client_id
SESSION_SECRET=your_long_random_session_secret
```

Notes:

- `SESSION_SECRET` is the server-only secret used to sign session cookies.
- the current Google button markup in `views/index.ejs` is using the client id directly in the page markup
- Cloudinary cloud name is still hardcoded in `Handlers/handleCloudinary.js`

---

## Setup

### Install

```bash
npm install
```

### Create tables

```bash
node createTable.js
```

### Run in development

```bash
npm run dev
```

### Run in production

```bash
npm start
```

Server default:

- `http://localhost:8080`

---

## Important implementation notes

- Session data is currently stored in the default in-memory session store.
- That is acceptable for local development but not ideal for production.
- A production-ready improvement would be a persistent session store such as Redis.
- Google Sign-In also needs the correct authorized origin configured in Google Cloud Console, such as `http://localhost:8080`.

---

## Remaining to-do ideas

- Add COOP/CSP after auth flow is stable.
- Move session storage to a production-ready store.
- Optionally protect `/admin` using Google session auth.
- Improve auth UI after successful login.
