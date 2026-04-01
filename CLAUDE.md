# Insurance App (보험 상담사 도우미) — CLAUDE.md

## 프로젝트 개요

보험 상담사가 고객 상담 중 실시간으로 관련 정보를 검색하고 카드뉴스 형태로 보여줄 수 있는 내부 도구입니다.

- **사용자**: 보험 상담사 (B2B 내부 도구)
- **핵심 기능**: 키워드 검색 → 관련 카드뉴스 표시 → 상담에 활용
- **데이터**: 397개 보험 카드뉴스 (JPG 이미지 + 구조화된 JSON)

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 14+ |
| 스타일링 | Tailwind CSS | 3+ |
| 데이터베이스 | Supabase (PostgreSQL) | - |
| 이미지 저장 | Supabase Storage | - |
| 배포 | Vercel | - |
| 언어 | TypeScript | 5+ |

---

## 프로젝트 구조

```
insurance-app/
├── app/
│   ├── page.tsx               # 메인 검색 화면
│   ├── card/[id]/page.tsx     # 카드뉴스 상세 페이지
│   ├── api/
│   │   ├── search/route.ts    # 검색 API
│   │   └── card/[id]/route.ts # 카드 상세 API
│   └── layout.tsx
├── components/
│   ├── SearchBar.tsx          # 검색창 컴포넌트
│   ├── CardGrid.tsx           # 카드 목록 그리드
│   ├── CardItem.tsx           # 개별 카드 아이템
│   ├── CardDetail.tsx         # 카드 상세 (이미지 슬라이드 포함)
│   ├── CategoryFilter.tsx     # 카테고리 필터
│   └── ImageSlider.tsx        # 카드뉴스 이미지 슬라이더
├── lib/
│   ├── supabase.ts            # Supabase 클라이언트
│   ├── search.ts              # 검색 유틸리티
│   └── types.ts               # TypeScript 타입 정의
├── scripts/
│   └── upload-data.py         # JSON 데이터 → Supabase 업로드 스크립트
├── public/
└── CLAUDE.md
```

---

## 데이터 구조

### Supabase 테이블: `insurance_cards`

```sql
CREATE TABLE insurance_cards (
  id           TEXT PRIMARY KEY,      -- 폴더명 (예: "4세대+실손보험+3가지+장점")
  title        TEXT NOT NULL,         -- 제목 (예: "4세대 실손보험 3가지 장점")
  category     TEXT,                  -- 카테고리 (예: "실손보험")
  tags         TEXT[],                -- 태그 배열
  summary      TEXT,                  -- 2-3문장 요약
  content      TEXT,                  -- 전체 텍스트 (검색용)
  key_points   TEXT[],                -- 핵심 포인트 3가지
  images       TEXT[],                -- 이미지 파일명 배열
  image_count  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 전문 검색 인덱스
CREATE INDEX idx_insurance_cards_fts
ON insurance_cards
USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,'') || ' ' || array_to_string(tags, ' ')));
```

### TypeScript 타입 (`lib/types.ts`)

```typescript
export interface InsuranceCard {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
  key_points: string[];
  images: string[];
  image_count: number;
}
```

---

## 핵심 기능 명세

### 1. 검색 (`app/api/search/route.ts`)

- **입력**: 검색어 (string), 카테고리 필터 (optional)
- **방식**: Supabase Full-Text Search (`to_tsvector`)
- **반환**: `InsuranceCard[]` (최대 20개)
- **검색 대상**: `title`, `content`, `tags`

```typescript
// 검색 쿼리 예시
const { data } = await supabase
  .from('insurance_cards')
  .select('id, title, category, tags, summary, key_points, image_count')
  .textSearch('fts', query, { type: 'websearch', config: 'simple' })
  .limit(20);
```

### 2. 이미지 URL 생성

카드뉴스 이미지는 Supabase Storage의 `card-images` 버킷에 저장됩니다.

