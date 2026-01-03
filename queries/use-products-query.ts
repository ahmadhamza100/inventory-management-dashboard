import { useQuery } from "@tanstack/react-query"

type ApiProduct = {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: { rate: number; count: number }
}

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("https://fakestoreapi.com/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data: ApiProduct[] = await response.json()

      return data.map((item) => ({
        id: String(item.id),
        sku: `SKU-${String(item.id).padStart(6, "0")}`,
        name: item.title,
        price: Math.round(item.price * 100),
        stock: item.rating.count,
        image: item.image,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date()
      }))
    }
  })
}

export type Product = NonNullable<
  Awaited<ReturnType<typeof useProductsQuery>>["data"]
>[number]
