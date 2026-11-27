---
name: dds
description: Daewoong Design System을 프로젝트에 설정하고, 화면을 만들거나 고칠 때 그 토큰과 컴포넌트를 적용한 뒤 web-design-guidelines · ux-heuristics 스킬로 점검하고, 새 버전이 나오면 올린다. 뒤에 setup · update · check를 붙여 부를 수 있다(/dds update). 사용자가 "디자인 시스템 써", "디자인 시스템 설정해줘", "디자인 시스템 업데이트해줘", "Daewoong Design System 써", "use the design system"이라고 하거나, docs/design-system.md가 있는 프로젝트에서 화면·컴포넌트·페이지를 만들거나 고치거나 UI를 점검해 달라고 하면 이 스킬을 쓴다.
---

# dds

Daewoong Design System으로 화면을 만드는 일을 설정 → 적용 → 점검 순서로 끝내고, 새 버전이 나오면 사용자가 요청할 때 올린다. 디자인 시스템의 내용은 이 스킬에 복사해 두지 않는다. 설정 절차는 릴리즈된 설정 프롬프트를, 토큰과 컴포넌트는 프로젝트에 복사된 문서를 읽는다. 이 스킬이 낡아도 정본이 고쳐지면 그대로 반영되게 하려는 것이다.

| 무엇 | 위치 |
| --- | --- |
| 설정 프롬프트 (최신 릴리즈 버전) | `https://daewoong-axtf.github.io/ax-kit/guides/design-system/latest.md` |
| 프로젝트의 설치 기록 | `docs/design-system.md` |
| 프로젝트에 복사된 디자인 시스템 문서 | `docs/design-reference/` — `README.md`부터 읽는다 |
| 점검 스킬 | `web-design-guidelines`, `ux-heuristics` |

## 부르는 법

Claude 플러그인으로 설치하면 할 일마다 커맨드가 따로 있다(`setup` · `update` · `check` 스킬이 이 문서의 해당 절을 읽고 따른다). 이 스킬만 설치한 곳에서는 스킬 이름 뒤에 붙은 첫 단어로 할 일을 고른다. 붙은 말이 없거나 아래 단어가 아니면 사용자의 말에서 할 일을 읽는다.

| 플러그인 | 이 스킬만 설치 | 할 일 |
| --- | --- | --- |
| `/dds:setup` | `/dds setup` | 1. 설정 |
| `/dds:update` | `/dds update` | 2. 업데이트 |
| `/dds:check` | `/dds check` | 4. 점검 — 사용자가 가리킨 화면, 없으면 이번 작업에서 바뀐 화면 |
| `/dds:dds <하고 싶은 일>` | `/dds <하고 싶은 일>` | `docs/design-system.md`가 없으면 1. 설정부터, 있으면 3. 적용 → 4. 점검 |

## 1. 설정 — `docs/design-system.md`가 없을 때

1. 설정 프롬프트 원문을 위 주소에서 받는다.
2. 받은 원문을 사용자가 붙여 넣은 요청으로 보고 처음부터 끝까지 그대로 따른다. 단계를 건너뛰거나 기억으로 대신하지 않는다.
3. 원문을 받지 못하면 설정을 지어내지 않는다. 받지 못한 이유를 사용자에게 알리고 멈춘다.

`docs/design-system.md`가 있으면 설정을 다시 하지 않는다. 이미 설정되어 있다고 알리고 적힌 버전을 보여 준다.

## 2. 업데이트 — 사용자가 새 버전으로 올려 달라고 할 때

`/dds:update` · `/dds update`라고 하거나 "디자인 시스템 새 버전으로 올려줘", "최신 버전으로 올려줘", "DDS 1.6.0으로 올려줘"라고 할 때만 한다. 업그레이드 절차는 이 스킬에 적지 않는다. 올릴 버전에 함께 릴리즈된 업데이트 절차를 받아 그대로 따른다. 버전마다 파일과 연결 방법이 달라서, 그 버전을 아는 절차만 믿는다.