```
버킷 경로: card-images/{card_id}/{image_filename}
Public URL: {SUPABASE_URL}/storage/v1/object/public/card-images/{card_id}/{filename}
```

### 3. 카드 상세 화면

- 이미지 슬라이더 (좌우 스와이프)
- 핵심 포인트 목록
- 날짜 경고 배너 (콘텐츠 날짜 기준)
- "내용이 틀렸어요" 피드백 버튼

---

## 환경변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # 서버 사이드 전용
```

---

## 주요 커맨드

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 데이터 업로드 (Python 스크립트)
python3 scripts/upload-data.py

# Supabase 로컬 개발
npx supabase start
```

---

## UI/UX 가이드

### 상담사 사용 시나리오
1. 고객이 질문함 → 상담사가 검색창에 키워드 입력
2. 관련 카드뉴스 목록 표시 (썸네일 + 한줄 요약)
3. 카드 클릭 → 이미지 슬라이드를 고객에게 태블릿으로 보여줌
4. 핵심 포인트로 말로 설명 보완

### 디자인 원칙
- **빠른 검색**: 타이핑과 동시에 결과 표시 (debounce 300ms)
- **태블릿 친화적**: 터치 인터페이스, 큰 버튼
- **정보 신뢰도 표시**: 오래된 콘텐츠는 노란색 경고 배너

### 색상 팔레트
- Primary: `#1E40AF` (파란색 — 신뢰감)
- Warning: `#F59E0B` (오래된 정보 경고)
- Background: `#F8FAFC`
- Card: `#FFFFFF`

---

## 데이터 소스

- **원본 데이터**: `C:\Users\HP\Documents\보험자료\_json_data\` (Windows)
  - VM 경로: `/sessions/.../mnt/보험자료/_json_data/`
  - 총 397개 JSON 파일 + `index.json` (마스터 인덱스)
- **카드뉴스 이미지**: 각 폴더 내 JPG 파일들

### index.json 구조
```json
{
  "total": 397,
  "categories": { "보험": 97, "실손보험": 13, ... },
  "top_tags": { "보험": 226, "실손": 45, ... },
  "items": [
    {
      "id": "폴더명",
      "title": "카드뉴스 제목",
      "category": "카테고리",
      "tags": ["태그1", "태그2"],
      "summary": "요약",
      "image_count": 6,
      "key_points": ["핵심1", "핵심2", "핵심3"]
    }
  ]
}
```

---

## 개발 우선순위 (로드맵)

### Phase 1 — MVP (1-2주)
- [ ] Next.js 프로젝트 세팅
- [ ] Supabase 테이블 생성 + 데이터 업로드 스크립트
- [ ] 기본 검색 API
- [ ] 검색창 + 카드 목록 UI

### Phase 2 — 핵심 기능 (3-4주)
- [ ] 카드뉴스 이미지 슬라이더
- [ ] 카테고리 필터
- [ ] 카드 상세 페이지
- [ ] 날짜 기준 신뢰도 경고 표시

### Phase 3 — 고도화
- [ ] 즐겨찾기 기능
- [ ] 최근 검색어 기록
- [ ] "내용 틀렸어요" 피드백 수집
- [ ] AI 보완 레이어 (Claude API 연동)

---

## 코딩 컨벤션

- **컴포넌트**: PascalCase (`SearchBar.tsx`)
- **함수/변수**: camelCase
- **API 라우트**: kebab-case (`/api/search-cards`)
- **Supabase 쿼리**: `lib/supabase.ts`에서 중앙 관리
- **에러 처리**: 모든 API 라우트에 try/catch + 한국어 에러 메시지
- **주석**: 한국어로 작성

---

## 참고 사항

- 이 앱은 상담사 전용 내부 도구로, 일반 사용자 인증은 초기에는 생략 가능
- 카드뉴스 내용은 보험 전문 지식이므로 임의로 내용을 수정/요약하지 말 것
- 이미지 파일명 형식: `knowledge_{hex_id}.jpg`
- 카드뉴스 폴더명의 `+`는 공백을 의미함
