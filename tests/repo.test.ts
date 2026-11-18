import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const read = (p: string): string => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('설정 프롬프트는 폴더를 나누기 전 태그(v1.2.0까지)의 design/도 읽는다', () => {
  const step3 = read('design-system/design/ai/setup-prompt.md').split('\n').find((l) => l.startsWith('3. '))
  assert.ok(step3?.includes('`design-system/design/`'))
  assert.ok(step3?.includes('v1.2.0까지'), '옛 태그 구조 안내가 없다')
})

test('테스트를 통과해야 릴리즈 PR · 릴리즈가 만들어진다', () => {
  const yml = read('.github/workflows/release.yml')
  const job = yml.slice(yml.indexOf('\n  release-please:'), yml.indexOf('\n  prepare-pr:'))
  assert.match(job, /needs: test/)
  assert.match(yml, /\n {2}test:\n[\s\S]*?pnpm test/)
})

test('릴리즈 뒤 Pages 배포는 앞 단계가 실패해도 돈다', () => {
  const yml = read('.github/workflows/release.yml')
  const step = yml.slice(yml.indexOf('- name: Deploy Pages'))
  assert.match(step.split('\n').slice(0, 3).join('\n'), /if: always\(\)/)
})

test('전환 전에 만든 브랜치는 rebase해야 한다고 안내한다', () => {
  assert.match(read('README.md'), /rebase/)
})

test('릴리즈 PR이 폴더마다 따로여도 디자인 시스템 PR 브랜치에만 준비 커밋을 한다', () => {
  const yml = read('.github/workflows/release.yml')
  assert.doesNotMatch(yml, /fromJSON\(steps\.rp\.outputs\.pr\)/)
  assert.match(yml, /ds_pr_branch:.*release-please--branches--main--components--design-system/)
  const job = yml.slice(yml.indexOf('\n  prepare-pr:'), yml.indexOf('\n  after-release:'))
  assert.match(job, /if: needs\.release-please\.outputs\.ds_pr_branch != ''/)
  assert.match(job, /ref: \$\{\{ needs\.release-please\.outputs\.ds_pr_branch \}\}/)
})
