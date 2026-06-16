# WJIIS Multi-Site Admin Goal

## Purpose

This project started as a copy of the IJARCM website and is being converted into a WJIIS-focused multi-site system.

The goal is to support multiple independent journal frontends with one shared admin experience, while keeping each site's database and content fully separate.

## Core Architecture Goal

- Each frontend/site must have its own domain.
- Each frontend/site must have its own database.
- Each site database must be selected through the site's `siteSlug`.
- WJIIS must use only the WJIIS database.
- IJARCM must not be touched while working on WJIIS-specific tasks.
- The admin panel may be shared, but all data operations must run against the active or allowed site's database.

## Site And Database Rules

- A request domain must resolve to a site config.
- The site config must provide the correct `siteSlug`.
- The `siteSlug` must choose the correct database connection.
- WJIIS data must come from `DATABASE_URL_WJIIS`.
- IJARCM data must come from its own separate database configuration.
- No API route, admin page, or frontend page should accidentally fall back to another site's database.

## Admin Rules

- Super admin is a global manager.
- Super admin may manage all websites.
- Super admin may select the active site in the admin panel.
- When super admin selects a site, all admin actions must use that selected site's database.
- Normal admin belongs to only one site.
- Normal admin must log in using credentials from that site's database.
- Normal admin must only manage their own site.
- Normal admin must not see or access site switching for other websites.

## WJIIS Current Target

- Current work target: WJIIS only.
- Working project path: `e:\wjiis.com`.
- Do not modify IJARCM files or IJARCM project paths.
- First priority is to make WJIIS use its own database correctly.
- After WJIIS database routing works, WJIIS normal admin login should work from the WJIIS database.

## Known Current Findings

- Super admin login works because it is environment-based and does not depend on the site database.
- Normal admin login depends on the selected site's database.
- WJIIS normal admin requires a WJIIS database user such as `admin@wjiis.com`.
- The WJIIS admin user must have role `ADMIN`, a valid `passwordHash`, and `isVerified = true`.
- The local WJIIS database check failed because Prisma could not reach MySQL at `127.0.0.1:3307`.
- The active WJIIS database is now the remote WJIIS database through `DATABASE_URL` and `DATABASE_URL_WJIIS`.
- Prisma needed a longer remote database wait window. The active WJIIS database URLs now include `connect_timeout=30` and `pool_timeout=30`.
- The remote WJIIS database connection was verified with Prisma.
- The remote WJIIS database contains `45` tables.
- The WJIIS normal admin user `admin@wjiis.com` exists, has role `ADMIN`, is verified, is not banned, and has a password hash.
- User confirmed that both normal admin and super admin login are now working.
- The IJARCM database `ijarcm_db` is now connected and reachable through `DATABASE_URL_IJARCM`.
- The IJARCM database connection was verified with both MySQL and Prisma.
- The IJARCM database contains `44` tables.
- `src/config/sites.ts` already maps `wjiis.com` to `wjiis` and `ijarcm.com` to `ijarcm`.
- `middleware.ts` already resolves site slug from host and injects `x-site-slug`.
- Superadmin site switching has been implemented at the app state and request-header level, but the papers flow still needs a unified canonical model.
- The admin store cache was site-scoped so WJIIS and IJARCM state do not bleed into each other.
- The IJARCM `papers` table was missing `body_column_mode`, which caused `/api/admin/papers` to fail until the column was added.
- The IJARCM database now serves `paper` rows correctly again.
- IJARCM also has separate new-workflow data in `researchPaperDraft`, `researchPaperSection`, and `researchPaperAuthor`.
- Runtime verification showed the IJARCM draft rows already have matching canonical `paper` rows by source file and title, so the migration problem is not missing data but an old/new flow split.
- The current `admin/papers` page only reads the legacy `paper` table, so new-workflow entries are not yet unified in that screen.
- The selected direction is Option 2: move toward one canonical paper system where old papers and new workflow papers are represented through one unified paper model.

## Confirmed Workflow So Far

1. Confirm project scope before work.
2. Work only inside `e:\wjiis.com`.
3. Do not touch `e:\ijarcm.com` while WJIIS is the target.
4. Inspect existing code and runtime behavior before changes.
5. Confirm site routing:
   - `src/config/sites.ts` defines WJIIS as `wjiis`.
   - Localhost resolves to WJIIS through `DEV_SITE_SLUG = 'wjiis'`.
   - WJIIS database env var is `DATABASE_URL_WJIIS`.
