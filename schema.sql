-- Medicine Tracker database schema (Neon Postgres).
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS accounts (
  code       text PRIMARY KEY CHECK (code ~ '^[0-9]{6}$'),
  name       text,
  subtitle   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medicines (
  id           serial PRIMARY KEY,
  account_code text NOT NULL REFERENCES accounts(code),
  name         text NOT NULL,
  dose_mg      numeric,
  frequency    text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS medicines_account_idx ON medicines (account_code, is_active);

CREATE TABLE IF NOT EXISTS snapshots (
  account_code  text NOT NULL REFERENCES accounts(code),
  snapshot_date date NOT NULL,
  medicines     jsonb NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (snapshot_date, account_code)
);
