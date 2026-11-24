import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DESIGN = fileURLToPath(new URL('../design/', import.meta.url))
const read = (p: string): string => readFileSync(join(DESIGN, p), 'utf8')
const specs = readdirSync(join(DESIGN, 'components')).filter((f) => f.endsWith('.md') && !f.startsWith('_'))
const markdown = readdirSync(DESIGN, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.md'))

test('every spec has its class in components.css', () => {
  const css = read('components.css')
  for (const f of specs) {
    const cls = /클래스 `(\.dw-[\w-]+)`/.exec(read(`components/${f}`))?.[1]
    assert.ok(cls, `${f}: 머리글에 클래스가 없다`)
    assert.ok(css.includes(cls) || read('catalog.html').includes(cls.slice(1)), `${f}: ${cls}`)
  }
})

test('components.css uses role tokens instead of chromatic palette', () => {
  const hits = read('components.css').match(/var\(--dw-(orange|charcoal|blue|green|yellow|red|purple)-[^)]*\)/g)
  assert.equal(hits, null)
})

test('every spec keeps the template sections', () => {
  const sections = [...read('components/_template.md').matchAll(/^## (.+)$/gm)].map((m) => m[1])
  for (const f of specs) {
    const doc = read(`components/${f}`)
    for (const s of sections) assert.ok(doc.includes(`## ${s}`), `${f}: ${s}`)
  }
})

test('relative links in design/ resolve', () => {
  for (const f of markdown) {
    const text = read(f).replace(/```[\s\S]*?```/g, '')
    for (const [, href] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|#|mailto:)/.test(href)) continue
      assert.ok(existsSync(join(DESIGN, dirname(f), decodeURI(href.split('#')[0]))), `${f}: ${href}`)
    }
  }
})

test('text styles match the tokens and the Storybook helper', () => {
  const tokens = JSON.parse(read('tokens.json'))
  const doc = read('design.md')
  const helper = readFileSync(new URL('../src/stories/foundations/_components/ds-text.tsx', import.meta.url), 'utf8')
  for (const [name, s] of Object.entries<{ scale: string; weight: string }>(tokens.typography.style)) {
    assert.ok(doc.includes(`| \`${name}\` | ${s.scale} `), `design.md: ${name}`)
    assert.ok(helper.includes(`${/-/.test(name) ? `'${name}'` : name}: scale('${s.scale}', '${s.weight}')`), `ds-text: ${name}`)
  }
})

test('z-index uses tokens, not raw numbers', () => {
  const css = readFileSync('design/components.css', 'utf8')
  const raw = [...css.matchAll(/z-index: ([^;]+);/g)].map((m) => m[1]).filter((v) => !/^(-1|1|var\(--dw-z-[a-z]+\))$/.test(v))
  assert.deepEqual(raw, [])
  const ui = readdirSync('src/components/ui').filter((f) => f !== 'sidebar.tsx' && /\bz-(\[\d+\]|[2-9]\d)\b/.test(readFileSync(`src/components/ui/${f}`, 'utf8')))
  assert.deepEqual(ui, [])
})

test('z-index order keeps overlays in front of what they cover', () => {
  const z = JSON.parse(readFileSync('design/tokens.json', 'utf8')).zIndex
  const v = (k: string) => Number(z[k])
  assert.equal(v('overlay'), v('modal'))
  assert.ok(v('raised') < v('notice') && v('notice') < v('modal') && v('modal') < v('dropdown') && v('dropdown') < v('toast') && v('toast') < v('tooltip'))
})

test('React controls share the control height scale', () => {
  const ui = (f: string) => readFileSync(`src/components/ui/${f}.tsx`, 'utf8')
  for (const [size, h] of [['xs', 8], ['sm', 9], ['default', 10], ['lg', 13]] as const) {
    assert.match(ui('button'), new RegExp(`\\b${size}: "h-${h}\\b`))
    assert.match(ui('input'), new RegExp(`\\b${size}: "h-${h}\\b`))
  }
})

test('media queries only use breakpoint tokens', () => {
  const bp = Object.values(JSON.parse(read('tokens.json')).breakpoint as Record<string, string>).map((v) => Number.parseInt(v, 10))
  const allowed = new Set([...bp, ...bp.map((v) => v - 1)])
  const bad = [...read('components.css').matchAll(/@(?:media|container) \((?:min|max)-width: (\d+)px\)/g)].map((m) => Number(m[1])).filter((v) => !allowed.has(v))
  assert.deepEqual(bad, [])
})

test('design.md lists every breakpoint with its token value', () => {
  const doc = read('design.md')
  for (const [name, value] of Object.entries(JSON.parse(read('tokens.json')).breakpoint as Record<string, string>)) {
    assert.match(doc, new RegExp(`\`breakpoint-${name}\` \\| ${value} \\|`))
  }
})

test('brand files exist and the unofficial white logo stays out', () => {
  const files = readdirSync(join(DESIGN, 'brand'))
  for (const f of ['ci-en.svg', 'ci-en-on-dark.svg', 'ci-kor.svg', 'ci-kor.png', 'ci-kor-on-dark.svg', 'ci-kor-on-dark.png', 'emblem.svg', 'emblem.png', 'ci-kor.ai']) assert.ok(files.includes(f), f)
  assert.equal(files.length, 9)
})

test('shadcn.css adds the breakpoints Tailwind does not have', () => {
  const bp = JSON.parse(read('tokens.json')).breakpoint as Record<string, string>
  const css = read('shadcn.css')
  for (const name of ['xs', '3xl', '4xl']) assert.ok(css.includes(`--breakpoint-${name}: ${Number.parseInt(bp[name], 10) / 16}rem;`), name)
})

test('foundation spec links point at a design.md heading', () => {
  const slugs = [...read('design.md').matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-'))
  const links = [...read('catalog.html').matchAll(/<h2>[^<]+<a href="design\.md#([^"]+)">명세<\/a><\/h2>/g)].map((m) => m[1])
  assert.equal(links.length, 19)
  for (const slug of links) assert.ok(slugs.includes(slug), slug)
})

test('design.md lists every grid and ratio token', () => {
  const doc = read('design.md')
  const tokens = JSON.parse(read('tokens.json')) as Record<'grid' | 'ratio', Record<string, string>>
  for (const group of ['grid', 'ratio'] as const) {
    for (const name of Object.keys(tokens[group])) assert.ok(doc.includes(`${group}-${name}`), name)
  }
})

test('React components leave cursor states visible', () => {
  for (const f of readdirSync('src/components/ui').filter((f) => f.endsWith('.tsx'))) {
    const src = readFileSync(`src/components/ui/${f}`, 'utf8')
    assert.doesNotMatch(src, /(?:^|["'\s]|data-\[disabled\]:|data-|has-)disabled:pointer-events-none/m, `${f}: 비활성에 pointer-events-none을 쓰면 not-allowed 커서가 가려진다 (design.md 11.1)`)
    assert.doesNotMatch(src, /cursor-default[^"']*(?:data-highlighted|focus:bg-accent)/, `${f}: 메뉴·선택 항목은 cursor-pointer (design.md 11.1)`)
  }
})

test('shadcn.css and components.css share the cursor defaults', () => {
  for (const file of ['shadcn.css', 'components.css']) {
    const css = read(file)
    for (const cursor of ['pointer', 'not-allowed', 'progress']) assert.match(css, new RegExp(`:where\\(button[^{]*\\{\\s*cursor: ${cursor};`), `${file}: ${cursor}`)
  }
})

test('link underline offset defaults to spacing-x1 everywhere', () => {
  assert.match(read('shadcn.css'), /body \{[^}]*text-underline-offset: var\(--dw-spacing-x1\);/)
  assert.match(read('components.css'), /:root \{ text-underline-offset: var\(--dw-spacing-x1\); \}/)
  assert.doesNotMatch(read('components.css'), /text-underline-offset: (?!var\(--dw-spacing-)/)
})

test('React components take copy from messages.json', () => {
  // 주석을 지운다. 문자열 안의 `//`(URL 등)는 앞이 `:`이면 남긴다
  const strip = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
  // `{…}` 표현식을 안쪽부터 지운다(중첩 중괄호 포함)
  const dropExpressions = (text: string) => {
    let prev
    do [prev, text] = [text, text.replace(/\{[^{}]*\}/g, '')]
    while (text !== prev)
    return text
  }
  // list-footer의 단위 타입 `"명" | "개"`는 공개 API라 남긴다(보이는 문구는 listFooter.total*)
  const allowed: Record<string, RegExp> = { 'list-footer.tsx': /"(?:명|개)"/g }
  const found: string[] = []
  for (const f of readdirSync('src/components/ui')) {
    const code = strip(readFileSync(`src/components/ui/${f}`, 'utf8')).replace(allowed[f] ?? /$^/g, '""')
    for (const m of code.matchAll(/[가-힣][^\n]*/g)) found.push(`${f}: 한글 ${m[0].trim()}`)
    // aria-label·title·placeholder는 {…} 표현식만 허용한다(문자열 리터럴 금지)
    for (const m of code.matchAll(/\b(?:aria-label|title|placeholder)=(?:["']|\{\s*["'`])[^\n]*/g)) found.push(`${f}: 속성 ${m[0].trim()}`)
    // sr-only 요소의 글자는 {…} 표현식만 허용한다
    for (const m of code.matchAll(/["'\s]sr-only["'\s][^>]*>([^<]*)</g)) {
      const text = dropExpressions(m[1]).trim()
      if (text) found.push(`${f}: sr-only ${text}`)
    }
    // JSX 글자(`>`와 `<`/`{` 사이)에 글자가 있으면 안 된다 — 한글이든 영어든. 예: <Button>Close</Button>
    // `=>`·`->` 뒤, 코드 기호가 섞인 조각, `,`로 시작하는 객체·타입 조각, 제네릭 뒤 키워드(`Promise<T> return`, `<T> extends`)는 코드라 뺀다
    for (const m of code.matchAll(/(?<![=-])>([^<>{}]*)(?=[<{])/g)) {
      const text = m[1].trim()
      if (/\p{L}/u.test(text) && !/[()=;&|"'`]/.test(text) && !/^,/.test(text) && !/^(?:return|extends)\b/.test(text)) {
        found.push(`${f}: JSX 글자 ${text}`)
      }
    }
  }
  assert.deepEqual(found, [])
})

test('only calendar and date-picker need date-fns', () => {
  // dialog.tsx처럼 날짜와 무관한 컴포넌트를 dw-locale.tsx·dw-messages.ts와 함께 가져가면 date-fns 없이 빌드된다
  const usesDateFns = (src: string) => /from\s+['"]date-fns(?:\/[^'"]*)?['"]|import\(\s*['"]date-fns/.test(src)
  assert.equal(usesDateFns(readFileSync('src/lib/dw-locale.tsx', 'utf8')), false, 'dw-locale.tsx')
  assert.equal(usesDateFns(readFileSync('src/lib/dw-messages.ts', 'utf8')), false, 'dw-messages.ts')
  assert.equal(/from\s+['"]@\/lib\/dw-date['"]/.test(readFileSync('src/components/ui/dialog.tsx', 'utf8')), false, 'dialog.tsx')
})