6. Confirm auth routing:
   - NextAuth reads `x-site-slug`.
   - Site auth options are created with `getAuthOptions(prisma, siteSlug)`.
   - Normal admin uses the selected site's database.
   - Super admin is environment-based.
7. Diagnose database:
   - Local MySQL URL on `127.0.0.1:3307/wjiis_db` was not reachable.
   - Remote WJIIS database was reachable.
   - Prisma required timeout tuning for reliable remote access.
8. Update WJIIS env after permission:
   - Point `DATABASE_URL` to WJIIS remote database.
   - Point `DATABASE_URL_WJIIS` to WJIIS remote database.
   - Fix diagnostic host format by removing protocol from host.
   - Add `connect_timeout=30`.
   - Add `pool_timeout=30`.
9. Verify:
   - Prisma connection works.
   - Parallel Prisma queries work.
   - Public WJIIS APIs return responses.
   - Normal admin login works.
   - Super admin login works.
10. Bring IJARCM online in the same site-based model.
   - Add `DATABASE_URL_IJARCM` in `.env`.
   - Verify IJARCM DB reachability.
   - Confirm `ijarcm.com` maps to `ijarcm`.
   - Confirm `ijarcm` requests use `DATABASE_URL_IJARCM`.
11. Reconfirm WJIIS/IJARCM separation.
   - WJIIS must stay on WJIIS DB.
   - IJARCM must stay on IJARCM DB.
   - No cross-site DB fallback.

## Next System Correction Plan

1. Keep the superadmin site switch as the active-site control plane.
   - Store the selected site centrally.
   - Read the selected site from one helper.
   - Use the selected site for admin requests.
   - Keep normal admin out of the switch.
2. Make admin request handling role-aware.
   - Super admin may use the selected site.
   - Normal admin must be locked to their own site.
   - `x-active-site` must be ignored for normal admin access.
3. Build the canonical paper model as Option 2.
   - Merge old papers and new workflow papers into one paper system.
   - Keep one admin papers surface for view, read, edit, publish, and issue actions.
   - Preserve old data as readable legacy records until migration completes.
4. Update core admin APIs to read the canonical paper model.
   - Start with stats, users, settings, journals, issues, and papers.
   - Make counts/search/listing source-aware but unified in output.
5. Finalize normal admin isolation.
   - Login should only use the site database for that admin.
   - Admin panel should not expose site switching to normal admins.
6. Test site isolation and paper unification end to end.
   - WJIIS frontend -> WJIIS DB.
   - IJARCM frontend -> IJARCM DB.
   - Superadmin switch -> selected site DB.
   - Old papers + new workflow papers -> unified admin paper view.
   - Normal admin -> own site DB only.
7. Fix only the errors that block the above flow.
   - Do not do unrelated cleanup.
   - Keep scope limited to the site/database and paper model system.

## Working Process Rules

- Inspect and collect evidence before proposing changes.
- Do not make code changes without explicit user permission.
- Before changing code, state the exact file and the exact reason.
- Keep work step by step.
- After each confirmed successful working step, update this file only after user permission.
- Keep this file updated as the shared project memory for future AI chats.

## Progress Log

- Created this goal file for AI tools to understand the WJIIS multi-site admin target.
- Verified WJIIS remote database connection and fixed the active WJIIS DB URLs.
- Verified WJIIS normal admin login and super admin login.
- Added `connect_timeout=30` and `pool_timeout=30` to WJIIS DB URLs after Prisma pool timeouts.
- Added and verified `DATABASE_URL_IJARCM`.
- Verified IJARCM database connectivity and table count.
- Confirmed site mapping for both `wjiis.com` and `ijarcm.com`.
- Implemented active-site SSOT helper and site-scoped admin cache.
- Updated admin fetches to use the active-site header helper.
- Updated admin dashboard and sidebar to read the shared active-site state.
- Diagnosed the IJARCM `papers` route 500 error as a missing `body_column_mode` column in the legacy `papers` table.
- Added `body_column_mode` to the live IJARCM `papers` table without touching row data.
- Verified IJARCM `paper` queries work again after the schema fix.
- Verified IJARCM also contains new-workflow data in `researchPaperDraft` and related tables.
- Verified the IJARCM draft entries already correspond to canonical `paper` rows, so the current fix is a code-path unification and cleanup, not a destructive migration.
- Chosen final direction: Option 2 canonical paper system, with old papers and new workflow data merged into one future paper model.
- Renamed all `research-papers` folders, files, and imports to `papers` throughout the codebase. No new code added — only rename. Build verified successful after rename.
