# Tooltip

> 클래스 `.dw-tooltip` · 레퍼런스 [catalog.html#tooltip](../catalog.html#tooltip)

## 개요

아이콘 버튼처럼 라벨이 안 보이는 요소나 짧은 보충 설명을 마우스 올림·포커스·터치 탭 때 말풍선으로 보여준다.
**쓰지 말 것** — 꼭 읽어야 하는 정보(화면에 직접 쓰거나 Callout), 버튼·링크가 든 내용(Popover), 여러 문장의 정책·배경 안내([Info Tooltip](info-tooltip.md)).

## Anatomy

| 부위 | 클래스 | 필수 | 설명 |
| --- | --- | --- | --- |
| Trigger | (아무 포커스 가능한 요소) | ✓ | `aria-describedby="<tooltip id>"` |
| Content | `.dw-tooltip` | ✓ | `role="tooltip"`, 검은 말풍선 |
| Title | `.dw-tooltip__title` | | 굵게 |
| Description | `.dw-tooltip__description` | ✓ | |
| Arrow | `.dw-tooltip__arrow` | ✓ | Trigger를 가리키는 꼬리 |

```html
<button type="button" class="dw-button dw-button--ghost dw-button--icon-only" aria-label="공유"
        aria-describedby="tip-share" data-dw-tooltip="tip-share">…</button>
<div class="dw-tooltip" id="tip-share" role="tooltip" hidden>
  <p class="dw-tooltip__description">링크를 복사해 공유합니다</p>
  <svg class="dw-tooltip__arrow" viewBox="0 0 12 8" aria-hidden="true"><path d="M0 0h12L6 8z"/></svg>
</div>
```

## Properties

| 속성 | 값 | 기본값 | 표현 |
| --- | --- | --- | --- |
| placement | `top` · `bottom` · `left` · `right` | `top` | `data-placement` (공간이 부족하면 반대편) |
| title | 텍스트 | 없음 | Title 유무 |

## Specification

| 항목 | 값 |
| --- | --- |
| Content | bg `bg-neutral-solid`, padding 10px 12px (`x2_5` `x3`), radius 12px `r3`, **max-width 280px** |
| Body | 세로, gap 2px `x0_5`, `word-break: keep-all` |
| Title | t3 13/18 bold, `fg-on-neutral-solid` |
| Description | t3 13/18 regular, `fg-on-neutral-solid`, `white-space: pre-wrap` |
| Arrow | 12×8px 삼각형, fill `bg-neutral-solid`, Content 가장자리 가운데(Trigger 가운데를 가리키도록 이동) |
| 간격 | Trigger와 4px(꼬리 끝 기준) |
| 열기 | opacity 0→1 + scale 0.9→1, `duration-d4` `easing-enter`, 기준점 = 꼬리 위치 |
| 닫기 | opacity 1→0, `duration-d4` `easing-easing` |

## States

| 상태 | 트리거 | 변화 |
| --- | --- | --- |
| Hidden | — | `hidden` |
| Open | 정밀 포인터 hover **300ms** 유지 · 키보드 포커스(즉시) · 터치 탭(즉시) | 위 열기 모션 |
| Closed | 포인터 이탈(100ms 유예) · blur · Esc · (터치로 열었으면) 같은 Trigger 다시 탭 · 바깥 탭 | 위 닫기 모션 후 `hidden` |

한 Tooltip이 열린 상태에서 바로 옆 Trigger로 옮기면 대기 없이 즉시 바뀐다(`data-instant`, 모션 0s).

## Behavior & Accessibility

- WAI-ARIA APG Tooltip 패턴. Content는 `role="tooltip"`, Trigger에 `aria-describedby`.
- 포인터가 Trigger에서 Content로 옮겨 가도 닫히지 않는다(내용을 읽거나 복사할 수 있게).
- 포커스를 Tooltip 안으로 옮기지 않는다 — 그래서 안에 상호작용 요소를 두지 않는다.
- 아이콘 버튼의 이름은 Tooltip이 아니라 `aria-label`로 준다(Tooltip은 보충 설명).
- 터치에는 hover가 없으므로 탭으로 연다. Trigger 본래 동작(버튼 클릭)은 막지 않고 함께 일어난다. 그래서 Trigger를 눌렀을 때 바로 화면이 바뀌는 자리(페이지 이동 등)라면 Tooltip에 기대지 말고 라벨을 화면에 쓴다.
- 마우스 클릭으로는 열거나 닫지 않는다(hover가 이미 열었다).

| 키 | 동작 |
| --- | --- |
| Tab (Trigger로) | 열기 |
| Esc | 닫기 (포커스는 Trigger에 남음) |

## Responsive

| 너비 | 변화 |
| --- | --- |
| 터치 기기 | Trigger를 탭하면 열리고, 다시 탭하거나 바깥을 탭하면(스크롤 시작 포함) 닫힌다 |
| 전체 | 화면 가장자리에 닿으면 반대 방향 또는 안쪽으로 밀어 8px 여백 유지 |

## Do / Don't

- **Do** 한 문장 이내.
- **Don't** 비활성 버튼의 이유를 Tooltip으로만 알리지 않는다(포커스가 안 간다).
