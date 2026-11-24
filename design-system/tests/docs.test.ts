import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Tokens } from '../scripts/types.ts'
import { readdirSync, readFileSync } from 'node:fs'

const read = (p: string): string => readFileSync(new URL(`../design/${p}`, import.meta.url), 'utf8')
const tokens: Tokens = JSON.parse(read('tokens.json'))

test('design.md lists every role token', () => {
  const doc = read('design.md')
  for (const name of Object.keys(tokens.role.light)) assert.ok(doc.includes(`| \`${name}\` |`), name)
})

test('catalog.html generated regions are current', async () => {
  const { buildCatalog } = await import('../scripts/build-catalog.ts')
  const html = read('catalog.html')
  assert.equal(buildCatalog(html), html)
})

test('catalog.en.html is current', async () => {
  const { buildCatalog, translateCatalog } = await import('../scripts/build-catalog.ts')
  const { html } = translateCatalog(buildCatalog(read('catalog.html')), JSON.parse(read('catalog.en.json')))
  assert.equal(read('catalog.en.html'), html)
})

test('components.js is generated from components.ts', async () => {
  const { buildBehaviorJs } = await import('../scripts/build-catalog.ts')
  assert.equal(buildBehaviorJs(read('js/components.ts')), read('js/components.js'))
})

test('catalog.html shows every component spec', () => {
  const html = read('catalog.html')
  const specs = readdirSync(new URL('../design/components/', import.meta.url)).filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  for (const f of specs) assert.ok(html.includes(`<section class="demo" id="${f.replace('.md', '')}">`), f)
})

test('every dw-* class in catalog.html is defined in components.css', () => {
  const css = read('components.css')
  const defined = new Set([...css.matchAll(/\.(dw-[\w-]+)/g)].map((m) => m[1]))
  const body = read('catalog.html').replace(/<style>[\s\S]*?<\/style>/g, '')
  const used = [...body.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c.startsWith('dw-'))
  // 기본값이라 CSS 규칙이 필요 없는 클래스 (명세에 있어 마크업에는 남긴다)
  const noRule = new Set(['dw-status-badge--neutral', 'dw-text-input--medium', 'dw-select--medium', 'dw-menu--responsive', 'dw-toast--default', 'dw-badge--neutral', 'dw-badge--weak', 'dw-chip--solid', 'dw-chip--medium', 'dw-callout--neutral', 'dw-progress-circle--neutral', 'dw-progress-circle--40', 'dw-breadcrumb', 'dw-accordion--medium'])
  const missing = [...new Set(used)].filter((c) => !defined.has(c) && !noRule.has(c))
  assert.deepEqual(missing, [])
})

test('Select 다중 선택의 보기마다 앞에 체크박스가 있고 뒤 check는 없다', () => {
  const html = read('catalog.html')
  // Combobox(data-dw="combobox")의 multiple은 대상이 아니다 — 보기를 스크립트가 만든다
  const lines = html.split('\n')
  const roots = lines.flatMap((line, i) => (/data-dw="select" data-multiple/.test(line) ? [i] : []))
  assert.ok(roots.length >= 5, `다중 Select ${roots.length}개`)
  for (const start of roots) {
    const list = lines.findIndex((line, i) => i > start && line.includes('role="listbox"'))
    const items: string[] = []
    for (let i = list + 1; lines[i].trim().startsWith('<div class="dw-select__item"'); i++) items.push(lines[i].trim())
    assert.ok(items.length > 0, `${start + 1}행의 다중 Select에 보기가 없다`)
    for (const item of items) {
      assert.match(item, /^<div[^>]*><span class="dw-select__item-checkbox" aria-hidden="true"><\/span><span class="dw-select__item-label">/, item)
      assert.doesNotMatch(item, /dw-select__check/, item)
    }
  }
})

test('AI documents are generated from the specs', async () => {
  const { buildFull, buildIndex, buildReadme, setupPrompt } = await import('../scripts/build-llms.ts')
  assert.equal(buildIndex(), read('llms.txt'))
  assert.equal(buildFull(), read('llms-full.txt'))
  assert.equal(buildReadme(), read('../README.md'))
  assert.ok(buildReadme().includes(setupPrompt()))
})

test('setup prompt fills its placeholders and requires shadcn only for React', async () => {
  const { setupPrompt } = await import('../scripts/build-llms.ts')
  const prompt = setupPrompt()
  assert.doesNotMatch(prompt, /\{\{/)
  assert.match(prompt, /git clone --depth 1 --branch \S+ https:\/\/github\.com\//)
  // 설치 명령은 버전마다 바뀌므로 적지 않고, 공식 설치 방법을 따르게 한다
  assert.doesNotMatch(prompt, /shadcn(@latest)? (add|init)|tailwindcss (add|init)/)
  assert.match(prompt, /React·Next\.js: Tailwind CSS v4와 shadcn\/ui를 쓴다/)
  assert.match(prompt, /설치하기 전에 사용자에게 물어보고/)
  assert.match(prompt, /새로 설치하지 않는다/)
})

test('옛 저장소 이름과 옛 Pages 주소가 남지 않는다', () => {
  // GitHub App 이름(daewoong-design-system-sync)은 그대로 쓰므로 주소 모양만 본다
  const stale = ['github.com/daewoong-axtf/daewoong-design-system', 'github.io/daewoong-design-system', 'releases/latest/download']
  for (const file of ['../README.md', '../design/catalog.html', '../design/catalog.en.html', '../design/ai/setup-prompt.md']) {
    const text = readFileSync(new URL(file, import.meta.url), 'utf8')
    for (const s of stale) assert.ok(!text.includes(s), `${file}에 ${s}가 남아 있다`)
  }
})
