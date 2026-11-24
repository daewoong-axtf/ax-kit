import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { en } from '@/lib/dw-messages'

const meta = {
  title: 'Component/Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '긴 목록을 페이지 단위로 나눠 이동한다. 명세는 `design/components/pagination.md`. 현재 페이지는 URL 쿼리(`?page=`)에 반영한다.',
      },
    },
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=10">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

/** 툴바 언어가 English면 탐색 영역과 이전·다음 링크 이름이 영어다 */
export const English: Story = {
  ...Default,
  globals: { locale: 'en' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole('navigation', { name: en['pagination.label'] })
    await expect(within(nav).getByRole('link', { name: en['pagination.previous'] })).toHaveAttribute('href', '?page=1')
    await expect(within(nav).getByRole('link', { name: en['pagination.next'] })).toHaveAttribute('href', '?page=3')
    await expect(nav).toHaveTextContent(en['pagination.previousShort'])
    await expect(nav).toHaveTextContent(en['pagination.more'])
  },
}
