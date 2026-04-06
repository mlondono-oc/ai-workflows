---
name: modifying-database
description: Guides schema changes for ImageLink using the Supabase CLI: create migration files, edit SQL, apply with migration up, and recover with db reset. Use when adding or altering tables, indexes, RLS policies, functions, or seeds, ared required.
---

# Modifying the Database — ImageLink

## Scope

This project keeps Supabase configuration under `supabase/` (e.g. `config.toml`, `project_id = "image-link"`). SQL migrations live in `supabase/migrations/`. After `db reset`, seeds from `supabase/seed.sql` run when `[db.seed]` is enabled in config.

Run all CLI commands from the **repository root** (the directory that contains the `supabase/` folder).

## Standard workflow

1. **Create an empty migration file**

   ```bash
   supabase migration new nombre_migracion
   ```

   Replace `nombre_migracion` with a short, descriptive name (e.g. `add_images_table`). The CLI creates a timestamped file under `supabase/migrations/`.

2. **Edit the migration**

   Open the new `.sql` file and add the DDL/DML for the change (CREATE/ALTER TABLE, indexes, policies, etc.). Prefer idempotent or forward-only SQL consistent with existing migrations.

3. **Apply pending migrations to the local database**

   ```bash
   supabase migration up
   ```

   This applies any migrations not yet recorded on the local DB. Ensure the local Supabase stack is running (`supabase start`) if you are working against Docker services.

4. **Keep application code in sync**

   After schema changes, update backend models, queries, and types as needed so the API matches the database.

## When migration history is corrupted

If local migration state is inconsistent or broken (failed applies, mismatched history, unusable local DB):

```bash
supabase db reset
```

This recreates the local database from migrations and reapplies seeds per `config.toml`. **Data in the local DB is lost**; use only for local recovery, not as a substitute for fixing production migration issues.

## Quick reference

| Goal              | Command |
|-------------------|---------|
| New migration     | `supabase migration new <name>` |
| Apply migrations  | `supabase migration up` |
| Reset local DB    | `supabase db reset` |

Optional: `supabase migration list` to inspect local vs applied migrations; `supabase migration repair` when the history table needs fixing without a full reset (advanced).
