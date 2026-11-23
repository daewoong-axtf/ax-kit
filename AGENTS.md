# AGENTS.md

이 저장소는 폴더마다 따로 버전을 매긴다. 고치는 폴더의 안내를 먼저 읽는다.

| 폴더 | 내용 | 먼저 읽을 것 |
| --- | --- | --- |
| `design-system/` | Daewoong Design System | [design-system/design/README.md](design-system/design/README.md) — 읽는 순서, 정본 우선순위(`tokens.json` > `components/<name>.md` > `catalog.html`), 금지사항 |
| `rules/` | AI 코딩 규칙 원문 | [rules/README.md](rules/README.md) — 폴더 구성, 고치고 배포하는 순서 |
| `plugins/` | 팀 Claude 스킬(플러그인 마켓플레이스) | [plugins/README.md](plugins/README.md) — 추가하는 법. 스킬 원문은 받은 그대로 넣는다 |

- `design-system/design/tokens.css`는 생성 파일이다. 직접 고치지 말고 `design-system/design/tokens.json`을 고친 뒤 `pnpm -C design-system build:tokens`.
- `rules/safety-rules/daewoong-coding-guide.md`는 생성 파일이다. 직접 고치지 말고 `rules/safety-rules/parts/`의 조각을 고친 뒤 `pnpm build:rules`. 버전(`version.txt`)과 `CHANGELOG.md`는 release-please가 고친다.
- 변경 후 루트에서 `pnpm test`(가드 테스트)가 통과해야 한다.
