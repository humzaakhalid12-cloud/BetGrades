# Basic Bettor - Betting Diary MVP

A simple betting diary web application for tracking bettors and their bets. Built with Next.js, TypeScript, Tailwind CSS, Prisma, and SQLite.

## Features

- ✅ Create and manage multiple bettors
- ✅ Add bets with full details (description, odds, stake, result)
- ✅ View comprehensive statistics:
  - Units Won
  - ROI %
  - Win/Loss Record
  - Win Rate %
  - Letter Grade (A-F based on ROI)
- ✅ Cumulative profit chart over time
- ✅ Filterable bets table with inline editing
- ✅ All data stored locally in SQLite

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma ORM
- **Charts:** Recharts

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (for Vercel deployment) or SQLite (for local development)

## Local Setup (Quick Start)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local Database (SQLite)

Create a `.env` file in the root directory:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

You can copy from the example file:
```bash
cp .env.example .env
```

### 3. Generate Prisma Client and Run Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. (Optional) Seed Sample Data

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setup Instructions (Detailed)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**IMPORTANT:** You must set the `DATABASE_URL` environment variable.

**For local development (SQLite):**
Create a `.env` file in the root directory:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

**For Vercel deployment (PostgreSQL):**
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `DATABASE_URL` with one of the following:
   
   **Option 1: Prisma Accelerate (Recommended for Vercel)**
   ```
   prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
   ```
   
   **Option 2: Direct PostgreSQL**
   ```
   postgres://user:password@host:5432/database?sslmode=require
   ```

**Note:** SQLite (`file:./prisma/dev.db`) is for local development only. Vercel's serverless environment requires PostgreSQL or Prisma Accelerate.

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 3. (Optional) Seed Sample Data

To populate the database with a sample bettor and bets:

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Add a Bettor:** Click the "+ Add Bettor" button in the sidebar, enter name and profile URL
2. **Select a Bettor:** Click on any bettor in the sidebar to view their profile
3. **Add a Bet:** Click "+ Add Bet" button, fill in the bet details
4. **Edit a Bet:** Click "Edit" on any bet row to modify result, notes, etc.
5. **Filter Bets:** Use the dropdown above the bets table to filter by result
6. **View Stats:** Summary cards show ROI, win rate, grade, and more
7. **View Chart:** Cumulative profit chart updates automatically as you add bets

## Database Management

### Reset Database

To completely reset the database (delete all data and start fresh):

```bash
npm run db:reset
```

This will:
- Delete the existing database
- Run migrations to create a fresh database
- Seed with sample data

### Manual Reset

If you want to reset without seeding:

```bash
rm prisma/dev.db prisma/dev.db-journal
npm run db:migrate
```

## API Routes

The app exposes the following API endpoints:

- `GET /api/bettors` - List all bettors
- `POST /api/bettors` - Create a new bettor
- `GET /api/bettors/:id` - Get bettor with all bets
- `POST /api/bettors/:id/bets` - Add a bet for a bettor
- `PATCH /api/bets/:id` - Update a bet
- `DELETE /api/bets/:id` - Delete a bet

## Profit Calculation

The app calculates profit using American odds:

- **Win with positive odds** (e.g., +150): `profit = stake * (odds / 100)`
- **Win with negative odds** (e.g., -110): `profit = stake * (100 / abs(odds))`
- **Loss:** `profit = -stake`
- **Push/Void/Pending:** `profit = 0`

## Grade System

Letter grades are assigned based on ROI:
- **A:** ROI ≥ 10%
- **B:** ROI ≥ 5% and < 10%
- **C:** ROI ≥ 0% and < 5%
- **D:** ROI ≥ -5% and < 0%
- **F:** ROI < -5%

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page component
├── lib/
│   ├── prisma.ts      # Prisma client
│   ├── utils.ts       # Utility functions (profit calculation)
│   └── validations.ts # Zod schemas
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Seed script
└── package.json
```

## Vercel Deployment

### Prerequisites
1. **PostgreSQL Database Required**: SQLite (`file:./prisma/dev.db`) is for local development only. Vercel's serverless environment is ephemeral and requires PostgreSQL.
2. **Environment Variable**: You must set `DATABASE_URL` in Vercel's environment variables before deployment.

### Setting Up DATABASE_URL

**Option 1: Prisma Accelerate (Recommended for Vercel)**
- Sign up at [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate)
- Get your connection string (format: `prisma+postgres://accelerate.prisma-data.net/?api_key=...`)
- Add it to Vercel as `DATABASE_URL`

**Option 2: Direct PostgreSQL Connection**
- Use a PostgreSQL database provider (e.g., Supabase, Neon, Railway, AWS RDS)
- Connection string format: `postgres://user:password@host:5432/database?sslmode=require`
- Add it to Vercel as `DATABASE_URL`

**Important Notes:**
- **SQLite on Vercel is ephemeral**: If you use `DATABASE_URL="file:./prisma/dev.db"` on Vercel, your database will be wiped on every deployment. This is not suitable for production.
- **Always use PostgreSQL** for Vercel deployments.

### Build Configuration
- The `postinstall` script automatically runs `prisma generate` during build
- All API routes are configured for serverless deployment with `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`
- No additional build configuration needed

### Environment Variables
Add to Vercel project settings (Settings → Environment Variables):
- `DATABASE_URL`: Your PostgreSQL connection string (required)
  - For Prisma Accelerate: `prisma+postgres://accelerate.prisma-data.net/?api_key=...`
  - For direct PostgreSQL: `postgres://user:password@host:5432/database?sslmode=require`

### Deployment Steps
1. Push code to GitHub
2. Connect repository to Vercel
3. **Before deploying**, add `DATABASE_URL` environment variable in Vercel dashboard
4. Deploy
5. Verify deployment by checking that `/api/bettors` returns data (not 500 errors)

### Troubleshooting Vercel Deployment

**Issue:** Build fails with "DATABASE_URL environment variable is not set"
- **Solution**: Ensure `DATABASE_URL` is set in Vercel's environment variables before building

**Issue:** App returns 500 errors after deployment
- **Solution**: 
  1. Check Vercel logs for database connection errors
  2. Verify `DATABASE_URL` is correctly set in Vercel environment variables
  3. Ensure you're using PostgreSQL (not SQLite) for Vercel
  4. Test the database connection string locally if possible

**Issue:** Database is empty after deployment
- **Solution**: Run migrations on your PostgreSQL database. You may need to connect to your database directly and run `npx prisma migrate deploy` or use your database provider's migration tools.

## Notes

- **Local Development:** SQLite database stored in `prisma/dev.db` (gitignored)
- **Production/Vercel:** Requires PostgreSQL (SQLite is not supported in serverless environments)
- Database connection is configured via `DATABASE_URL` in `.env` file
- The `.env` file is gitignored for security
- No authentication or user accounts (single-user app)
- No Twitter/X integration (manual entry only)

## Troubleshooting

**Issue:** Database errors or migration failures
- Solution: Try resetting the database with `npm run db:reset`

**Issue:** Prisma client not found
- Solution: Run `npm run db:generate` after installing dependencies

**Issue:** Port 3000 already in use
- Solution: Kill the process using port 3000 or change the port in `package.json`

**Issue:** Vercel build fails with "Failed to collect page data"
- Solution: Ensure all API routes have `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'`
- Ensure `DATABASE_URL` is set in Vercel environment variables

## License

MIT
