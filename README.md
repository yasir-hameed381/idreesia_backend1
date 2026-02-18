# Idreesia Backend (API)

Express.js REST API for Idreesia with MySQL (Sequelize), JWT auth, and optional file upload (S3/DigitalOcean Spaces). Can be run as a Node server or deployed as serverless on Vercel.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MySQL** (local or remote instance)
- **npm** or **yarn**

## Implementation Steps (Public Build)

### 1. Get the code

```bash
git clone <repository-url>
cd idressiaBackend
```

### 2. Install dependencies

```bash
npm install
```

(or `yarn install`)

### 3. Environment variables

Create a `.env` file in the **backend project root** (`idressiaBackend/.env`). The app loads it from `idressiaBackend/.env` in non-production; on Vercel, set variables in the dashboard.

#### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment: `development`, `production`, or `test` | `development` |
| `PORT` | Server port | `3000` |
| `MYSQL_HOST` | MySQL host | `localhost` |
| `MYSQL_USER` | MySQL user | `root` |
| `MYSQL_PASSWORD` | MySQL password | `your_password` |
| `MYSQL_DATABASE` | MySQL database name | `idreesiadb` |
| `JWT_SECRET` | Secret for signing JWT tokens | Long random string |

#### Optional (features / deployment)

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend base URL (e.g. for links in emails/APIs) | `https://your-app.com` |
| `DEFAULT_LOCALE` | Default locale for emails/links | `en` |
| `MONGO_URI` | MongoDB connection (if used) | `mongodb://localhost:27017/...` |
| `MONGO_URI_TESTS` | MongoDB for tests | — |

#### File upload (S3 / DigitalOcean Spaces)

If you use file upload endpoints, set one of these:

**DigitalOcean Spaces:**

| Variable | Description |
|----------|-------------|
| `SPACES_ENDPOINT` | Spaces endpoint URL |
| `SPACES_KEY` | Access key |
| `SPACES_SECRET` | Secret key |
| `SPACES_BUCKET` | Bucket name |
| `SPACES_REGION` | Region (e.g. `nyc3`) |

**AWS S3:** use `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, and optionally `S3_ENDPOINT`.

Example `.env` (minimal):

```env
NODE_ENV=development
PORT=3000
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=idreesiadb
JWT_SECRET=your_long_random_jwt_secret
FRONTEND_URL=http://localhost:3000
```

### 4. Database setup

1. Create the MySQL database (e.g. `idreesiadb`).
2. Run migrations or sync if your project provides them (e.g. Sequelize migrations).
3. Ensure MySQL is running and reachable at `MYSQL_HOST` / `MYSQL_PORT`.

### 5. Run the API

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

(or `npm run prod`)

The API will listen on the configured `PORT` (default `3000`).

### 6. (Optional) Run tests

```bash
npm test
```

Unit tests:

```bash
npm run test:unit
```

Integration tests:

```bash
npm run test:integration
```

---

## Scripts Summary

| Script | Command | Purpose |
|--------|---------|---------|
| Start | `npm start` | Run production server (`node ./src/index.js`) |
| Dev | `npm run dev` | Run with nodemon (auto-reload) |
| Prod | `npm run prod` | Same as start |
| Test | `npm test` | Run full test suite |
| Test unit | `npm run test:unit` | Unit tests only |
| Test integration | `npm run test:integration` | Integration tests only |
| Docs | `npm run docs` | Generate API docs (apidoc) |

---

## Tech Stack

- **Express** 4
- **Sequelize** (MySQL)
- **JWT** (passport-jwt)
- **dotenv** for env loading (non-production)
- **Winston** logging
- Optional: **MongoDB/Mongoose**, **AWS S3 / DigitalOcean Spaces** for file uploads

---

## Deployment

### Traditional (VPS / PM2)

1. Set all required env vars on the server.
2. Build/install: `npm install --production` (if needed).
3. Start: `node ./src/index.js` or use **PM2** (e.g. `pm2 start src/index.js --name idreesia-api`).

### Vercel (Serverless)

1. Connect the `idressiaBackend` project to Vercel.
2. Set all required environment variables in the Vercel project (no `.env` file in serverless).
3. Build: Vercel uses `api/index.js` as the serverless entry (see `vercel.json`). No custom build command needed unless you add one.
4. The Express app is exported from `api/index.js` and mounted at the root.

Ensure MySQL is reachable from Vercel (e.g. use a cloud MySQL instance and set `MYSQL_HOST` accordingly).
