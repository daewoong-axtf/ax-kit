'use client'

import * as React from 'react'
import type { Locale } from 'date-fns'
import { enUS, ko } from 'date-fns/locale'
import { useDwLocale, type DwLocale } from '@/lib/dw-locale'

// 날짜 기본값은 여기만 date-fns를 쓴다 — dw-locale.tsx만 가져간 프로젝트는 date-fns 없이 빌드된다
const DATE_LOCALES: Record<DwLocale, Locale> = { ko, en: enUS }
// 영어는 동작 스크립트(Intl dateStyle long + 요일)와 같은 "September 20, 2026 (Sun)"
const DATE_FORMATS: Record<DwLocale, string> = {
  ko: 'yyyy년 M월 d일 (EEE)',
  en: 'MMMM d, yyyy (EEE)',
}

/** 달력·날짜 선택의 date-fns 로케일과 표기 형식. Provider가 dateLocale을 주면 그것을 쓴다 */
function useDwDate(): { dateLocale: Locale; dateFormat: string } {
  const { locale, dateLocale } = useDwLocale()
  return React.useMemo(
    () => ({
      // Provider의 dateLocale은 date-fns Locale을 받는 자리다(타입은 dw-locale.tsx가 date-fns 없이 { code }로만 적는다)
      dateLocale: (dateLocale as Locale | undefined) ?? DATE_LOCALES[locale],
      dateFormat: DATE_FORMATS[locale],
    }),
    [locale, dateLocale],
  )
}

export { useDwDate }
