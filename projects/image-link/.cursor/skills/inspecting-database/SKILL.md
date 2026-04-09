---
name: inspecting-database
description: Read-only inspection of the ImageLink database via the Supabase MCP (local):
  schema discovery, safe SQL introspection, migrations list, extensions, logs,
  advisors, and docs search. Use when debugging, clarifying the current schema,
  or extracting information. Never use MCP to mutate the database; schema
  changes belong in migrations (see modifying-database skill).
---

# Inspecting the Database — ImageLink

## Purpose

Use this skill to understand the current state of the database with the Supabase MCP without modifying data or the schema.

This procedure is **read-only** and is used for:

- debugging
- extracting information
- clarifying the current schema

## Non-negotiable rules

1. Treat all MCP interactions as read-only.
2. **Do not** use MCP to modify the database.
3. **Do not** execute `apply_migration` from MCP.
4. If schema or data changes are required, use the project's CLI migrations:
  - `supabase migration new migration_name`
  - edit migration SQL
  - `supabase migration up`
  - if corruption occurs: `supabase db reset`

If the user asks to change the schema or data, redirect to migrations and the modifying-database skill.

## MCP to be used for inspection

MCP Server: project-0-image-link-local-database

Use the enabled Supabase local database MCP. Before calling a tool, read its JSON schema under `.cursor/.../mcps/<server>/tools/<tool>.json` so arguments match exactly (e.g. `list_tables` requires `schemas` and `verbose`).

Recommended tools for reading:

- `list_tables`: List tables by schema
- `list_migrations`: Review the status of applied migrations
- `list_extensions`: Inspect enabled extensions
- `get_logs`: Diagnose problems by service (`postgres`, `api`, `auth`, etc.)
- `get_advisors`: Review security/performance recommendations
- `execute_sql`: Only for `SELECT` or other read queries

Forbidden for this skill
- `apply_migration`: (prohibited by read-only policy)

## Suggested workflow

1. Define the inspection question (schema, data, performance or error).
2. Start with metadata:
  - `list_tables`
  - `list_migrations`
  - `list_extensions`
3. If more detail is needed, use `execute_sql` with read queries (`SELECT`).
4. If the problem is operational, supplement with:
  - `get_logs`
  - `get_advisors`
5. Report findings and, if changes are needed, escalate to the CLI migrations workflow.

## Restrictions for execute_sql

Allowed:

- `SELECT ...`
- Catalog queries (`information_schema`, `pg_catalog`)
- `EXPLAIN` on read queries

Not allowed:

- `INSERT`, `UPDATE`, `DELETE`
- `CREATE`, `ALTER`, `DROP`, `TRUNCATE`
- `GRANT`, `REVOKE`, `COMMENT`
- Any SQL with side effects

## Quick Checklist

- [ ] Confirm that the objective is inspection/debugging
- [ ] Use only MCP read tools
- [ ] If using `execute_sql`, validate that it is read-only
- [ ] Do not use `apply_migration` via MCP
- [ ] If a database needs to be changed, move to CLI migrations
