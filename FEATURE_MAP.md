# Feature map

How each feature works and where its data lives. The database is Neon Postgres
(connected through Vercel); the browser talks to it only through the `/api` functions.

| Feature | Front end | API | Data stored |
|---|---|---|---|
| Log in / create account with a 6-digit code | `src/components/LoginScreen.jsx`, `src/App.jsx` | `api/account.js` (GET, POST) | `accounts.code`; the code is also kept in browser localStorage to stay logged in |
| List active medicines | `src/components/HomeScreen.jsx`, `src/components/MedicineList.jsx` | `api/medicines.js` (GET) | `medicines` where `is_active = true` |
| Add a medicine (name autocomplete, dose, frequency) | `src/components/MedicineModal.jsx`, `src/data/drugNames.js` | `api/medicines.js` (POST) | `medicines` |
| Edit dose / frequency (auto-saves) | `src/components/MedicineModal.jsx` | `api/medicines.js` (PATCH) | `medicines` |
| Delete a medicine (soft delete) | `src/components/HomeScreen.jsx` | `api/medicines.js` (PATCH `is_active: false`) | `medicines.is_active = false` |
| Daily history snapshot (one per day per account) | `HomeScreen.saveSnapshot`, `src/components/HistoryList.jsx` | `api/snapshots.js` (GET, PUT) | `snapshots` |
| Name and Patient ID header | `src/components/SettingsModal.jsx`, `src/components/HomeScreen.jsx` | `api/account.js` (GET, PATCH) | `accounts.name`, `accounts.subtitle` (localStorage keeps a display copy) |
| Error messages when a load or save fails | `HomeScreen.jsx`, `LoginScreen.jsx`, `src/lib/api.js` | all | none |
| Installable app (PWA) | `vite.config.js`, `public/` | none | none |

## Database

Schema: `schema.sql` (safe to re-run). Tables: `accounts`, `medicines`, `snapshots`.

## Running locally

```bash
npx vercel link
npx vercel env pull .env.local
npx vercel dev
```

`npm run dev` (plain Vite) serves the UI only; the `/api` functions need `vercel dev`.
