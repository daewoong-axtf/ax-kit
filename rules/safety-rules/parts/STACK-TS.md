# TypeScript + React(Next.js) 규칙

프론트엔드 코드(`package.json`이 있는 폴더)에 적용한다. 지향점: 화면만 담당하는 얇은 프론트엔드. 타입으로 오류를 미리 막고, 서버 컴포넌트를 기본으로 해 브라우저로 보내는 코드를 줄인다.

## TS-1. 버전과 도구

- Node.js 26 LTS를 쓰고 `package.json`의 `engines.node`와 `.nvmrc`에 패치까지 적는다.
- 패키지 매니저는 pnpm만 쓴다. pnpm 버전은 `package.json`의 `packageManager`(예: `pnpm@10.x.y`)에 패치까지 적고, `pnpm-lock.yaml`을 커밋한다. `package-lock.json`·`yarn.lock`이 있으면 pnpm으로 옮기고 지운다(`pnpm import`).
- `.npmrc`에 `save-exact=true`를 둔다. 버전에 `^`, `~`, `*`, `latest`를 쓰지 않는다.
- 자동·일괄 업그레이드(`pnpm update`, `pnpm audit --fix`)는 사용자 확인 없이 실행하지 않는다. 취약점 점검은 `pnpm audit`로 한다.
- lint·포맷은 Biome 하나로 한다. 설정은 `biome.json`. ESLint·Prettier 설정이 있으면 Biome으로 옮기고 지운다.
- `package.json`의 scripts 이름을 맞춘다. 에이전트는 `pnpm <이름>`으로 실행한다.
  - `dev`, `build`, `start`
  - `lint`: `biome check .`
  - `format`: `biome check --write .`
  - `typecheck`: `tsc --noEmit`
  - `test`: 단위 테스트, `test:e2e`: E2E 테스트

## TS-2. TypeScript

- 모든 코드는 `.ts`·`.tsx`로 쓴다. `.js`·`.jsx`는 TypeScript로 옮긴다.
- `tsconfig.json`에 `"strict": true`와 `"noUncheckedIndexedAccess": true`를 켠다.
- `any`, `as any`, `@ts-ignore`를 쓰지 않는다. 타입을 모르면 `unknown`으로 받고 검사해서 좁힌다.
- 백엔드 응답, 폼 입력, URL 파라미터처럼 밖에서 들어오는 값은 zod 스키마로 검증하고, 타입은 스키마에서 만든다(`z.infer`).
- 타입은 쓰는 곳 가까이에 두고, 여러 기능이 함께 쓰는 타입만 `src/types/`에 둔다.

## TS-3. 프로젝트 구조

템플릿이 없으면 아래 구조를 쓴다.

```txt
src/
  app/                 # 라우트: page.tsx, layout.tsx, loading.tsx, error.tsx
  components/ui/       # 버튼·입력창 같은 공용 기본 요소
  features/<기능>/      # 기능별 컴포넌트·훅·스키마
  lib/api/             # 백엔드 API 호출(이곳에서만 fetch)
  lib/                 # 공용 유틸
  types/               # 여러 기능이 함께 쓰는 타입
public/                # 정적 파일(실제 업무 데이터는 두지 않는다, 3번)
```

- 파일 이름은 컴포넌트·훅을 포함해 모두 kebab-case로 쓴다(`user-table.tsx`, `use-user-list.ts`, `format-date.ts`). 코드 안의 컴포넌트 이름은 PascalCase(`UserTable`), 훅 이름은 `use`로 시작(`useUserList`)한다. Next.js가 정한 파일 이름(`page.tsx` 등)은 그대로 둔다.
- 파일 하나에 export하는 컴포넌트는 하나다. 컴포넌트가 200줄을 넘으면 나눈다.
- import는 `@/` 경로 별칭을 쓴다. `../../../`처럼 깊은 상대 경로를 쓰지 않는다.

## TS-4. 아키텍처

- 프론트엔드는 화면과 백엔드 API 호출만 맡는다. DB 접근, 업무 로직, 비밀키가 필요한 외부 호출은 백엔드(PY·JV 규칙)에 둔다. 기존 코드가 Next.js 안에서 DB에 접근하거나 업무 로직을 처리하면 백엔드로 옮긴다(규격화 4단계).
- Route Handler(`app/api/`)와 Server Action은 백엔드 호출을 중계하거나 로그인 쿠키를 넘길 때만 쓴다.
- 백엔드 호출은 `src/lib/api/`에서만 한다. 컴포넌트에서 `fetch`를 직접 부르지 않는다. 응답은 TS-2의 스키마로 검증한다.
- 권한 판단을 프론트엔드에서 하지 않는다(10번). 메뉴·버튼을 숨기는 것은 편의일 뿐이다.
- 브라우저에 노출되는 환경 변수(`NEXT_PUBLIC_`로 시작)에는 비밀값을 넣지 않는다.

