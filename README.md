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
- PostgreSQL database (configured via DATABASE_URL in .env file)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a `.env` file in the root directory with your PostgreSQL connection string:

```bash
DATABASE_URL="your-postgres-connection-string"
```

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

## Notes

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

## License

MIT
