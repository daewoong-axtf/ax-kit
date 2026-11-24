import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

const meta = {
  title: 'Component/Feedback/Toast',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '방금 한 행동의 결과를 잠깐 알린다. 명세는 `design/components/toast.md`. shadcn은 sonner를 쓴다 — 앱 루트에 `<Toaster />` 하나를 두고 `toast()`로 띄운다.',
      },
    },
  },
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast('임시 저장했습니다')}>
          기본
        </Button>
        <Button variant="outline" onClick={() => toast.success('저장했습니다')}>
          성공
        </Button>
        <Button variant="outline" onClick={() => toast.warning('연결이 불안정합니다')}>
          경고
        </Button>
        <Button variant="outline" onClick={() => toast.error('저장하지 못했습니다')}>
          실패
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('삭제했습니다', { action: { label: '실행 취소', onClick: () => {} } })}
        >
          행동 포함
        </Button>
      </div>
    </>
  ),
} satisfies Meta<typeof Toaster>

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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '성공' }))
    const message = await within(document.body).findByText('저장했습니다')
    await expect(message).toBeInTheDocument()
    const positive = getComputedStyle(document.documentElement).getPropertyValue('--dw-bg-positive-solid').trim()
    await expect(getComputedStyle(message.closest('[data-sonner-toast]')!).backgroundColor).toBe(positive)
  },
}

/** 한국어일 때 알림 영역과 닫기 버튼 이름에 영어가 없다(단축키 글자도 붙지 않는다) */
export const KoreanNames: Story = {
  args: { closeButton: true },
  globals: { locale: 'ko' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '기본' }))
    const body = within(document.body)
    await expect(await body.findByText('임시 저장했습니다')).toBeInTheDocument()
    // 앞 스토리가 띄운 알림이 남아 있을 수 있어 여러 개를 허용한다
    await waitFor(() => expect(body.getAllByRole('button', { name: '닫기' }).length).toBeGreaterThan(0))
    await expect(body.getByRole('region', { name: '알림' })).toBeInTheDocument()
    await expect(englishNames(canvasElement, document.body)).toEqual([])
  },
}
