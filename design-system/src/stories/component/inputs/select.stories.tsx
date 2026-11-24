import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Field, FieldLabel } from '@/components/ui/field'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const meta = {
  title: 'Component/Inputs/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '여러 보기 중 하나를 드롭다운으로 고른다. 명세는 `design/components/select.md`.',
      },
    },
  },
  render: (args) => (
    <Field className="w-64">
      <FieldLabel htmlFor="city">도시</FieldLabel>
      <Select {...args}>
        <SelectTrigger id="city">
          <SelectValue placeholder="도시 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>수도권</SelectLabel>
            <SelectItem value="seoul">서울</SelectItem>
            <SelectItem value="incheon">인천</SelectItem>
            <SelectItem value="gyeonggi">경기</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>그 외</SelectLabel>
            <SelectItem value="busan">부산</SelectItem>
            <SelectItem value="daegu">대구</SelectItem>
            <SelectItem value="jeju" disabled>
              제주(준비 중)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  ),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox', { name: '도시' })
    await userEvent.click(trigger)
    const body = within(document.body)
    await userEvent.click(await body.findByRole('option', { name: '부산' }))
    await expect(trigger).toHaveTextContent('부산')
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const WithValue: Story = { args: { defaultValue: 'seoul' } }

export const Disabled: Story = { args: { disabled: true } }

const REGIONS = [
  { value: 'seoul', label: '서울' },
  { value: 'busan', label: '부산' },
  { value: 'daegu', label: '대구' },
  { value: 'jeju', label: '제주(준비 중)', disabled: true },
]

/** 보기의 앞 체크박스. 장식이라 접근성 트리에 없고, 상태는 보기의 aria-selected가 알린다 */
const checkboxOf = (option: HTMLElement) => option.querySelector<HTMLElement>('[data-slot="multi-select-checkbox"]')

/** 보기마다 앞에 체크박스가 있고, 고른 보기만 켜져 있으며, 뒤 check는 없다 */
async function expectCheckboxes(options: HTMLElement[]) {
  for (const option of options) {
    const checkbox = checkboxOf(option)
    await expect(checkbox).not.toBeNull()
    await expect(option.firstElementChild).toBe(checkbox)
    await expect(checkbox).toHaveAttribute('aria-hidden', 'true')
    await expect(checkbox).not.toHaveAttribute('tabindex')
    await expect(checkbox!.hasAttribute('data-checked')).toBe(option.getAttribute('aria-selected') === 'true')
    await expect(checkbox!.hasAttribute('data-disabled')).toBe(option.hasAttribute('data-disabled'))
    // 보기 안의 아이콘은 체크박스의 check 하나뿐이다 — 뒤 check가 남지 않는다
    await expect(option.querySelectorAll('svg')).toHaveLength(1)
    await expect(checkbox!.contains(option.querySelector('svg'))).toBe(true)
    // 꺼진 체크박스도 20px 상자가 실제로 보인다
    await expect(checkbox).toBeVisible()
    const box = checkbox!.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([20, 20])
  }
}

/** 목록은 열린 채로 있고, 고른 값은 칩으로 쌓인다. 보기마다 앞에 체크박스가 있다 */
export const Multiple: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="regions">지역</FieldLabel>
      <MultiSelect id="regions" options={REGIONS} defaultValue={['seoul']} placeholder="지역 선택" name="regions" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    await userEvent.click(canvas.getByRole('combobox', { name: /지역/ }))
    await userEvent.click(await body.findByRole('option', { name: '부산' }))
    await expect(body.getByRole('option', { name: '부산' })).toHaveAttribute('aria-selected', 'true')
    await expect(checkboxOf(body.getByRole('option', { name: '서울' }))).toHaveAttribute('data-checked')
    await expect(checkboxOf(body.getByRole('option', { name: '부산' }))).toHaveAttribute('data-checked')
    await userEvent.click(body.getByRole('option', { name: '서울' }))
    await expect(body.getByRole('option', { name: '서울' })).toHaveAttribute('aria-selected', 'false')
    await expect(checkboxOf(body.getByRole('option', { name: '서울' }))).not.toHaveAttribute('data-checked')
    await expectCheckboxes(body.getAllByRole('option'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('listbox')).not.toBeInTheDocument())
    await expect(canvas.getByRole('combobox', { name: /지역/ })).toHaveTextContent('부산')
    await expect(canvas.getByRole('combobox', { name: /지역/ })).not.toHaveTextContent('서울')
  },
}

