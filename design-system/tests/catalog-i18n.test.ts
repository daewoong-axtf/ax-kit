import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalog, catalogUnits, translateCatalog, type CatalogUnit } from '../scripts/build-catalog.ts'
import { addHistory } from '../scripts/prepare-release.ts'

const read = (p: string): string => readFileSync(new URL(`../design/${p}`, import.meta.url), 'utf8')
const unit = (section: string, kind: CatalogUnit['kind'], ko: string): CatalogUnit => ({ section, kind, ko })

test('units: text, attr, block and script are extracted in document order', () => {
  const html = `<section class="demo" id="s1">
  <h2>Button <a href="b.md">명세</a></h2>
  <p>웹은 <code>a</code>를 먼저 연결한다.</p>
  <button class="dw-button" type="button" aria-label="닫기"><svg aria-hidden="true"><use href="#i-x"/></svg><span>닫기 버튼</span></button>
  <label>이름</label>
  <input placeholder="입력" value="값" data-label-next="다음 달" data-value="seoul">
  <img alt="로고" title="회사 로고" src="a.png">
  <script>
    // 주석 한글
    const a = '사과' /* 주석 */
    const b = "배"
    const c = \`<b>\${x}</b> 개\`
    const d = 'apple'
  </script>
</section>
<p>바깥</p>`
  assert.deepEqual(catalogUnits(html), [
    unit('s1', 'block', 'Button <a href="b.md">명세</a>'),
    unit('s1', 'block', '웹은 <code>a</code>를 먼저 연결한다.'),
    unit('s1', 'attr', '닫기'),
    unit('s1', 'text', '닫기 버튼'),
    unit('s1', 'text', '이름'),
    unit('s1', 'attr', '입력'),
    unit('s1', 'attr', '값'),
    unit('s1', 'attr', '다음 달'),
    unit('s1', 'attr', '로고'),
    unit('s1', 'attr', '회사 로고'),
    unit('s1', 'script', '사과'),
    unit('s1', 'script', '배'),
    unit('s1', 'script', '<b>${x}</b> 개'),
    unit('page', 'text', '바깥'),
  ])
})

test('units: data-q, style, comments, class, id, ICONS region and lang-marked elements are skipped', () => {
  const html = `<html lang="ko"><head><title>제목</title><meta name="description" content="설명">
<style>.a::after { content: "한글" }</style></head><body>
<!--ICONS:start--><svg><symbol id="i-x"><title>아이콘</title></symbol></svg><!--ICONS:end-->
<!-- 주석 한글 -->
<a href="#x" data-q="검색 별칭 alias" class="한글" id="한글">Button</a>
<a href="catalog.en.html" hreflang="en" lang="en" id="lang">English</a>
<p lang="ko">한국어 그대로</p>
</body></html>`
  assert.deepEqual(catalogUnits(html), [unit('page', 'text', '제목'), unit('page', 'attr', '설명')])
})

test('units: the AI_PROMPT region and the release history list stay Korean and get lang="ko"', () => {
  const html = `<html lang="ko"><body><pre aria-label="프롬프트"><!--AI_PROMPT:start-->설정해줘
1. 확인해줘<!--AI_PROMPT:end--></pre>
<section class="page-history" aria-labelledby="t"><h2 id="t">업데이트 기록</h2>
<ol>
<li><p><strong>v1.0.0</strong></p><p>첫 공개.</p></li>
</ol></section></body></html>`
  assert.deepEqual(catalogUnits(html), [unit('page', 'attr', '프롬프트'), unit('page', 'text', '업데이트 기록')])
  const { html: en, missing } = translateCatalog(html, { 프롬프트: 'Prompt', '업데이트 기록': 'Release notes' })
  assert.deepEqual(missing, [])
  assert.equal(en, `<html lang="en"><body><pre aria-label="Prompt"><!--AI_PROMPT:start--><span lang="ko">설정해줘
1. 확인해줘</span><!--AI_PROMPT:end--></pre>
<section class="page-history" aria-labelledby="t"><h2 id="t">Release notes</h2>
<ol lang="ko">
<li><p><strong>v1.0.0</strong></p><p>첫 공개.</p></li>
</ol></section></body></html>`)
})

