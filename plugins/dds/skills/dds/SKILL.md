---
name: dds
description: Daewoong Design System을 프로젝트에 설정하고, 화면을 만들거나 고칠 때 그 토큰과 컴포넌트를 적용한 뒤 web-design-guidelines · ux-heuristics 스킬로 점검하고, 새 판이 나오면 올린다. 뒤에 setup · update · check를 붙여 부를 수 있다(/dds update). 사용자가 "디자인 시스템 써", "디자인 시스템 설정해줘", "디자인 시스템 업데이트해줘", "Daewoong Design System 써", "use the design system"이라고 하거나, docs/design-system.md가 있는 프로젝트에서 화면·컴포넌트·페이지를 만들거나 고치거나 UI를 점검해 달라고 하면 이 스킬을 쓴다.
---

# dds

Daewoong Design System으로 화면을 만드는 일을 설정 → 적용 → 점검 순서로 끝내고, 새 판이 나오면 사용자가 요청할 때 올린다. 디자인 시스템의 내용은 이 스킬에 복사해 두지 않는다. 설정 절차는 릴리즈된 설정 프롬프트를, 토큰과 컴포넌트는 프로젝트에 복사된 문서를 읽는다. 이 스킬이 낡아도 정본이 고쳐지면 그대로 반영되게 하려는 것이다.

| 무엇 | 위치 |
| --- | --- |
| 설정 프롬프트 (최신 릴리즈판) | `https://daewoong-axtf.github.io/ax-kit/guides/design-system/latest.md` |
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

## 2. 업데이트 — 사용자가 새 판으로 올려 달라고 할 때

`/dds:update` · `/dds update`라고 하거나 "최신 판으로 올려줘", "업데이트해줘"라고 할 때만 한다.

1. `docs/design-system.md`에서 지금 버전을 읽는다. 파일이 없으면 올릴 것이 없다. 사용자에게 알리고 1. 설정을 한다.
2. `https://daewoong-axtf.github.io/ax-kit/guides/index.json`의 `guides["design-system"].latest`로 최신 버전을 확인한다. 지금 버전과 같으면 이미 최신이라고 알리고 멈춘다.
3. 설정 프롬프트 원문을 다시 받고, 거기 적힌 저장소와 가져올 위치(ref)에서 새 판을 가져온다. 원문의 "`docs/design-system.md`가 이미 있으면 다시 가져오지 않는다"는 문장은 업데이트에서는 따르지 않는다. 나머지 단계는 그대로 따른다.
4. 덮어쓰기 전에 지금 `docs/design-reference/`와 새 판이 어떻게 다른지(추가 · 변경 · 삭제된 파일, 바뀐 토큰과 컴포넌트) 사용자에게 보여 준다. 프로젝트 코드에 복사해 쓰는 토큰 · 컴포넌트 파일을 프로젝트에서 고쳤으면 그 파일은 사용자가 정한 대로만 바꾼다.
5. `docs/design-reference/`를 새 판으로 바꾸고 `docs/design-system.md`의 버전과 날짜를 고친다. 점검 스킬 두 개는 이미 있으면 다시 받지 않는다.
6. 프로젝트의 타입·빌드·테스트 검사를 돌린다. 기존 화면은 다시 디자인하지 않는다. 새 판에서 바뀐 토큰이나 컴포넌트 때문에 손봐야 할 화면이 있으면 고치지 말고 목록으로 보고한다.
7. 올리기 전 버전과 올린 뒤 버전, 바뀐 것, 사용자가 확인할 것을 보고한다. 원문이나 새 판을 받지 못했으면 올렸다고 말하지 않는다.

## 3. 적용 — 화면을 만들거나 고칠 때

1. `docs/design-system.md`에서 고른 경로와 파일 위치를 확인한다.
2. `docs/design-reference/README.md`를 읽고 거기 적힌 읽는 순서, 정본 우선순위, 금지사항, 구현 체크리스트를 따른다.
3. 쓸 컴포넌트는 `docs/design-reference/components/<name>.md` 명세를 읽고 구현한다. 마크업은 `catalog.html`에서 복사한다. 있는 컴포넌트를 다시 만들지 않고, 없는 컴포넌트는 토큰으로 프로젝트에서 만든다.
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
