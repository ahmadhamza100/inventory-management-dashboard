import { useCurrentUserQuery } from "@/queries/use-current-user-query"
import { isAdmin } from "@/utils/auth"
import { ROUTES } from "@/utils/routes"
import {
  IconFileInvoice,
  IconLayoutDashboard,
  IconPackage,
  IconSettings2,
  IconTransactionDollar,
  IconUsers,
  IconUserCog
} from "@tabler/icons-react"

export const SIDEBAR_ITEMS = [
  {
    href: ROUTES.dashboard,
    icon: IconLayoutDashboard,
    label: "Dashboard",
    adminOnly: false
  },
  {
    href: ROUTES.products,
    icon: IconPackage,
    label: "Products",
    adminOnly: false
  },
  {
    href: ROUTES.customers,
    icon: IconUsers,
    label: "Customers",
    adminOnly: false
  },
  {
    href: ROUTES.invoices,
    icon: IconFileInvoice,
    label: "Invoices",
    adminOnly: false
  },
  {
    href: ROUTES.transactions,
    icon: IconTransactionDollar,
    label: "Transactions",
    adminOnly: false
  },
  {
    href: ROUTES.users,
    icon: IconUserCog,
    label: "Users",
    adminOnly: true
  },
  {
    href: ROUTES.settings,
    icon: IconSettings2,
    label: "Settings",
    adminOnly: false
  }
] as const

export type ISidebarItem = (typeof SIDEBAR_ITEMS)[number]

export function useSidebarItems() {
  const { user } = useCurrentUserQuery()
  return SIDEBAR_ITEMS.filter((item) => !item.adminOnly || isAdmin(user))
}