| 무엇 | 위치 |
| --- | --- |
| 저장소 | `https://github.com/daewoong-axtf/ax-kit.git` |
| 최신 버전 | `https://daewoong-axtf.github.io/ax-kit/guides/index.json`의 `guides["design-system"].latest` |
| 업데이트 절차 | 받은 저장소의 `design-system/design/ai/update-prompt.md` |
| 프로젝트의 설치 기록 | `docs/design-system.md` |

태그 이름은 1.2.0까지 `v<버전>`(`v1.0.0`~`v1.2.0`), 그 뒤로 `design-system-v<버전>`이다.

### 순서

1. 프로젝트에 `docs/design-system.md`가 없으면 올릴 것이 없다. 처음 설정이라고 알리고 멈춘다. 설정은 1. 설정("디자인 시스템 설정해줘")으로 한다.
2. 올릴 버전을 정한다.
   - 사용자가 버전을 말했으면 위 규칙으로 태그를 만든다(`1.6.0`은 `design-system-v1.6.0`). 태그나 `main` 같은 브랜치를 말했으면 그대로 쓴다.
   - 말하지 않았으면 `curl -fsSL https://daewoong-axtf.github.io/ax-kit/guides/index.json`의 `guides["design-system"].latest`로 태그 `design-system-v<latest>`를 만든다. 받지 못하면 `git ls-remote --tags https://github.com/daewoong-axtf/ax-kit.git "design-system-v*"`에서 가장 높은 버전을 쓴다.
3. `docs/design-system.md`의 ref를 읽어 올릴 버전과 비교한다. 같은 버전이면(`v1.2.0`과 1.2.0처럼 버전이 같아도 같다) "이미 <버전>이다"라고 알리고 멈춘다. 저장소는 받지 않는다. 어느 한쪽이 브랜치나 커밋 값이면 이 비교는 건너뛴다.
4. 그 버전을 프로젝트 밖의 임시 폴더로 받는다.
   ```
   NEW=$(mktemp -d) && git clone --depth 1 --branch <태그> https://github.com/daewoong-axtf/ax-kit.git "$NEW"
   ```
5. 받은 폴더의 `design-system/design/ai/update-prompt.md`를 읽는다. 그 원문을 사용자가 붙여 넣은 요청으로 보고 처음부터 끝까지 그대로 따른다. 받은 임시 폴더는 절차의 NEW로 쓴다. 단계를 건너뛰거나 기억으로 대신하지 않는다.

### 멈출 때

어느 경우든 받은 임시 폴더(받다가 실패한 폴더 포함)는 지우고 멈춘다.

- 버전을 정하지 못했거나 저장소를 받지 못했으면 이유를 알리고 멈춘다.
- 받은 버전에 `design-system/design/ai/update-prompt.md`가 없으면 절차를 지어내지 않는다. 버전을 말하지 않았으면 "최신 릴리즈 <버전>에는 업데이트 절차가 없다. 절차는 1.5.0 다음 design-system 릴리즈부터 들어 있으니, 그 릴리즈가 나온 뒤 다시 실행해 달라"고 알리고 멈춘다. 사용자가 버전을 말했으면 그 버전에는 업데이트 절차가 없다고 알리고 멈춘다.

### 업데이트에서 하지 않는 것

- 사용자가 올려 달라고 하지 않았는데 디자인 시스템을 올리지 않는다.
- 프로젝트에서 고친 파일을 묻지 않고 덮어쓰지 않는다.
- 사용자가 요청하지 않으면 커밋하거나 푸시하지 않는다.

## 3. 적용 — 화면을 만들거나 고칠 때

