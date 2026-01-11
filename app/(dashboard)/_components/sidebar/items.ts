import { ROUTES } from "@/utils/routes"
import {
  IconFileInvoice,
  IconLayoutDashboard,
  IconPackage,
  IconSettings2,
  IconTransactionDollar,
  IconUsers
} from "@tabler/icons-react"

export const SIDEBAR_ITEMS = [
  {
    href: ROUTES.dashboard,
    icon: IconLayoutDashboard,
    label: "Dashboard"
  },
  {
    href: ROUTES.products,
    icon: IconPackage,
    label: "Products"
  },
  {
    href: ROUTES.customers,
    icon: IconUsers,
    label: "Customers"
  },
  {
    href: ROUTES.invoices,
    icon: IconFileInvoice,
    label: "Invoices"
  },
  {
    href: ROUTES.transactions,
    icon: IconTransactionDollar,
    label: "Transactions"
  },
  {
    href: ROUTES.settings,
    icon: IconSettings2,
    label: "Settings"
  }
]

export type ISidebarItem = (typeof SIDEBAR_ITEMS)[number]
