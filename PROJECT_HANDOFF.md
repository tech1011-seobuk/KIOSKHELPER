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

## 2026-10-17 조치 과정 사진 우선 정리

- 조치 사진을 영상보다 먼저 표시합니다. 여러 기종/작업 영상은 선택 버튼으로 구분하고, 고른 영상 하나만 재생기를 생성합니다. 단일 관련 영상은 사진 아래에 표시됩니다.
- 전체 영상이 반복되던 시작 안내와 단순 확인 단계의 영상 연결을 정리합니다. 케이블/부품/소모품 교체, 리본 수리, 색감 설정처럼 동작 설명이 필요한 영상만 유지합니다.
- 안내 데이터는 별도 DB 반영 대상: 32개 저장 트리, 105개 노드의 첨부/설명만 변경합니다. 활성 35개 안내 기준 영상 연결 174→45, 사진 연결 155→195, 시작 전체 영상 17→0입니다. 선택지/이동 흐름은 유지합니다.
- 회사 기존 매뉴얼 영상에서 확인한 정지 화면 23개를 assets/manual-scenes/pf-*.jpg로 추가했습니다. 인증 정보나 DB 전체 내보내기 자료는 포함하지 않습니다.
- 두 환경 모두 현재 리비전과 내용 해시를 확인한 롤백 검증에 통과했습니다. 실제 데이터 반영은 정적 사진 배포 확인 후 기존 save_diagnosis_tree RPC와 이력 보존 방식으로 수행합니다.
- 검증: production 자동 검사 125개, staging 80개 통과. 로그인/CMS/권한/3D 모델은 변경하지 않습니다.


## 2026-10-18 guide search and ES-1 photos
- Home and header search published symptom, replacement, care, and camera setup guides; supports brand filtering and Korean aliases/error codes. Retired/held guides and account/editor data are excluded. Search opens diagnostic guides at their first step.
- Replacement paging retains video/image DOM and reserves text-card height to avoid scroll jumps/player resets.
- ES-1 database media: n1 only C dial image; n2a/n3a retain the two recent photos and remove E01 video stills. Existing relevant n3a video remains. Each environment uses its own C-image URL and revision-guarded save history.
- Verification: guide-search.test.mjs plus existing regression suites and 390px browser check.
