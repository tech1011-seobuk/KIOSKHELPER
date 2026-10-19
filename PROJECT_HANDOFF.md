## 2026-10-16 로그인 진입·3D 화면 정리

- 로그인 진입은 관리자 로그인 하나로 통합. 기존 관리자, 전환된 체험 계정, 신규 체험 계정은 같은 화면을 사용하며 서버에서 확인된 기존 권한을 유지합니다. CMS 로그인·가입·승인 방식은 그대로입니다.
- CMS 원본을 빌드 시 index.html에 함께 반영합니다.
- 자동 검사 123개 통과.
- PHOTOISM/SNAPISM의 기존 그림 보기 버튼을 제거했습니다. 3D 실패 시에는 부품 메뉴가 계속 표시됩니다.
- 공통 3D 화면을 390px 브라우저에서 확인했습니다. 실물 휴대폰 시험은 별도입니다.
- 이번 변경은 화면 코드만 해당하며 DB·사용자 권한·안내 내용은 변경하지 않습니다.

# Production maintenance · 2026-10-16

## 2026-10-19 production authentication restoration

- User scope clarification: promoting staging means troubleshooting guide content (including edited/deleted photos and text), not copying the whole staging application. Preserve production identity, CMS membership, approvals, store selection, managed/viewing accounts, analytics exclusions and access boundaries.
- The staging-copy release e1965b8 regressed production-specific frontend code. Restore those parts from pre-release production source 45ccea2 while retaining the latest 104 published guides, editable-guide routing, search, kiosk models and camera replacement improvements. This repair makes no database, account, secret, membership or guide-data writes.
- Restore the first-step greeting and original production inline-video presentation. Viewing accounts remain guidance-only and excluded from usage events.
- Both production deployment workflows now deploy the current production branch and run CMS plus production-contract regression tests. Neither workflow checks out or transforms staging. The old prepare-production.mjs wholesale copier is retired.
- Local verification: 150 tests passed, including CMS mapping, signup/approval/session gates, managed login, store selection, event attribution, first-step greeting, service-worker recovery, latest editable guides and workflow safeguards. Browser checks cover CMS login/signup and the administrator entry; do not claim a new real-user login was tested without completing it.
- Guide-content promotions must use the revision-guarded data process and preserve production-specific frontend code. Never use a full staging checkout as the production application.

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


## 2026-10-19 카메라 교체 시작 카드 정리
- R10·850D·M50 교체 화면에서 상단 영상으로 이미 분리된 ‘교체 영상·사진 매뉴얼’ 전용 카드를 건너뜁니다. 준비물·주의사항이 바로 STEP 1로 표시됩니다.
- 수정한 설명·사진·첨부·분기 선택지가 있는 카드는 유지합니다. 저장된 안내 원문과 관리자 편집 초안은 변경하지 않습니다.
- 두 환경 각각의 최신 코드에 같은 표시 로직만 적용합니다. 운영 CMS 로그인·관리자 권한 등 다른 기능은 유지합니다.
- 상단 중앙에 큰 화면 이동 영역을 배치했습니다. 기존 이전/다시 시작 동작과 홈 이동을 재사용하고 로그인·홈에서는 비어 있는 영역을 숨깁니다. 모바일 버튼 높이는 48px 이상입니다.
- 검증: 본서버 151개, 테스트 서버 103개 자동 검사 통과. 세 카메라의 빈 소개 카드 생략, 기존 사진·설명·분기 보존을 포함합니다.
- 사용자 요청으로 자동 음성 읽기·목소리 설정 UI와 음성 합성 코드를 제거했습니다. 단계별 안내와 의견 전송은 유지합니다.


## 2026-10-19 대시보드 바로 표시
- 상단 관리자 진입 버튼을 ‘대시보드’로 변경했습니다. 사용자 역할 표기와 권한 검사는 유지합니다.
- 전체 통계를 감싼 접힌 ‘이전 기록 및 상세 통계 보기’ 영역을 제거했습니다. 진입 후 데이터를 불러오면 통계와 계정 관련 작업이 바로 표시됩니다. 기존 집계 기준 안내 문구는 통계 위에 유지합니다.
- 본서버와 테스트 서버 각자의 최신 코드에 적용하며 CMS·계정·통계 계산·실제 데이터는 변경하지 않습니다.
- 검증: 본서버 151개, 테스트 서버 103개 기존 자동 검사 통과. DB 변경 없음. 화면 및 모바일 확인은 배포 후 작업 결과에 별도로 기록합니다.

## 2026-10-19 운영 대시보드 통합
- 기존 브랜드·시간대·장비·증상·매장·계정 활동, 의견, 문의/A/S 결과 및 회원 승인·계정 추가·CSV 작업을 네 탭으로 정리합니다. 첫 화면은 핵심 현황과 보완 검토 후보를 보여줍니다.
- 기존 events/profiles를 읽어 계산하며 DB 구조, 인증, 계정 권한, 안내 데이터 및 이벤트 수집 방식은 변경하지 않습니다. 관리자 제외가 기본이며 관리자 포함 필터가 있습니다.
- 새 방식의 조치는 사용자+진행 번호로 중복을 구분하고 마지막 유효 결과만 집계합니다. 과거 결과 기록은 따로 보존합니다. 해결 확인 비율은 solved/(solved+escalate+as), 결과 응답률은 (solved+escalate+as+info)/시작입니다. 일반 안내 완료를 미해결로 계산하지 않습니다.
- 보완 검토 후보는 결과 10건 이상, 채널톡 문의 안내 1건 이상인 증상에 한해 문의 안내 비율 순입니다. A/S와 미응답만으로 매뉴얼 부족을 판단하지 않습니다. 실제 채널톡 접수, 단계별 이탈/시간, 검색 실패는 현재 자료로 확인할 수 없다고 표시합니다.
- 신규 원본 dashboard.js/dashboard.css는 sync-community.cjs를 통해 index.html에 포함합니다. 운영 배포는 기존 production workflow를 사용하며 staging 전체 복사는 금지합니다.
