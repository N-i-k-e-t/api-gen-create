# Excel-to-API Platform

A simple, secure platform to convert Excel sheets into a JSON API.

## 1. Setup

### Prerequisites
- Node.js > 18
- Access to a PostgreSQL database (for production) or SQLite (for local)

### Installation
1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Configure Environment:
    Create `.env` file:
    ```bash
    # Local SQLite
    DATABASE_URL="file:./dev.db"
    
    # Security (Change these!)
    JWT_SECRET="super-secret-jwt-key"
    ADMIN_PASSWORD_HASH="ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f"
    # The default hash above is for password: "admin"
    ```

3.  Initialize Database:
    ```bash
    npx prisma db push
    ```

## 2. Running Locally

Start the development server:
```bash
npm run dev
```

- **Login**: `http://localhost:3000/login`
- **Default Password**: `admin` (if using the hash above)
- **Dashboard**: `http://localhost:3000/dashboard`

## 3. Usage

1.  **Login** to the portal.
2.  **Generate API Key**: Click "Generate First Key". Copy it immediately.
3.  **Upload Excel**: Upload your `.xlsx` file. First row is header.
4.  **Access Data**:
    ```bash
    curl -H "Authorization: Bearer <YOUR_KEY>" http://localhost:3000/api/data
    ```

## 4. Deployment (Vercel)

1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add Storage (Vercel Postgres) -> Connect it.
4.  Set Environment Variables in Vercel:
    - `DATABASE_URL`: (Automatically set if using Vercel Postgres)
    - `JWT_SECRET`: Generate a random string.
    - `ADMIN_PASSWORD_HASH`: SHA-256 hash of your desired password.
5.  Redeploy.
6.  Go to Vercel Console -> "Terminal" tab (or run locally connecting to prod DB):
    ```bash
    npx prisma db push
    ```

## 5. Security Notes

- Passwords are hashed (SHA-256).
- API Keys are hashed in the database.
- Data is append-only.
- Admin session uses Secure HTTPOnly Cookies.
