# rules/ — AI 코딩 규칙 원문

AI 코딩 도구에 넣어 쓰는 회사 규칙의 원문이다. 폴더 하나가 문서 하나이고, 문서마다 따로 버전을 매긴다.

| 폴더 | 문서 | 받는 파일 이름 | AX Desk |
| --- | --- | --- | --- |
| `safety-rules/` | AI로 만든 웹앱 최소 안전 규칙 | `daewoong-coding-guide.md` | 코딩 가이드 › 최소 안전 규칙 |

## 다른 서비스에서 받아 쓰기

규칙 원문은 GitHub Pages에 정적 파일로 올라가 있어 인증 없이 `GET` 요청으로 받는다. 다른 도메인의 브라우저에서도 받을 수 있다(`Access-Control-Allow-Origin: *`).

| 무엇 | 주소 | 응답 |
| --- | --- | --- |
| 최신 원문 | `https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/latest.md` | `text/markdown` |
| 판별 원문 | `https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/<버전>.md` | `text/markdown` |
| 버전 · 기준일 | `https://daewoong-axtf.github.io/ax-kit/guides/index.json` | `application/json` — `guides["safety-rules"]`의 `latest`, `versions[].updatedAt` · `path` |

```bash
curl https://daewoong-axtf.github.io/ax-kit/guides/index.json
curl https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/latest.md
```

- 릴리즈 뒤 Pages 게시에 1~2분, 응답 캐시(`Cache-Control: max-age=600`)로 최대 10분이 더 걸린다.
- 버전과 원문을 정확히 맞춰 보이려면 `index.json`을 먼저 받고 그 안의 `path`로 원문을 받는다. `latest.md`를 따로 받으면 릴리즈 직후 잠깐 버전이 어긋날 수 있다.
- 서버에서 받아 캐시하고, 받지 못하면 저장해 둔 사본을 보이는 것을 권한다. AX Desk가 이렇게 한다(5분 캐시).

## 고치는 법

1. 원문 파일을 고친다. 본문 첫머리의 `(vX.Y.Z)`와 `기준일`은 릴리즈 PR을 머지하기 전에 새 버전과 날짜로 맞춘다. AX Desk는 이 글 대신 태그의 버전과 날짜를 보인다.
2. 커밋 타입으로 버전이 정해진다.

   | 커밋 | 버전 | 예 |
   | --- | --- | --- |
   | `feat:` | 마이너 (1.0.0 → 1.1.0) | 규칙 추가, 규칙의 뜻이 바뀌는 변경 |
   | `fix:` | 패치 (1.0.0 → 1.0.1) | 문구 다듬기, 오탈자 |
   | `feat!:` | 메이저 (1.0.0 → 2.0.0) | 기존 규칙을 지우거나 뒤집는 변경 |
   | `docs:` · `chore:` | 릴리즈하지 않음 | 이 README 수정 등 |

3. `main`에 머지하면 release-please가 릴리즈 PR을 만든다. 그 PR을 머지하면 `safety-rules-vX.Y.Z` 태그가 붙고 게시물이 새로 올라간다.
4. AX Desk는 게시물을 5분마다 다시 읽는다. Pages 캐시까지 합쳐 머지 후 15분 안에 새 버전이 보인다. AX Desk를 다시 배포할 필요는 없다.

한 PR에서 `design-system/`과 `rules/`를 함께 고치면 두 폴더의 버전이 모두 오른다. 폴더별로 PR을 나눈다.
