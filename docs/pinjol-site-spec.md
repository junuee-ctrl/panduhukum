# 인도네시아 생활법률·행정 사이트 — 설계 문서 v1.2

작성일: 2026-07-15
Phase 1: pinjol/소비자금융 기둥 30~40페이지로 개시
차용 설계: korean-law-mcp의 action_plan(5단계 템플릿) + verify_citations(인용검증 게이트)

---

## 0. 미션 — 이 사이트가 표방하는 것

> **"법을 모르는 보통 사람이 인생 문제에 부딪혔을 때,
> 지금 당장 무엇을 해야 하는지 단계별로 알려주는 무료 안내소."**

**누구를 위한 곳인가** — 변호사도 법대생도 아닌 일반인. 추심 전화에 떨고 있는
사람, 해고 통보를 받은 사람, 사기당한 돈을 찾고 싶은 사람. 이들은 "법령"을
검색하지 않고 "lapor kemana"를 검색한다. 우리는 그 질문에 답한다.

**무엇을 주는가** — 답이 아니라 **행동 경로**. 모든 글은 5단계로 끝난다:
진단 → 권리 → 어디로·언제 → 무엇을 챙겨서 → 무엇을 피해서. 읽고 나면
"알겠다"가 아니라 **"이제 뭘 할지 알겠다"**가 되어야 한다.

**무엇으로 신뢰받는가** — "확실하지 않으면 발행하지 않는다"를 기계로 강제한다.
모든 법령 인용은 공식 DB로 실존 검증되며, 통과하지 못하면 발행 자체가
불가능하다(빌드 차단). 그 위에 AI 법리 검토, 사후 변호사 서명.

**무엇이 아닌가 (정체성의 절반)**
- 법률 자문이 아니다 — 정보 제공까지. 구체 사건은 변호사에게 연결한다.
- 채무 회피 코치가 아니다 — "갚지 마라"가 아니라 "권리를 지키며 합법적으로 해결하라".
- 법률가용 DB가 아니다 — 그건 Hukumonline의 영역. 우리는 그들이 내려오지 않는
  눈높이를 지킨다.

**세 가지 가치**: 접근성(누구나 이해하는 언어) · 실행 가능성(읽으면 움직일 수
있음) · 검증된 정직함(모르는 것은 모른다고 표시).

※ 콘텐츠 톤, 기능 우선순위, 수익화 결정이 흔들릴 때 이 섹션으로 돌아올 것.
   판단 기준: "추심 전화에 떨고 있는 사람에게 이게 도움이 되는가?"

---

## 1. 사이트 정체성

| 항목 | 결정 |
|---|---|
| 타겟 | 인도네시아 일반인 (법률 지식 없음, 문제 발생 시 검색) |
| 언어 | 인도네시아어 (구어체에 가까운 쉬운 문체, Hukumonline과 반대 포지션) |
| 수익 | AdSense 중심 → 변호사 연결 (§7 수익 로드맵) |
| 브랜드 / 도메인 | **PanduHukum — panduhukum.com (확정)**. "pandu"(안내하다) + hukum: 미션("단계별 안내소")과 문자 그대로 일치. Cloudflare 등록. 잔여 확인: DJKI 상표 검색, 인스타·틱톡 핸들(@panduhukum) 선점 |
| 슬로건 방향 | "PanduHukum — Tahu hak Anda, langkah demi langkah" (당신의 권리를, 단계별로) |

핵심 차별화 3종:
1. **5단계 action_plan 템플릿** — 모든 문제형 글이 동일한 실행 구조
2. **인용검증 게이트** — 모든 법령 인용이 공식 DB로 기계 검증됨
3. **changelog 신선도** — 규정 변경 시 갱신 이력 공개 (SERP 검증에서 '2026 갱신' 표기가 랭킹 견인함을 실증)

---

## 2. 스택

| 레이어 | 선택 | 비고 |
|---|---|---|
| 프론트 | Next.js 14 (App Router, SSG) + Tailwind | K-pop 캘린더와 코드 공유 |
| 배포 | Cloudflare Pages | Phase 1~3 (수백 페이지)는 정적으로 충분 |
| 콘텐츠 | git 저장소 내 MDX + frontmatter | 이벤트가 아닌 문서형이므로 MDX가 적합 |
| 생성 | Python + Claude API (초안: claude-haiku-4-5, 고난도 글: claude-sonnet-4-6) | 40편 초안 비용은 소액 (문서화: docs.claude.com/en/api/overview) |
| 검증 | 인용검증 스크립트 (아래 §5) + 법대생 검수자 | 이중 게이트 |
| 실행 환경 | GitHub Actions (PC 불필요) | 생성·검증 배치는 workflow_dispatch, 재검증은 월간 크론 |
| 승인 | GitHub PR | Actions가 초안+검증 리포트를 PR로 생성 → 폰 GitHub 앱에서 검토·머지 → Cloudflare 자동 배포 |

