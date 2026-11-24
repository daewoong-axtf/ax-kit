// catalog.html → catalog.en.html 번역 — 번역 단위를 뽑고(catalogUnits) 번역표로 바꾼다(translateCatalog)
// HTML 파서 없이 작은 토크나이저로 읽는다. 손으로 쓴 일정한 파일이라 닫는 태그가 어긋나면 바로 멈춘다.
// 한국어 그대로 두는 곳: 생성 구역 ICONS·AI_PROMPT(설정 프롬프트 원문은 setup-prompt.md이고 릴리즈마다 ref가 바뀐다),
// 업데이트 기록 목록(<section class="page-history">의 <ol>, 릴리즈 때 커밋 제목으로 쌓인다). 영어판에서는 lang="ko"를 단다.

export interface CatalogUnit {
  section: string
  kind: 'block' | 'text' | 'attr' | 'script'
  ko: string
}

interface Located extends CatalogUnit {
  start: number
  end: number
  /** 번역표의 영어를 이 자리에 넣을 수 있게 바꾼다 */
  escape: (en: string) => string
}

interface Attr {
  name: string
  value: string
  start: number // 값의 시작(따옴표 안쪽)
  quote: '"' | "'" | ''
}

interface Element {
  type: 'element'
  tag: string
  attrs: Attr[]
  open: number // 여는 태그 끝(>) 바로 뒤
  close: number // 닫는 태그 시작
  children: Node[]
}

interface Text {
  type: 'text'
  start: number
  end: number
}

type Node = Element | Text

const HANGUL = /[ㄱ-ㅎㅏ-ㅣ가-힣]/
const INLINE = new Set(['a', 'b', 'strong', 'em', 'code', 'kbd', 'span', 'small', 'sub', 'sup', 'br', 'mark', 'abbr'])
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
/** 안쪽을 태그로 읽지 않는 요소 */
const RAW = new Set(['script', 'style', 'textarea', 'title'])
/** 사람이 읽는 속성 (data-*는 data-q만 빼고 모두, content는 meta description일 때) */
const ATTRS = new Set(['aria-label', 'aria-valuetext', 'aria-description', 'aria-placeholder', 'aria-roledescription', 'placeholder', 'title', 'alt', 'label', 'value'])

// ── HTML 읽기 ───────────────────────────────────────────

