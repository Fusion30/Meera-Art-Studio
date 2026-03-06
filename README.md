# Meera Art Studio

An e-commerce web application for **Meera** — an art studio selling original paintings and artwork. Built with Express 5, SQLite, Cloudinary, and vanilla JavaScript.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Architecture Notes](#architecture-notes)

---

## Overview

Meera Art Studio is a full-stack Node.js application with three faces:

| Surface                 | URL      | Purpose                                                    |
| ----------------------- | -------- | ---------------------------------------------------------- |
| **Public Landing Page** | `/`      | Hero swipers, "Why buy here" section, newsletter signup    |
| **Shop Page**           | `/shop`  | Server-rendered (EJS) product grid showing all paintings   |
| **Admin Panel**         | `/admin` | Upload paintings (image + metadata) and view current stock |

Images are uploaded through the admin panel, processed/compressed with **Sharp**, stored on **Cloudinary**, and their metadata is persisted in a local **SQLite** database. Newsletter subscriptions are handled via the **Brevo** (formerly Sendinblue) API.

---

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Runtime          | Node.js (ES Modules)                           |
| Framework        | Express 5                                      |
| View Engine      | EJS (server-rendered shop page)                |
| Database         | SQLite 3 (via `sqlite` / `sqlite3` packages)   |
| Image Storage    | Cloudinary                                     |
| Image Processing | Sharp (resize & AVIF conversion before upload) |
| File Uploads     | Multer (in-memory storage)                     |
| Email Marketing  | Brevo API (contact/subscriber management)      |
| Frontend Sliders | Swiper.js v12                                  |
| Dev Tooling      | Nodemon                                        |

---

## Project Structure

```
├── server.js                 # Express app — routes, middleware, static serving
├── package.json
├── createTable.js            # One-time script: creates the `products` table
├── seedTable.js              # Helper: inserts a product row (used by upload handler)
├── logTable.js               # Utility script: prints all products to console
│
├── DB/
│   └── db.js                 # SQLite connection factory (getDBConnection)
│
├── Handlers/
│   ├── handleCloudinary.js   # POST /painting-upload — compress → upload → respond
│   └── brevoSubscription.js  # POST /subscribe — add email to Brevo contact list
│
├── Public/                   # Static files served at /
│   ├── index.html            # Landing page (hero swipers, features, newsletter)
│   ├── index.js              # Newsletter email subscription (client-side)
│   ├── index.css             # Global styles (nav, features, product cards, footer)
│   ├── handleSwiper.js       # Swiper.js initialisation (two carousels)
│   ├── swiper.css            # Swiper slide & navigation styling
│   ├── Images/               # Static artwork images used on the landing page
│   └── shared/
│       └── getProducts.js    # Shared fetch wrapper (used by both Admin & Public)
│
├── Admin/                    # Static files served at /admin
│   ├── index.html            # Upload form + product stock table
│   ├── index.js              # Form submit → POST /painting-upload
│   └── renderStock.js        # Fetches & renders product list in admin panel
│
└── views/
    └── shop.ejs              # Server-rendered shop page (product card grid)
```

---

## Features

- **Image Upload Pipeline**: Admin uploads an image → Sharp checks file size against Cloudinary's 10 MB free-tier limit → if oversized, it progressively resizes/compresses to AVIF → uploads the buffer stream to Cloudinary → stores the `public_id` in SQLite.
- **Optimised Image URLs**: Cloudinary URLs are generated with `quality: auto` and `fetch_format: auto` transformations for optimised delivery.
- **Server-Rendered Shop**: The `/shop` route uses EJS to render a responsive product card grid (3 → 2 → 1 column breakpoints). Falls back to sample placeholder images when no products exist.
- **Dual Swipers**: The landing page features two Swiper.js carousels — a hero slider with fade effect and an auto-playing gallery slider.
- **Scroll-Driven Animations**: The "Why buy here" section uses CSS `animation-timeline: view()` for fade-in effects as the user scrolls.
- **Newsletter Subscription**: An email input in the footer sends subscriptions to Brevo's contact list via their REST API.
- **Admin Stock View**: After each upload, the admin product table auto-refreshes via a custom `products:refresh` DOM event.
- **Shared Code**: Both the admin panel and public pages share the same `fetchProducts()` module (`/shared/getProducts.js`) to call `GET /api/products`.

---

## Getting Started

### Prerequisites

- **Node.js** v18+ (ES Module support required)
- A **Cloudinary** account (free tier works)
- A **Brevo** account with an API key (for newsletter subscriptions)

### Installation

```bash
git clone <repo-url>
cd Meera-Art-Studio
npm install
```

### Create the Database

Run the table creation script once:

```bash
node createTable.js
```

This creates a `database.db` file with a `products` table:

| Column               | Type               | Description                        |
| -------------------- | ------------------ | ---------------------------------- |
| `id`                 | INTEGER (PK, auto) | Product ID                         |
| `name`               | TEXT               | Painting name                      |
| `media`              | TEXT               | Medium used (e.g. "Oil on canvas") |
| `cloudinaryPublicID` | TEXT               | Cloudinary public ID for the image |
| `price`              | REAL               | Price in ₹                         |

### Start the Server

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

The server runs on **http://localhost:8080**.

---

## Environment Variables

Create a `.env` file in the project root:

```env
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
BREVO_API_KEY=your_brevo_api_key
```

> **Note:** The Cloudinary cloud name (`dubdinigl`) is hardcoded in `Handlers/handleCloudinary.js`.

---

## Database Setup

| Script           | Command               | Purpose                                                                           |
| ---------------- | --------------------- | --------------------------------------------------------------------------------- |
| `createTable.js` | `node createTable.js` | Creates the `products` table (run once)                                           |
| `logTable.js`    | `node logTable.js`    | Prints all products to the console as a table                                     |
| `seedTable.js`   | _(used internally)_   | Called by the upload handler to insert a row after a successful Cloudinary upload |

---

## API Endpoints

| Method | Route                  | Description                                                                                                                                                                     |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/`                    | Serves the public landing page (`Public/index.html`)                                                                                                                            |
| `GET`  | `/admin`               | Serves the admin panel (`Admin/index.html`)                                                                                                                                     |
| `GET`  | `/shop`                | Server-rendered product shop page (EJS)                                                                                                                                         |
| `GET`  | `/api/products`        | Returns all products as JSON (newest first)                                                                                                                                     |
| `POST` | `/api/painting-upload` | Accepts `multipart/form-data` with fields: `name`, `media`, `price`, and file field `uploaded-file`. Compresses if needed, uploads to Cloudinary, and saves metadata to SQLite. |
| `POST` | `/api/subscribe`       | Accepts `{ "email": "..." }` JSON body. Adds the email to Brevo contact list #2.                                                                                                |

---

## Architecture Notes

- **ES Modules throughout** — the project uses `"type": "module"` in `package.json`.
- **No frontend framework** — the public site and admin panel use vanilla JS with static HTML served by Express.
- **Multer in-memory storage** — uploaded files are held in `req.file.buffer` (never written to disk), then piped directly to Cloudinary via a readable stream.
- **Sharp pre-processing** — images exceeding Cloudinary's 10 MB upload limit are progressively downscaled and converted to AVIF before upload, trying multiple resolution/quality combinations until the file fits.
- **SQLite with transactions** — product inserts use explicit `BEGIN`/`COMMIT`/`ROLLBACK` for data integrity.
- **Shared `fetchProducts()` module** — both the admin panel's `renderStock.js` and the public client import from `Public/shared/getProducts.js`, keeping the API-calling logic DRY.

To-Dos

1. Look into COOP & CSP
2.
