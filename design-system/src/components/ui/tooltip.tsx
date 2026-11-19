"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip as TooltipPrimitive } from "radix-ui"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

// 터치 기기는 hover가 없으므로 Trigger를 탭해 열고 닫는다. Radix는 click에 닫으므로 그 닫기를 한 번 무시한다
const TouchTapContext = React.createContext<((wasOpen: boolean) => void) | null>(null)

function Tooltip({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const touchOpening = React.useRef(false)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange]
  )

  const touchTap = React.useCallback(
    (wasOpen: boolean) => {
      touchOpening.current = !wasOpen
      setOpen(!wasOpen)
      setTimeout(() => (touchOpening.current = false))
    },
    [setOpen]
  )

  return (
    <TouchTapContext.Provider value={touchTap}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        open={open}
        onOpenChange={(next) => {
          if (!next && touchOpening.current) return
          setOpen(next)
        }}
        {...props}
      />
    </TouchTapContext.Provider>
  )
}

function TooltipTrigger({
  onPointerDown,
  onClick,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const touchTap = React.useContext(TouchTapContext)
  const tap = React.useRef<{ touch: boolean; wasOpen: boolean }>({ touch: false, wasOpen: false })

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onPointerDown={(event) => {
        // Radix가 pointerdown에 닫기 전의 열림 상태를 남긴다
        const trigger = event.currentTarget
        tap.current = { touch: event.pointerType === "touch", wasOpen: trigger.dataset.state !== "closed" && trigger.dataset.state !== undefined }
        onPointerDown?.(event)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (tap.current.touch) touchTap?.(tap.current.wasOpen)
      }}
      {...props}
    />
  )
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-(--dw-z-tooltip) w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-(--dw-z-tooltip) size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
