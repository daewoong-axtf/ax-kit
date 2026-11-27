# design/ — Daewoong Design System 정본

언어·프레임워크와 무관하게 UI를 구현할 때 쓰는 폴더다. 사람과 AI 에이전트 모두 이 파일부터 읽는다.

## 사용 방법

- **프로젝트 초반에 가져가 셋팅한다.** 이 폴더의 내용을 프로젝트에 복사해 시작점으로 쓴다. 패키지로 설치하는 방식이 아니다. AI에게 맡길 때는 [설정 프롬프트](ai/setup-prompt.md)를 쓴다. 카탈로그 첫 화면에서 복사할 수 있다. 환경별 연결 방법은 [`design.md` 14장](design.md#14-환경별-적용)에 있다. 이미 설치한 프로젝트를 새 버전으로 올릴 때는 [업데이트 절차](ai/update-prompt.md)를 쓴다. 프로젝트에서 고치지 않은 파일만 바꾸고, 고친 파일은 묻는다.
- **필요한 컴포넌트는 프로젝트에서 자유롭게 확장한다.** 여기에 없는 컴포넌트가 필요하면 이 시스템을 기반으로 프로젝트 안에서 만들어 쓴다. 승인을 받거나 이 저장소에 먼저 추가할 필요는 없다.
- **확장할 때도 기반은 지킨다.** 색·간격·모서리·글자는 토큰을 쓰고, 상태·키보드·반응형·다크 모드는 아래 체크리스트를 따른다. 반응형과 단어 단위 줄바꿈은 따로 요청하지 않아도 기본으로 지원한다.

## 읽는 순서

1. [`design.md`](design.md) — 토큰을 언제 어디에 쓰는지. 프로젝트에 붙이는 방법은 [14장](design.md#14-환경별-적용)
2. [`tokens.json`](tokens.json) — 값의 정본
3. `components/<name>.md` — 구현할 컴포넌트 명세 ([템플릿](components/_template.md))
4. [`catalog.html`](catalog.html) — 동작하는 예시. 마크업은 여기서 복사한다
5. 필요할 때 [`guides/`](guides/) — [접근성](guides/accessibility.md), [상호작용](guides/interaction.md), [UX 문구](guides/ux-writing.md), [콘텐츠·다국어](guides/content-i18n.md), [UX 가이드라인](guides/ux-guideline.md). 기본안이므로 서비스에 맞게 고쳐 쓴다
6. 화면을 만들거나 고친 뒤 [점검 스킬](#점검-스킬) 두 개로 점검한다

## 정본 우선순위

`tokens.json` > `components/<name>.md` > `design.md` > `catalog.html`

충돌하면 앞쪽이 맞다. 뒤쪽을 고친다. `design.md`의 규칙은 컴포넌트 명세가 따로 정하지 않은 자리에 쓴다.

컴포넌트가 만드는 문구(접근 가능한 이름·안내·상태 문구)의 정본은 [`messages.json`](messages.json)이다. 한국어·영어 표는 여기서 고친다([`content-i18n.md` 5장](guides/content-i18n.md#5-다국어-전환)).

## 파일

| 파일 | 내용 | 수정 |
| --- | --- | --- |
| `ai/setup-prompt.md` | AI에게 붙여 넣는 설정 프롬프트 원본. 저장소·ref는 `package.json`의 `designSystem`에서 채운다 | 직접 |
| `ai/update-prompt.md` | 설치한 프로젝트를 새 버전으로 올리는 절차. 채울 자리 없이 릴리즈 태그 그대로 읽는다. `dds` 스킬의 업데이트(`/dds:update`)가 받은 버전에서 읽어 따른다 | 직접 |
| `llms.txt` · `llms-full.txt` | AI가 읽는 문서 목록과 전체 합본 | 생성 — `pnpm build:llms` |
| `tokens.json` | 색·간격·모서리·글자·모션·쌓임 순서·브레이크포인트·그리드·비율 토큰 | 직접 |
| `tokens.css` | `--dw-*` CSS 변수 | 생성 — `pnpm build:tokens` |
| `shadcn.css` | shadcn 변수를 토큰에 연결 (Next.js·React) | 직접 |
| `components.css` | 서버 템플릿 웹용 `dw-*` 클래스 | 직접 |
| `messages.json` | 컴포넌트 문구의 정본. `{ 키: { ko, en } }` | 직접 |
| `js/components.ts` | 컴포넌트 동작 원본. `MESSAGES` 구역은 `messages.json`에서 생성 | 직접 (`MESSAGES` 구역은 생성 — `pnpm build:messages`) |
| `js/components.js` | 브라우저가 읽는 동작 파일 | 생성 — `pnpm build:catalog` |
| `../src/lib/dw-messages.ts` | React 컴포넌트가 읽는 문구 표 | 생성 — `pnpm build:messages` |
| `../src/lib/dw-locale.tsx` · `../src/lib/dw-date.ts` | React 문구 Provider·훅(`DwLocaleProvider`·`useDwMessages`·`useDwLocale`), 달력·날짜 선택의 날짜 기본값(`useDwDate`) | 직접 |
| `icons/` | 아이콘 SVG·`sprite.svg`·`icons.json` | 생성 — `pnpm build:icons` |
| `brand/` | 회사 로고(CI) SVG·PNG·원본 AI | 수정 금지. 교체할 때 통째로 바꾼다 |
| `guides/*.md` | UX·문구·인터랙션·콘텐츠·접근성 기본안. 정본 우선순위에 들지 않는다 | 서비스 성격에 맞게 자유롭게 |
| `fonts/` | Pretendard 공식 동적 서브셋·라이선스 | 수정 금지. 버전을 올릴 때 통째로 교체 |
| `catalog.html` | 토큰과 컴포넌트를 한 페이지에서 보는 카탈로그. 마크업 레퍼런스. 맨 아래 업데이트 기록은 릴리즈 때 자동으로 추가된다 | 절은 직접, 아이콘·메뉴 구역은 생성 — `pnpm build:catalog` |
| `catalog.en.json` | 카탈로그 영어 번역표. 키는 `catalog.html`의 한국어 단위 | 직접 |
| `catalog.en.html` | `catalog.html`의 영어판. 설정 프롬프트와 업데이트 기록 목록은 한국어로 둔다 | 생성 — `pnpm build:catalog` |
| `catalog.css` · `js/catalog.js` | 카탈로그 페이지 틀. 제품에 쓰지 않는다 | 직접 |

## 점검 스킬

디자인 시스템으로 화면을 만들거나 고쳤으면 끝내기 전에 아래 두 스킬로 점검한다. 둘 다 필수다. [설정 프롬프트](ai/setup-prompt.md)가 프로젝트에 설치하고 AI 규칙에 등록한다.

| 스킬 | 점검하는 것 | 받는 곳 |
| --- | --- | --- |
| `web-design-guidelines` | UI 코드가 Web Interface Guidelines를 지키는지. 점검할 때마다 규칙 원문을 인터넷에서 받아 온다 | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines` |
| `ux-heuristics` | 화면과 흐름의 사용성 (Nielsen 휴리스틱, Krug 원칙, 심각도 등급) | `npx skills add wondelai/skills --skill ux-heuristics` |

- 스킬은 어느 서비스에나 통하는 일반 점검이다. 이 시스템이 정한 것(토큰, 컴포넌트 명세, `design.md`, `guides/`)과 지적이 어긋나면 이 시스템을 따르고, 어긋난 항목을 보고에 적는다.
- 지적을 고칠 때도 토큰과 있는 컴포넌트로 고친다. 휴리스틱별로 어떤 컴포넌트를 쓰는지는 [UX 가이드 1장](guides/ux-guideline.md#1-사용성-휴리스틱)에 있다.
- 아래는 스킬과 이 시스템이 다르게 정한 곳이다. 스킬이 지적해도 고치지 않고, 보고에 다시 올리지 않는다.

| 주제 | 스킬의 지적 | 이 시스템의 결정 |
| --- | --- | --- |
| 파괴적 행동 | 확인 창보다 되돌리기를 둔다 | [Alert Dialog](components/alert-dialog.md)로 확인한다. 되돌릴 수 있는 행동만 Toast Action으로 되돌린다 ([interaction.md 5·6장](guides/interaction.md#5-피드백)) |
| 입력 검증 시점 | 필드를 벗어날 때 검증한다 | 첫 오류는 제출할 때 보이고, 그 뒤로는 입력할 때마다 다시 검증한다 ([interaction.md 8장](guides/interaction.md#8-폼-제출-검증)) |
| 문구 | 영어 표기 규칙 (Title Case, 둥근 따옴표, `…`로 끝나는 placeholder·로딩 문구) | 한국어 문구는 [ux-writing.md](guides/ux-writing.md)를 따른다 |
| 날짜·숫자 표기 | 포맷을 코드에 직접 쓰지 않는다 | 표기는 [content-i18n.md](guides/content-i18n.md)의 표로 정해져 있다. 만들 때는 로케일 포맷 기능을 쓴다 |
| 검색창 위치 | 헤더에 항상 보이는 검색창을 둔다 | 목록의 필터 줄에 두고, 모바일은 조건 시트 안에 둔다 ([ux-guideline.md 5.2](guides/ux-guideline.md#52-필터-줄)·[6.3](guides/ux-guideline.md#63-필터)) |
| 도움말 | 도움말·문서를 둔다 (Nielsen 10번) | 10번은 정보 계층으로 바꿔 쓴다 ([ux-guideline.md 1장](guides/ux-guideline.md#1-사용성-휴리스틱)) |

- 스킬은 외부 저장소의 것이다. 이 저장소에 원문을 두지 않고 버전을 고정하지 않는다. 프로젝트에 설치된 버전은 그 프로젝트의 `skills-lock.json`에 기록된다.

## 금지사항

- 색·간격·모서리·글자를 토큰 없이 쓰지 않는다. 스케일 밖 수치를 만들지 않는다.
- 유채색 팔레트(`orange`·`charcoal`·`blue`·`green`·`yellow`·`red`·`purple`)를 직접 쓰지 않는다. 역할 토큰으로 부른다.
- 생성 파일을 손으로 고치지 않는다.
- 컴포넌트에 문구를 직접 적지 않는다. 문구는 `messages.json`에 두고 키로 부른다.
- 이미 있는 컴포넌트의 클래스 이름과 마크업 구조를 바꾸지 않는다. `catalog.html`에서 복사한다. 새 컴포넌트는 프로젝트의 이름으로 만들고 `dw-` 접두사를 쓰지 않는다.
- [`design.md` 12장](design.md#12-하지-말-것)의 항목을 어기지 않는다.

## 구현 체크리스트

- [ ] 명세의 모든 variant·size를 구현했다
- [ ] States 표의 hover·pressed·focus-visible·disabled·loading을 구현했다
- [ ] 키보드로 전부 조작할 수 있고 포커스가 보인다
- [ ] `375 · 768 · 1024px`에서 깨지지 않고, 터치 타깃이 44×44px 이상이다
- [ ] hover로만 보이는 정보가 없다. 터치에서는 탭으로 열린다
- [ ] 줄이 바뀔 때 단어가 음절 중간에서 끊기지 않는다 (`word-break: keep-all`)
- [ ] 라이트·다크 양쪽에서 확인했다
- [ ] `prefers-reduced-motion`에서 이동 애니메이션이 줄어든다
- [ ] 상태를 색 하나로만 알리지 않는다
- [ ] `web-design-guidelines`와 `ux-heuristics` 스킬로 점검하고 지적 사항을 처리했다

## 브랜드 색 교체

[`design.md` 4장](design.md#4-브랜드-교체)의 절차로 `tokens.json`의 `orange-*`만 바꾸고 `pnpm build:tokens`를 돌린다. 그다음 `bg-brand-solid`와 `fg-on-brand-solid`, 흰 바탕의 `fg-brand` 대비가 4.5:1 이상인지 다시 확인한다.
