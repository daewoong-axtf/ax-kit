# 최소 안전 규칙 받기 API

AI로 만든 웹앱 최소 안전 규칙 원문을 다른 서비스에서 받아 쓰는 방법이다. 원문은 릴리즈 때 GitHub Pages에 정적 파일로 올라간다(`scripts/build-site.ts`). 받는 쪽은 다시 배포하지 않아도 최신 판을 보인다.

| 항목 | 값 |
| --- | --- |
| Base URL | `https://daewoong-axtf.github.io/ax-kit` |
| 메서드 | `GET`만 |
| 인증 | 없음 |
| CORS | `Access-Control-Allow-Origin: *` (다른 도메인의 브라우저에서도 부를 수 있다) |
| 캐시 | `Cache-Control: max-age=600`. 릴리즈 뒤 Pages 게시에 1~2분, 캐시로 최대 10분이 더 걸린다 |

## 1. 판 목록 조회

### Request

```http
GET /ax-kit/guides/index.json HTTP/1.1
Host: daewoong-axtf.github.io
```

### Response `200 OK`

`Content-Type: application/json; charset=utf-8`

```json
{
  "guides": {
    "safety-rules": {
      "fileName": "daewoong-coding-guide.md",
      "latest": "1.1.0",
      "versions": [
        { "version": "1.1.0", "updatedAt": "2026-11-19", "path": "guides/safety-rules/1.1.0.md" },
        { "version": "1.0.0", "updatedAt": "2026-11-05", "path": "guides/safety-rules/1.0.0.md" }
      ]
    },
    "design-system": { "...": "디자인 시스템은 design-system/API.md" }
  }
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `guides["safety-rules"].fileName` | string | 받기(다운로드) 때 쓸 파일 이름 |
| `guides["safety-rules"].latest` | string | 최신 판. `x.y.z` |
| `versions[]` | array | 모든 판. 새 판이 앞에 온다 |
| `versions[].version` | string | 판. `x.y.z` (태그 `safety-rules-vX.Y.Z`에서 읽는다) |
| `versions[].updatedAt` | string | 기준일. `YYYY-MM-DD` (태그 날짜, 한국 시간) |
| `versions[].path` | string | 원문 경로. Base URL 뒤에 붙여 2번으로 받는다 |

## 2. 원문 조회

### Request

```http
GET /ax-kit/guides/safety-rules/{version}.md HTTP/1.1
Host: daewoong-axtf.github.io
```

| 경로 변수 | 설명 |
| --- | --- |
| `version` | 1번의 `latest`. 판을 고정하려면 `versions[].version` 중 하나. `latest`라고 적으면 최신 판이 온다(`latest.md`) |

### Response `200 OK`

`Content-Type: text/markdown; charset=utf-8`

```markdown
# AI로 만든 웹앱 최소 안전 규칙 (v1.1.0)

- 제공: AXTF
- 기준일: 2026-11-19
...(원문 전체)
```

한 번 올린 판(`<버전>.md`)은 바뀌지 않는다. `latest.md`만 릴리즈 때 바뀐다.

## 오류

| 상태 | 언제 | 받는 쪽 처리 |
| --- | --- | --- |
| `404 Not Found` | 없는 판, 잘못된 경로 | 저장해 둔 사본을 보인다 |
| 시간 초과 · 네트워크 오류 | Pages 장애 | 저장해 둔 사본을 보인다 |

## 호출 예시

```bash
curl https://daewoong-axtf.github.io/ax-kit/guides/index.json
curl https://daewoong-axtf.github.io/ax-kit/guides/safety-rules/1.1.0.md
```

```ts
const BASE = "https://daewoong-axtf.github.io/ax-kit";

async function getSafetyRules() {
  const opts = { signal: AbortSignal.timeout(5000) };

  // 1. 판 목록 조회
  const index = await (await fetch(`${BASE}/guides/index.json`, opts)).json();
  const entry = index.guides["safety-rules"];
  const latest = entry.versions.find((v) => v.version === entry.latest);

  // 2. 원문 조회
  const markdown = await (await fetch(`${BASE}/${latest.path}`, opts)).text();

  return { markdown, version: latest.version, updatedAt: latest.updatedAt, fileName: entry.fileName };
}
```

## 받아 쓸 때 지킬 것

- **1번을 먼저 받고 그 `path`로 원문을 받는다.** `latest.md`를 따로 받으면 릴리즈 직후 잠깐 판과 원문이 어긋날 수 있다.
- **버전 · 기준일은 1번 값을 보인다.** 원문 첫머리의 `(vX.Y.Z)` · `기준일` 글이 아니라 태그 값이 정본이다.
- **서버에서 받아 캐시한다.** 5분이면 충분하다. 화면을 열 때마다 부르지 않는다.
- **받지 못하면 저장해 둔 사본을 보인다.** 실패한 결과는 짧게(1분쯤) 캐시해 곧 다시 받는다.

참고 구현: AX Desk 프론트엔드 `lib/guide/remote.ts`(받기 · 형식 검사)와 `lib/guide/content.ts`(5분 캐시, 실패하면 사본).
