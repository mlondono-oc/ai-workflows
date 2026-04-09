---
name: modifying-database
description: Define the workflow for creating and applying database changes with Supabase in this project. Use when you need to modify the database schema, create SQL migrations, run migrations, or recover a local database with corrupted migrations.
---

# Modifying the Database — ImageLink

## Scope

This project keeps Supabase configuration under `supabase/` (e.g. `config.toml`, `project_id = "image-link"`). SQL migrations live in `supabase/migrations/`. After `db reset`, seeds from `supabase/seed.sql` run when `[db.seed]` is enabled in config.

Run all CLI commands from the **repository root** (the directory that contains the `supabase/` folder).

## When to Apply

Apply automatically when the user requests:

- create or edit tables, columns, indexes, constraints, or RLS policies
- generate a migration
- run local migrations
- recover a local database when migrations are corrupted

## Mandatory flow

1. **Create an empty migration file**

   ```bash
   supabase migration new migration_name
   ```

   Replace `migration_name` with a short, descriptive name (e.g. `add_images_table`). The CLI creates a timestamped file under `supabase/migrations/`.

2. **Edit the migration**

   Open the new `.sql` file and add the DDL/DML for the change (CREATE/ALTER TABLE, indexes, policies, etc.). Prefer idempotent or forward-only SQL consistent with existing migrations.

   Practical rules:

- Keep changes small and focused per migration
- Use descriptive migration names
- Avoid mixing unrelated changes in the same file

3. **Apply pending migrations to the local database**

   ```bash
   supabase migration up
   ```

   This applies any migrations not yet recorded on the local DB. Ensure the local Supabase stack is running (`supabase start`) if you are working against Docker services.

4. **(Optional) Recovery from Corrupted Migrations**

   If the local migration history is corrupt or inconsistent, reset the database with:

   ```bash
   supabase db reset
   ```

   After the reset, verify that the database starts up with the expected migrations.

## Quick reference

| Goal              | Command |
|-------------------|---------|
| New migration     | `supabase migration new <name>` |
| Apply migrations  | `supabase migration up` |
| Reset local DB    | `supabase db reset` |

Optional: `supabase migration list` to inspect local vs applied migrations; `supabase migration repair` when the history table needs fixing without a full reset (advanced).

## Quick Checklist

- [ ] Create migration with `supabase migration new migration_name`
- [ ] Write SQL to the created file
- [ ] Run `supabase migration up`