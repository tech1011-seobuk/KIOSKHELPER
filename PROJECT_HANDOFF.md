# Production maintenance · 2026-10-16

- Production: KIOSKHELPER / Supabase lsetixbyarexggxsihen. Staging: kioskhelper-staging / mjzhljlhjsbnnxyekmwy. Keep credentials, cache names, queues and data isolated.
- Latest staging kiosk UI sources are promoted from e13c0d2689a2469a7f749d73a32085cc47ac698b. Production keeps CMS signup/approval, store selection, administrator login, greeting and inline videos.
- The single 계정 추가 action issues guidance-only viewing accounts. It does not grant administrator privileges or require CMS membership. Existing administrators remain administrators. Legacy company account helperadmin01 was converted to viewing-only with its existing password preserved.
- Production does not expose diagram/manual editors or staging community controls. All administrator routes must remain blocked for viewing accounts.
- `supabase/migrations/202610160003_production_guide_catalog.sql` was applied after a rollback validation. Do not rerun completed migrations. Guide/media promotion is separate from static UI deployment; preserve CAS revisions and history.
- Use the GitHub Actions workflow **Deploy current production code** (`deploy-current-production.yml`). Do not run the old wholesale staging-copy workflow (`apply-production.yml`), which would overwrite production-specific authentication.
- Build: `npm ci`, `npm run build`, `npm test`. Commit original model/UI sources, generated index.html and sw.js, and required assets together. Build updates the production cache version.
- Guide exports, credential files, temporary SQL containing company data, and local browser fixtures are not repository files. Never commit them.
