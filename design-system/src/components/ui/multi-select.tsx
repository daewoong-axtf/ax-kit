'use client'

import { Select as SelectPrimitive } from '@base-ui/react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  className?: string
  'aria-invalid'?: boolean
}

/**
 * 보기 앞 체크박스 — Checkbox medium·brand 모양(select.md "Item checkbox (다중)").
 * 장식이라 aria-hidden이고 포커스를 받지 않는다. 켜짐은 보기의 aria-selected가 알린다.
 * 20px 상자를 14/20 줄의 첫 줄 가운데에 둔다.
 */
const CHECKBOX = cn(
  'group/checkbox flex size-5 shrink-0 items-center justify-center rounded-[var(--dw-radius-r1)] bg-[var(--dw-bg-transparent)] text-[var(--dw-fg-on-brand-solid)] shadow-[inset_0_0_0_1px_var(--dw-stroke-neutral-weak)]',
  'transition-colors duration-(--dw-duration-color-transition) ease-(--dw-easing-easing)',
  'data-checked:not-data-disabled:bg-[var(--dw-bg-brand-solid)] data-checked:not-data-disabled:shadow-none',
  'data-disabled:bg-[var(--dw-bg-disabled)] data-disabled:text-[var(--dw-fg-disabled)] data-disabled:shadow-[inset_0_0_0_1px_var(--dw-stroke-neutral-muted)]',
)

/**
 * (DW 커스텀) Radix Select는 다중 선택이 없어 Base UI로 만든다. 명세는 design/components/select.md
 */
function MultiSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  name,
  id,
  disabled,
  required,
  className,
  'aria-invalid': ariaInvalid,
}: MultiSelectProps) {
  const labelOf = (selected: string) => options.find((option) => option.value === selected)?.label ?? selected

  return (
    <SelectPrimitive.Root<string, true>
      multiple
      items={options}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
      required={required}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={ariaInvalid}
        data-slot="multi-select-trigger"
        className={cn(
          'flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-left text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <SelectPrimitive.Value>
          {(selected: string[]) =>
            selected.length ? (
              <span className="flex min-w-0 flex-wrap gap-1">
                {selected.map((item) => (
                  <span
                    key={item}
                    data-slot="multi-select-chip"
                    className="h-7 max-w-full truncate rounded-md bg-[var(--dw-bg-neutral-weak-alpha)] px-2 text-[13px]/7 font-medium"
                  >
                    {labelOf(item)}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-[var(--dw-fg-neutral-subtle)]">{placeholder}</span>
            )
          }
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="shrink-0 text-muted-foreground">
          <ChevronDownIcon className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner alignItemWithTrigger={false} sideOffset={4} className="z-(--dw-z-dropdown) w-(--anchor-width)">
          <SelectPrimitive.Popup
            data-slot="multi-select-content"
            className="max-h-(--available-height) overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none"
          >
            <SelectPrimitive.List>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  data-slot="multi-select-item"
                  className="relative flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-disabled:cursor-not-allowed data-disabled:text-[var(--dw-fg-disabled)] data-highlighted:not-data-disabled:bg-accent data-highlighted:not-data-disabled:text-accent-foreground"
                >
                  <SelectPrimitive.ItemIndicator
                    keepMounted
                    data-slot="multi-select-checkbox"
                    data-disabled={option.disabled ? '' : undefined}
                    render={(props, state) => <span {...props} data-checked={state.selected ? '' : undefined} />}
                    className={CHECKBOX}
                  >
                    <CheckIcon className="size-3 opacity-0 transition-opacity duration-(--dw-duration-color-transition) ease-(--dw-easing-easing) group-data-checked/checkbox:opacity-100" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText className="min-w-0">{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export { MultiSelect }
export type { MultiSelectOption }
