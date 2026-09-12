# Minesweeper

Classic Minesweeper as a Next.js app. Three fields (beginner 9x9 with 10 mines, intermediate 16x16 with 40, expert 30x16 with 99), first click always safe, flag and question marks, timer, mine counter, and best times saved per difficulty in the browser.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Test

```bash
npm run test:unit
npm run test:e2e
```

Unit tests cover board generation, flood fill, the game reducer, and best-time storage. Playwright tests drive the real UI through seeded games (`/play?difficulty=beginner&seed=42`).