function parse(html: string): Element {
  const root: Element = { type: 'element', tag: '#root', attrs: [], open: 0, close: html.length, children: [] }
  const stack: Element[] = [root]
  const top = (): Element => stack[stack.length - 1]
  let i = 0
  const text = (start: number, end: number): void => {
    if (end > start) top().children.push({ type: 'text', start, end })
  }
  while (i < html.length) {
    const lt = html.indexOf('<', i)
    if (lt < 0) {
      text(i, html.length)
      break
    }
    text(i, lt)
    i = lt
    if (html.startsWith('<!--', i)) {
      // 생성 구역 ICONS·AI_PROMPT는 통째로 건너뛴다
      const region = /^<!--(ICONS|AI_PROMPT):start-->/.exec(html.slice(i, i + 32))?.[1]
      const end = region ? html.indexOf(`<!--${region}:end-->`, i) : i
      const close = end < 0 ? -1 : html.indexOf('-->', end + 4)
      if (close < 0) throw new Error(`닫히지 않은 주석 (${lt})`)
      i = close + 3
      continue
    }
    if (html[i + 1] === '!' || html[i + 1] === '?') {
      i = html.indexOf('>', i) + 1
      if (i === 0) throw new Error(`닫히지 않은 선언 (${lt})`)
      continue
    }
    const endTag = /^<\/([a-zA-Z][\w-]*)\s*>/.exec(html.slice(i, i + 64))
    if (endTag) {
      const tag = endTag[1].toLowerCase()
      if (top().tag !== tag) throw new Error(`</${tag}> 자리(${i})에서 <${top().tag}>가 열려 있다`)
      top().close = i
      stack.pop()
      i += endTag[0].length
      continue
    }
    const name = /^<([a-zA-Z][\w-]*)/.exec(html.slice(i, i + 64))
    if (!name) {
      text(i, i + 1) // 태그가 아닌 <
      i++
      continue
    }
    const tag = name[1].toLowerCase()
    const attrs: Attr[] = []
    i += name[0].length
    let selfClosing = false
    for (;;) {
      while (/\s/.test(html[i] ?? '')) i++
      if (i >= html.length) throw new Error(`닫히지 않은 <${tag}>`)
      if (html[i] === '>') {
        i++
        break
      }
      if (html.startsWith('/>', i)) {
        selfClosing = true
        i += 2
        break
      }
      const attr = /^[^\s=>/]+/.exec(html.slice(i))?.[0] ?? html[i]
      i += attr.length
      while (/\s/.test(html[i])) i++
      if (html[i] !== '=') {
        attrs.push({ name: attr.toLowerCase(), value: '', start: i, quote: '' })
        continue
      }
      i++
      while (/\s/.test(html[i])) i++
      const q = html[i]
      if (q === '"' || q === "'") {
        const end = html.indexOf(q, i + 1)
        if (end < 0) throw new Error(`닫히지 않은 속성 값 (${i})`)
        attrs.push({ name: attr.toLowerCase(), value: html.slice(i + 1, end), start: i + 1, quote: q })
        i = end + 1
      } else {
        const value = /^[^\s>]*/.exec(html.slice(i))?.[0] ?? ''
        attrs.push({ name: attr.toLowerCase(), value, start: i, quote: '' })
        i += value.length
      }
    }
    const el: Element = { type: 'element', tag, attrs, open: i, close: i, children: [] }
    top().children.push(el)
    if (selfClosing || VOID.has(tag)) continue
    if (RAW.has(tag)) {
      const close = html.toLowerCase().indexOf(`</${tag}`, i)
      if (close < 0) throw new Error(`닫히지 않은 <${tag}>`)
      if (tag !== 'script' && tag !== 'style' && close > i) el.children.push({ type: 'text', start: i, end: close })
      el.close = close
      i = html.indexOf('>', close) + 1
      continue
    }
    stack.push(el)
  }
  if (stack.length > 1) throw new Error(`<${top().tag}>가 닫히지 않았다`)
  return root
}

// ── 스크립트 문자열 리터럴 ───────────────────────────────

interface Literal {
  start: number // 따옴표 안쪽
  end: number
  quote: '"' | "'" | '`'
  /** 문자열이면 내용 전체, 템플릿이면 ${…} 밖의 글자에 한글이 있는지 */
  hangul: boolean
}

const KEYWORDS = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'new', 'throw', 'instanceof', 'yield', 'await', 'else', 'do'])

/** 정규식이 올 자리인지 — 앞의 의미 있는 글자로 판단한다 */
function regexAllowed(src: string, i: number): boolean {
  let j = i - 1
  while (j >= 0 && /\s/.test(src[j])) j--
  if (j < 0) return true
  if (/[\w$]/.test(src[j])) {
    let k = j
    while (k >= 0 && /[\w$]/.test(src[k])) k--
    return KEYWORDS.has(src.slice(k + 1, j + 1))
  }
  return !/[)\]]/.test(src[j])
}

