import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { en } from '@/lib/dw-messages'

const meta = {
  title: 'Component/Feedback/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '집중이 필요한 작업을 화면 위에 띄운다. 명세는 `design/components/dialog.md`. 포커스 가두기·Esc·바깥 클릭·포커스 복귀는 Radix가 처리한다.',
      },
    },
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">프로필 수정</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>변경한 내용은 저장 후 바로 반영됩니다.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="d-name">이름</FieldLabel>
            <Input id="d-name" defaultValue="홍길동" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: '프로필 수정' })
    await userEvent.click(trigger)
    const body = within(document.body)
    const dialog = await body.findByRole('dialog', { name: '프로필 수정' })
    await expect(dialog).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

/** 툴바 언어가 English면 닫기 버튼 이름도 영어다 */
export const English: Story = {
  globals: { locale: 'en' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '프로필 수정' }))
    const dialog = await within(document.body).findByRole('dialog', { name: '프로필 수정' })
    await expect(within(dialog).getByRole('button', { name: en['common.close'] })).toBeInTheDocument()
    await expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument()
  },
}
