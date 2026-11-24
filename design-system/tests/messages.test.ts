import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { buildMessagesTs, fillBehaviorMessages } from '../scripts/build-messages.ts'

process.removeAllListeners('warning') // stripTypeScriptTypes 실험 기능 경고 숨김

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const json = read('design/messages.json')
const messages: Record<string, { ko?: unknown; en?: unknown }> = JSON.parse(json)
const placeholders = (text: string): string[] => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort()

test('every message has ko and en', () => {
  const problems: string[] = []
  for (const [key, { ko, en }] of Object.entries(messages)) {
    if (typeof ko !== 'string' || !ko.trim()) problems.push(`${key}: ko 없음`)
    else if (!/[가-힣]/.test(ko)) problems.push(`${key}: ko에 한글 없음`)
    if (typeof en !== 'string' || !en.trim()) problems.push(`${key}: en 없음`)
    else if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(en)) problems.push(`${key}: en에 한글 있음`)
  }
  assert.deepEqual(problems, [])
})

test('placeholders match across languages', () => {
  const problems: string[] = []
  for (const [key, { ko, en }] of Object.entries(messages)) {
    const a = placeholders(String(ko))
    const b = placeholders(String(en))
    if (a.join() !== b.join()) problems.push(`${key}: ko {${a}} ≠ en {${b}}`)
  }
  assert.deepEqual(problems, [])
})

test('keys follow <component>.<meaning>', () => {
  const bad = Object.keys(messages).filter((key) => !/^[a-z][A-Za-z]*\.[a-z][A-Za-z]*$/.test(key))
  assert.deepEqual(bad, [])
})

test('dw-messages.ts is generated from messages.json', () => {
  assert.equal(read('src/lib/dw-messages.ts'), buildMessagesTs(json), 'pnpm build:messages')
})

test('components.ts MESSAGES region is current', () => {
  const ts = read('design/js/components.ts')
  assert.match(ts, /\/\* MESSAGES:start \*\/[\s\S]*?\/\* MESSAGES:end \*\//)
  assert.equal(fillBehaviorMessages(ts, json), ts, 'pnpm build:messages')
})

/* ── 동작 스크립트: <html lang>으로 문구를 고른다 ── */
const behaviorTs = read('design/js/components.ts')
const region = (name: string): string => behaviorTs.match(new RegExp(`/\\* ${name}:start \\*/[\\s\\S]*?/\\* ${name}:end \\*/`))?.[0] ?? ''

interface I18n {
  msg(key: string, values?: Record<string, string | number>, attr?: string): string
  dwLocale(): string
  setMessages(table: Record<string, string>): void
}
function loadI18n(lang: string | null, win?: unknown): I18n {
  const source = stripTypeScriptTypes(`${region('MESSAGES')}\n${region('I18N')}`, { mode: 'strip' })
  const doc = { documentElement: { getAttribute: (name: string) => (name === 'lang' ? lang : null), lang: lang ?? '' } }
  return new Function('document', 'window', `${source}\nreturn { msg, dwLocale, setMessages: (t) => Object.assign(overrides, t) }`)(doc, win)
}

test('behavior script picks English only when lang starts with en', () => {
  for (const lang of ['en', 'en-US', 'EN']) assert.equal(loadI18n(lang).msg('pagination.next'), 'Next page', lang)
  for (const lang of ['', 'ko', 'ja', null]) assert.equal(loadI18n(lang).msg('pagination.next'), '다음 페이지', String(lang))
})

test('behavior script msg: attr > overrides > table, placeholders always filled', () => {
  const i18n = loadI18n('ko')
  i18n.setMessages({ 'pagination.next': '다음으로' })
  assert.equal(i18n.msg('pagination.next'), '다음으로')
  assert.equal(i18n.msg('pagination.next', {}, 'Go'), 'Go')
  assert.equal(i18n.msg('pagination.page', { page: 3 }), '3 페이지')
  assert.equal(i18n.msg('combobox.remove', { label: 'A' }, 'drop {label}'), 'drop A')
  assert.equal(i18n.msg('pagination.page'), '{page} 페이지', '값이 빠진 자리표시는 남는다')
  assert.equal(i18n.msg('pagination.next', {}, ''), '', '속성이 있으면 빈 값도 그대로 쓴다 (기존 ?? 동작)')
})

test('behavior script has no hard-coded copy', () => {
  const code = behaviorTs
    .replace(region('MESSAGES'), '')
    .replace(region('I18N'), '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
  const literals = code.split('\n').filter((line) => /(['"`])[^'"`\n]*[가-힣][^'"`\n]*\1/.test(line))
  assert.deepEqual(literals, [])
})

test('behavior script reads preloaded window.dwMessages', () => {
  const win = { dwMessages: { 'pagination.next': 'Weiter', 'pagination.previous': 'Zurück' } }
  const i18n = loadI18n('en', win)
  assert.equal(i18n.msg('pagination.next'), 'Weiter')
  i18n.setMessages({ 'pagination.next': 'Los' })
  assert.equal(i18n.msg('pagination.next'), 'Los', 'setMessages가 위에 덮는다')
  assert.equal(i18n.msg('pagination.previous'), 'Zurück')
  assert.equal(i18n.msg('pagination.next', {}, 'attr'), 'attr', '요소 attr이 가장 먼저')
  assert.equal(i18n.msg('toast.region'), 'Notifications', '없는 키는 기본 표')
})

test('behavior script tolerates missing or non-object window.dwMessages', () => {
  for (const win of [undefined, {}, { dwMessages: null }, { dwMessages: 'x' }, { dwMessages: 3 }, { dwMessages: ['a'] }]) {
    assert.equal(loadI18n('ko', win).msg('pagination.next'), '다음 페이지', JSON.stringify(win))
  }
})

test('behavior script msg tolerates non-string override values', () => {
  const win = { dwMessages: { 'pagination.page': 3, 'pagination.next': true } }
  const i18n = loadI18n('ko', win)
  assert.equal(i18n.msg('pagination.page', { page: 1 }), '3')
  assert.equal(i18n.msg('pagination.next'), 'true')
  i18n.setMessages({ 'combobox.remove': 7 } as unknown as Record<string, string>)
  assert.equal(i18n.msg('combobox.remove', { label: 'A' }), '7')
})

test('behavior script never interpolates msg() into innerHTML', () => {
  // 문구에 " 나 < 가 있어도 마크업이 깨지지 않도록, 문구는 setAttribute·textContent로만 넣는다
  const templates = [...behaviorTs.matchAll(/innerHTML\s*=[\s\S]*?(?:\n\s*\n|\n\s*(?:const|let|root|grid|if|for|return)\b)/g)].map((m) => m[0])
  const hits = templates.filter((t) => /\$\{\s*msg\(/.test(t)).map((t) => t.split('\n')[0].trim())
  assert.deepEqual(hits, [])
})
