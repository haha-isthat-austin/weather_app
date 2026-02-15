# Weather App

A simple weather app built with Next.js. Search by city name to see current conditions and a 7-day forecast. Uses the free [Open-Meteo](https://open-meteo.com/) API (no API key required).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this project to a Git repo (GitHub, GitLab, or Bitbucket).
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **Add New** → **Project** and import your repo.
4. Leave the default settings (framework: Next.js) and click **Deploy**.

Vercel will build and deploy. You’ll get a URL like `https://your-project.vercel.app`. No environment variables or API keys are needed for the weather API.

## Build

```bash
npm run build
npm start
```

Runs a production build locally (same as on Vercel).