function jsLiterals(src: string): Literal[] {
  const all: Literal[] = []
  let i = 0
  const string = (q: '"' | "'"): void => {
    const start = ++i
    while (i < src.length && src[i] !== q && src[i] !== '\n') i += src[i] === '\\' ? 2 : 1
    all.push({ start, end: i, quote: q, hangul: HANGUL.test(src.slice(start, i)) })
    i++
  }
  const template = (): void => {
    const start = ++i
    let own = ''
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') {
        own += src.slice(i, i + 2)
        i += 2
      } else if (src.startsWith('${', i)) {
        i += 2
        code(true)
      } else own += src[i++]
    }
    all.push({ start, end: i, quote: '`', hangul: HANGUL.test(own) })
    i++
  }
  const regex = (): void => {
    const from = i++
    let inClass = false
    while (i < src.length && src[i] !== '\n') {
      if (src[i] === '\\') i++
      else if (src[i] === '[') inClass = true
      else if (src[i] === ']') inClass = false
      else if (src[i] === '/' && !inClass) break
      i++
    }
    if (src[i] !== '/') i = from + 1 // 정규식이 아니었다
    else i++
  }
  /** braces: ${ 안이면 짝이 맞는 } 에서 멈춘다 */
  function code(braces: boolean): void {
    let depth = 0
    while (i < src.length) {
      const c = src[i]
      if (c === '/' && src[i + 1] === '/') i = src.indexOf('\n', i) < 0 ? src.length : src.indexOf('\n', i)
      else if (c === '/' && src[i + 1] === '*') i = src.indexOf('*/', i + 2) < 0 ? src.length : src.indexOf('*/', i + 2) + 2
      else if (c === '"' || c === "'") string(c)
      else if (c === '`') template()
      else if (c === '/' && regexAllowed(src, i)) regex()
      else {
        if (c === '{') depth++
        if (c === '}') {
          if (braces && depth === 0) {
            i++
            return
          }
          depth--
        }
        i++
      }
    }
  }
  code(false)
  // 한글이 든 가장 바깥 리터럴만 단위다 (단위인 템플릿 안의 ${…}는 그 단위에 속한다)
  const units: Literal[] = []
  let covered = -1
  for (const l of all.sort((a, b) => a.start - b.start)) {
    if (l.start < covered || !l.hangul) continue
    units.push(l)
    covered = l.end
  }
  return units
}

/** 영어를 원래 따옴표 종류의 리터럴 안에 넣을 수 있게 바꾼다 (이미 \로 이스케이프된 글자와 ${…}는 그대로) */
function escapeJs(en: string, quote: Literal['quote']): string {
  let out = ''
  for (let i = 0; i < en.length; i++) {
    const c = en[i]
    if (c === '\\') out += en.slice(i, ++i + 1)
    else if (quote === '`' && en.startsWith('${', i)) {
      let depth = 0
      let j = i
      for (; j < en.length; j++) {
        if (en[j] === '{') depth++
        if (en[j] === '}' && --depth === 0) break
      }
      out += en.slice(i, j + 1)
      i = j
    } else if (c === quote) out += `\\${c}`
    else if (c === '\n' && quote !== '`') out += '\\n'
    else out += c
  }
  return out
}

const escapeAttr = (en: string, quote: Attr['quote']): string => {
  if (quote === '"') return en.replaceAll('"', '&quot;')
  if (quote === "'") return en.replaceAll("'", '&#39;')
  throw new Error(`따옴표 없는 속성 값에는 번역을 넣지 않는다: ${en}`)
}

// ── 단위 뽑기 ───────────────────────────────────────────

const attrOf = (el: Element, name: string): string | undefined => el.attrs.find((a) => a.name === name)?.value

function translatableAttr(el: Element, a: Attr): boolean {
  if (a.name === 'data-q') return false
  if (a.name.startsWith('data-') || ATTRS.has(a.name)) return true
  return a.name === 'content' && el.tag === 'meta' && attrOf(el, 'name') === 'description'
}

/** 인라인 태그와 글자만으로 이뤄졌는지 (자식의 자식까지) */
const inlineOnly = (el: Element): boolean => el.children.every((c) => c.type === 'text' || (INLINE.has(c.tag) && inlineOnly(c)))

