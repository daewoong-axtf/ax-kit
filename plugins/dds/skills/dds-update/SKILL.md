---
name: dds-update
description: Daewoong Design System이 설치된 프로젝트(docs/design-system.md가 있는 프로젝트)를 새 판으로 올린다. 올릴 판의 저장소를 받아 그 판에 들어 있는 업데이트 절차(design-system/design/ai/update-prompt.md)를 그대로 따른다. 프로젝트에서 고치지 않은 파일은 바꾸고, 프로젝트에서 고친 파일을 새 판도 바꿨을 때만 묻는다. 사용자가 "디자인 시스템 새 버전으로 올려줘", "디자인 시스템 업데이트", "디자인 시스템 최신으로", "DDS 업그레이드", "DDS 1.6.0으로 올려줘", "upgrade the design system", "update DDS"라고 하면 이 스킬을 쓴다.
---

# dds-update

설치된 Daewoong Design System을 새 판으로 올린다. 업그레이드 절차는 이 스킬에 적지 않는다. 올릴 판에 함께 릴리즈된 업데이트 절차를 받아 그대로 따른다. 판마다 파일과 연결 방법이 달라서, 그 판을 아는 절차만 믿는다.

| 무엇 | 위치 |
| --- | --- |
| 저장소 | `https://github.com/daewoong-axtf/ax-kit.git` |
| 최신 판 | `https://daewoong-axtf.github.io/ax-kit/guides/index.json`의 `guides["design-system"].latest` |
| 업데이트 절차 | 받은 저장소의 `design-system/design/ai/update-prompt.md` |
| 프로젝트의 설치 기록 | `docs/design-system.md` |

태그 이름은 1.2.0까지 `v<판>`(`v1.0.0`~`v1.2.0`), 그 뒤로 `design-system-v<판>`이다.

## 순서

1. 프로젝트에 `docs/design-system.md`가 없으면 올릴 것이 없다. 처음 설정이라고 알리고 멈춘다. 설정은 `dds` 스킬("디자인 시스템 설정해줘")이 한다.
2. 올릴 판을 정한다.
   - 사용자가 버전을 말했으면 위 규칙으로 태그를 만든다(`1.6.0`은 `design-system-v1.6.0`). 태그나 `main` 같은 브랜치를 말했으면 그대로 쓴다.
   - 말하지 않았으면 `curl -fsSL https://daewoong-axtf.github.io/ax-kit/guides/index.json`의 `guides["design-system"].latest`로 태그 `design-system-v<latest>`를 만든다. 받지 못하면 `git ls-remote --tags https://github.com/daewoong-axtf/ax-kit.git "design-system-v*"`에서 가장 높은 판을 쓴다.
3. `docs/design-system.md`의 ref를 읽어 올릴 판과 비교한다. 같은 판이면(`v1.2.0`과 1.2.0처럼 버전이 같아도 같다) "이미 <판>이다"라고 알리고 멈춘다. 저장소는 받지 않는다. 어느 한쪽이 브랜치나 커밋 값이면 이 비교는 건너뛴다.
4. 그 판을 프로젝트 밖의 임시 폴더로 받는다.
   ```
   NEW=$(mktemp -d) && git clone --depth 1 --branch <태그> https://github.com/daewoong-axtf/ax-kit.git "$NEW"
   ```
5. 받은 폴더의 `design-system/design/ai/update-prompt.md`를 읽는다. 그 원문을 사용자가 붙여 넣은 요청으로 보고 처음부터 끝까지 그대로 따른다. 받은 임시 폴더는 절차의 NEW로 쓴다. 단계를 건너뛰거나 기억으로 대신하지 않는다.

## 멈출 때

어느 경우든 받은 임시 폴더(받다가 실패한 폴더 포함)는 지우고 멈춘다.

- 판을 정하지 못했거나 저장소를 받지 못했으면 이유를 알리고 멈춘다.
- 받은 판에 `design-system/design/ai/update-prompt.md`가 없으면 절차를 지어내지 않는다. 판을 말하지 않았으면 "최신 릴리즈 <판>에는 업데이트 절차가 없다. 절차는 1.5.0 다음 design-system 릴리즈부터 들어 있으니, 그 릴리즈가 나온 뒤 다시 실행해 달라"고 알리고 멈춘다. 사용자가 판을 말했으면 그 판에는 업데이트 절차가 없다고 알리고 멈춘다.

## 하지 않는 것

- 사용자가 올려 달라고 하지 않았는데 디자인 시스템을 올리지 않는다.
- 프로젝트에서 고친 파일을 묻지 않고 덮어쓰지 않는다.
- 사용자가 요청하지 않으면 커밋하거나 푸시하지 않는다.
