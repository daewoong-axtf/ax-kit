import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { DwLocaleProvider, useDwLocale, useDwMessages } from '@/lib/dw-locale'
import { useDwDate } from '@/lib/dw-date'
import { en, ko, type DwMessageKey } from '@/lib/dw-messages'

function Probe({ count }: { count?: number }) {
  const t = useDwMessages()
  const { locale, dateLocale: givenDateLocale } = useDwLocale()
  const { dateLocale, dateFormat } = useDwDate()
  return (
    <ul className="flex flex-col gap-1 text-sm">
      <li data-testid="close">{t('common.close')}</li>
      <li data-testid="loading">{t('common.loading')}</li>
      <li data-testid="applied">
        {count === undefined ? t('filter.applied') : t('filter.applied', { count })}
      </li>
      <li data-testid="locale">{locale}</li>
      <li data-testid="dateFormat">{dateFormat}</li>
      <li data-testid="dateLocale">{dateLocale.code}</li>
      <li data-testid="givenDateLocale">{givenDateLocale?.code ?? 'none'}</li>
      <li data-testid="unknown">{t('nope.missing' as DwMessageKey, { count: 1 })}</li>
      <li data-testid="inherited">{t('toString' as DwMessageKey, { count: 1 })}</li>
    </ul>
  )
}

/**
 * 문구 표와 날짜 로케일을 정하는 Provider다. 없으면 한국어다.
 * 툴바의 언어 전환은 스토리를 바깥 Provider로 감싸고, 스토리가 자기 Provider를 두면 안쪽이 이긴다.
 */
const meta = {
  title: 'Element/Locale',
  tags: ['autodocs'],
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// 툴바가 한국어(기본)면 데코레이터가 Provider를 씌우지 않으므로, Provider 없는 기본 경로를 그대로 검증한다
export const Default: Story = {
  render: () => <Probe count={3} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByTestId('close')).toHaveTextContent(ko['common.close'])
    await expect(c.getByTestId('applied')).toHaveTextContent('조회 조건 — 3개 적용됨')
    await expect(c.getByTestId('locale')).toHaveTextContent('ko')
    await expect(c.getByTestId('dateFormat')).toHaveTextContent('yyyy년 M월 d일 (EEE)')
    await expect(c.getByTestId('dateLocale')).toHaveTextContent('ko')
    await expect(c.getByTestId('givenDateLocale')).toHaveTextContent('none')
  },
}

export const English: Story = {
  render: () => (
    <DwLocaleProvider locale="en">
      <Probe count={3} />
    </DwLocaleProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByTestId('close')).toHaveTextContent(en['common.close'])
    await expect(c.getByTestId('applied')).toHaveTextContent('Filters — 3 applied')
    await expect(c.getByTestId('dateFormat')).toHaveTextContent('MMMM d, yyyy (EEE)')
    await expect(c.getByTestId('dateLocale')).toHaveTextContent('en-US')
  },
}

export const Override: Story = {
  render: () => (
    <DwLocaleProvider locale="en" messages={{ 'common.close': 'Dismiss' }}>
      <Probe count={3} />
    </DwLocaleProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByTestId('close')).toHaveTextContent('Dismiss')
    await expect(c.getByTestId('loading')).toHaveTextContent(en['common.loading'])
  },
}

export const Nested: Story = {
  render: () => (
    <DwLocaleProvider locale="en">
      <DwLocaleProvider messages={{ 'common.close': 'Dismiss' }}>
        <Probe count={3} />
      </DwLocaleProvider>
    </DwLocaleProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByTestId('close')).toHaveTextContent('Dismiss')
    await expect(c.getByTestId('loading')).toHaveTextContent(en['common.loading'])
    await expect(c.getByTestId('locale')).toHaveTextContent('en')
  },
}

export const MissingValue: Story = {
  render: () => <Probe />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId('applied')).toHaveTextContent('조회 조건 — {count}개 적용됨')
  },
}

/** 표에 없는 키, Object의 상속 이름(toString)은 키 이름 그대로 돌려주고 멈추지 않는다 */
export const UnknownKey: Story = {
  render: () => <Probe />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByTestId('unknown')).toHaveTextContent('nope.missing')
    await expect(c.getByTestId('inherited')).toHaveTextContent(/^toString$/)
  },
}

/** `en-US`처럼 지역이 붙은 값은 영어로, 지원하지 않는 언어는 한국어로 맞춘다 */
export const RegionTag: Story = {
  render: () => (
    <DwLocaleProvider locale="en-US">
      <Probe count={3} />
    </DwLocaleProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByTestId('locale')).toHaveTextContent(/^en$/)
    await expect(c.getByTestId('close')).toHaveTextContent(en['common.close'])
    await expect(c.getByTestId('dateFormat')).toHaveTextContent('MMMM d, yyyy (EEE)')
  },
}

export const UnsupportedLocale: Story = {
  render: () => (
    <DwLocaleProvider locale="ja">
      <Probe count={3} />
    </DwLocaleProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByTestId('locale')).toHaveTextContent(/^ko$/)
    await expect(c.getByTestId('close')).toHaveTextContent(ko['common.close'])
    await expect(c.getByTestId('applied')).toHaveTextContent('조회 조건 — 3개 적용됨')
  },
}

/** Provider가 준 dateLocale은 useDwLocale로 그대로 보이고, 안쪽 Provider가 덮지 않으면 이어진다 */
export const GivenDateLocale: Story = {
  render: () => (
    <DwLocaleProvider locale="en" dateLocale={{ code: 'en-GB' }}>
      <DwLocaleProvider messages={{ 'common.close': 'Dismiss' }}>
        <Probe count={3} />
      </DwLocaleProvider>
    </DwLocaleProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByTestId('givenDateLocale')).toHaveTextContent('en-GB')
    await expect(c.getByTestId('dateLocale')).toHaveTextContent('en-GB')
  },
}
