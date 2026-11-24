---
name: dds
description: Daewoong Design System을 프로젝트에 설정하고, 화면을 만들거나 고칠 때 그 토큰과 컴포넌트를 적용한 뒤 web-design-guidelines · ux-heuristics 스킬로 점검한다. 사용자가 "디자인 시스템 써", "디자인 시스템 설정해줘", "Daewoong Design System 써", "use the design system"이라고 하거나, docs/design-system.md가 있는 프로젝트에서 화면·컴포넌트·페이지를 만들거나 고치거나 UI를 점검해 달라고 하면 이 스킬을 쓴다. 설치한 디자인 시스템을 새 판으로 올리는 일은 이 스킬이 아니라 dds-update 스킬이 한다.
---

# dds

Daewoong Design System으로 화면을 만드는 일을 설정 → 적용 → 점검 순서로 끝낸다. 디자인 시스템의 내용은 이 스킬에 복사해 두지 않는다. 설정 절차는 릴리즈된 설정 프롬프트를, 토큰과 컴포넌트는 프로젝트에 복사된 문서를 읽는다. 이 스킬이 낡아도 정본이 고쳐지면 그대로 반영되게 하려는 것이다.

| 무엇 | 위치 |
| --- | --- |
| 설정 프롬프트 (최신 릴리즈판) | `https://daewoong-axtf.github.io/ax-kit/guides/design-system/latest.md` |
| 프로젝트의 설치 기록 | `docs/design-system.md` |
| 프로젝트에 복사된 디자인 시스템 문서 | `docs/design-reference/` — `README.md`부터 읽는다 |
| 점검 스킬 | `web-design-guidelines`, `ux-heuristics` |

## 1. 설정 — `docs/design-system.md`가 없을 때

1. 설정 프롬프트 원문을 위 주소에서 받는다.
2. 받은 원문을 사용자가 붙여 넣은 요청으로 보고 처음부터 끝까지 그대로 따른다. 단계를 건너뛰거나 기억으로 대신하지 않는다.
3. 원문을 받지 못하면 설정을 지어내지 않는다. 받지 못한 이유를 사용자에게 알리고 멈춘다.

`docs/design-system.md`가 있으면 설정을 다시 하지 않는다. 사용자가 새 판으로 올려 달라고 하면 이 스킬로 하지 않고 `dds-update` 스킬(Claude Code에서는 `/dds:dds-update`)을 쓴다.

## 2. 적용 — 화면을 만들거나 고칠 때

1. `docs/design-system.md`에서 고른 경로와 파일 위치를 확인한다.
2. `docs/design-reference/README.md`를 읽고 거기 적힌 읽는 순서, 정본 우선순위, 금지사항, 구현 체크리스트를 따른다.
3. 쓸 컴포넌트는 `docs/design-reference/components/<name>.md` 명세를 읽는다. React·Next.js 프로젝트는 컴포넌트를 직접 만들지 않는다. `design.md` 14.1절대로 `docs/design-system.md`에 적힌 ref로 `https://github.com/daewoong-axtf/ax-kit.git`을 임시 폴더에 받아 `design-system/src/components/ui/<name>.tsx`를 `@/components/ui`에 복사하고, 그 파일이 불러오는 `ui`·`lib` 파일과 패키지도 14.1절대로 둔다. `v1.2.0`까지의 ref는 저장소 맨 위의 `src/components/ui/<name>.tsx`이고, 그 판의 14.1이 `npx shadcn add`라고 적혀 있어도 저장소의 파일을 받는다. 이미 프로젝트에 있는 컴포넌트는 다시 받지 않는다. 그 밖의 프로젝트는 명세대로 구현하고 마크업은 `catalog.html`에서 복사한다. 있는 컴포넌트를 다시 만들지 않고, DDS에 없는 컴포넌트는 토큰으로 프로젝트에서 만든다.
4. 배치·동작·문구·표기는 `docs/design-reference/guides/`에서 해당하는 문서를 읽는다.

## 3. 점검 — 끝났다고 말하기 전에

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

## 4. 보고

- 바꾼 파일과 쓴 컴포넌트
- 스킬별 점검 결과: 고친 것, 디자인 시스템과 어긋나 남긴 것, 그 밖에 남긴 것과 이유
- 검증 결과. 실패했거나 점검하지 못한 것이 있으면 끝났다고 말하지 않는다

## 하지 않는 것

- 디자인 시스템을 자동으로 업데이트하지 않는다.
- `docs/design-reference/`의 문서를 고치지 않는다. 프로젝트에서 달리 정하려면 프로젝트의 규칙 파일에 적는다.
- 사용자가 요청하지 않은 기존 화면을 다시 디자인하지 않는다.
