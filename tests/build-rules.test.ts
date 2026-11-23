import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import { GUIDE_PATH, PARTS, PARTS_DIR, buildGuide, demote, kstToday, partTitle, readParts, readStamp, readVersion } from '../scripts/build-rules.ts'

const read = (p: string): string => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const parts = readParts()
const guide = read(GUIDE_PATH)

test('통합본은 조각을 합친 결과와 같다 — 다르면 pnpm build:rules', () => {
  const stamp = readStamp(guide)
  assert.ok(stamp, '통합본 첫머리에 (vX.Y.Z)와 기준일이 없다')
  assert.equal(guide, buildGuide(parts, stamp.version, stamp.date), '조각을 고친 뒤 pnpm build:rules를 돌리지 않았다')
})

test('통합본의 버전은 version.txt와 같다 — 다르면 pnpm build:rules', () => {
  assert.equal(readStamp(guide)?.version, readVersion())
})

test('parts/의 파일과 합치는 목록(PARTS)이 같다', () => {
  const files = readdirSync(new URL(`../${PARTS_DIR}`, import.meta.url)).sort()
  assert.deepEqual(files, PARTS.map((p) => p.file).sort())
})

test('조각은 "# 제목"으로 시작하고 제목이 겹치지 않는다', () => {
  const titles = parts.map(({ file, text }) => partTitle(text, file))
  assert.equal(new Set(titles).size, titles.length)
})

test('조각은 다른 조각을 파일 이름이나 순서 번호로 가리키지 않는다 — 규칙 번호(10번, TS-1)와 절 이름으로 가리킨다', () => {
  const names = new RegExp(PARTS.map((p) => p.file.replace('.', '\\.')).join('|'))
  for (const { file, text } of parts) {
    assert.doesNotMatch(text, names, `${file}: 조각 파일 이름을 적었다`)
    assert.doesNotMatch(text, /\d번 부분/, `${file}: "N번 부분"은 통합본에서만 통한다`)
    assert.doesNotMatch(text, /\(v\d+\.\d+\.\d+\)|기준일: \d{4}/, `${file}: 버전 · 기준일은 빌드가 찍는다`)
  }
})

test('제목을 한 단계 내리되 코드 블록 안의 #은 그대로 둔다', () => {
  assert.equal(demote('# 가\n\n## 나\n\n```txt\n# 리포트\n```\n\n   ```txt\n   ## 표\n   ```\n### 다'), '## 가\n\n### 나\n\n```txt\n# 리포트\n```\n\n   ```txt\n   ## 표\n   ```\n#### 다')
})

test('통합본 첫머리에 버전 · 기준일과 조각 표가 들어간다', () => {
  const out = buildGuide(parts, '9.8.7', '2026-12-31')
  assert.deepEqual(readStamp(out), { version: '9.8.7', date: '2026-12-31' })
  assert.match(out, /이 파일은 여섯 부분으로 되어 있다\./)
  for (const { file, text } of parts) assert.ok(out.includes(`| ${partTitle(text, file)} |`), file)
})

test('기준일은 한국 시간 날짜', () => {
  assert.equal(kstToday(new Date('2026-11-22T16:30:00Z')), '2026-11-23')
})

test('공통 규칙은 1번부터 16번까지 빠짐없이 있다', () => {
  const text = parts.find((p) => p.file === 'SECURITY.md')!.text
  const numbers = [...text.matchAll(/^## (\d+)\. /gm)].map((m) => Number(m[1]))
  assert.deepEqual(numbers, Array.from({ length: 16 }, (_, i) => i + 1))
})

test('최소 안전 규칙 릴리즈 PR에 통합본을 다시 만들어 넣는다', () => {
  const yml = read('.github/workflows/release.yml')
  assert.match(yml, /rules_pr_branch:.*release-please--branches--main--components--safety-rules/)
  const job = yml.slice(yml.indexOf('\n  prepare-rules-pr:'), yml.indexOf('\n  after-release:'))
  assert.match(job, /if: needs\.release-please\.outputs\.rules_pr_branch != ''/)
  assert.match(job, /node scripts\/build-rules\.ts/)
})

test('커밋 훅이 조각을 고친 커밋에 통합본을 함께 넣는다', () => {
  const hook = read('.husky/pre-commit')
  assert.match(hook, /rules\/safety-rules\/\(parts\//)
  assert.match(hook, /node scripts\/build-rules\.ts/)
  assert.match(hook, /git add rules\/safety-rules\/daewoong-coding-guide\.md/)
})
