# ax-kit

대웅 AX 서비스가 함께 쓰는 기준을 한 저장소에서 관리한다. 폴더마다 따로 버전을 매긴다. 한 폴더를 고쳐도 다른 폴더의 버전은 오르지 않는다.

| 폴더 | 내용 | 태그 | AI에 붙여 넣기 |
| --- | --- | --- | --- |
| [`design-system/`](design-system/README.md) | Daewoong Design System — 토큰 · 컴포넌트 명세 · [카탈로그](https://daewoong-axtf.github.io/ax-kit/design/catalog.html) · Storybook | [![design-system](https://img.shields.io/github/v/tag/daewoong-axtf/ax-kit?filter=design-system-v*&sort=semver&label=%EC%B5%9C%EC%8B%A0)](https://github.com/daewoong-axtf/ax-kit/tags) | [설치 프롬프트](https://daewoong-axtf.github.io/ax-kit/guides/design-system/latest.md) |
| [`rules/safety-rules/`](rules/README.md) | AI로 만든 웹앱 최소 안전 규칙 | [![safety-rules](https://img.shields.io/github/v/tag/daewoong-axtf/ax-kit?filter=safety-rules-v*&sort=semver&label=%EC%B5%9C%EC%8B%A0)](https://github.com/daewoong-axtf/ax-kit/tags) | [규칙 원문](https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/latest.md) |
| [`plugins/`](plugins/README.md) | 팀 Claude 스킬 — 플러그인 마켓플레이스 `ax-kit` | 플러그인마다 `<이름>-vX.Y.Z` | [설치 · 쓰는 법](plugins/README.md) |

폴더 이름을 누르면 그 폴더의 안내로 간다. "AI에 붙여 넣기"는 최신 릴리즈판 원문이다. 전체를 복사해 AI 대화창에 붙여 넣거나 프로젝트에 파일로 둔다. 스킬은 붙여 넣지 않고 플러그인으로 설치한다.

[가이드 게시물 목록](https://daewoong-axtf.github.io/ax-kit/guides/index.json) · [릴리즈](https://github.com/daewoong-axtf/ax-kit/releases)

## 팀 Claude 스킬 쓰기

스킬은 플러그인으로 설치한다. 마켓플레이스를 한 번 등록하고 필요한 것만 고른다.

```
/plugin marketplace add daewoong-axtf/ax-kit
/plugin install ax@ax-kit
/plugin install dds@ax-kit
/plugin install rules@ax-kit
```

데스크톱 앱 · claude.ai는 Customize → Plugins → Add → Add marketplace에 `daewoong-axtf/ax-kit`을 넣는다. `ax`의 스킬은 **Notion 연결이 필요하다.**

| 스킬 | 이렇게 말한다 | 결과 |
| --- | --- | --- |
| `ax:write-prd` | "PRD 써줘 — <노션 티켓 · 회의록 링크>", "이 PRD 기준에 맞는지 점검해줘" | 노션 'PRD 작성 기준'대로 초안을 `prd-drafts/`에 쓴다. 저장하라고 하면 'AX PRD 문서' DB에 올린다 |
| `ax:mail-inquiry-log` | "이 메일 문의 노션에 기록해줘"(원문을 붙여 넣는다), "지난번 문의 건에 오늘 회신 추가해줘" | 'AX 라운지 메일·메신저 문의' DB에 `[부서] 문의 요약` 페이지를 만들거나 대응 이력을 덧붙인다 |
| `dds` | "디자인 시스템 설정해줘", "디자인 시스템 써서 이 화면 만들어줘" | Daewoong Design System을 프로젝트에 설정하고, 화면을 만든 뒤 `web-design-guidelines` · `ux-heuristics` 스킬로 점검한다 |
| `dds`의 `/dds:update` | "디자인 시스템 새 버전으로 올려줘", Claude Code에서는 `/dds:update` | 설치한 디자인 시스템을 새 판으로 올린다. 프로젝트에서 고친 파일은 새 판도 바꿨을 때만 묻는다. 1.5.0 다음 design-system 릴리즈부터 동작한다 |
| `rules`의 `/rules:safety-rules` | "최소 안전 규칙 넣어줘", "안전 규칙 최신 판으로 올려줘", Claude Code에서는 `/rules:safety-rules` | 최소 안전 규칙 원문을 프로젝트의 `daewoong-coding-guide.md`로 넣고 `CLAUDE.md` · `AGENTS.md`가 가리키게 한다. 이미 있으면 최신 판으로 올린다 |

Notion 연결 확인, 업데이트, 스킬을 추가하는 법은 [plugins/README.md](plugins/README.md).

## 버전과 릴리즈

커밋 메시지(conventional commits)와 바뀐 파일의 폴더로 버전이 정해진다. `feat:`은 마이너, `fix:`·`perf:`는 패치, `feat!:`은 메이저를 올리고 `docs:`·`chore:`·`ci:`·`refactor:`는 릴리즈하지 않는다.

1. `main`에 머지하면 [release-please](https://github.com/googleapis/release-please)가 바뀐 폴더마다 릴리즈 PR을 따로 만들거나 갱신한다. 설정은 `release-please-config.json`, 지금 버전은 `.release-please-manifest.json`에 있다.
2. 릴리즈 PR을 확인하고 머지하면 태그 · CHANGELOG · GitHub Release가 생긴다.
3. 릴리즈 뒤 Pages를 다시 올린다. 디자인 시스템이면 `design.zip` 업로드와 받는 저장소 알림도 한다 — `.github/workflows/release.yml`

한 PR에서 두 폴더를 고치면 두 폴더의 버전이 함께 오른다. 폴더별로 PR을 나눈다.

최소 안전 규칙을 고쳐 배포하는 순서는 [rules/README.md](rules/README.md#고치고-배포하기)에 처음 하는 사람 기준으로 적어 두었다. 규칙은 `rules/safety-rules/parts/`의 조각만 고치고, 통합본(`daewoong-coding-guide.md`)과 버전 표기는 자동으로 만들어진다.

release-please는 커밋이 바꾼 파일의 경로로 폴더를 정한다. 폴더를 나누기 전(`design/`이 맨 위에 있던 때)에 만든 브랜치는 이 저장소 구조 위로 **rebase**해 경로를 `design-system/` 아래로 맞춘 뒤 머지한다. 그대로 merge commit으로 넣으면 어느 폴더에도 속하지 않아 릴리즈가 일어나지 않는다.

## AX Desk에 보이는 흐름

AX Desk의 코딩 가이드 화면은 Pages에 올린 게시물을 읽는다. 원문이 릴리즈되면 AX Desk를 다시 배포하지 않아도 15분 안에(Pages 캐시 약 10분 + AX Desk 캐시 5분) 새 버전이 보인다.

```
릴리즈 → .github/workflows/pages.yml → scripts/build-site.ts
  guides/index.json                 문서별 최신 버전 · 기준일 · 경로
  guides/<문서>/<버전>.md            태그마다 한 파일. 한 번 올린 판은 바뀌지 않는다
  guides/safety-rules/<버전>/<조각>.md  최소 안전 규칙을 이루는 조각 (rules/safety-rules/parts/)
  design/ · index.html              디자인 시스템 카탈로그 (main 기준)
```

- 버전은 태그에서, 기준일은 태그 날짜(한국 시간)에서 읽는다. 원문 본문에 적힌 버전 글은 쓰지 않는다.
- 디자인 시스템 게시물은 그 태그의 설정 프롬프트에 저장소 주소와 태그를 채운 글이다.

로컬에서 만들어 보려면 `node scripts/build-site.ts _site`.

## 개발

```bash
pnpm install
pnpm test                 # 디자인 시스템 가드 테스트 + 게시물 빌드 테스트 + 규칙 통합본 가드
pnpm build:rules          # rules/safety-rules/parts/ → daewoong-coding-guide.md
pnpm -C design-system build
```

## 저장소 이름

예전 이름은 `daewoong-design-system`, `daewoong-ax-standards`다. GitHub가 예전 주소의 clone · API 요청을 이 저장소로 넘겨 준다. **예전 이름들로 저장소를 새로 만들지 않는다.** 만들면 넘겨 주기가 끊긴다. Pages 주소는 넘겨 주지 않으므로 예전 Pages 링크는 새 주소로 바꾼다.
