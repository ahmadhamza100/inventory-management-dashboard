"use client"

import { useRouter } from "next/navigation"
import { ROUTES } from "@/utils/routes"
import { createClient } from "@/utils/supabase/client"
import { IconUser, IconSettings, IconLogout } from "@tabler/icons-react"
import { useCurrentUserQuery } from "@/queries/use-current-user-query"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar
} from "@heroui/react"

export function UserMenu() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useCurrentUserQuery()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(ROUTES.login)
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          size="sm"
          name={user?.name || "User"}
          className="cursor-pointer transition-transform"
          color="primary"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu" variant="flat">
        <DropdownSection showDivider>
          <DropdownItem
            key="profile-info"
            className="h-14 gap-2"
            textValue={`Signed in as ${user?.email || ""}`}
            isReadOnly
          >
            <p className="font-semibold">{user?.name || "User"}</p>
            <p className="text-sm text-default-500">{user?.email || ""}</p>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider>
          <DropdownItem key="profile" startContent={<IconUser size={18} />}>
            Profile
          </DropdownItem>
          <DropdownItem
            key="settings"
            startContent={<IconSettings size={18} />}
          >
            Settings
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem
            key="logout"
            color="danger"
            className="text-danger"
            startContent={<IconLogout size={18} />}
            onPress={handleSignOut}
          >
            Log out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}
