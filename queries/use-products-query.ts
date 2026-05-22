import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const productsQueryKey = ["products"] as const

export function useProductsQuery() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: async () => {
      const response = await api.products.$get()
      return response.json()
    }
  })
}

export type ProductsQueryData = Awaited<
  ReturnType<Awaited<ReturnType<typeof api.products.$get>>["json"]>
>

export type ProductListItem = ProductsQueryData[number]