test('units: a lone inline wrapper or a control with an icon is not a block', () => {
  const html = `<ul><li><a href="#a">설정</a></li></ul>
<button type="button"><svg aria-hidden="true"><use href="#i-plus"/></svg><span class="label">추가</span></button>
<p><strong>화면을 기획할 때</strong> 쓸 수 있는 버튼</p>
<p>줄<br>바꿈</p>`
  assert.deepEqual(catalogUnits(html), [
    unit('page', 'text', '설정'),
    unit('page', 'text', '추가'),
    unit('page', 'block', '<strong>화면을 기획할 때</strong> 쓸 수 있는 버튼'),
    unit('page', 'block', '줄<br>바꿈'),
  ])
})

test('units: attributes inside a block belong to the block', () => {
  assert.deepEqual(catalogUnits('<p>보기 <a href="#" title="제목">링크</a></p>'), [unit('page', 'block', '보기 <a href="#" title="제목">링크</a>')])
})

test('units: event handler attributes give script units', () => {
  const html = `<form aria-label="검색" onsubmit="event.preventDefault(); this.x.textContent = q ? '조회: ' + q : '조회: 전체'"></form>`
  assert.deepEqual(catalogUnits(html), [unit('page', 'attr', '검색'), unit('page', 'script', '조회: '), unit('page', 'script', '조회: 전체')])
})

test('units: regex literals and nested templates do not confuse the script scanner', () => {
  const html = `<script>
  const re = /'"\`/g, n = 4 / 2 / 1
  const t = \`a \${f(\`\${y}\`)} b\`
  const k = \`\${list.map((x) => \`<li>\${x}</li>\`).join('')}\`
  const s = '한\\'글'
  const r = /'/; const u = '가'
  const v = a / 2, w = '나' / 1
  const x = (b) / 2, y = '다' / 1, z = c[0] / 2, q = '라' / 1
</script>`
  assert.deepEqual(catalogUnits(html), [unit('page', 'script', "한\\'글"), unit('page', 'script', '가'), unit('page', 'script', '나'), unit('page', 'script', '다'), unit('page', 'script', '라')])
})

test('units: a template with Korean text is one unit with its ${…}; otherwise its inner literals are units', () => {
  const html = `<script>
  const a = \`\${ok ? '예' : '아니오'} 선택\`
  const b = \`\${ok ? '예' : '아니오'}\`
</script>`
  assert.deepEqual(catalogUnits(html), [
    unit('page', 'script', "${ok ? '예' : '아니오'} 선택"),
    unit('page', 'script', '예'),
    unit('page', 'script', '아니오'),
  ])
})

test('translate: only whole units are replaced', () => {
  const { html, missing } = translateCatalog('<button>조회</button><p>조회 조건</p>', { 조회: 'Search' })
  assert.equal(html, '<button>Search</button><p>조회 조건</p>')
  assert.deepEqual(missing, [unit('page', 'text', '조회 조건')])
})

test('translate: a block and a standalone text with the same words resolve independently', () => {
  const { html, missing } = translateCatalog('<p>메뉴 <code>x</code></p><span>메뉴</span>', { 메뉴: 'Menu' })
  assert.equal(html, '<p>메뉴 <code>x</code></p><span>Menu</span>')
  assert.deepEqual(missing, [unit('page', 'block', '메뉴 <code>x</code>')])
})

test('translate: section keys win over global keys', () => {
  const src = '<section class="demo" id="chip"><p>전체</p></section><section class="demo" id="tabs"><p>전체</p></section><p>전체</p>'
  const { html, missing } = translateCatalog(src, { 전체: 'All', 'chip::전체': 'Everything' })
  assert.equal(html, '<section class="demo" id="chip"><p>Everything</p></section><section class="demo" id="tabs"><p>All</p></section><p>All</p>')
  assert.deepEqual(missing, [])
})

test('translate: entities stay as written, attribute and script values are escaped for their quotes', () => {
  const table = {
    '&lt;a&gt; 태그': 'the &lt;a&gt; tag',
    열기: 'Open "menu"',
    확인: "it's",
    취소: 'say "no"',
    '${n}개': '${n} `items`',
    '조회: ': 'Search: "',
  }
  const src = `<p>&lt;a&gt; 태그</p><button aria-label="열기"></button><input placeholder='열기'>
<form onsubmit="x = '조회: '"></form>
<script>const a = '확인', b = "취소", c = \`\${n}개\`</script>`
  const { html, missing } = translateCatalog(src, table)
  assert.deepEqual(missing, [])
  assert.equal(html, `<p>the &lt;a&gt; tag</p><button aria-label="Open &quot;menu&quot;"></button><input placeholder='Open "menu"'>
<form onsubmit="x = 'Search: &quot;'"></form>
<script>const a = 'it\\'s', b = "say \\"no\\"", c = \`\${n} \\\`items\\\`\`</script>`)
})

