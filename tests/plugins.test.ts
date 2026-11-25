import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

// 플러그인 하나를 넣을 때 고치는 곳: plugins/<이름>/ · marketplace.json · release-please-config · manifest · version.txt
const read = (p: string): string => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const json = (p: string) => JSON.parse(read(p))
const dirs = (p: string): string[] =>
  readdirSync(new URL(`../${p}`, import.meta.url), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

const plugins = dirs('plugins')

/** SKILL.md 머리의 --- 블록에서 한 줄짜리 값만 읽는다. 감싼 따옴표는 벗긴다 */
function frontmatter(md: string): Record<string, string> {
  const block = md.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ''
  return Object.fromEntries(
    block.split('\n').flatMap((line) => {
      const m = line.match(/^([\w-]+):\s*(.*)$/)
      return m ? [[m[1], m[2].replace(/^"(.*)"$/, '$1')]] : []
    }),
  )
}

test('마켓플레이스 항목과 plugins/ 폴더가 1:1이고 source는 상대 경로다', () => {
  const market = json('.claude-plugin/marketplace.json')
  assert.equal(market.name, 'ax-kit')
  assert.equal(market.owner.name, 'daewoong-axtf')
  assert.ok(plugins.length > 0)
  assert.deepEqual(market.plugins.map((p: { name: string }) => p.name).sort(), plugins)
  for (const entry of market.plugins) {
    assert.equal(entry.source, `./plugins/${entry.name}`)
    assert.ok(!('version' in entry), `${entry.name}: 버전은 plugin.json에만 둔다`)
  }
})

test('plugin.json 이름은 폴더, 버전은 manifest · version.txt와 같다', () => {
  const manifest = json('.release-please-manifest.json')
  for (const n of plugins) {
    const plugin = json(`plugins/${n}/.claude-plugin/plugin.json`)
    assert.equal(plugin.name, n)
    assert.match(plugin.version, /^\d+\.\d+\.\d+$/)
    assert.equal(manifest[`plugins/${n}`], plugin.version, `${n}: manifest`)
    assert.equal(read(`plugins/${n}/version.txt`).trim(), plugin.version, `${n}: version.txt`)
    assert.ok(plugin.description, `${n}: description`)
  }
})

test('스킬 frontmatter name은 폴더 이름, description은 1,024자 이하', () => {
  for (const n of plugins) {
    const skills = dirs(`plugins/${n}/skills`)
    assert.ok(skills.length > 0, `${n}: 스킬이 없다`)
    for (const s of skills) {
      const fm = frontmatter(read(`plugins/${n}/skills/${s}/SKILL.md`))
      assert.equal(fm.name, s)
      assert.ok(fm.description && fm.description.length <= 1024, `${s}: description`)
    }
  }
})

test('플러그인마다 release-please 패키지가 있고 릴리즈 PR은 폴더마다 따로다', () => {
  const config = json('release-please-config.json')
  assert.equal(config['separate-pull-requests'], true)
  for (const n of plugins) {
    assert.deepEqual(config.packages[`plugins/${n}`], {
      'release-type': 'simple',
      component: n,
      'extra-files': [{ type: 'json', path: '.claude-plugin/plugin.json', jsonpath: '$.version' }],
    })
  }
})

test('플러그인 설명에 Notion 연결이 필요하다고 알린다', () => {
  for (const n of ['ax']) {
    assert.match(json(`plugins/${n}/.claude-plugin/plugin.json`).description, /Notion/)
  }
})

test('plugins/README.md는 모든 플러그인과 Notion 연결 안내를 담고, 루트 README · AGENTS.md가 가리킨다', () => {
  const guide = read('plugins/README.md')
  for (const n of plugins) assert.ok(guide.includes(`${n}@ax-kit`), `${n}: 설치 명령이 없다`)
  assert.ok(guide.includes('/plugin marketplace add daewoong-axtf/ax-kit'))
  assert.match(guide, /Notion/)
  assert.ok(read('README.md').includes('(plugins/README.md'))
  assert.ok(read('AGENTS.md').includes('(plugins/README.md)'))
})
