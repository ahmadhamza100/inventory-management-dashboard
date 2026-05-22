"use client"

import { useCallback, useState, type ReactNode } from "react"
import { Button, Drawer, useOverlayState, cn } from "@heroui/react"
import { IconAdjustmentsHorizontal, IconFilterX } from "@tabler/icons-react"

export type FilterDraftControls<T> = {
  draft: T
  setDraft: (patch: Partial<T>) => void
}

export type TableFilterDrawerProps<T extends object> = {
  title: string
  description?: string
  /** Active (committed) filter count for the trigger badge */
  activeCount: number
  /** Current applied filters — copied into draft when the drawer opens */
  committed: T
  /** Baseline used by Clear */
  getDefaultDraft: () => T
  /** Persist draft to URL / store, then close */
  onApply: (draft: T) => void | Promise<void>
  children: (ctx: FilterDraftControls<T>) => ReactNode
  triggerAriaLabel?: string
  triggerClassName?: string
  /** Classes on the default toolbar wrapper (filters + optional clear + drawer root) */
  rootClassName?: string
  /**
   * When set, filter / clear controls are rendered here (e.g. next to search) and not
   * bundled with the heading row. Passes the toolbar fragment as `toolbar`.
   */
  toolbarSlot?: (toolbar: ReactNode) => ReactNode
}

/**
 * Right-docked filter drawer with staged edits. **Apply filters** commits and closes.
 * **Clear** resets to defaults, applies, and closes. **Clear filters** appears beside
 * **Filters** when any filter is active.
 */
export function TableFilterDrawer<T extends object>({
  title,
  description,
  activeCount,
  committed,
  getDefaultDraft,
  onApply,
  children,
  triggerAriaLabel = "Open filters",
  triggerClassName,
  rootClassName,
  toolbarSlot
}: TableFilterDrawerProps<T>) {
  const overlay = useOverlayState()
  const { open, close } = overlay

  const [draft, setDraftState] = useState<T>(() => getDefaultDraft())

  const setDraft = useCallback((patch: Partial<T>) => {
    setDraftState((prev) => ({ ...prev, ...patch }))
  }, [])

  const openDrawer = useCallback(() => {
    setDraftState(committed)
    open()
  }, [committed, open])

  const clearCommitted = useCallback(async () => {
    const next = getDefaultDraft()
    setDraftState(next)
    await Promise.resolve(onApply(next))
    close()
  }, [getDefaultDraft, onApply, close])

  const handleApply = useCallback(() => {
    void onApply(draft)
    close()
  }, [draft, onApply, close])

  const toolbarInner = (
    <>
      <Button
        variant="secondary"
        size="md"
        onPress={openDrawer}
        aria-label={
          activeCount > 0
            ? `${triggerAriaLabel}, ${activeCount} active`
            : triggerAriaLabel
        }
        className={cn(
          "h-10 min-h-10 shrink-0 gap-2 rounded-xl border px-3 text-sm font-medium",
          "border-[var(--field-border,var(--color-divider))] bg-[var(--field-background,var(--surface-secondary))] text-foreground shadow-field",
          "outline-none hover:bg-[var(--field-background,var(--surface-secondary))]/90",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "max-md:aspect-square max-md:w-10 max-md:justify-center max-md:px-0",
          "dark:hover:bg-default-100/30",
          "data-[pressed]:opacity-90",
          triggerClassName
        )}
      >
        <IconAdjustmentsHorizontal size={20} className="text-default-500" aria-hidden />
        <span className="max-md:hidden">Filters</span>
        {activeCount > 0 ? (
          <span className="bg-primary/15 text-primary min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-semibold tabular-nums max-md:absolute max-md:right-0 max-md:top-0 max-md:min-w-5 max-md:-translate-y-1/3 max-md:translate-x-1/3 max-md:px-1.5">
            {activeCount}
          </span>
        ) : null}
      </Button>

      {activeCount > 0 ? (
        <Button
          variant="danger-soft"
          size="md"
          className="h-10 min-h-10 shrink-0 gap-2 rounded-xl border px-3 text-sm font-medium max-md:aspect-square max-md:w-10 max-md:justify-center max-md:px-0"
          onPress={() => void clearCommitted()}
          aria-label="Clear all filters"
        >
          <IconFilterX size={18} aria-hidden />
          <span className="max-md:hidden">Clear filters</span>
        </Button>
      ) : null}
    </>
  )

  const toolbarWrapped = (
    <div className={cn("flex flex-wrap items-center gap-2", rootClassName)}>
      {toolbarInner}
    </div>
  )

  const drawer = (
    <Drawer state={overlay}>
      <Drawer.Backdrop className="z-[100]">
        <Drawer.Content
          placement="right"
          className="z-[100] flex h-full max-h-[100dvh] min-h-0 max-w-none"
        >
          <Drawer.Dialog
            data-app-drawer-shell
            className={cn(
              "app-filter-drawer__dialog flex h-full max-h-[100dvh] min-h-0 flex-col border-0 !p-0",
              "w-[min(100vw,22rem)] bg-overlay text-left shadow-2xl sm:w-[28rem]"
            )}
          >
            <Drawer.Header className="border-divider relative shrink-0 border-b px-5 pb-4 pt-5 pr-12">
              <Drawer.CloseTrigger className="absolute end-3 top-3" />
              <Drawer.Heading className="text-lg font-semibold">
                {title}
              </Drawer.Heading>
              {description ? (
                <p className="text-default-500 mt-1 text-sm">{description}</p>
              ) : null}
            </Drawer.Header>

            <Drawer.Body
              className={cn(
                "min-h-0 flex-1 overflow-x-hidden overflow-y-auto !p-0",
                "overscroll-y-contain [-webkit-overflow-scrolling:touch]",
                "[scrollbar-gutter:stable]"
              )}
            >
              <div className="min-w-0 px-4 pb-6 pt-4">
                {children({ draft, setDraft })}
              </div>
            </Drawer.Body>

            <Drawer.Footer className="bg-overlay border-divider sticky bottom-0 z-10 shrink-0 border-t px-5 py-3 shadow-[0_-6px_20px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_-6px_20px_-10px_rgba(0,0,0,0.4)]">
              <div className="flex w-full flex-wrap items-center justify-end gap-2">
                <Button
                  variant="danger-soft"
                  onPress={() => void clearCommitted()}
                >
                  Clear
                </Button>
                <Button variant="primary" onPress={handleApply}>
                  Apply filters
                </Button>
              </div>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )

  if (toolbarSlot) {
    return (
      <>
        {toolbarSlot(toolbarWrapped)}
        {drawer}
      </>
    )
  }

  return (
    <>
      {toolbarWrapped}
      {drawer}
    </>
  )
}
