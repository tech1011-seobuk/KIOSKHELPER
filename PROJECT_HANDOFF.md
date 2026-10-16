## 2026-10-16 로그인 진입·3D 화면 정리

- 로그인 진입은 관리자 로그인 하나로 통합. 기존 관리자, 전환된 체험 계정, 신규 체험 계정은 같은 화면을 사용하며 서버에서 확인된 기존 권한을 유지합니다. CMS 로그인·가입·승인 방식은 그대로입니다.
- CMS 원본을 빌드 시 index.html에 함께 반영합니다.
- 자동 검사 123개 통과.
- PHOTOISM/SNAPISM의 기존 그림 보기 버튼을 제거했습니다. 3D 실패 시에는 부품 메뉴가 계속 표시됩니다.
- 공통 3D 화면을 390px 브라우저에서 확인했습니다. 실물 휴대폰 시험은 별도입니다.
- 이번 변경은 화면 코드만 해당하며 DB·사용자 권한·안내 내용은 변경하지 않습니다.

# Production maintenance · 2026-10-16

- Production: KIOSKHELPER / Supabase lsetixbyarexggxsihen. Staging: kioskhelper-staging / mjzhljlhjsbnnxyekmwy. Keep credentials, cache names, queues and data isolated.
- Latest staging kiosk UI sources are promoted from e13c0d2689a2469a7f749d73a32085cc47ac698b. Production keeps CMS signup/approval, store selection, administrator login, greeting and inline videos.
- The single 계정 추가 action issues guidance-only viewing accounts. It does not grant administrator privileges or require CMS membership. Existing administrators remain administrators. Legacy company account helperadmin01 was converted to viewing-only with its existing password preserved.
- Production does not expose diagram/manual editors or staging community controls. All administrator routes must remain blocked for viewing accounts.
- `supabase/migrations/202610160003_production_guide_catalog.sql` was applied after a rollback validation. Do not rerun completed migrations. Guide/media promotion is separate from static UI deployment; preserve CAS revisions and history.
- Use the GitHub Actions workflow **Deploy current production code** (`deploy-current-production.yml`). Do not run the old wholesale staging-copy workflow (`apply-production.yml`), which would overwrite production-specific authentication.
- Build: `npm ci`, `npm run build`, `npm test`. Commit original model/UI sources, generated index.html and sw.js, and required assets together. Build updates the production cache version.
- Guide exports, credential files, temporary SQL containing company data, and local browser fixtures are not repository files. Never commit them.
