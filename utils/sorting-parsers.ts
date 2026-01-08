import { createParser } from "nuqs"

type SortDirection = "ascending" | "descending"

const VALID_DIRECTIONS: readonly SortDirection[] = [
  "ascending",
  "descending"
] as const

export type SortDescriptor<TColumn extends string = string> = {
  column: TColumn
  direction: SortDirection
}

export function createSortParser<TColumn extends string>(options: {
  validColumns: readonly TColumn[]
  defaultColumn: TColumn
  defaultDirection?: SortDirection
}) {
  const {
    validColumns,
    defaultColumn,
    defaultDirection = "descending"
  } = options

  const defaultSort: SortDescriptor<TColumn> = {
    column: defaultColumn,
    direction: defaultDirection
  }

  return createParser<SortDescriptor<TColumn>>({
    parse: (value) => {
      if (!value) return defaultSort

      const [column, direction] = value.split(":")

      const validColumn = validColumns.includes(column as TColumn)
        ? (column as TColumn)
        : defaultColumn

      const validDirection = VALID_DIRECTIONS.includes(
        direction as SortDirection
      )
        ? (direction as SortDirection)
        : defaultDirection

      return {
        column: validColumn,
        direction: validDirection
      }
    },
    serialize: (value) => {
      return `${value.column}:${value.direction}`
    },
    eq: (a, b) => {
      return a.column === b.column && a.direction === b.direction
    }
  })
}

export const productSortParser = createSortParser({
  validColumns: ["createdAt", "name", "price", "stock"] as const,
  defaultColumn: "createdAt",
  defaultDirection: "descending"
})
