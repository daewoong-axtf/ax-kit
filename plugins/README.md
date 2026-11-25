# plugins/ — 팀 Claude 스킬

AX팀이 함께 쓰는 Claude 스킬이다. 이 저장소가 Claude 플러그인 마켓플레이스 `ax-kit`이고, 스킬 하나가 플러그인 하나다(`dds`만 커맨드를 나누려고 스킬을 넷 둔다). 마켓플레이스를 한 번 등록하고 필요한 플러그인만 골라 설치한다. 플러그인마다 따로 버전을 매긴다.

| 플러그인 | 하는 일 | 필요한 연결 | 버전 |
| --- | --- | --- | --- |
| [`write-prd`](write-prd/skills/write-prd/SKILL.md) | 노션 'PRD 작성 기준'을 매번 읽어 그대로 PRD를 쓰고 'AX PRD 문서' DB에 저장한다. 기존 PRD 점검도 한다 | Notion — 'PRD 작성 기준' · 'AX PM 문서' 페이지와 'AX PRD 문서' DB | [![write-prd](https://img.shields.io/github/v/tag/daewoong-axtf/ax-kit?filter=write-prd-v*&sort=semver&label=%EC%B5%9C%EC%8B%A0)](https://github.com/daewoong-axtf/ax-kit/tags) |
| [`ax-mail-inquiry-log`](ax-mail-inquiry-log/skills/ax-mail-inquiry-log/SKILL.md) | 메일·웍스 문의와 AX팀 대응을 노션 'AX 라운지 메일·메신저 문의' DB에 정해진 형식으로 기록한다 | Notion — 'AX 라운지 메일·메신저 문의' DB | [![ax-mail-inquiry-log](https://img.shields.io/github/v/tag/daewoong-axtf/ax-kit?filter=ax-mail-inquiry-log-v*&sort=semver&label=%EC%B5%9C%EC%8B%A0)](https://github.com/daewoong-axtf/ax-kit/tags) |
| [`dds`](dds/skills/dds/SKILL.md) | Daewoong Design System을 프로젝트에 설정하고, 화면을 만들거나 고칠 때 토큰·컴포넌트를 적용한 뒤 `web-design-guidelines` · `ux-heuristics` 스킬로 점검한다 | GitHub 접속 — 설정 프롬프트와 점검 스킬 두 개를 처음 한 번 받아 온다 | [![dds](https://img.shields.io/github/v/tag/daewoong-axtf/ax-kit?filter=dds-v*&sort=semver&label=%EC%B5%9C%EC%8B%A0)](https://github.com/daewoong-axtf/ax-kit/tags) |

## 설치

### 1. 마켓플레이스 등록과 플러그인 설치

**Claude Code (터미널)**

```
/plugin marketplace add daewoong-axtf/ax-kit
/plugin install write-prd@ax-kit
/plugin install ax-mail-inquiry-log@ax-kit
/plugin install dds@ax-kit
```

`/plugin`을 열면 목록에서 골라 설치할 수도 있다.

**데스크톱 앱 · claude.ai**

Customize → Plugins → Add → Add marketplace에 `daewoong-axtf/ax-kit`을 넣고, 목록에서 필요한 플러그인을 설치한다. claude.ai 계정에 설치한 플러그인은 같은 계정으로 로그인한 Claude Code에도 보인다.

**데스크톱 앱 Code 탭**

\+ → Add plugins에서 `ax-kit` 플러그인을 고른다. 마켓플레이스가 목록에 없으면 위 Claude Code 명령으로 먼저 등록한다.

**Codex · Cursor 등 다른 AI 도구**

`dds`은 프로젝트 맨 위 폴더에서 아래 명령으로도 설치한다. 스킬이 프로젝트의 `.agents/skills/`에 들어가 그 프로젝트를 여는 AI 도구가 함께 쓴다.

```
npx skills add daewoong-axtf/ax-kit --skill dds
```

### 2. Notion 연결 확인

`write-prd`와 `ax-mail-inquiry-log`는 Notion을 읽고 쓴다. `dds`은 Notion을 쓰지 않으니 이 단계를 건너뛴다. 플러그인에는 Notion 연결이 들어 있지 않고, 각자 연결해 둔 Notion을 쓴다.

- **데스크톱 앱 · claude.ai**: Settings → Connectors에서 Notion을 연결한다.
- **Claude Code**: `/mcp`에 Notion이 보이면 된다. claude.ai 계정에 연결한 Notion이 그대로 보인다. 없으면 `claude mcp add --transport http notion https://mcp.notion.com/mcp`로 추가하고 `/mcp`에서 로그인한다.

Notion 연결은 내 계정 권한으로 동작한다. 위 표의 페이지 · DB를 Notion에서 직접 열 수 있어야 스킬도 읽고 쓴다. 열 수 없으면 스킬은 내용을 지어내지 않고 멈춰서 알린다.

## 쓰는 법

설치하면 대화에서 하고 싶은 일을 말하면 된다. Claude가 맞는 스킬을 골라 쓴다. Claude Code에서는 `/write-prd:write-prd`, `/ax-mail-inquiry-log:ax-mail-inquiry-log`처럼 `플러그인:스킬` 이름으로 바로 부를 수도 있다.

**write-prd**

```
PRD 써줘 — https://www.notion.so/<티켓 또는 회의록>
이 회의록으로 PRD 만들어줘 (메모를 붙여 넣거나 파일을 함께 준다)
이 PRD 기준에 맞는지 점검해줘 — <기존 PRD 링크>
```

- 재료가 노션 링크 · 붙여 넣은 메모 · 파일 중 무엇이든 된다. 재료가 한두 줄뿐이면 인터뷰부터 한다.
- 매번 노션 'PRD 작성 기준'을 다시 읽고 그대로 쓴다. 필수 항목 중 근거가 없는 것만 초안 전에 한 번에 묻는다.
- 초안은 작업 폴더의 `prd-drafts/`에 먼저 저장하고 요약을 보여 준다. **저장하라고 해야** 'AX PRD 문서' DB에 올린다.

**ax-mail-inquiry-log**

```
이 메일 문의 노션에 기록해줘 (메일 · 웍스 대화 원문이나 요약을 붙여 넣는다)
지난번 SCM팀 문의 건에 오늘 회신한 내용 추가해줘
```

- 'AX 라운지 메일·메신저 문의' DB에 `[부서] 문의 요약` 제목과 문제 · 어려움 · 지원 · 결과 · 대응 이력 형식으로 페이지를 만든다.
- 같은 건이 이미 있으면 새로 만들지 않고 업데이트할지 묻는다. 추가 대응은 대응 이력 끝에 덧붙인다.
- 대화로 확정되지 않은 값(부서 · 유형 · 상태 등)은 추정해 채우고, 무엇을 추정했는지 알려 준다.

**dds**

디자인 시스템을 쓸 프로젝트 폴더에서 Claude Code를 열고 아래 순서로 한다. 1 · 2번은 처음 한 번만 한다.

1. **플러그인을 설치한다.**

   ```
   /plugin marketplace add daewoong-axtf/ax-kit
   /plugin install dds@ax-kit
   ```

2. **디자인 시스템을 프로젝트에 설정한다.**

   ```
   /dds:setup
   ```

   "디자인 시스템 설정해줘"라고 말해도 된다.

   최신 [설정 프롬프트](../design-system/design/ai/setup-prompt.md)를 받아 그대로 설정한다. 붙여 넣을 필요가 없다. 끝나면 `docs/design-reference/`에 토큰과 컴포넌트 명세가, `docs/design-system.md`에 가져온 버전이 생긴다.

3. **화면을 만들거나 고친다.**

   ```
   디자인 시스템 써서 회원 목록 화면 만들어줘
   /dds:check
   ```

   만드는 일은 말로 시킨다. `/dds:check`는 만든 화면을 점검만 따로 할 때 쓴다.

   프로젝트에 복사된 `docs/design-reference/`를 읽고 토큰과 컴포넌트를 쓴다. 끝내기 전에 `web-design-guidelines` · `ux-heuristics` 스킬로 점검한다. 두 스킬은 처음 한 번 GitHub에서 받아 프로젝트의 `.agents/skills/`에 두고, 그 뒤로는 프로젝트에 있는 것을 계속 쓴다. 스킬 지적이 디자인 시스템과 어긋나면 디자인 시스템을 따른다.

4. **디자인 시스템 새 판이 나오면 올린다.**

   ```
   /dds:update
   ```

   "디자인 시스템 최신 판으로 업데이트해줘"라고 말해도 된다. 자동으로는 올라가지 않는다. 지금 버전이 최신이면 그렇다고 알리고 멈춘다. 아니면 최신 설정 프롬프트를 다시 받아 `docs/design-reference/`와 `docs/design-system.md`를 새 판으로 바꾼다. 덮어쓰기 전에 무엇이 바뀌는지 먼저 보여 준다. 올린 뒤 `docs/design-system.md`의 버전을 확인한다.

| 커맨드 | 하는 일 |
| --- | --- |
| `/dds:setup` | 디자인 시스템을 프로젝트에 설정한다 |
| `/dds:update` | 프로젝트의 디자인 시스템을 최신 판으로 올린다 |
| `/dds:check` | 화면을 디자인 시스템과 점검 스킬 두 개로 점검한다 |

커맨드는 `플러그인:스킬` 모양이다. 세 커맨드는 `dds` 스킬 원문의 해당 절을 읽고 따르는 짧은 스킬이라, 절차는 [`dds` 스킬](dds/skills/dds/SKILL.md) 한 곳에만 있다. Codex · Cursor처럼 `npx skills add … --skill dds`로 `dds` 스킬만 설치한 곳에서는 `/dds setup`, `/dds update`, `/dds check`로 쓴다.

디자인 시스템 버전(`design-system-vX.Y.Z`)과 `dds` 플러그인 버전(`dds-vX.Y.Z`)은 따로 오른다. 4번은 디자인 시스템을 올리는 것이고, 플러그인 자체를 올리는 법은 아래 [업데이트](#업데이트)에 있다. 최신 디자인 시스템 버전은 [릴리즈](https://github.com/daewoong-axtf/ax-kit/releases)에서 본다.

## 업데이트

플러그인(스킬 원문)을 새 판으로 올리는 법이다. 플러그인은 버전이 오를 때만 새 판을 받는다. 프로젝트에 넣은 디자인 시스템을 올리는 것은 [dds 쓰는 법](#쓰는-법) 4번이다.

- Claude Code: `/plugin marketplace update ax-kit` 뒤 `/plugin`에서 업데이트한다.
- 터미널에서는 명령 두 줄로 한다. 플러그인을 설치한 프로젝트 폴더에서 실행하고, 끝나면 Claude Code를 다시 시작해야 적용된다.

  ```bash
  claude plugin marketplace update ax-kit
  claude plugin update dds@ax-kit
  ```

  `dds` 자리에 올릴 플러그인 이름을 넣는다.
- 자동으로 받으려면 `/plugin` → Marketplaces → `ax-kit` → Enable auto-update. 팀 마켓플레이스는 기본으로 꺼져 있다.

## 플러그인을 추가하거나 고치는 법

PR을 올리고 누군가 확인한 뒤 머지한다. 한 PR에서는 플러그인 하나만 고친다. 여러 폴더를 함께 고치면 그 폴더들의 버전이 모두 오른다.

**새 플러그인** — 다섯 곳을 맞춘다. 하나라도 빠지면 `pnpm test`가 실패한다.

1. `plugins/<이름>/skills/<이름>/SKILL.md` — 스킬 원문. frontmatter `name`이 폴더 이름과 같아야 한다.
2. `plugins/<이름>/.claude-plugin/plugin.json` — `name`, `version: "1.0.0"`, `description`(필요한 연결도 적는다), `author`, `repository`.
3. `plugins/<이름>/version.txt` — `1.0.0`.
4. `.claude-plugin/marketplace.json`의 `plugins[]` — `name`, `source: "./plugins/<이름>"`, `description`. `version`은 넣지 않는다.
5. `release-please-config.json`의 `packages`에 `plugins/<이름>`(다른 플러그인과 같은 모양), `.release-please-manifest.json`에 `"plugins/<이름>": "1.0.0"`.

`pnpm test`와 `claude plugin validate .`를 통과시킨다. 첫 PR 제목은 `chore:`로 해서 릴리즈 PR이 바로 열리지 않게 하고, 머지한 뒤 그 커밋에 시작점을 만든다.

```bash
gh release create <이름>-v1.0.0 --repo daewoong-axtf/ax-kit --target <머지 커밋> --latest=false \
  --title "<이름>: v1.0.0" --notes "첫 버전"
```

이 표의 줄과 루트 README는 같이 고친다.

**고치기** — `SKILL.md`를 고친다. 커밋 타입으로 버전이 정해진다.

| 커밋 | 버전 | 예 |
| --- | --- | --- |
| `feat:` | 마이너 (1.0.0 → 1.1.0) | 절차 추가, 결과물이 달라지는 변경 |
| `fix:` | 패치 (1.0.0 → 1.0.1) | 문구 다듬기, 오탈자, 잘못된 ID 고치기 |
| `feat!:` | 메이저 (1.0.0 → 2.0.0) | 입력 · 저장 위치 · 형식을 바꿔 기존 사용법이 깨지는 변경 |
| `docs:` · `chore:` | 릴리즈하지 않음 | 이 README 수정 등 |

`main`에 머지하면 release-please가 그 플러그인의 릴리즈 PR을 따로 만든다. 그 PR을 머지하면 `plugin.json` 버전이 오르고 `<이름>-vX.Y.Z` 태그가 붙는다. 설치한 사람은 그때부터 새 판을 받는다. 릴리즈 전에 `main`에 들어간 수정은 그사이 새로 설치하는 사람에게 먼저 간다.
