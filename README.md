# Episodic — Web

The web app for **Episodic**, a personal TV series tracker: sign in with Google,
build a library, mark episodes as watched and follow your progress, history and
upcoming episodes.

**Live:** https://episodic-app-web.vercel.app

## Features

- Google sign-in (Identity Services)
- Search series through the catalog API
- Personal library with per-series progress (thin bar + "N of M episodes watched")
- Series detail with seasons/episodes, watched toggles and *mark season watched*
  (aired episodes only)
- Episode detail with own progress and previous/next navigation
- Dashboard with *Upcoming* release views (this week, this month, next 3
  months, or a picked month) grouped by day with weekday headers
- Recent history shown as the search screen's empty state (fetched from
  `/api/v1/history`)
- Public Privacy Policy and Terms of Use
- Neo-brutalist design system (cream canvas, ink borders, hard offset shadows,
  a single red accent) defined in `src/theme`

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Chakra UI v3 with a
custom neo-brutalist theme · `react-icons` · `@react-oauth/google` · Vercel Analytics.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Environment variables

Create a `.env` file:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (API Gateway) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth **Web** client id |

Only `NEXT_PUBLIC_*` values reach the browser. Never put backend secrets
(`JWT_SECRET`, `TMDB_API_KEY`) in these variables.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |

## Project structure

```
src/
  app/          routes: dashboard, search, library, series/[id],
                series/[id]/episodes/[episodeId], history, login,
                privacy-policy, terms-of-use
  components/   app shell, cards, dialogs, google button, legal layout, ...
  contexts/     auth context
  lib/          API client, types, constants
  theme/        Chakra system: neo-brutalist tokens, recipes, hard shadows
public/         logo (svg/png) and static assets
```

## Deploy

Deployed on Vercel. Set the two `NEXT_PUBLIC_*` variables in the project
settings — `.env` files are not uploaded (see `.vercelignore`). Remember to add
the production domain to the Google OAuth client's **Authorized JavaScript
origins**.

## Related repos

- [episodic-app-backend](https://github.com/maxsonferovante/episodic-app-backend) — serverless API (Rust + AWS Lambda)
- [episodic-app-infra-cloud](https://github.com/maxsonferovante/episodic-app-infra-cloud) — AWS infrastructure (Terraform)

## License

MIT © Maxson Almeida. TMDB metadata is provided by TMDB; this product uses the
TMDB API but is not endorsed or certified by TMDB.