## TS-5. React·Next.js 작성 방식

- Next.js App Router(`app/`)를 쓴다. `pages/` 라우터에 새 코드를 쓰지 않고, 기존 `pages/`는 `app/`으로 옮긴다.
- 함수형 컴포넌트와 hooks만 쓴다. 클래스 컴포넌트는 함수형으로 바꾼다.
- 서버 컴포넌트가 기본이다. `'use client'`는 상태, 이벤트 처리, 브라우저 API가 필요한 가장 작은 컴포넌트에만 붙인다.
- 첫 화면에 필요한 데이터는 서버 컴포넌트에서 가져온다. `useEffect` 안에서 데이터를 가져오지 않는다.
- 서버에서 받은 데이터를 전역 상태에 복사해 두지 않는다. 전역 상태 라이브러리는 필요한 이유를 설명할 수 있을 때만 추가한다.
- 스타일링 방식은 템플릿을 따르고, 한 프로젝트에 두 가지 이상 섞지 않는다.
- `dangerouslySetInnerHTML`, `innerHTML`을 쓰지 않는다(9번).
- 경로마다 `loading.tsx`와 `error.tsx`를 둔다. `error.tsx`에는 오류 상세 대신 다시 시도 방법을 보여 준다(10번·14번).

## TS-6. 보안 헤더와 설정

- 보안 헤더(11번)는 `next.config.ts`의 `headers()`에서 모든 경로에 적용한다.
- `next.config.ts`에 `poweredByHeader: false`를 둔다.
- 외부 스크립트는 npm 패키지로 설치해 쓴다. 외부 URL에서 스크립트를 불러오지 않는다.

## TS-7. 테스트

- 단위 테스트는 Vitest + React Testing Library로, 파일은 대상 옆에 `*.test.ts(x)`로 둔다.
- 로그인·권한·핵심 흐름(15번)은 Playwright E2E 테스트로 `e2e/`에 둔다.
- 테스트가 없는 프로젝트의 스모크 테스트는 Playwright로 모든 경로를 열어 오류 없이 뜨는지 확인한다. 특성 테스트는 Vitest 스냅샷(`toMatchSnapshot`)으로 만든다. 백엔드 호출은 MSW로 가짜 응답을 준다.
- 시나리오(S-n)는 Playwright 테스트로 만들고 이름에 시나리오 ID를 넣는다(`test('S-01 ...')`). TDD 단위 테스트는 Vitest로 만든다.

## TS-8. 아키텍처 패턴과 리팩토링

『리팩터링』 2판의 예제가 JavaScript라 기법을 그대로 적용한다. 다만 React는 클래스 대신 함수와 합성으로 구조를 만들기 때문에 아래처럼 바꿔 적용한다.

| 층        | 위치                                                 | 역할                    |
| --------- | ---------------------------------------------------- | ----------------------- |
| 표현      | `app/`, `components/`, `features/<기능>/`의 컴포넌트 | 그리기만 한다           |
| 화면 로직 | `features/<기능>/`의 훅·순수 함수                    | 상태 관리, 데이터 가공  |
| Gateway   | `lib/api/`(TS-4)                                     | 백엔드 호출과 응답 검증 |

- 단계 쪼개기: 컴포넌트에서 데이터 가공과 렌더링이 섞여 있으면 "데이터 준비 순수 함수 → 렌더링"으로 나눈다. 순수 함수는 단위 테스트한다.
- 클래스 추출하기 → 컴포넌트 추출·커스텀 훅 추출로 적용한다. 상속 관련 기법(메서드 올리기, 슈퍼클래스 추출하기 등)은 쓰지 않고, 재사용은 props와 `children` 합성으로 한다.
- 조건부 로직을 다형성으로 바꾸기 → 판별 유니언 타입(`type` 필드)과 객체 맵으로 적용하고, `switch`에는 `never`로 빠진 경우를 검사한다.
- 기본형을 객체로 바꾸기 → 사번·금액·기간은 zod 스키마와 브랜드 타입(`z.string().brand<'EmployeeId'>()`)으로 만든다.
- 반복문을 파이프라인으로 바꾸기 → `map`·`filter`로 바꾼다. `reduce`가 읽기 어려워지면 `for...of`를 쓴다.
- 레코드 캡슐화하기·가변 데이터 → props와 상태는 `readonly`로 두고 직접 고치지 않는다. 새 값을 만들어 바꾼다.
- 특이 케이스 추가하기 → 데이터 없음·로딩·오류 처리는 null 검사를 흩뿌리지 않고 빈 상태 컴포넌트와 `loading.tsx`·`error.tsx`(TS-5)로 모은다.
