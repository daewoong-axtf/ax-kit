# 콘텐츠·국제화 가이드

> 텍스트·숫자·날짜 포맷과 다국어 대응 규칙을 정한다.
>
> 기본안이다. 서비스 성격에 맞게 고쳐 쓴다.

## 1. 기준 언어

- 기준 언어는 한국어다. 영어를 함께 지원한다.
- 컴포넌트가 만드는 문구는 코드에 박지 않고 [`messages.json`](../messages.json)에 한국어·영어를 함께 둔다(5장).

## 2. 날짜·시간

| 항목 | 포맷 | 예 (한국어) | 예 (영어) |
| --- | --- | --- | --- |
| 날짜 | YYYY년 M월 D일 (요일) · 영어 `MMMM d, yyyy (EEE)` | 2026년 9월 20일 (일) | September 20, 2026 (Sun) |
| 짧은 날짜 | M.D | 5.20 | 5.20 |
| 시간 | 24시간제 HH:mm | 10:00, 18:30 | 10:00, 18:30 |
| 기간 | `~`로 연결 | 2026.05.01 ~ 05.31 | 2026.05.01 ~ 05.31 |
| 소요 시간 | N분 | 25분, 50분 | 25 min, 50 min |
| 상대 시간 | N분 전, N일 전 | 30분 전 | 30 min ago |

한 서비스 안에서 날짜 포맷을 섞지 않는다. 영어에서도 시간은 24시간제를 쓴다.

## 3. 숫자·통화

| 항목 | 표현 |
| --- | --- |
| 천 단위 | 콤마 — 550,000 |
| 통화 | 기호를 앞에 — ₩550,000 |
| 수량 | 단위를 붙인다 — 잔여 8개, 3명 / 8명 |
| 비율 | 78% |

- 시간·숫자는 자릿수가 맞도록 고정폭 숫자(`font-variant-numeric: tabular-nums`)로 표시한다. CSS가 없는 환경은 서체의 고정폭 숫자 기능을 쓴다.

## 4. 텍스트 길이 대응

- 라벨은 문구 길이가 바뀌어도 깨지지 않게 둔다. 고정 폭으로 텍스트를 자르지 않고 최소 폭으로 여유를 둔다.
- 영어로 바꾸면 한국어보다 길어질 수 있다.
- 말줄임은 제목과 1줄 메타 정보에만 쓴다. 본문에는 쓰지 않는다.
- 강제 한 줄(`white-space: nowrap`)은 짧은 라벨에만 쓴다. [Button](../components/button.md) 라벨은 한 줄이므로 길면 문구를 줄인다.

## 5. 다국어 전환

