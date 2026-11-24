import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { expect, userEvent, within } from 'storybook/test'

import { ja } from 'date-fns/locale'

import { Calendar } from '@/components/ui/calendar'
import { DwLocaleProvider } from '@/lib/dw-locale'

const meta = {
  title: 'Component/Inputs/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '화면에 펴 두고 날짜나 기간을 고르는 달력이다. 명세는 `design/components/calendar.md`.',
      },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

// 화면 낭독기가 읽는 이름(aria-label·title·sr-only 글자) 중 영어 낱말이 든 것. 라이브러리 기본 문구가 새는지 본다
// Storybook이 body에 미리 깔아 두는 자리표시(.sb-wrapper)는 뺀다
function englishNames(...roots: ParentNode[]) {
  const own = (selector: string) =>
    roots.flatMap((root) => [...root.querySelectorAll(selector)]).filter((el) => !el.closest('.sb-wrapper'))
  const names = [
    ...own('[aria-label]').map((el) => el.getAttribute('aria-label') ?? ''),
    ...own('[title]').map((el) => el.getAttribute('title') ?? ''),
    ...own('.sr-only').map((el) => el.textContent ?? ''),
  ]
  return [...new Set(names.filter((name) => /[A-Za-z]{2,}/.test(name)))]
}

function SingleDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 4, 20))
  return (
    <div className='grid gap-2'>
      <Calendar mode='single' selected={date} onSelect={setDate} defaultMonth={new Date(2026, 4, 1)} className='rounded-md border' />
      <output data-testid='picked'>{date?.getDate() ?? ''}</output>
    </div>
  )
}

/** 날짜 하나를 고른다. 방향키로 칸을 옮기고 Enter로 고른다 */
export const Default: Story = {
  render: () => <SingleDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /2026년 5월 21일/ }))
    await expect(canvas.getByTestId('picked')).toHaveTextContent('21')
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect(canvas.getByTestId('picked')).toHaveTextContent('22')
    await userEvent.click(canvas.getByRole('button', { name: /다음 달|next/i }))
    await expect(canvas.getByText('2026년 6월')).toBeInTheDocument()
  },
}

function RangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2026, 4, 18), to: new Date(2026, 4, 27) })
  return <Calendar mode='range' selected={range} onSelect={setRange} defaultMonth={new Date(2026, 4, 1)} className='rounded-md border' />
}

/** 시작과 끝을 차례로 고른다 */
export const Range: Story = { render: () => <RangeDemo /> }

function DropdownDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 4, 20))
  return (
    <Calendar
      mode='single'
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 4, 1)}
      captionLayout='dropdown'
      startMonth={new Date(2020, 0)}
      endMonth={new Date(2030, 11)}
      className='rounded-md border'
    />
  )
}

/** 연·월을 드롭다운으로 건너뛴다 */
export const WithDropdown: Story = { render: () => <DropdownDemo /> }

/** 좁은 화면 — 한 칸이 44px이다 */
export const Mobile: Story = {
  render: () => <SingleDemo />,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

function NamesDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <Calendar
      mode='single'
      selected={date}
      onSelect={setDate}
      showWeekNumber
      captionLayout='dropdown'
      startMonth={new Date(2020, 0)}
      endMonth={new Date(2035, 11)}
      className='rounded-md border'
    />
  )
}

/** 한국어일 때 달력의 이름(이전·다음 달, 연·월 선택, 오늘·선택됨, 주 번호)에 영어가 없다 */
export const KoreanNames: Story = {
  render: () => <NamesDemo />,
  globals: { locale: 'ko' },
  // 주 번호 칸(CalendarWeekNumber)이 td에 scope를 그대로 넘기는 기존 결함이 있다. 이 스토리는 이름만 보므로 그 규칙만 끈다
  parameters: { a11y: { config: { rules: [{ id: 'scope-attr-valid', enabled: false }] } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(englishNames(canvasElement, document.body)).toEqual([])
    await expect(canvas.getByRole('button', { name: '다음 달' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /^오늘, .+, 선택됨$/ })).toBeInTheDocument()
    await expect(canvas.getByRole('combobox', { name: '연도' })).toBeInTheDocument()
    await expect(canvas.getAllByRole('rowheader', { name: /^\d+주차$/ }).length).toBeGreaterThan(0)
  },
}

/** Provider의 dateLocale이 월 드롭다운의 이름도 바꾼다 (5.4) */
export const DateLocaleMonths: Story = {
  render: () => (
    <DwLocaleProvider locale='ko' dateLocale={ja}>
      <DropdownDemo />
    </DwLocaleProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const month = canvas.getByRole('combobox', { name: '월' })
    await expect(within(month).getByRole('option', { selected: true })).toHaveTextContent('5月')
  },
}
