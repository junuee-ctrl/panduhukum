# PC-free 운영 셋업 (1회, 약 20분)

## 저장소 구조
```
repo/
├── .github/workflows/
│   ├── generate-article.yml      # 글 생성 (수동 트리거)
│   └── reverify-citations.yml    # 월간 인용 재검증 (크론)
├── pipeline/                     # citation_extract / citation_verify / verify_all / generate_draft
├── content/pinjol/*.mdx          # 발행 콘텐츠
└── (Next.js 앱)
```

## 셋업 순서
1. GitHub 저장소 생성 → 위 파일 배치 (github-workflows/ 내용물을 .github/workflows/로)
2. repo Settings → Secrets and variables → Actions → `ANTHROPIC_API_KEY` 등록
3. Cloudflare Pages → "Connect to Git"으로 이 저장소 연결 (main 푸시 = 자동 배포)
4. (권장) main 브랜치 보호 규칙: PR 필수 — 검증 안 된 글이 실수로 배포되는 것 방지

## 일상 운영 — 완전 자동 모드 (기본, 개입 0)
- `keyword-queue.txt`에 키워드를 쌓아두면 **매일 09:30 WIB에 1편씩 자동 처리**:
  - 🟢 게이트 1층(인용 실존)+2층(AI 법리검토, sonnet) 클린 → **main 직접 커밋 = 즉시 배포**
  - 🟡 WARN/검수필요 존재 → PR 대기열 (쌓아뒀다가 확인 후 머지, 변호사 도입 시 여기부터)
  - ✗ 3회 재시도 실패 → 이슈 알림, 큐에 유지
- 매월 1일: 전체 인용 재검증 크론 → 규정 개정 감지 시 이슈로 알림
- 3층(변호사 검수)은 사후 소급: 발행 글 검토 후 frontmatter `reviewer` 서명 → 배지 표시

## 수동 모드 (필요 시)
- GitHub 앱 → Actions → Generate Article → keyword/slug 입력 → PR 생성 → 검토·머지

## 주의
- 완전 자동 모드에서는 main 브랜치 보호(PR 필수)를 걸 수 없음 — 🟢 직접 커밋과 충돌.
  대신 게이트의 빌드 차단(verified 아니면 실패)이 안전장치 역할.
- 🟢 자동발행 글에는 "Belum ditinjau ahli hukum" 표기 유지 (투명성 + 사후검수 시 제거)

## 비용
- GitHub Actions: 퍼블릭 무료 / 프라이빗 월 2,000분 무료 (글 1편 ≈ 2~3분 → 여유 큼)
- Claude API: 초안 40편 기준 소액 (haiku). 사용량은 console.anthropic.com에서 확인
- Cloudflare Pages: 무료

## 로컬 PC가 필요한 유일한 경우
- citation_verify.py의 실네트워크 파싱 최초 튜닝 (peraturan.bpk.go.id HTML 구조 확인)
  — 이것도 Actions에서 workflow_dispatch로 돌려 로그 보며 조정 가능하므로 사실상 불필요
