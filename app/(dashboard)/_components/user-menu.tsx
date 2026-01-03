"use client"

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar
} from "@heroui/react"
import { IconUser, IconSettings, IconLogout } from "@tabler/icons-react"

export function UserMenu() {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          size="sm"
          name="John Doe"
          src="https://i.pravatar.cc/150?u=dashboard-user"
          className="cursor-pointer transition-transform"
          color="primary"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu" variant="flat">
        <DropdownSection showDivider>
          <DropdownItem
            key="profile-info"
            className="h-14 gap-2"
            textValue="Signed in as johndoe@example.com"
            isReadOnly
          >
            <p className="font-semibold">John Doe</p>
            <p className="text-sm text-default-500">johndoe@example.com</p>
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
          >
            Log out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}
