"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Button,
  Label,
  ListBox,
  SearchField,
  Spinner,
  useFilter
} from "@heroui/react"

export type SearchableEntityListProps<T extends object> = {
  label: ReactNode
  /** Full row of items; when undefined, list is treated as loading. */
  items: readonly T[] | undefined
  isLoading?: boolean
  isDisabled?: boolean
  selectedId?: string
  onSelect: (id: string) => void
  getItemId: (item: T) => string
  getTextValue: (item: T) => string
  /** One-line label when an item is selected (defaults to full search text). */
  getSelectedSummary?: (item: T) => string
  renderItem: (item: T) => ReactNode
  searchPlaceholder: string
  searchAriaLabel: string
  listAriaLabel: string
  emptyNoData: string
  emptyNoMatch: string
  /** When false, selection is cleared after each pick (e.g. add-to-list). */
  persistSelection?: boolean
  /** Bump to remount the list and clear keyboard selection after a transient pick. */
  listResetKey?: number
  listMaxHeightClassName?: string
}

export function SearchableEntityList<T extends object>({
  label,
  items,
  isLoading = false,
  isDisabled = false,
  selectedId,
  onSelect,
  getItemId,
  getTextValue,
  getSelectedSummary,
  renderItem,
  searchPlaceholder,
  searchAriaLabel,
  listAriaLabel,
  emptyNoData,
  emptyNoMatch,
  persistSelection = true,
  listResetKey = 0,
  listMaxHeightClassName = "max-h-60"
}: SearchableEntityListProps<T>) {
  const { contains } = useFilter({ sensitivity: "base" })
  const [filterText, setFilterText] = useState("")

  const filtered = useMemo(() => {
    if (items == null) return []
    const q = filterText.trim()
    if (!q) return [...items]
    return items.filter((item) => contains(getTextValue(item), q))
  }, [items, filterText, contains, getTextValue])

  const showLoading = isLoading || items === undefined
  const noServerRows = !showLoading && items !== undefined && items.length === 0
  const noMatches =
    !showLoading &&
    items !== undefined &&
    items.length > 0 &&
    filtered.length === 0 &&
    !!filterText.trim()

  const selectedKeys =
    persistSelection && selectedId
      ? new Set<string>([selectedId])
      : new Set<string>()

  const selectedItem =
    selectedId && items != null
      ? items.find((i) => getItemId(i) === selectedId)
      : undefined
  const selectedSummaryText =
    selectedItem != null
      ? (getSelectedSummary?.(selectedItem) ?? getTextValue(selectedItem))
      : selectedId
        ? "Selected"
        : null

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label className="text-foreground text-sm font-medium">{label}</Label>

      {persistSelection && selectedId ? (
        <div className="flex items-start justify-between gap-2">
          <p className="text-default-600 line-clamp-2 min-w-0 text-sm">
            {selectedSummaryText}
          </p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="shrink-0"
            onPress={() => onSelect("")}
          >
            Clear
          </Button>
        </div>
      ) : null}

      <SearchField
        aria-label={searchAriaLabel}
        value={filterText}
        onChange={setFilterText}
        isDisabled={isDisabled || showLoading}
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={searchPlaceholder} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div
        className={`border-divider bg-content1/30 min-h-[8.5rem] min-w-0 overflow-y-auto overscroll-y-contain rounded-xl border ${listMaxHeightClassName} ${isDisabled ? "pointer-events-none opacity-60" : ""}`}
      >
        {showLoading ? (
          <div className="flex h-32 items-center justify-center gap-2 text-default-500">
            <Spinner size="sm" color="current" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : noServerRows ? (
          <p className="text-default-500 p-4 text-center text-sm">{emptyNoData}</p>
        ) : noMatches ? (
          <p className="text-default-500 p-4 text-center text-sm">{emptyNoMatch}</p>
        ) : (
          <ListBox
            key={listResetKey}
            aria-label={listAriaLabel}
            selectionMode="single"
            selectedKeys={selectedKeys}
            items={filtered}
            onSelectionChange={(keys) => {
              if (keys === "all") return
              const first = keys.size ? [...keys][0] : null
              const id = first != null ? String(first) : ""
              onSelect(id)
            }}
            className="p-1 outline-none"
          >
            {(item) => (
              <ListBox.Item
                id={getItemId(item)}
                textValue={getTextValue(item)}
                className="rounded-lg"
              >
                {renderItem(item)}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </ListBox>
        )}
      </div>
    </div>
  )
}