/** 번역 단위와, 영어판에서 lang="ko"를 달 여는 태그의 > 자리 */
function locate(html: string): { units: Located[]; korean: number[] } {
  const units: Located[] = []
  const korean: number[] = []
  /** 앞뒤 공백을 뺀 자리 */
  const trimmed = (section: string, kind: 'block' | 'text' | 'attr', start: number, end: number, escape: Located['escape']): void => {
    const raw = html.slice(start, end)
    if (!HANGUL.test(raw)) return
    const lead = raw.length - raw.trimStart().length
    const ko = raw.trim()
    units.push({ section, kind, ko, start: start + lead, end: start + lead + ko.length, escape })
  }
  const scripts = (section: string, src: string, offset: number, wrap: (js: string) => string): void => {
    for (const l of jsLiterals(src)) {
      units.push({ section, kind: 'script', ko: src.slice(l.start, l.end), start: offset + l.start, end: offset + l.end, escape: (en) => wrap(escapeJs(en, l.quote)) })
    }
  }
  const asIs = (en: string): string => en

  const walk = (el: Element, section: string, history = false): void => {
    if (el.tag === 'style') return
    if (history && el.tag === 'ol') return void korean.push(el.open - 1)
    if (el.tag === 'section' && (attrOf(el, 'class') ?? '').split(/\s+/).includes('page-history')) history = true
    // lang을 따로 단 요소(언어 링크 등)는 그 언어 그대로 둔다. 문서 뿌리의 <html lang>만 예외
    if (el.tag !== 'html' && el.tag !== '#root' && attrOf(el, 'lang') !== undefined) return
    if (el.tag === 'section' && attrOf(el, 'id') && (attrOf(el, 'class') ?? '').split(/\s+/).includes('demo')) section = attrOf(el, 'id') ?? section

    for (const a of el.attrs) {
      if (/^on/.test(a.name)) scripts(section, a.value, a.start, (js) => escapeAttr(js, a.quote))
      else if (translatableAttr(el, a)) trimmed(section, 'attr', a.start, a.start + a.value.length, (en) => escapeAttr(en, a.quote))
    }
    if (el.tag === 'script') {
      scripts(section, html.slice(el.open, el.close), el.open, (js) => js.replace(/<\/(script)/gi, '<\\/$1'))
      return
    }
    // 블록: 인라인 태그로 쪼개진 문장. 자식 요소가 있고, 그 사이에 글자가 있어야 한다
    const hasElement = el.children.some((c) => c.type === 'element')
    const hasText = el.children.some((c) => c.type === 'text' && html.slice(c.start, c.end).trim())
    if (el.tag !== '#root' && hasElement && hasText && inlineOnly(el)) {
      trimmed(section, 'block', el.open, el.close, asIs)
      return
    }
    for (const c of el.children) {
      if (c.type === 'text') trimmed(section, 'text', c.start, c.end, asIs)
      else walk(c, section, history)
    }
  }
  walk(parse(html), 'page')
  return { units, korean }
}

const strip = ({ section, kind, ko }: Located): CatalogUnit => ({ section, kind, ko })

/** 번역 대상 전부, 문서 순서 */
export function catalogUnits(html: string): CatalogUnit[] {
  return locate(html).units.map(strip)
}

/** 영어판 언어 링크: 한국어판을 가리키게 뒤집는다 */
const flipLink = (html: string): string =>
  html.replace(/<a\b[^>]*\bid="lang"[^>]*>English<\/a>/, (a) =>
    a.replace('href="catalog.en.html"', 'href="catalog.html"').replace('hreflang="en"', 'hreflang="ko"').replace(/(\s)lang="en"/, '$1lang="ko"').replace('>English<', '>한국어<'))

/** 키 조회: "<절 id>::<한국어>" → "<한국어>". 단위 전체가 일치할 때만 바꾼다 */
export function translateCatalog(html: string, table: Record<string, string>): { html: string; missing: CatalogUnit[] } {
  const { units, korean } = locate(html)
  const missing: CatalogUnit[] = []
  const edits: { start: number; end: number; text: string }[] = korean.map((at) => ({ start: at, end: at, text: ' lang="ko"' }))
  for (const u of units) {
    const key = Object.hasOwn(table, `${u.section}::${u.ko}`) ? `${u.section}::${u.ko}` : Object.hasOwn(table, u.ko) ? u.ko : undefined
    if (key === undefined) missing.push(strip(u))
    else edits.push({ start: u.start, end: u.end, text: u.escape(table[key]) })
  }
  let out = ''
  let at = 0
  for (const e of edits.sort((a, b) => a.start - b.start)) {
    out += html.slice(at, e.start) + e.text
    at = e.end
  }
  out += html.slice(at)
  out = out
    .replace(/<html([^>]*?)\slang="ko"/, '<html$1 lang="en"')
    .replace(/<!--AI_PROMPT:start-->([\s\S]*?)<!--AI_PROMPT:end-->/, '<!--AI_PROMPT:start--><span lang="ko">$1</span><!--AI_PROMPT:end-->')
  return { html: flipLink(out), missing }
}
