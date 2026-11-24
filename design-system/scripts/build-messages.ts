// design/messages.json(컴포넌트 문구의 정본)에서 두 곳을 만든다
//   src/lib/dw-messages.ts                          React용 ko·en 표와 DwMessageKey 타입
//   design/js/components.ts의 MESSAGES 구역         /* MESSAGES:start */…/* MESSAGES:end */ — 스크립트는 의존성이 없어 표를 파일 안에 둔다
// components.ts를 바꾼 뒤에는 pnpm build:catalog가 components.js를 다시 만든다
//   node scripts/build-messages.ts [--check]
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const HEADER = '// 생성 파일 — design/messages.json을 고치고 pnpm build:messages'

type Messages = Record<string, { ko: string; en: string }>
type Locale = 'ko' | 'en'
const LOCALES: Locale[] = ['ko', 'en']

const str = (s: string): string => JSON.stringify(s)
const table = (messages: Messages, locale: Locale, indent: string): string =>
  Object.entries(messages).map(([key, text]) => `${indent}${str(key)}: ${str(text[locale])},`).join('\n')

export function buildMessagesTs(json: string): string {
  const messages: Messages = JSON.parse(json)
  const keys = Object.keys(messages).map((key) => `  | ${str(key)}`).join('\n')
  const tables = LOCALES.map((locale) => `export const ${locale}: Record<DwMessageKey, string> = {\n${table(messages, locale, '  ')}\n}\n`)
  return `${HEADER}\nexport type DwMessageKey =\n${keys}\n\n${tables.join('\n')}`
}

const REGION = /\/\* MESSAGES:start \*\/[\s\S]*?\/\* MESSAGES:end \*\//

export function fillBehaviorMessages(ts: string, json: string): string {
  if (!REGION.test(ts)) throw new Error('components.ts에 /* MESSAGES:start */ … /* MESSAGES:end */ 구역이 없다')
  const messages: Messages = JSON.parse(json)
  const body = LOCALES.map((locale) => `    ${locale}: {\n${table(messages, locale, '      ')}\n    },`).join('\n')
  return ts.replace(REGION, () => `/* MESSAGES:start */\n  const MESSAGES = {\n${body}\n  } as const\n  /* MESSAGES:end */`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const json = readFileSync(join(ROOT, 'design', 'messages.json'), 'utf8')
  const behavior = join(ROOT, 'design', 'js', 'components.ts')
  const targets: Array<[string, string]> = [
    [join(ROOT, 'src', 'lib', 'dw-messages.ts'), buildMessagesTs(json)],
    [behavior, fillBehaviorMessages(readFileSync(behavior, 'utf8'), json)],
  ]
  for (const [file, out] of targets) {
    let current = ''
    try {
      current = readFileSync(file, 'utf8')
    } catch {}
    if (process.argv.includes('--check')) {
      if (out !== current) {
        console.error(`${file} 가 최신이 아니다 — pnpm build:messages`)
        process.exitCode = 1
      }
    } else {
      writeFileSync(file, out)
      console.log(`→ ${file}`)
    }
  }
}
