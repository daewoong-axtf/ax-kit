"use client"

import type * as React from "react"

import { useDwMessages } from "@/lib/dw-locale"
import type { DwMessageKey } from "@/lib/dw-messages"
import { cn } from "@/lib/utils"

/** 사람 목록은 `명`, 그 외는 `개`. `건`은 쓰지 않는다 */
type ListCountUnit = "명" | "개"

// 단위는 공개 API라 그대로 두고, 보이는 문구만 문구 표에서 고른다
const TOTAL_KEYS: Record<ListCountUnit, DwMessageKey> = { "명": "listFooter.totalPeople", "개": "listFooter.totalItems" }

interface ListFooterProps extends React.ComponentProps<"div"> {
  /** 조회 결과 총 건수. 아직 모르면(로딩·오류) null이고 `-`로 보인다 */
  total: number | null
  unit?: ListCountUnit
  /** 가운데에 둘 Pagination */
  children?: React.ReactNode
}

/**
 * 표·목록 아래 줄. 왼쪽에 총 건수, 가운데에 Pagination을 둔다.
 * 명세는 design/components/list-footer.md
 */
function ListFooter({ total, unit = "개", children, className, ...props }: ListFooterProps) {
  const t = useDwMessages()
  // 숫자만 굵게 그리려고 `{count}` 앞뒤로 나눈다
  // 타입 밖의 단위가 와도 `undefined`가 보이지 않게 `개` 문구로 둔다
  const key = Object.hasOwn(TOTAL_KEYS, unit) ? TOTAL_KEYS[unit] : "listFooter.totalItems"
  const [before, after = ""] = t(key).split("{count}")
  return (
    <div
      data-slot="list-footer"
      className={cn(
        "flex min-w-0 flex-col items-center gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
        className
      )}
      {...props}
    >
      <p aria-live="polite" className="self-start text-sm sm:self-auto">
        {before}<span className="font-bold tabular-nums">{total ?? "-"}</span>
        {after}
      </p>
      {children}
    </div>
  )
}

export { ListFooter }
export type { ListCountUnit, ListFooterProps }
