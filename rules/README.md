# rules/ — AI 코딩 규칙 원문

AI 코딩 도구에 넣어 쓰는 회사 규칙의 원문이다. 폴더 하나가 문서 하나이고, 문서마다 따로 버전을 매긴다.

처음이면 [폴더 구성](#폴더-구성)과 [고치고 배포하기](#고치고-배포하기)만 읽으면 된다.

| 폴더 | 문서 | 받는 파일 이름 | AX Desk |
| --- | --- | --- | --- |
| `safety-rules/` | AI로 만든 웹앱 최소 안전 규칙 | `daewoong-coding-guide.md` | 코딩 가이드 › 최소 안전 규칙 |

## 다른 서비스에서 받아 쓰기

규칙 원문은 GitHub Pages에 정적 파일로 올라가 있어 인증 없이 `GET` 요청으로 받는다. 다른 도메인의 브라우저에서도 받을 수 있다(`Access-Control-Allow-Origin: *`).

| 무엇 | 주소 | 응답 |
| --- | --- | --- |
| 최신 원문 | `https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/latest.md` | `text/markdown` |
| 판별 원문 | `https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/<버전>.md` | `text/markdown` |
| 조각 | `https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/<버전>/<조각>.md` | `text/markdown` — `SECURITY.md` · `COMMIT.md` 등. `<버전>` 자리에 `latest`도 된다 |
| 버전 · 기준일 · 조각 목록 | `https://daewoong-axtf.github.io/ax-kit/guides/index.json` | `application/json` — `guides["safety-rules"]`의 `latest`, `versions[].updatedAt` · `path` · `files` |

```bash
curl https://daewoong-axtf.github.io/ax-kit/guides/index.json
curl https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/latest.md
```

- 릴리즈 뒤 Pages 게시에 1~2분, 응답 캐시(`Cache-Control: max-age=600`)로 최대 10분이 더 걸린다.
- 버전과 원문을 정확히 맞춰 보이려면 `index.json`을 먼저 받고 그 안의 `path`로 원문을 받는다. `latest.md`를 따로 받으면 릴리즈 직후 잠깐 버전이 어긋날 수 있다.
- 서버에서 받아 캐시하고, 받지 못하면 저장해 둔 사본을 보이는 것을 권한다. AX Desk가 이렇게 한다(5분 캐시).

요청 · 응답 형식과 호출 예시는 [safety-rules/API.md](safety-rules/API.md).

## 폴더 구성

```
rules/safety-rules/
  parts/                      정본. 규칙은 여기서만 고친다
    WORKFLOW.md               작업 방식 — 적용 대상과 기술 스택, 스택 판별, AX 검사와 핸드오프, 개발 순서
    SECURITY.md               공통 규칙 1~17번
    COMMIT.md                 커밋 규칙
    STACK-TS.md               TypeScript + React(Next.js) 규칙 (TS-1~TS-8)
    STACK-PY.md               Python + FastAPI 규칙 (PY-1~PY-8)
    STACK-JV.md               Java·Kotlin + Spring Boot 규칙 (JV-1~JV-8)
  daewoong-coding-guide.md    통합본. 조각을 위 순서로 합친 생성 파일 — 직접 고치지 않는다
  version.txt                 지금 버전. release-please가 올린다 — 직접 고치지 않는다
  CHANGELOG.md                변경 기록. release-please가 쓴다 — 직접 고치지 않는다
  API.md                      다른 서비스에서 받아 쓰는 방법
```

- **통합본**은 현업이 AX Desk에서 한 번에 복사하거나 파일로 받는 원페이지다.
- **조각**은 앱 저장소에 파일을 나눠 넣는 서비스(AppHub)가 받아 쓴다.
- 둘은 같은 내용이고 버전도 하나다(`safety-rules-vX.Y.Z`). 조각마다 따로 버전을 매기지 않는다.

## 고치고 배포하기

사람이 하는 일은 **1 · 2 · 4번**뿐이다. 나머지는 자동이다.

```
1. parts/ 의 조각을 고친다
2. 커밋 → PR → main에 머지        커밋할 때 통합본이 자동으로 다시 만들어진다
3. (자동) 릴리즈 PR이 생긴다       새 버전 · 변경 기록 · 통합본의 버전과 기준일이 들어 있다
4. 릴리즈 PR을 확인하고 머지
5. (자동) 태그 safety-rules-vX.Y.Z → Pages 게시 → 15분 안에 AX Desk에 새 판이 보인다
```

### 1. 조각을 고친다

`parts/` 안의 파일만 고친다. `daewoong-coding-guide.md`를 직접 고치면 다음 빌드에서 지워진다.

- 다른 조각의 내용을 가리킬 때는 파일 이름을 쓰지 않는다. 규칙 번호(`10번`, `TS-1`)나 절 이름(`"스택 판별"`)으로 쓴다. 통합본에서도 조각에서도 통하는 말이어야 한다.
- 버전과 기준일은 조각에 적지 않는다. 빌드가 통합본 첫머리에 찍는다.
- 조각을 더하거나 이름을 바꾸면 `scripts/build-rules.ts`의 `PARTS`(합치는 순서, 통합본 첫머리 표)도 고친다.

### 2. 커밋하고 main에 머지한다

커밋하면 훅(`.husky/pre-commit`)이 통합본을 다시 만들어 같은 커밋에 넣는다. 훅이 돌지 않는 환경(GitHub 웹 편집 등)이면 직접 돌린다.

```bash
pnpm build:rules   # parts/ → daewoong-coding-guide.md
pnpm test          # 통합본이 조각과 어긋나면 여기서 실패한다
```

**커밋 타입이 버전을 정한다.** 규칙 문장을 고쳤는데 `docs:`로 커밋하면 릴리즈되지 않는다.

| 커밋 | 버전 | 예 |
| --- | --- | --- |
| `feat:` | 마이너 (1.0.0 → 1.1.0) | 규칙 추가, 규칙의 뜻이 바뀌는 변경 |
| `fix:` | 패치 (1.0.0 → 1.0.1) | 문구 다듬기, 오탈자 |
| `feat!:` | 메이저 (1.0.0 → 2.0.0) | 기존 규칙을 지우거나 뒤집는 변경 |
| `docs:` · `chore:` | 릴리즈하지 않음 | 이 README, `API.md`, 빌드 스크립트 수정 |

한 PR에서 `design-system/`과 `rules/`를 함께 고치면 두 폴더의 버전이 모두 오른다. 폴더별로 PR을 나눈다.

### 3. 릴리즈 PR이 생긴다 (자동)

`main`에 머지하면 release-please가 `chore: safety-rules X.Y.Z 릴리즈` PR을 만든다. 이미 열려 있으면 갱신한다. 이어서 워크플로(`prepare-rules-pr`)가 통합본 첫머리의 `(vX.Y.Z)`와 `기준일`을 새 값으로 바꿔 같은 PR에 커밋한다. 손으로 고칠 것은 없다.

### 4. 릴리즈 PR을 머지한다

PR에서 아래를 확인하고 머지한다. 여러 변경을 모아 한 번에 내보내려면 머지하지 않고 두면 된다. `main`에 변경이 쌓일 때마다 PR이 갱신된다.

- 버전이 뜻한 대로 올랐는가 (`version.txt`)
- `CHANGELOG.md`에 이번 변경이 적혔는가
- `daewoong-coding-guide.md` 첫머리가 새 버전인가 — 워크플로의 "릴리즈 준비" 커밋이 붙은 뒤에 머지한다

### 5. 게시된다 (자동)

`safety-rules-vX.Y.Z` 태그와 GitHub Release가 생기고 Pages에 통합본과 조각이 올라간다. AX Desk는 게시물을 5분마다 다시 읽는다. Pages 캐시까지 합쳐 머지 후 15분 안에 새 버전이 보인다. AX Desk를 다시 배포할 필요는 없다.

```bash
curl https://daewoong-axtf.github.io/ax-kit/guides/index.json   # latest가 새 버전인지 확인
```

### 막혔을 때

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `pnpm test`가 "통합본은 조각을 합친 결과와 같다"에서 실패 | 조각만 고치고 통합본을 다시 만들지 않았다 | `pnpm build:rules` 뒤 통합본을 함께 커밋 |
| `main`에서 "통합본의 버전은 version.txt와 같다"가 실패하고 태그가 생기지 않음 | "릴리즈 준비" 커밋이 붙기 전에 릴리즈 PR을 머지했다 | `main`에서 `pnpm build:rules` 뒤 `chore:`로 커밋해 올리면 릴리즈가 이어진다 |
| 머지했는데 릴리즈 PR이 생기지 않음 | 커밋 타입이 `docs:` · `chore:`이거나 `rules/safety-rules/` 밖만 고쳤다 | `feat:` · `fix:` 커밋으로 조각을 고친다 |
| 릴리즈했는데 AX Desk에 옛 판이 보임 | 캐시(최대 15분) | 기다린다. 그래도 그대로면 Actions의 Pages 워크플로가 성공했는지 본다 |
