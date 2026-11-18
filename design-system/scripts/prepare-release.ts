// 릴리즈 PR에 버전이 들어가는 파일을 고친다. release.yml이 release-please PR 브랜치에서 부른다
//   package.json          version, designSystem.repository · ref
//   design/catalog.html   업데이트 기록 (같은 버전이 이미 있으면 그대로)
//   node scripts/prepare-release.ts <새 버전>
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const REPOSITORY = 'https://github.com/daewoong-axtf/daewoong-ax-standards'
const HISTORY = /(<h2 id="page-history-title">업데이트 기록<\/h2>\s*<ol>\n)/

export function bumpPackage(source: string, version: string): string {
  const pkg = JSON.parse(source) as { version: string; designSystem: { repository: string; ref: string } }
  pkg.version = version
  pkg.designSystem.repository = REPOSITORY
  pkg.designSystem.ref = `design-system-v${version}`
  return `${JSON.stringify(pkg, null, 2)}\n`
}

/** feat·fix·perf 커밋의 제목만 남긴다 */
export function summarize(subjects: string[]): string {
  const lines = subjects.flatMap((subject) => subject.match(/^(?:feat|fix|perf)(?:\(.+?\))?!?: (.+)$/)?.[1] ?? [])
  return lines.map((line) => (/[.!?]$/.test(line) ? line : `${line}.`)).join(' ')
}

const escapeHtml = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

export function addHistory(html: string, version: string, date: string, summary: string): string {
  if (!HISTORY.test(html)) throw new Error('catalog.html에서 업데이트 기록을 찾지 못했다')
  // 릴리즈 PR이 갱신될 때마다 다시 불리므로 같은 버전은 한 번만 넣는다
  if (html.includes(`<strong>v${version}</strong>`)) return html
  const entry = `        <li>
          <p class="page-history__version"><strong>v${version}</strong><time datetime="${date}">${date}</time></p>
          <p>${escapeHtml(summary)}</p>
        </li>
`
  return html.replace(HISTORY, (open) => open + entry)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [version] = process.argv.slice(2)
  if (!version) throw new Error('사용법: prepare-release.ts <새 버전>')
  // 직전 디자인 시스템 태그. 폴더를 나누기 전의 태그는 v1.2.0처럼 접두사가 없다
  const git = (...args: string[]): string => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
  const previous = git('describe', '--tags', '--abbrev=0', '--match', 'design-system-v*', '--match', 'v*', 'HEAD').trim()
  const log = git('log', `${previous}..HEAD`, '--format=%s', '--', '.')
  const pkgPath = join(ROOT, 'package.json')
  const catalogPath = join(ROOT, 'design/catalog.html')
  writeFileSync(pkgPath, bumpPackage(readFileSync(pkgPath, 'utf8'), version))
  writeFileSync(
    catalogPath,
    addHistory(
      readFileSync(catalogPath, 'utf8'),
      version,
      new Date().toISOString().slice(0, 10),
      summarize(log.split('\n')),
    ),
  )
}
