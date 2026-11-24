import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildMessagesTs, fillBehaviorMessages } from '../scripts/build-messages.ts'

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

