# Growth Map Sales Scale Simulator

Interactive sales intelligence product for coaching businesses and info-product founders.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

- **Supabase**: URL, anon key, service role key
- **PostHog**: Project key (optional for V1)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- PostHog (Analytics)

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
npm test         # Run tests
```

## Project Structure

```
app/              Next.js pages and API routes
components/       React components
lib/              Shared utilities and clients
types/            TypeScript type definitions
tests/            Unit tests
migrations/       SQL migrations
```