export const MultipleEmpty: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="regions-empty">지역</FieldLabel>
      <MultiSelect id="regions-empty" options={REGIONS} placeholder="지역 선택" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    const trigger = canvas.getByRole('combobox', { name: /지역/ })
    trigger.focus()
    await userEvent.keyboard('{ArrowDown}')
    const seoul = await body.findByRole('option', { name: '서울' })
    await waitFor(() => expect(seoul).toHaveAttribute('data-highlighted'))
    await expectCheckboxes(body.getAllByRole('option'))
    await userEvent.keyboard('{Enter}')
    await expect(seoul).toHaveAttribute('aria-selected', 'true')
    await expect(checkboxOf(seoul)).toHaveAttribute('data-checked')
    await userEvent.keyboard('{ArrowDown}')
    const busan = body.getByRole('option', { name: '부산' })
    await waitFor(() => expect(busan).toHaveAttribute('data-highlighted'))
    await userEvent.keyboard(' ')
    await expect(busan).toHaveAttribute('aria-selected', 'true')
    await expect(checkboxOf(busan)).toHaveAttribute('data-checked')
    await userEvent.keyboard(' ')
    await expect(busan).toHaveAttribute('aria-selected', 'false')
    await expect(checkboxOf(busan)).not.toHaveAttribute('data-checked')
    await expectCheckboxes(body.getAllByRole('option'))
    await expect(body.getByRole('listbox')).toBeInTheDocument()
  },
}

const ROLES = [
  { value: 'admin', label: '관리자' },
  { value: 'editor', label: '편집자' },
  { value: 'viewer', label: '열람자' },
  { value: 'auditor', label: '감사 담당자(모든 기록을 열람하고 내려받을 수 있지만 고칠 수는 없음)' },
  { value: 'owner', label: '소유자(바꿀 수 없음)', disabled: true },
  { value: 'guest', label: '손님(준비 중)', disabled: true },
]

/** 고를 수 없는 보기는 체크박스도 비활성으로 보이고 눌러도 바뀌지 않는다. 고른 채 잠긴 보기는 켜진 비활성 */
export const MultipleDisabledOption: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="roles">역할</FieldLabel>
      <MultiSelect id="roles" options={ROLES} defaultValue={['owner', 'viewer']} placeholder="역할 선택" name="roles" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    await userEvent.click(canvas.getByRole('combobox', { name: /역할/ }))
    const owner = await body.findByRole('option', { name: /소유자/ })
    const guest = body.getByRole('option', { name: /손님/ })
    await expectCheckboxes(body.getAllByRole('option'))
    await expect(checkboxOf(owner)).toHaveAttribute('data-checked')
    await expect(checkboxOf(owner)).toHaveAttribute('data-disabled')
    await expect(checkboxOf(guest)).not.toHaveAttribute('data-checked')
    await expect(checkboxOf(guest)).toHaveAttribute('data-disabled')
    await userEvent.click(guest, { pointerEventsCheck: 0 })
    await userEvent.click(owner, { pointerEventsCheck: 0 })
    await expect(guest).toHaveAttribute('aria-selected', 'false')
    await expect(checkboxOf(guest)).not.toHaveAttribute('data-checked')
    await expect(owner).toHaveAttribute('aria-selected', 'true')
    await expect(checkboxOf(owner)).toHaveAttribute('data-checked')
    // 키보드: 비활성 보기에도 강조는 오지만 Space·Enter로 바뀌지 않는다
    const auditor = body.getByRole('option', { name: /감사 담당자/ })
    await userEvent.hover(auditor)
    await waitFor(() => expect(auditor).toHaveAttribute('data-highlighted'))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(owner).toHaveAttribute('data-highlighted'))
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{Enter}')
    await expect(owner).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(guest).toHaveAttribute('data-highlighted'))
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{Enter}')
    await expect(guest).toHaveAttribute('aria-selected', 'false')
    await expect(checkboxOf(guest)).not.toHaveAttribute('data-checked')
    await expect(body.getByRole('listbox')).toBeInTheDocument()
    await expectCheckboxes(body.getAllByRole('option'))
  },
}
