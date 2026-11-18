import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildIndex, fillPrompt, kstDate, latestCopies, parseTag, readSource, sourcePath } from '../scripts/build-site.ts'

test('옛 태그는 디자인 시스템, 접두사 태그는 그 문서', () => {
  assert.deepEqual(parseTag('v1.2.0'), { slug: 'design-system', version: '1.2.0' })
  assert.deepEqual(parseTag('design-system-v1.3.0'), { slug: 'design-system', version: '1.3.0' })
  assert.deepEqual(parseTag('safety-rules-v1.0.0'), { slug: 'safety-rules', version: '1.0.0' })
  assert.equal(parseTag('v1.2'), null)
  assert.equal(parseTag('skills-v1.0.0'), null)
})

test('원문 위치는 태그 형식을 따른다', () => {
  assert.equal(sourcePath('design-system', 'v1.2.0'), 'design/ai/setup-prompt.md')
  assert.equal(sourcePath('design-system', 'design-system-v1.3.0'), 'design-system/design/ai/setup-prompt.md')
  assert.equal(sourcePath('safety-rules', 'safety-rules-v1.0.0'), 'rules/safety-rules/daewoong-coding-guide.md')
})

test('설정 프롬프트에 저장소와 ref를 채운다', () => {
  assert.equal(
    fillPrompt('저장소: {{REPOSITORY}} / {{REF}}', 'v1.2.0'),
    '저장소: https://github.com/daewoong-axtf/ax-kit / v1.2.0',
  )
  assert.throws(() => fillPrompt('{{REPO}}', 'v1.2.0'), /v1\.2\.0.*자리표시자/)
})

test('버전은 semver 내림차순, latest는 가장 높은 판', () => {
  const idx = buildIndex([
    { slug: 'design-system', version: '1.9.0', updatedAt: '2026-11-01' },
    { slug: 'design-system', version: '1.10.0', updatedAt: '2026-11-20' },
    { slug: 'safety-rules', version: '1.0.0', updatedAt: '2026-11-05' },
  ])
  assert.equal(idx.guides['design-system'].latest, '1.10.0')
  assert.deepEqual(
    idx.guides['design-system'].versions.map((v) => v.version),
    ['1.10.0', '1.9.0'],
  )
  assert.equal(idx.guides['design-system'].versions[0].path, 'guides/design-system/1.10.0.md')
  assert.equal(idx.guides['design-system'].fileName, 'daewoong-design-system.md')
  assert.equal(idx.guides['safety-rules'].fileName, 'daewoong-coding-guide.md')
})

test('기준일은 한국 시간 날짜', () => {
  assert.equal(kstDate('2026-11-04T16:30:00Z'), '2026-11-05')
  assert.equal(kstDate('2026-11-05T09:00:00+09:00'), '2026-11-05')
})

test('태그에 원문이 없으면 태그 이름을 넣어 실패한다', () => {
  assert.throws(() => readSource('safety-rules-v1.0.0', 'nope.md'), /safety-rules-v1\.0\.0/)
})

test('가이드마다 최신 판을 latest.md로도 낸다 — README 링크가 버전과 상관없이 최신 릴리즈판을 가리킨다', () => {
  const index = buildIndex([
    { slug: 'design-system', version: '1.2.0', updatedAt: '2026-11-12' },
    { slug: 'design-system', version: '1.3.0', updatedAt: '2026-11-18' },
    { slug: 'safety-rules', version: '1.0.0', updatedAt: '2026-11-05' },
  ])
  assert.deepEqual(latestCopies(index), [
    { from: 'guides/design-system/1.3.0.md', to: 'guides/design-system/latest.md' },
    { from: 'guides/safety-rules/1.0.0.md', to: 'guides/safety-rules/latest.md' },
  ])
})
