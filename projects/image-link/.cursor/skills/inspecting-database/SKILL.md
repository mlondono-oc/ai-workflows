---
name: inspecting-database
description: Read-only inspection of the ImageLink database via the Supabase MCP (local):
  schema discovery, safe SQL introspection, migrations list, extensions, logs,
  advisors, and docs search. Use when debugging, clarifying the current schema,
  or extracting information. Never use MCP to mutate the database; schema
  changes belong in migrations (see modifying-database skill).
---

# Inspecting the Database — ImageLink

## Non-negotiable rules

1. **Do not modify the database through MCP.** No DDL or DML that changes persisted state.
2. **Never call `apply_migration` on the MCP** for this workflow. Migrations are created and applied with the Supabase CLI (`supabase migration new`, `supabase migration up`). Follow the **modifying-database** skill for schema changes.
3. **`execute_sql` is read-only here.** Use only queries that inspect data or metadata: `SELECT`, `EXPLAIN`, `SHOW`, and catalog queries (`information_schema`, `pg_catalog`, etc.). Do **not** run `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `CREATE`, `ALTER`, `DROP`, `GRANT`, or other mutating statements—even for “quick fixes.”

If the user asks to change the schema or data, redirect to migrations and the modifying-database skill.

## MCP server

Use the enabled Supabase local database MCP (e.g. server identifier `project-0-image-link-local-database`, display name `local-database`). Before calling a tool, read its JSON schema under `.cursor/.../mcps/<server>/tools/<tool>.json` so arguments match exactly (e.g. `list_tables` requires `schemas` and `verbose`).

## Tools and when to use them

| Tool | Role in this workflow |
|------|------------------------|
| `list_tables` | Overview of tables; set `verbose: true` for columns, PKs, and FKs. Default schema list often includes `public`. |
| `list_extensions` | See installed Postgres extensions. |
| `list_migrations` | See which migrations are recorded (useful vs local files / debugging). |
| `execute_sql` | **Read-only** introspection and debugging queries only (see rules above). |
| `get_advisors` | Security or performance advisories (`type`: `security` or `performance`); useful after schema discussions. Include remediation links for the user. |
| `get_logs` | Recent logs by `service` (`api`, `postgres`, `auth`, `storage`, `realtime`, `edge-function`, `branch-action`). |
| `search_docs` | Supabase documentation search via GraphQL (`graphql_query`). Prefer checking docs when behavior is unclear. |
| `get_project_url` | API URL for the linked project (context / debugging). |
| `get_publishable_keys` | Publishable keys (treat as sensitive; use only when needed for local debugging). |
| `generate_typescript_types` | Optional: generated types from the schema for frontend typing—does not replace migrations. |

## Forbidden for this skill

| Tool | Reason |
|------|--------|
| `apply_migration` | Mutates the database outside the repo migration workflow. Use CLI migrations instead. |

## Suggested workflow

1. **Shape of the schema:** `list_tables` with `verbose: true` on relevant schemas (often `public`).
2. **Deeper detail:** `execute_sql` with targeted `SELECT` or catalog queries (e.g. columns, constraints, views, policies if exposed).
3. **Migration vs reality:** compare `list_migrations` with `supabase/migrations/` when diagnosing drift.
4. **Issues / performance / security:** `get_advisors`, optionally `get_logs` for `postgres` or `api`.
5. **Supabase-specific behavior:** `search_docs` with an appropriate GraphQL query.

## Relationship to other skills

- **modifying-database:** Any persistent schema or data change goes through new migration files and `supabase migration up`, not through MCP `apply_migration` or mutating SQL.