test('translate: surrounding whitespace and line breaks are kept', () => {
  const { html } = translateCatalog('<p>\n  안녕\n</p><p class="d">첫 줄.\n둘째 줄.</p>', { 안녕: 'Hello', '첫 줄.\n둘째 줄.': 'Line one.\nLine two.' })
  assert.equal(html, '<p>\n  Hello\n</p><p class="d">Line one.\nLine two.</p>')
})

test('translate: root lang becomes en and the language link flips', () => {
  const src = `<html lang="ko"><body><header><a class="dw-button dw-button--neutral-outline dw-button--small" href="catalog.en.html" hreflang="en" lang="en" id="lang">English</a></header><p lang="ko">한국어</p></body></html>`
  const { html } = translateCatalog(src, {})
  assert.equal(html, `<html lang="en"><body><header><a class="dw-button dw-button--neutral-outline dw-button--small" href="catalog.html" hreflang="ko" lang="ko" id="lang">한국어</a></header><p lang="ko">한국어</p></body></html>`)
})

test('catalog.html: with an empty table only lang, the language link and the Korean-kept regions change', () => {
  const ko = buildCatalog(read('catalog.html'))
  const { html } = translateCatalog(ko, {})
  const flip = ko
    .replace('<html lang="ko">', '<html lang="en">')
    .replace('href="catalog.en.html" hreflang="en" lang="en" id="lang">English</a>', 'href="catalog.html" hreflang="ko" lang="ko" id="lang">한국어</a>')
    .replace(/<!--AI_PROMPT:start-->([\s\S]*?)<!--AI_PROMPT:end-->/, '<!--AI_PROMPT:start--><span lang="ko">$1</span><!--AI_PROMPT:end-->')
    .replace(/(<h2 id="page-history-title">[^<]*<\/h2>\s*<ol)>/, '$1 lang="ko">')
  assert.notEqual(flip, ko)
  assert.equal(html, flip)
})

test('catalog.html: the language link sits before the theme button', () => {
  assert.match(read('catalog.html'), /<a class="dw-button dw-button--neutral-outline dw-button--small" href="catalog\.en\.html" hreflang="en" lang="en" id="lang">English<\/a>\s*<button [^>]*id="theme"/)
})

test('a release history entry needs no translation', () => {
  // 릴리즈 PR은 prepare-release.ts로 한국어 기록을 넣고 pnpm build만 돌린다. 번역표를 고치지 않아도 영어판이 빠짐없이 나와야 한다
  const html = addHistory(read('catalog.html'), '9.9.0', '2026-12-01', '새 컴포넌트 추가.')
  const { html: en, missing } = translateCatalog(buildCatalog(html), JSON.parse(read('catalog.en.json')))
  assert.deepEqual(missing, [])
  assert.match(en, /<ol lang="ko">\s*<li>\s*<p class="page-history__version"><strong>v9\.9\.0<\/strong>/)
})

