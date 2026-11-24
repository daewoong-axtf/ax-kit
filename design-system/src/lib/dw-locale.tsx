'use client'

import * as React from 'react'
import { en, ko, type DwMessageKey } from '@/lib/dw-messages'

export type DwLocale = 'ko' | 'en'
export type DwMessages = Partial<Record<DwMessageKey, string>>
/** date-fns `Locale`을 받는 자리. date-fns 없이 쓰도록 모양만 적는다(날짜 기본값은 dw-date.ts) */
export type DwDateLocale = { code: string }

type DwLocaleState = {
  locale: DwLocale
  dateLocale?: DwDateLocale
  messages: DwMessages
}

const TABLES: Record<DwLocale, Record<DwMessageKey, string>> = { ko, en }

// Provider가 없으면 한국어 표 그대로다
const DEFAULT_STATE: DwLocaleState = { locale: 'ko', messages: {} }

const DwLocaleContext = React.createContext<DwLocaleState>(DEFAULT_STATE)

type DwLocaleProviderProps = {
  /** `'ko'`·`'en'`. `en-US`처럼 en으로 시작하면 영어, 그 밖의 값은 한국어로 맞춘다 */
  locale?: DwLocale | (string & {})
  messages?: DwMessages
  dateLocale?: DwDateLocale
  children: React.ReactNode
}

// 표에 없는 언어 값('en-US'·'ja' 등)이 와도 멈추지 않게 둘 중 하나로 맞춘다
function normalizeLocale(locale: string): DwLocale {
  return /^en/i.test(locale) ? 'en' : 'ko'
}

/** 문구 표와 날짜 로케일을 정한다. 중첩하면 안쪽이 지정한 값만 바깥을 덮는다. */
function DwLocaleProvider({ locale, messages, dateLocale, children }: DwLocaleProviderProps) {
  const parent = React.useContext(DwLocaleContext)
  const value = React.useMemo<DwLocaleState>(
    () => ({
      locale: locale === undefined ? parent.locale : normalizeLocale(locale),
      dateLocale: dateLocale ?? parent.dateLocale,
      messages: messages ? { ...parent.messages, ...messages } : parent.messages,
    }),
    [locale, dateLocale, messages, parent],
  )
  return <DwLocaleContext.Provider value={value}>{children}</DwLocaleContext.Provider>
}

/** `{name}` 자리표시를 채운다. 값이 없으면 자리표시를 그대로 둔다. */
function format(template: string, values?: Record<string, string | number>) {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
  )
}

function useDwMessages() {
  const { locale, messages } = React.useContext(DwLocaleContext)
  return React.useCallback(
    (key: DwMessageKey, values?: Record<string, string | number>): string => {
      // 자기 키만 찾는다 — toString 같은 상속 이름은 표에 없는 키로 본다
      const own = (table: Partial<Record<DwMessageKey, string>>) => (Object.hasOwn(table, key) ? table[key] : undefined)
      const template = own(messages) ?? own(TABLES[locale]) ?? own(ko)
      return template === undefined ? String(key) : format(template, values)
    },
    [locale, messages],
  )
}

/** 지금 언어와 Provider가 준 dateLocale(없으면 undefined). 날짜 기본값·형식은 dw-date.ts의 useDwDate */
function useDwLocale(): { locale: DwLocale; dateLocale?: DwDateLocale } {
  const { locale, dateLocale } = React.useContext(DwLocaleContext)
  return React.useMemo(() => ({ locale, dateLocale }), [locale, dateLocale])
}

export { DwLocaleProvider, useDwMessages, useDwLocale }