---

## 3. URL / 페이지 타입

```
/                                메인 (문제 유형별 진입)
/pinjol/[slug]                   Phase 1: pinjol 문제 해결 글
/pinjol/cek-legalitas            [도구] OJK 등록 대출앱 조회 DB
/kalkulator/[slug]               [도구] 계산기 (denda pajak, bunga maksimal 등)
/surat/[slug]                    Phase 3: 양식 템플릿+생성기
/urus/[slug]                     Phase 2: 행정 절차 가이드
/urus/[slug]/[provinsi]          Phase 2: 주별 프로그래매틱 페이지
/kerja/[slug]                    Phase 4: 노동 롱테일
/tentang, /disclaimer, /kontak   AdSense 필수 페이지
```

### 문제 해결 글(주력) 페이지 구성 — "5단계 템플릿"

korean-law-mcp의 action_plan 구조를 콘텐츠 표준으로 채택:

```
H1: [문제를 그대로] "Diteror DC Pinjol? Ini Hak dan Langkah Anda (Update 2026)"

[요약 박스] 3줄 답변 (Featured Snippet 타겟)

STEP 1 — Diagnosis Situasi (상황진단)
  · 합법/불법 대출앱 구분 체크리스트 → /pinjol/cek-legalitas 링크
STEP 2 — Hak Anda (법적 권리·구제수단)
  · 근거 규정 요약 (원문은 접기)
STEP 3 — Ke Mana & Kapan (신고 기관·기한)
  · OJK 157 / Satgas PASTI / 경찰 — 표로 정리
STEP 4 — Dokumen & Bukti (필요 서류·증거·양식)
  · 스크린샷 수집법, 신고 양식 → /surat/ 링크 (내부링크 허브)
STEP 5 — Jebakan yang Harus Dihindari (함정·주의)
  · 돌려막기 금지, 사기성 '채무 해결사' 주의 등

[FAQ 3~5개]  ← FAQPage 스키마
[Dasar Hukum] 인용 법령 리스트 (검증 배지 포함)
[Ditinjau oleh: 이름, S.H. · 최종 검토일]
[Riwayat Pembaruan] changelog
[Disclaimer 고지]
```

이 구조의 효과: 실행 가능성(체류시간↑) + 내부링크 자연 발생(STEP 1→도구,
STEP 4→양식) + FAQ/HowTo 스키마 적합 + Poskota류와 구조적 차별화.

---

## 4. 콘텐츠 데이터 모델 (MDX frontmatter)

```yaml
---
slug: "cara-mengatasi-teror-dc-pinjol"
title: "Diteror DC Pinjol? Ini Hak dan Langkah Anda"
pillar: "pinjol"
type: "action_plan"          # action_plan | guide | tool | form
target_keyword: "cara mengatasi teror dc pinjol"
secondary_keywords: ["dc pinjol datang ke rumah", "teror pinjol lapor kemana"]
citations:                    # 인용검증 게이트 대상
  - ref: "POJK 22/2023"
    pasal: "Pasal 62"
    verified: true
    verified_at: "2026-07-15"
    source_url: "https://peraturan.ojk.go.id/..."
  - ref: "UU 27/2022 (PDP)"
    pasal: "Pasal 65"
    verified: true
reviewer: "nama-reviewer"     # 검수자 ID
reviewed_at: "2026-07-15"
changelog:
  - date: "2026-07-15"
    note: "Artikel diterbitkan"
published: true
---
```

`citations[].verified: true`가 아닌 항목이 하나라도 있으면 **빌드 실패** —
발행 자체가 불가능하게 강제.

---

## 5. 인용검증 게이트 (verify_citations 이식)

korean-law-mcp가 법제처 DB로 조문 실존을 교차검증하듯, 인니 공식 소스로 검증:

