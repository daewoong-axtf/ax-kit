// 최소 안전 규칙 조각(rules/safety-rules/parts/)을 합쳐 통합본(daewoong-coding-guide.md)을 만든다
//   조각이 정본이다. 통합본은 생성 파일이라 직접 고치지 않는다
//   버전은 version.txt에서 읽는다. 기준일은 버전이 그대로면 그대로 두고, 버전이 오르면 오늘(한국 시간)로 바꾼다
//   node scripts/build-rules.ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const RULES_DIR = 'rules/safety-rules'
export const PARTS_DIR = `${RULES_DIR}/parts`
export const GUIDE_PATH = `${RULES_DIR}/daewoong-coding-guide.md`

/** 합치는 순서. 통합본 첫머리의 표도 여기서 만든다 */
export const PARTS = [
  { file: 'WORKFLOW.md', summary: '적용 대상과 기술 스택, AX 검사와 핸드오프, 개발 순서, 규격화 원칙', scope: '항상' },
  { file: 'SECURITY.md', summary: '모든 웹앱의 보안·운영 규칙(1~17번)', scope: '항상' },
  { file: 'COMMIT.md', summary: '커밋 메시지, 커밋 단위, 커밋하지 않는 것', scope: '항상' },
  {
    file: 'STACK-TS.md',
    summary: '프론트엔드의 도구·구조·아키텍처·코드 스타일(TS-1~TS-8)',
    scope: '프론트엔드 코드(FastAPI + HTML, Spring Boot + Thymeleaf 구조 제외)',
  },
  {
    file: 'STACK-PY.md',
    summary: '백엔드의 도구·구조·아키텍처·코드 스타일(PY-1~PY-8)',
    scope: 'Python 백엔드 코드, FastAPI가 제공하는 HTML 화면',
  },
  {
    file: 'STACK-JV.md',
    summary: '백엔드의 도구·구조·아키텍처·코드 스타일(JV-1~JV-8)',
    scope: 'Java·Kotlin 백엔드 코드, Spring Boot가 제공하는 Thymeleaf 화면',
  },
] as const

const COUNT = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉']

/** 조각의 제목(첫 줄의 # 제목) */
export function partTitle(text: string, file: string): string {
  const m = text.match(/^# (.+)\n/)
  if (!m) throw new Error(`${file}: 첫 줄이 "# 제목"이 아니다`)
  return m[1]
}

/** 제목을 한 단계 내린다(# → ##). 코드 블록 안의 #은 건드리지 않는다 */
export function demote(text: string): string {
  let fenced = false
  return text
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) fenced = !fenced
      return !fenced && /^#{1,5} /.test(line) ? `#${line}` : line
    })
    .join('\n')
}

export function buildGuide(parts: { file: string; text: string }[], version: string, date: string): string {
  const rows = parts.map(({ file, text }) => {
    const meta = PARTS.find((p) => p.file === file)
    if (!meta) throw new Error(`${file}: PARTS에 없는 조각이다`)
    return `| ${partTitle(text, file)} | ${meta.summary} | ${meta.scope} |`
  })
  const head = [
    `# AI로 만든 웹앱 최소 안전 규칙 (v${version})`,
    '',
    '- 제공: AXTF',
    `- 기준일: ${date}`,
    '- 용도: 코딩 에이전트로 업무용 웹앱을 새로 만들거나 이미 만든 앱에 적용할 때 넣는 규칙 파일 원문. 배포 시 Claude Code는 `CLAUDE.md`, 그 외 도구는 `AGENTS.md`로 이름을 바꿔 앱 폴더 맨 위에 둔다.',
    '',
    `이 파일은 ${COUNT[parts.length] ?? parts.length} 부분으로 되어 있다.`,
    '',
    '| 부분 | 내용 | 적용 |',
    '| --- | --- | --- |',
    ...rows,
  ].join('\n')
  return `${[head, ...parts.map(({ text }) => demote(text).trim())].join('\n\n')}\n`
}

/** 통합본 첫머리에 적힌 버전과 기준일 */
export function readStamp(guide: string): { version: string; date: string } | null {
  const version = guide.match(/^# .*\(v(\d+\.\d+\.\d+)\)\n/)?.[1]
  const date = guide.match(/^- 기준일: (\d{4}-\d{2}-\d{2})$/m)?.[1]
  return version && date ? { version, date } : null
}

export function kstToday(now = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10)
}

export function readParts(root = ROOT): { file: string; text: string }[] {
  return PARTS.map(({ file }) => ({ file, text: readFileSync(join(root, PARTS_DIR, file), 'utf8') }))
}

export function readVersion(root = ROOT): string {
  return readFileSync(join(root, RULES_DIR, 'version.txt'), 'utf8').trim()
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(ROOT, GUIDE_PATH)
  const version = readVersion()
  const stamp = existsSync(out) ? readStamp(readFileSync(out, 'utf8')) : null
  const date = stamp?.version === version ? stamp.date : kstToday()
  const next = buildGuide(readParts(), version, date)
  const changed = !existsSync(out) || readFileSync(out, 'utf8') !== next
  if (changed) writeFileSync(out, next)
  console.log(`${GUIDE_PATH}: v${version} · ${date} ${changed ? '(다시 씀)' : '(그대로)'}`)
}