test('catalog.en.json: keys are units of catalog.html and values have no Hangul', () => {
  const table: Record<string, string> = JSON.parse(read('catalog.en.json'))
  const units = catalogUnits(buildCatalog(read('catalog.html')))
  const keys = new Set(units.flatMap((u) => [u.ko, `${u.section}::${u.ko}`]))
  assert.deepEqual(Object.keys(table).filter((k) => !keys.has(k)), [])
  // 링크 주소는 한국어 문서(design.md)의 제목 앵커라 한글이 남는다
  assert.deepEqual(Object.entries(table).filter(([, v]) => /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(v.replace(/ href="[^"]*"/g, ''))), [])
})

test('catalog.en.json: the page chrome is English', () => {
  const { html } = translateCatalog(buildCatalog(read('catalog.html')), JSON.parse(read('catalog.en.json')))
  // 머리말과 그 뒤의 사이드바 접기 버튼
  const header = /<header class="page-header"[^>]*>[\s\S]*?<\/header>\s*<button [^>]*id="sidebar-toggle"[^>]*>/.exec(html)?.[0] ?? ''
  assert.match(header, /id="theme"/)
  // 메뉴 링크 글자는 절 제목이고, 언어 링크의 '한국어'는 번역 단위가 아니다
  const chrome = header.replace(/<!--NAV:start-->[\s\S]*<!--NAV:end-->/, '').replace(/<a [^>]*id="lang">[^<]*<\/a>/, '')
  assert.doesNotMatch(chrome, /[ㄱ-ㅎㅏ-ㅣ가-힣]/)
})

// ── 완결성 (Task 6) ─────────────────────────────────────

const HANGUL_RE = /[ㄱ-ㅎㅏ-ㅣ가-힣]/
const enTable = (): Record<string, string> => JSON.parse(read('catalog.en.json'))
const koUnits = (): CatalogUnit[] => catalogUnits(buildCatalog(read('catalog.html')))

test('every catalog unit has an English entry', () => {
  const { missing } = translateCatalog(buildCatalog(read('catalog.html')), enTable())
  assert.deepEqual(missing, [])
})

test('catalog.en.json has no unused entries', () => {
  const units = koUnits()
  const used = new Set<string>()
  for (const u of units) used.add(Object.hasOwn(enTable(), `${u.section}::${u.ko}`) ? `${u.section}::${u.ko}` : u.ko)
  assert.deepEqual(Object.keys(enTable()).filter((k) => !used.has(k)), [])
})

test('English catalog has no Korean left', () => {
  const rest = read('catalog.en.html')
    .replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ data-q="[^"]*"/g, '')
    .replace(/<script>[\s\S]*?<\/script>/g, (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''))
    .replace(/(<a [^>]*id="lang">)한국어(<\/a>)/, '$1$2')
    // 한국어 문서(design.md)의 제목 앵커
    .replace(/ href="[^"]*"/g, '')
    // 한국어 그대로 두는 곳 (설정 프롬프트 원문, 업데이트 기록 목록)
    .replace(/<(span|ol) lang="ko">[\s\S]*?<\/\1>/g, '')
  const left = rest.split('\n').filter((l) => HANGUL_RE.test(l)).map((l) => l.trim())
  assert.deepEqual(left, [])
})

// 같은 한국어가 화면에서 다른 역할이라 messages.json과 다른 영어를 쓰는 전역 키 (키 → 이유)
const MESSAGES_EXCEPTIONS: Record<string, string> = {
  // stepper.completed는 단계 옆에 읽어 주는 상태 "Completed". 카탈로그의 완료는 버튼·Callout 제목·마지막 단계 이름이라 "Done"
  완료: 'button or label, not the screen-reader step status',
  // calendar.month는 "월" 드롭다운 이름(Month). 카탈로그의 월은 Segmented Control 요일 묶음의 월요일
  월: 'weekday Monday in the Segmented Control example',
}

test('catalog reuses messages.json wording', () => {
  const messages: Record<string, { ko: string; en: string }> = JSON.parse(read('messages.json'))
  const byKo = new Map(Object.values(messages).filter((m) => !m.ko.includes('{')).map((m) => [m.ko, m.en]))
  const table = enTable()
  const wrong = koUnits()
    .filter((u) => (u.kind === 'attr' || u.kind === 'text') && byKo.has(u.ko) && !Object.hasOwn(table, `${u.section}::${u.ko}`))
    .filter((u) => !Object.hasOwn(MESSAGES_EXCEPTIONS, u.ko))
    .filter((u) => table[u.ko] !== byKo.get(u.ko))
    .map((u) => `${u.section} · ${u.ko} → ${table[u.ko]} (messages: ${byKo.get(u.ko)})`)
  assert.deepEqual([...new Set(wrong)], [])
})

test('block translations keep the same inline tags', () => {
  const tags = (s: string): string[] => [...s.matchAll(/<\/?[a-z][^>]*>/g)].map((m) => m[0]).sort()
  const blocks = new Set(koUnits().filter((u) => u.kind === 'block').map((u) => u.ko))
  const table = enTable()
  const bad = Object.entries(table)
    .filter(([k]) => blocks.has(k.includes('::') ? k.slice(k.indexOf('::') + 2) : k))
    .filter(([k, v]) => tags(k.includes('::') ? k.slice(k.indexOf('::') + 2) : k).join('\n') !== tags(v).join('\n'))
    .map(([k]) => k)
  assert.deepEqual(bad, [])
})

test('catalog.js writes the same English as catalog.en.json for the buttons it relabels', () => {
  // 테마·사이드바 버튼 이름은 마크업(번역표)과 catalog.js가 함께 정한다. 둘이 어긋나면 누를 때 이름이 바뀐다
  const js = read('js/catalog.js')
  const table = enTable()
  for (const ko of ['다크 모드로 전환', '사이드바 접기']) {
    assert.ok(Object.hasOwn(table, ko), ko)
    assert.ok(js.includes(`'${table[ko]}'`), `catalog.js에 ${table[ko]} 없음`)
    assert.ok(js.includes(`'${ko}'`), `catalog.js에 ${ko} 없음`)
  }
})