```
[Claude API 초안 생성]
      ↓
[citation-extract.py]
  정규식으로 인용 추출:
  - "UU (Nomor )?\d+ Tahun \d{4}" / "UU \d+/\d{4}"
  - "POJK \d+/(POJK\.\d+/)?\d{4}"
  - "PP \d+/\d{4}", "Permen... \d+/\d{4}"
  - "Pasal \d+( ayat \(\d+\))?"  (직전 문맥 30자 lookback으로 소속 법령 역추적
     — korean-law-mcp v3.5와 동일 기법)
      ↓
[citation-verify.py]
  1) peraturan.go.id / peraturan.bpk.go.id 검색으로 법령 실존 확인
  2) 가능하면 본문 fetch → 해당 Pasal 번호 존재 확인 (없으면 존재 범위 리포트)
  3) 결과: ✓ 실존 / ✗ 없음 / ⚠ 확인불가(사람 검수 필수 플래그)
      ↓
[검증 리포트 → PR 본문]
  ✗ 또는 ⚠ 포함 시: PR에 🔴 표시 + 머지 전 체크리스트 (검수자 확인 필수)
  전부 ✓: frontmatter에 verified 기록
      ↓
[준의 승인 = PR 머지 (폰 GitHub 앱)] → main 반영 → Cloudflare Pages 자동 빌드

※ 전 과정이 GitHub Actions에서 실행 — 로컬 PC 불필요.
  · 글 생성: Actions 탭 → "Generate Article" → keyword/slug 입력 (폰에서 가능)
  · 월간 재검증: 크론이 전체 인용 재검증, 실패 시 이슈 자동 생성 (규정 개정 감지)
```

korean-law-mcp README의 실전 교훈 반영:
- **NOT_FOUND 명시 시그널**: 검증 실패 시 Claude API에 재생성 요청할 때
  `[NOT_FOUND]` 마커 + "추측/생성 금지" 프롬프트를 명시 (같은 환각 반복 방지)
- **부분매칭 오매칭 주의**: "UU PDP" 같은 약칭 → 정식 명칭 사전(alias map)
  구축 후 매칭 (그쪽의 "민법→난민법" 오매칭 사례와 동일한 함정)
- 봇 차단 대비: 요청 UA를 일반 브라우저로, 요율 제한 준수, 실패 시 캐시 사용

사이트 표시: 검증 통과 인용에 "✓ Terverifikasi dari sumber resmi" 배지 →
E-E-A-T 신호 + 사용자 신뢰 + 경쟁자가 흉내 내기 어려운 차별점.

---

## 6. Phase 1 — pinjol 초기 40페이지

### A. 문제 해결 글 (action_plan형, 22개) — 키워드 시트 P6 '상' 기반
1. Diteror DC pinjol — hak & langkah          11. Hutang kartu kredit bisa dipidana?
2. DC datang ke rumah — boleh atau tidak       12. Kartu kredit tidak dibayar — akibat & solusi
3. Data disebar pinjol ilegal — lapor kemana   13. Leasing tarik motor di jalan — sah?
4. Cara menghapus data di aplikasi pinjol      14. Motor ditarik leasing — bisa diambil lagi?
5. Galbay pinjol — blacklist berapa lama       15. Cara negosiasi & restrukturisasi kredit
6. Pinjol tidak dibayar — apa akibatnya        16. Hutang orang meninggal — siapa bayar
7. Cara melaporkan pinjol ilegal               17. Hutang suami — tanggung jawab istri?
8. Bunga pinjol maksimal (aturan OJK)          18. Menagih hutang teman secara hukum
9. Cara keluar dari blacklist SLIK             19. Hutang tak dibayar — bisa lapor polisi?
10. Cara memperbaiki skor kredit               20. Salah transfer — uang bisa kembali?
                                               21. Penipuan online — langkah lengkap
                                               22. Investasi bodong — ciri & cek izin

### B. 절차 가이드 (10개)
23. Cara cek SLIK OJK online (스크린샷 단계별)   28. Cara lapor ke OJK 157 (전 채널)
24. Cara pakai cekrekening.id                   29. Cara blokir rekening penipu via bank
25. Cara cek pinjol legal di OJK                30. Cara refund di marketplace
26. Cara lapor Satgas PASTI                     31. Kartu ATM tertelan
27. Cara lapor polisi online (penipuan)         32. Klaim asuransi ditolak — banding

### C. 도구 (4개) — 링크 자산
33. [DB] Cek legalitas pinjol — OJK 등록 리스트 검색 DB (월 갱신, changelog)
34. [계산기] Bunga harian maksimal 계산기 (OJK 요율 기준)
35. [계산기] Simulasi restrukturisasi (기간/이자 재계산)
36. [체크리스트] "Pinjol ini ilegal?" 인터랙티브 진단 (STEP 1 재사용)

### D. 기반 페이지 (4개)
37. Tentang kami (검수자 프로필 포함)  39. Disclaimer (정보제공·비자문 고지)
38. Kontak                             40. Kebijakan privasi

