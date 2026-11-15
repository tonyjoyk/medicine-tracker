# Medicine Tracker

A simple phone-friendly app for keeping a list of the medicines you take, with a daily record of how that list changes.

**Try it out:** https://medicine-tracker-lyart.vercel.app/

## What you can do

- **Log in with a 6-digit code.** If the code is new, the app offers to create an account for it.
- **Add a medicine** with its name, dose (mg) and how often you take it. Names autocomplete as you type.
- **Change the dose or frequency.** Tap a medicine and the change saves on its own.
- **Delete a medicine** you no longer take.
- **See your history.** The app saves your list once a day, so you can see what you took on past dates.
- **Set your name and Patient ID**, shown at the top of the screen.
- **Install it on your phone** from the browser, like a regular app.

Your data is saved to a database, so it's still there when you log in from another phone or browser.

> **Note:** the 6-digit code is the only login. Anyone who knows or guesses a code can see that account's medicines.

## How it works

- **Front end:** React, built with Vite and styled with Tailwind CSS. Code is in `src/`.
- **Server:** three small functions in `api/` that run on Vercel. The app saves and loads data only through them.
- **Database:** Neon Postgres, connected to the Vercel project. The tables are in `schema.sql`.

For each feature and the files behind it, see [the feature map](FEATURE_MAP.md).

## Run it on your computer

You need Node.js and access to the medicine-tracker project on Vercel.

```bash
npm install
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel dev
```

Then open the address it prints (usually http://localhost:3000).

Use `npx vercel dev`, not `npm run dev`. `npm run dev` starts only the screens, so nothing will load or save.

## Database setup

The database is already set up for the live app. You only need these steps for a new database.

1. In Vercel, open the project, go to **Storage**, create a **Neon** database and connect it to all environments. Use the prefix `DATABASE` so the connection setting is named `DATABASE_URL`.
2. Run the SQL in `schema.sql` once, for example in the Neon SQL editor. It's safe to run again.

## Deploy

Vercel deploys the app on its own:

- **Push to `main`:** updates the live site.
- **Open a pull request:** builds a preview copy you can test first. Previews use the same database as the live site.