- 컴포넌트가 만드는 문구는 키-값 표로 분리한다. 정본은 [`messages.json`](../messages.json)이고 형식은 `{ 키: { ko, en } }`다. 한국어와 영어의 `{name}` 자리표시는 같아야 한다.
- 날짜·숫자·통화는 각 언어의 로케일 포맷 기능으로 만든다. 문자열을 직접 이어 붙이지 않는다.
- RTL(아랍어 등)은 범위 밖이다.
- 서체는 `--dw-font-sans` 시스템 스택을 그대로 쓴다. 라틴 문자가 포함돼 있어 언어별 서체를 따로 싣지 않아도 된다([design.md 3.1](../design.md#31-서체)).

### 5.1 문구 표 고치기

`messages.json`을 고치고 `pnpm build`를 돌린다. 생성되는 곳은 React용 `src/lib/dw-messages.ts`와 동작 스크립트 `js/components.ts`의 `MESSAGES` 구역이다. `pnpm build:messages`만 돌리면 브라우저가 읽는 `js/components.js`가 이전 문구로 남는다. 이 파일은 `pnpm build:catalog`가 만든다. 테스트가 모든 키에 `ko`·`en`이 있는지, 자리표시가 같은지, 컴포넌트와 스크립트에 문구가 직접 적혀 있지 않은지, 생성 파일이 최신인지 본다.

### 5.2 React

`DwLocaleProvider`로 감싸면 `src/components/ui`의 컴포넌트가 그 언어의 문구를 쓴다. Provider가 없으면 한국어다.

```tsx
import { DwLocaleProvider } from '@/lib/dw-locale'

<DwLocaleProvider locale="en">{children}</DwLocaleProvider>
```

| 속성 | 내용 |
| --- | --- |
| `locale` | `'ko'` · `'en'`. `en-US`처럼 `en`으로 시작하는 값은 `'en'`, 그 밖의 값(`ja` 등)은 `'ko'`로 맞춘다. 안 주면 바깥 Provider 값, 없으면 `'ko'` |
| `messages` | 키별로 덮어쓸 문구. 표에 없는 키는 `locale`의 표를 쓴다 |
| `dateLocale` | date-fns `Locale`. 달력과 날짜 선택기의 월·요일 이름에 쓴다 |

- Provider를 중첩하면 안쪽이 지정한 값만 바깥을 덮는다. `messages`는 바깥 것 위에 쌓인다.
- `messages` 표는 컴포넌트 **바깥**에 상수로 둔다. 렌더 안에서 `messages={{ ... }}`처럼 새 객체를 만들면 그릴 때마다 값이 바뀌어 문구를 쓰는 컴포넌트가 모두 다시 그려진다.
- Provider는 `<html lang>`을 바꾸지 않는다. 화면 읽기 프로그램이 맞는 언어로 읽도록 앱이 `<html lang="en">`을 직접 맞춘다(Next.js는 `app/layout.tsx`).
- 컴포넌트에 문구 props가 있으면(예: Async Combobox의 `messages`) 그 값이 Provider보다 우선한다.
- 컴포넌트를 직접 만들 때는 `useDwMessages()`로 문구를 읽는다. `useDwLocale()`은 `{ locale, dateLocale }`을 준다 — `dateLocale`은 Provider가 넘긴 값이고 안 넘겼으면 `undefined`다. 날짜 기본값(로케일과 표기 형식)은 `src/lib/dw-date.ts`의 `useDwDate()`가 `{ dateLocale, dateFormat }`으로 준다. 표기 형식은 한국어 `yyyy년 M월 d일 (EEE)`, 영어 `MMMM d, yyyy (EEE)`다. `dw-locale.tsx`는 `date-fns`를 쓰지 않고, `dw-date.ts`만 `date-fns`를 쓴다.
- `dateLocale`은 함수를 담은 객체라 서버 컴포넌트(`app/layout.tsx` 등)에서 Provider로 바로 넘길 수 없다. Provider를 감싸는 작은 클라이언트 컴포넌트를 만들어 그 안에서 넘긴다.

```tsx
// app/dw-provider.tsx
'use client'
import { ja } from 'date-fns/locale'
import { DwLocaleProvider, type DwMessages } from '@/lib/dw-locale'

const messages: DwMessages = { 'common.close': '閉じる' } // 컴포넌트 바깥에 둔다

export function DwProvider({ children }: { children: React.ReactNode }) {
  return <DwLocaleProvider locale="ko" messages={messages} dateLocale={ja}>{children}</DwLocaleProvider>
}
```

```tsx
const t = useDwMessages()
t('common.close')                    // '닫기' · 'Close'
t('filter.applied', { count: 2 })    // '조회 조건 — 2개 적용됨' · 'Filters — 2 applied'
```

### 5.3 서버 템플릿 웹

`components.js`는 `<html lang>`을 읽는다. 값이 `en`으로 시작하면(대소문자 무관) 영어, 그 밖의 값은 한국어다. 한국어 화면이면 `<html lang="ko">`인지 먼저 확인한다. 템플릿에 처음부터 있던 `lang="en"`이 남아 있으면 스크립트 문구가 영어로 나온다. 문구를 만드는 때마다 읽으므로 `lang`을 바꾼 뒤에 만드는 문구부터 바뀐다.

```html
<html lang="en">
```

문구 우선순위는 높은 순서대로 다음과 같다.

1. 요소의 속성 — `data-label-*`·`data-msg-*`·`data-text-*` (예: `data-label-prev`, `data-msg-empty`, `data-text-offline`). 그 요소만 바꾼다.
2. 페이지 전체의 덮어쓰기 — `window.dwMessages`로 넘긴 표, 그 위에 `window.dw.setMessages`로 더한 표. 키는 `messages.json`의 키다.
3. `messages.json`의 기본 표

문구를 덮어쓰거나 다른 언어를 붙이는 권장 방법은 `window.dwMessages`다. `components.js`는 `defer`로 불러 나중에 실행되므로, 표를 담은 스크립트를 `components.js` 태그 **앞**에 둔다. 스크립트가 시작할 때 이 표를 읽으므로 처음 그리는 문구(Calendar 헤더 등)도 바뀐다.

```html
<script>
  window.dwMessages = { 'pagination.next': 'Go to next page' }
</script>
<script src="/design/js/components.js" defer></script>
```

`window.dw.setMessages({ 키: '문구' })`는 실행 중에 문구를 바꾸는 방법이다. `components.js`가 실행된 뒤에만 쓸 수 있고(그전에는 `window.dw`가 없어 오류가 난다), 호출 뒤에 만드는 문구에만 적용된다. 이미 그려진 문구(예: Calendar 헤더)는 바뀌지 않는다. `dwMessages` 위에 덮어쓴다.

**스크립트가 만드는 문구와 마크업에 적힌 문구는 다르다.** 스크립트는 접근 가능한 이름·안내·상태처럼 동작 중에 만드는 문구만 언어에 맞춘다. 마크업에 이미 적힌 문구(버튼 라벨, 제목, 본문)는 스크립트가 바꾸지 않는다. 서버 템플릿이 `lang`에 맞게 번역해서 내려준다. 카탈로그 [`catalog.en.html`](../catalog.en.html)이 영어 마크업의 예시다.

### 5.4 다른 언어

DDS는 한국어·영어만 담는다. 다른 언어는 프로젝트가 자기 표를 넘긴다.

- React: `<DwLocaleProvider locale="en" messages={...} dateLocale={ja}>`처럼 `messages`와 `dateLocale`을 넘긴다. 빠진 키는 `locale`의 표로 채워진다. 날짜 표기 패턴은 `locale`(`ko`·`en`)의 것을 따르고 `dateLocale`은 월·요일 이름만 바꾼다. `dateLocale`은 서버 컴포넌트에서 넘길 수 없으므로 5.2의 예처럼 클라이언트 컴포넌트 안에서 Provider를 둔다. `messages` 표는 컴포넌트 바깥에 둔다.
- 서버 템플릿 웹: `components.js` 앞에서 `window.dwMessages = {...}`로 표를 넘긴다. 영어가 아닌 `lang`은 기본 표가 한국어이므로 모든 키를 덮어쓴다.

### 5.5 카탈로그 번역

[`catalog.html`](../catalog.html)은 한국어 원본이고 [`catalog.en.html`](../catalog.en.html)은 생성 파일이다. 번역표는 [`catalog.en.json`](../catalog.en.json)이다.

1. `catalog.html`의 한국어를 고친다.
2. `catalog.en.json`에 영어를 더한다. 키는 한국어 단위 그대로, 값은 영어다. 같은 한국어가 절마다 다르게 옮겨져야 하면 `"<절 id>::<한국어>"`로 적는다.
3. `pnpm build:catalog`를 돌린다.

`node scripts/build-catalog.ts --missing [절 id…]`가 번역표에 없는 단위를 JSON으로 보여 준다. 번역 단위 규칙은 DDS 저장소의 `design-system/scripts/translate-catalog.ts` 머리의 주석과 `design-system/scripts/build-catalog.ts` 머리의 형식 설명에 있다. 번역표에 없는 단위, 쓰이지 않는 항목, 영어판에 남은 한글은 테스트가 실패시킨다. 컴포넌트 문구와 같은 말은 `messages.json`의 영어와 맞춰야 한다.

설정 프롬프트(원문 [`ai/setup-prompt.md`](../ai/setup-prompt.md))와 업데이트 기록 목록은 번역하지 않는다. 둘 다 릴리즈 때마다 바뀌기 때문이다. 영어판에서는 `lang="ko"`를 붙여 한국어로 둔다.

### 5.6 영어 문구 기준

- 문장형 대소문자(Sentence case)로 쓴다. 첫 낱말과 고유명사만 대문자다. 예: `Save changes`.
- 버튼은 동사로 시작한다. 예: `Apply`, `Try again`.
- 끝에 마침표를 붙이지 않는다. 문장이 둘 이상이면 문장마다 붙인다.
- 숫자에 따라 모양이 바뀌는 문구를 쓰지 않는다. 단수·복수가 갈리면 `{count} items`처럼 낱말이 같게 쓴다.
- 바뀌는 값은 `{name}` 자리표시로 둔다. 문자열을 이어 붙이지 않는다.

### 5.7 알려진 한계

- 동작 스크립트가 이미 그린 Calendar는 `lang`이 실행 중에 바뀌어도 라벨이 바뀌지 않는다. 헤더를 처음 만들 때 한 번 그리기 때문이다. 영어로 시작하는 페이지는 영어로 그려진다.
- Base UI Combobox가 만드는 숨은 버튼의 접근 가능한 이름 `Dismiss`는 라이브러리에 박혀 있고 바꿀 방법이 없다. 한국어 페이지에서도 영어로 남는다.
- Time Picker는 브라우저의 시간 입력(`input[type=time]`)이다. 칸의 표시와 읽는 이름은 페이지 언어가 아니라 브라우저·OS 언어를 따른다.
- `DwLocaleProvider`의 `dateLocale`은 서버 컴포넌트에서 넘길 수 없다. 함수를 담은 객체이기 때문이다. 클라이언트 컴포넌트 안에서 넘긴다(5.2).
- 카탈로그 영어판 [`catalog.en.html`](../catalog.en.html)의 설정 프롬프트와 업데이트 기록 목록은 한국어다(5.5).
- 날짜 형식은 `messages.json`에 없다. React는 date-fns로 `dw-date.ts`의 언어별 패턴(영어 `MMMM d, yyyy (EEE)`)을 쓰고, 스크립트는 `Intl.DateTimeFormat`(`dateStyle: 'long'`과 요일)을 쓴다. 둘 다 영어는 `September 20, 2026 (Sun)`로 나온다. Calendar와 Date Picker의 스크립트는 `data-locale` 속성을 우선하고 없으면 `<html lang>`을 쓴다.
- `window.dw.setMessages`는 `components.js`가 실행된 뒤에만 쓸 수 있고 이미 그려진 문구는 바꾸지 못한다. 처음 그리는 문구는 `window.dwMessages`로 넘긴다(5.3).
- 한국어·영어가 아닌 언어는 DDS가 표를 싣지 않는다(5.4).

구현 방법은 [design.md 14장](../design.md#14-환경별-적용)을 따른다.

## 6. Do / Don't

- **Do** 24시간제와 고정폭 숫자를 쓴다.
- **Do** 금액에 천 단위 콤마와 ₩ 기호를 쓴다.
- **Do** 텍스트 길이 변화에 여유를 둔다.
- **Do** 상태 용어를 통일한다([ux-writing.md 4장](ux-writing.md#4-상태-용어)).
- **Don't** 12시간제(AM/PM)를 섞지 않는다.
- **Don't** 고정 폭으로 텍스트를 자르지 않는다.
- **Don't** 날짜 포맷을 섞지 않는다(5/20, 5.20, 05-20).
- **Don't** 본문에 말줄임을 쓰지 않는다.
