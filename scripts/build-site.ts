// GitHub Pages에 올릴 _site/를 만든다. 매번 git 태그만 보고 처음부터 만든다
//   index.html · design/          디자인 시스템 카탈로그 (HEAD의 design-system/)
//   guides/index.json             문서별 최신 버전 · 기준일 · 경로 — AX Desk가 읽는다
//   guides/<slug>/<version>.md    태그마다 한 파일. 한 번 올린 판은 바뀌지 않는다
//   node scripts/build-site.ts <outDir>
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const REPOSITORY = 'https://github.com/daewoong-axtf/daewoong-ax-standards'

export type Slug = 'design-system' | 'safety-rules'

/** 받기 버튼이 쓰는 파일 이름 */
const FILE_NAMES: Record<Slug, string> = {
  'design-system': 'daewoong-design-system.md',
  'safety-rules': 'daewoong-coding-guide.md',
}

export interface GuideVersion {
  version: string
  updatedAt: string
  path: string
}

export interface GuideIndex {
  guides: Record<string, { fileName: string; latest: string; versions: GuideVersion[] }>
}

/** v1.2.0처럼 접두사 없는 태그는 폴더를 나누기 전의 디자인 시스템 릴리즈다 */
export function parseTag(tag: string): { slug: Slug; version: string } | null {
  const m = tag.match(/^(?:(design-system|safety-rules)-)?v(\d+\.\d+\.\d+)$/)
  if (!m) return null
  return { slug: (m[1] as Slug | undefined) ?? 'design-system', version: m[2] }
}

export function sourcePath(slug: Slug, tag: string): string {
  if (slug === 'safety-rules') return 'rules/safety-rules/daewoong-coding-guide.md'
  return tag.startsWith('v') ? 'design/ai/setup-prompt.md' : 'design-system/design/ai/setup-prompt.md'
}

export function fillPrompt(raw: string, ref: string): string {
  const out = raw.replaceAll('{{REPOSITORY}}', REPOSITORY).replaceAll('{{REF}}', ref)
  if (out.includes('{{')) throw new Error(`설정 프롬프트(${ref})에 채우지 못한 자리표시자가 있다`)
  return out
}

const compare = (a: string, b: string): number => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number))
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

export function buildIndex(entries: { slug: Slug; version: string; updatedAt: string }[]): GuideIndex {
  const guides: GuideIndex['guides'] = {}
  for (const slug of Object.keys(FILE_NAMES) as Slug[]) {
    const versions = entries
      .filter((e) => e.slug === slug)
      .sort((a, b) => compare(b.version, a.version))
      .map(({ version, updatedAt }) => ({ version, updatedAt, path: `guides/${slug}/${version}.md` }))
    if (versions.length) guides[slug] = { fileName: FILE_NAMES[slug], latest: versions[0].version, versions }
  }
  return { guides }
}

/** 태그 날짜를 한국 시간 YYYY-MM-DD로 */
export function kstDate(iso: string): string {
  return new Date(Date.parse(iso) + 9 * 3600_000).toISOString().slice(0, 10)
}

export function readSource(tag: string, path: string): string {
  try {
    return execFileSync('git', ['show', `${tag}:${path}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch {
    throw new Error(`${tag}에 ${path}가 없다`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2]
  if (!out) throw new Error('사용법: build-site.ts <outDir>')
  rmSync(out, { recursive: true, force: true })
  cpSync(join(ROOT, 'design-system/design'), join(out, 'design'), { recursive: true })
  cpSync(join(ROOT, 'design-system/index.html'), join(out, 'index.html'))

  // annotated 태그는 태그 날짜, 아니면 커밋 날짜
  const refs = execFileSync('git', ['for-each-ref', 'refs/tags', '--format=%(refname:short)%09%(creatordate:iso-strict)'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  const entries = []
  for (const line of refs.split('\n').filter(Boolean)) {
    const [tag, date] = line.split('\t')
    const parsed = parseTag(tag)
    if (!parsed) continue
    const raw = readSource(tag, sourcePath(parsed.slug, tag))
    const text = parsed.slug === 'design-system' ? fillPrompt(raw, tag) : raw
    mkdirSync(join(out, 'guides', parsed.slug), { recursive: true })
    writeFileSync(join(out, 'guides', parsed.slug, `${parsed.version}.md`), text)
    entries.push({ ...parsed, updatedAt: kstDate(date) })
  }
  writeFileSync(join(out, 'guides/index.json'), `${JSON.stringify(buildIndex(entries), null, 2)}\n`)
  console.log(`${out}: ${entries.map((e) => `${e.slug}@${e.version}`).join(', ')}`)
}
