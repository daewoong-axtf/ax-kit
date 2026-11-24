import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Slider } from '@/components/ui/slider'

const meta = {
  title: 'Component/Inputs/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '연속된 범위에서 값을 끌어서 고른다. 명세는 `design/components/slider.md`.',
      },
    },
  },
  args: { defaultValue: [40], max: 100, step: 1, className: 'w-72', 'aria-label': '음량' },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole('slider')
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect(thumb).toHaveAttribute('aria-valuenow', '42')
    await userEvent.keyboard('{End}')
    await expect(thumb).toHaveAttribute('aria-valuenow', '100')
  },
}

export const Range: Story = { args: { defaultValue: [20, 80] } }

export const Disabled: Story = { args: { disabled: true } }

/** aria-label 없이 범위를 고르면 두 손잡이 이름은 최솟값·최댓값이다(라이브러리 기본 영어 대신) */
export const KoreanNames: Story = {
  args: { defaultValue: [20, 80], 'aria-label': undefined },
  globals: { locale: 'ko' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('slider', { name: '최솟값' })).toHaveAttribute('aria-valuenow', '20')
    await expect(canvas.getByRole('slider', { name: '최댓값' })).toHaveAttribute('aria-valuenow', '80')
  },
}
