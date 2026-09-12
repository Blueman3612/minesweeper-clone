@AGENTS.md

# Minesweeper

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4. Package manager: npm.

## Commands
- `npm run dev` starts the dev server. E2E and the Browser pane use port 3111 (`.claude/launch.json`).
- `npm run typecheck` and `npm run lint` must both be clean before a commit.
- `npm run test:unit` runs Vitest over `tests/unit`. `npm run test:e2e` runs Playwright over `tests/e2e`, starting or reusing the dev server on 3111. `npm test` runs both.

## Structure
- `src/lib/minesweeper/` is the pure engine, no React: `types`, `difficulties`, `rng` (mulberry32, seed parsing), `board` (createBoard, placeMines, neighborsOf), `actions` (reveal with flood fill, cycleMark, win and loss board transforms), `game` (createGame, gameReducer, elapsedMs, remainingMines).
- `src/lib/bestTimes.ts` persists best times in localStorage under `minesweeper:bestTimes` as milliseconds per difficulty. It takes a `StorageLike` so tests run without a DOM.
- `src/lib/format.ts` formats durations and the three-digit LED readouts.
- `src/components/menu/` is the main menu (difficulty cards, field manual). `src/components/game/` is the game screen (`Game` owns state, `Board` and `Cell` are memoized, `Clock` isolates timer ticks). `src/components/ui/icons.tsx` holds inline SVG icons.
- `runs/` holds autonomous run logs. It is gitignored and stays local, so a kickoff must not commit the log here.
- Routes: `/` menu, `/play?difficulty=<beginner|intermediate|expert>&seed=<uint32>`. The seed is optional and exists for deterministic tests; without it every round draws a fresh random seed.

## Rules
- The engine stays pure. The UI applies `gameReducer` inside event handlers and reads the result synchronously for side effects (best-time recording), never in effects.
- Mines are placed on the first reveal. The clicked cell and its eight neighbors stay clear, so the first click always opens an area.
- Right click cycles none, flag, question, none. Flood fill never opens flagged cells but does open question marks.
- Cells expose only visible state in the DOM: `data-state` (hidden, flagged, question, revealed, mine, exploded, wrong-flag) and `data-value` only when revealed. Never put mine positions on hidden cells.
- Fixed footprints: LED counters, face button, status strip, and difficulty cards do not resize with content.
- Test ids: `game[data-status]`, `board`, `cell-<row>-<col>`, `mine-counter`, `timer`, `face[data-face]`, `status`, `difficulty-<key>`, `best-<key>`. E2E tests compute the expected board through the engine with the URL seed.
