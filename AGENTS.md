# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds Next.js App Router routes (`page.tsx`, `schedule`, `map`, `privacy`) and API handlers under `app/api` for calendar availability/booking.
- `components/` contains reusable UI (shadcn-style `components/ui`, schedule dialog/cards, header, theme toggles); client-only pieces are marked with `"use client"`.
- `lib/` hosts server utilities such as the Google Calendar client; `types/` stores shared TypeScript types; `public/` holds static assets; configs live in `eslint.config.mjs`, `next.config.ts`, and `postcss.config.mjs`.

## Build, Test, and Development Commands
- `npm run dev` — start the dev server at `http://localhost:3000`.
- `npm run lint` — run ESLint (Next core-web-vitals + TypeScript). Run before pushing.
- `npm run build` / `npm run start` — production build and serve; use to validate deployability.
- Set env vars in `.env.local` for calendar flows: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`. Use `node get-google-refresh-token.js` if you need to mint a refresh token.

## Coding Style & Naming Conventions
- TypeScript throughout; keep `strict` happy and use the `@/*` path alias. Favor `const` and explicit types for exported helpers and props.
- Components/files in `components/` use `PascalCase` (e.g., `SlotCard.tsx`); route segments under `app/` stay kebab/lowercase.
- Prefer Tailwind utilities (v4, configured in `app/globals.css`); keep variant logic inside UI helpers instead of long inline class strings.
- Use React function components and hooks; add `"use client"` only where needed for browser APIs or stateful UI.

## Testing Guidelines
- No automated test suite yet. For changes, run `npm run lint` and sanity-check pages: home, `/map`, `/schedule` (availability fetch + booking dialog), and `/schedule/success`.
- When adding logic-heavy utilities, include lightweight unit tests (Vitest/Testing Library) in a nearby `__tests__/` folder and wire into `npm test` before expanding coverage.

## Commit & Pull Request Guidelines
- Commit messages follow short, imperative summaries similar to `solve bug in SlotCard` or `Map and others`.
- PRs should describe the change, list impacted routes/API handlers, call out env/config migrations, and attach screenshots or screen recordings for UI changes.
- Confirm `npm run lint` and `npm run build` locally before requesting review, and note any manual verification steps you performed.