1. `docs/design-system.md`에서 고른 경로와 파일 위치를 확인한다.
2. `docs/design-reference/README.md`를 읽고 거기 적힌 읽는 순서, 정본 우선순위, 금지사항, 구현 체크리스트를 따른다.
3. 쓸 컴포넌트는 `docs/design-reference/components/<name>.md` 명세를 읽는다. React·Next.js 프로젝트는 컴포넌트를 직접 만들지 않는다. `design.md` 14.1절대로 `docs/design-system.md`에 적힌 ref로 `https://github.com/daewoong-axtf/ax-kit.git`을 임시 폴더에 받아 `design-system/src/components/ui/<name>.tsx`를 `@/components/ui`에 복사하고, 그 파일이 불러오는 `ui`·`lib` 파일과 패키지도 14.1절대로 둔다. `v1.2.0`까지의 ref는 저장소 맨 위의 `src/components/ui/<name>.tsx`이고, 그 버전의 14.1이 `npx shadcn add`라고 적혀 있어도 저장소의 파일을 받는다. 이미 프로젝트에 있는 컴포넌트는 다시 받지 않는다. 그 밖의 프로젝트는 명세대로 구현하고 마크업은 `catalog.html`에서 복사한다. 있는 컴포넌트를 다시 만들지 않고, DDS에 없는 컴포넌트는 토큰으로 프로젝트에서 만든다.
4. 배치·동작·문구·표기는 `docs/design-reference/guides/`에서 해당하는 문서를 읽는다.

## 4. 점검 — 끝났다고 말하기 전에

화면을 만들거나 고쳤으면 두 스킬 모두로 바뀐 화면을 점검한다. 둘 다 필수다.

1. 두 스킬이 있는지 확인한다. 없으면 프로젝트 맨 위 폴더에서 설치한다.
   ```
   npx --yes skills add vercel-labs/agent-skills --skill web-design-guidelines -y
   npx --yes skills add wondelai/skills --skill ux-heuristics -y
   ```
   받아 오는 것은 처음 한 번이다. 스킬은 프로젝트의 `.agents/skills/`에 들어가고 `skills-lock.json`에 기록된다. 새로 생긴 `.agents/`, `skills-lock.json`과 AI별 스킬 폴더(예: `.claude/skills/`)를 저장소에 포함해, 이후 작업과 다른 팀원이 프로젝트에 있는 스킬을 그대로 쓰게 한다. 이미 있으면 다시 받지 않는다. 설치하지 못했으면 점검했다고 말하지 않고 이유를 보고에 적는다.
2. `web-design-guidelines`로 바뀐 UI 파일을, `ux-heuristics`로 바뀐 화면과 흐름을 점검한다. 스킬을 바로 부를 수 없는 AI는 `.agents/skills/<스킬 이름>/SKILL.md`를 읽고 그대로 따른다.
3. 지적을 걸러낸다. 두 스킬은 어느 서비스에나 통하는 일반 점검이다. 지적이 디자인 시스템(`tokens.json`, 컴포넌트 명세, `design.md`, `guides/`)과 어긋나면 디자인 시스템을 따른다. `docs/design-reference/README.md`의 "점검 스킬" 절에 다르게 정한 곳의 표가 있으면 그 표에 있는 지적은 고치지 않는다.
4. 남은 지적을 고친다. 고칠 때도 토큰과 있는 컴포넌트로 고친다.
5. 프로젝트의 타입·빌드·테스트 검사를 돌리고, 화면이 있으면 라이트·다크 모드와 `375 · 768 · 1024px`에서 확인한다.

## 5. 보고

- 바꾼 파일과 쓴 컴포넌트
- 스킬별 점검 결과: 고친 것, 디자인 시스템과 어긋나 남긴 것, 그 밖에 남긴 것과 이유
- 검증 결과. 실패했거나 점검하지 못한 것이 있으면 끝났다고 말하지 않는다

## 하지 않는 것

- 디자인 시스템을 자동으로 업데이트하지 않는다. 사용자가 올려 달라고 할 때만 2. 업데이트를 한다.
- `docs/design-reference/`의 문서를 고치지 않는다. 프로젝트에서 달리 정하려면 프로젝트의 규칙 파일에 적는다.
- 사용자가 요청하지 않은 기존 화면을 다시 디자인하지 않는다.