발행 페이스: 주 8~10개 × 4~5주. 도구(33~36)를 2주차까지 우선 —
글보다 링크가 먼저 붙는 자산.

---

## 7. AdSense 정책 가드레일 (채무 콘텐츠 필수)

- **금지 프레임**: "갚지 마라", "도망쳐라", 갈베이 조장, 추심 회피 "꼼수" —
  정책 위반 + YMYL 품질 하락. Poskota류가 아슬아슬하게 타는 선을 우리는 명확히 지킴
- **허용 프레임**: 법적 권리 안내, 공식 신고 절차, 규정 수치(OJK 최고금리 등),
  합법적 채무조정 절차
- Satgas PASTI 권고(원금 상환 능력 있으면 상환) 등 균형 서술 포함
- 모든 글 하단 고지: "Artikel ini bersifat informasi, bukan nasihat hukum.
  Untuk kasus spesifik, konsultasikan dengan advokat."
- AdSense 신청 시점: 40페이지 + 색인 확인 후 (약 6~8주차)

광고 배치: STEP 2 뒤 인아티클 1 / STEP 5 뒤 1 / FAQ 뒤 1. 도구 페이지는
결과 표시 하단 1 (입력 UI 주변 배치 금지 — 오클릭 정책 리스크).

### 수익 로드맵 (애드센스 → 변호사 연결)

법률 상담 리드는 애드센스 클릭 대비 단가가 압도적 (건당 수십만 루피아 가치).
LaporKemana → "누구한테 맡기지?"로 이어지는 자연 퍼널.

| 단계 | 모델 | 시점 | 리스크 |
|---|---|---|---|
| ① 제휴 | Justika 등 법률상담 플랫폼 어필리에이트 (STEP 3 아래 CTA) | 월 세션 1만~ | 최소 — 플랫폼 경유라 윤리규정은 플랫폼 책임 |
| ② 정액 광고 | 로펌/변호사 사무소의 분야별·지역별 스폰서 슬롯 (월정액) | 트래픽 안정 후 | 낮음 — 건당 커미션 아닌 광고 |
| ③ 자체 연결 | 상담 신청 폼 + 파트너 변호사 네트워크 | 사업체 전환 시 | 법인·계약 구조 필요 |

⚠ 법적 확인 필수: 인니 변호사 윤리강령(Kode Etik Advokat)상 사건 유치 대가의
보수 분배 제한 가능성 — "성사 건당 수임료 X%" 성공보수형은 변호사 자문으로
적법성 확인 전 금지. ①②는 이 이슈를 우회하는 구조.

**검수-마케팅 교환**: 파트너 변호사가 글을 검수(3층 게이트)해주면 해당 글에
프로필+상담 버튼 노출. 검수 비용 → 수익 모델 내부에서 상쇄. E-E-A-T 서명과
리드 퍼널이 동시에 확보됨.

레이아웃 준비: Phase 1부터 STEP 3 하단에 상담 CTA 슬롯을 비워둘 것
(컴포넌트만 만들고 비활성 — 추후 스위치 온).

---

## 8. 로드맵

**주 1~2**: 도메인·저장소·Next.js 뼈대 / 도구 4종 / 기반 페이지 / 인용검증 스크립트 v1
**주 3~6**: action_plan 22개 + 절차 10개 발행 (Claude API 초안 → 검증 게이트 → 검수 → 승인)
**주 6~8**: Search Console 지표 확인, AdSense 신청, 상위 노출 글 보강
**주 8~**: Phase 2 착수 — /urus/ 행정 절차 + 주별 프로그래매틱 (키워드 시트 P5)

병행 준비:
- [ ] 법대생 검수자 채용 (파트타임, 월 Rp2~4jt) — 글당 검토+서명
- [ ] 인니 변호사 1회 자문: disclaimer 문안 + '법률 자문' 경계 확인
- [ ] alias map 초기 구축: UU PDP→UU 27/2022, UU ITE→UU 1/2024 개정 반영 등
      (착수 시 최신 개정 번호 재확인 필수)

---

## 9. 성공 지표 (Phase 1 판정, 12주차)

| 지표 | 목표 |
|---|---|
| 색인 페이지 | 35+ / 40 |
| 상위 10위 진입 키워드 | 10개+ (롱테일 포함) |
| 월 오가닉 세션 | 5,000+ (12주차 기준) |
| 도구 페이지 유입 비중 | 20%+ |
| AdSense | 승인 완료 |

미달 시: SERP 재분석 후 P5(행정)로 무게 이동. 달성 시: Phase 2 확장 +
검수자 시간 증량.
