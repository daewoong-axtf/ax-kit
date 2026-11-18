# daewoong-ax-standards

대웅 AX 서비스가 함께 쓰는 기준을 한 저장소에서 관리한다. 폴더마다 따로 버전을 매긴다. 한 폴더를 고쳐도 다른 폴더의 버전은 오르지 않는다.

| 폴더 | 내용 | 태그 | 안내 |
| --- | --- | --- | --- |
| `design-system/` | Daewoong Design System — 토큰 · 컴포넌트 명세 · 카탈로그 · Storybook | `design-system-vX.Y.Z` | [design-system/README.md](design-system/README.md) |
| `rules/safety-rules/` | AI로 만든 웹앱 최소 안전 규칙 | `safety-rules-vX.Y.Z` | [rules/README.md](rules/README.md) |

[카탈로그](https://daewoong-axtf.github.io/daewoong-ax-standards/design/catalog.html) · [가이드 게시물 목록](https://daewoong-axtf.github.io/daewoong-ax-standards/guides/index.json) · [릴리즈](https://github.com/daewoong-axtf/daewoong-ax-standards/releases)

## 버전과 릴리즈

커밋 메시지(conventional commits)와 바뀐 파일의 폴더로 버전이 정해진다. `feat:`은 마이너, `fix:`·`perf:`는 패치, `feat!:`은 메이저를 올리고 `docs:`·`chore:`·`ci:`·`refactor:`는 릴리즈하지 않는다.

1. `main`에 머지하면 [release-please](https://github.com/googleapis/release-please)가 바뀐 폴더마다 릴리즈 PR을 만들거나 갱신한다. 설정은 `release-please-config.json`, 지금 버전은 `.release-please-manifest.json`에 있다.
2. 릴리즈 PR을 확인하고 머지하면 태그 · CHANGELOG · GitHub Release가 생긴다.
3. 릴리즈 뒤 Pages를 다시 올린다. 디자인 시스템이면 `design.zip` 업로드와 받는 저장소 알림도 한다 — `.github/workflows/release.yml`

한 PR에서 두 폴더를 고치면 두 폴더의 버전이 함께 오른다. 폴더별로 PR을 나눈다.

release-please는 커밋이 바꾼 파일의 경로로 폴더를 정한다. 폴더를 나누기 전(`design/`이 맨 위에 있던 때)에 만든 브랜치는 이 저장소 구조 위로 **rebase**해 경로를 `design-system/` 아래로 맞춘 뒤 머지한다. 그대로 merge commit으로 넣으면 어느 폴더에도 속하지 않아 릴리즈가 일어나지 않는다.

## AX Desk에 보이는 흐름

AX Desk의 코딩 가이드 화면은 Pages에 올린 게시물을 읽는다. 원문이 릴리즈되면 AX Desk를 다시 배포하지 않아도 15분 안에(Pages 캐시 약 10분 + AX Desk 캐시 5분) 새 버전이 보인다.

```
릴리즈 → .github/workflows/pages.yml → scripts/build-site.ts
  guides/index.json                 문서별 최신 버전 · 기준일 · 경로
  guides/<문서>/<버전>.md            태그마다 한 파일. 한 번 올린 판은 바뀌지 않는다
  design/ · index.html              디자인 시스템 카탈로그 (main 기준)
```

- 버전은 태그에서, 기준일은 태그 날짜(한국 시간)에서 읽는다. 원문 본문에 적힌 버전 글은 쓰지 않는다.
- 디자인 시스템 게시물은 그 태그의 설정 프롬프트에 저장소 주소와 태그를 채운 글이다.

로컬에서 만들어 보려면 `node scripts/build-site.ts _site`.

## 개발

```bash
pnpm install
pnpm test                 # 디자인 시스템 가드 테스트 + 게시물 빌드 테스트
pnpm -C design-system build
```

## 저장소 이름

예전 이름은 `daewoong-design-system`이다. GitHub가 예전 주소의 clone · API 요청을 이 저장소로 넘겨 준다. **예전 이름으로 저장소를 새로 만들지 않는다.** 만들면 넘겨 주기가 끊긴다. Pages 주소는 넘겨 주지 않으므로 예전 Pages 링크는 새 주소로 바꾼다.
