"use client"

import { Checkbox, Label } from "@heroui/react"

export type UserFilterDraft = {
  role: "all" | "admin" | "staff" | "user"
  status: "all" | "active" | "banned"
}

type UserFiltersFormProps = {
  draft: UserFilterDraft
  setDraft: (patch: Partial<UserFilterDraft>) => void
}

const ROLES: { value: UserFilterDraft["role"]; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "user", label: "User (legacy)" }
]

const STATUSES: { value: UserFilterDraft["status"]; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" }
]

export function UserFiltersForm({ draft, setDraft }: UserFiltersFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div>
        <Label className="text-foreground mb-3 block text-sm font-medium">
          Role
        </Label>
        <div className="border-divider bg-content1/40 flex flex-col gap-0 rounded-xl border p-1">
          {ROLES.map((opt) => (
            <div
              key={opt.value}
              className="hover:bg-default-100/80 rounded-lg px-1 py-0.5"
            >
              <Checkbox
                isSelected={draft.role === opt.value}
                onChange={(selected) => {
                  if (selected) setDraft({ role: opt.value })
                }}
                className="w-full flex-row items-center gap-3 py-2 pl-2 pr-3"
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content className="text-sm">{opt.label}</Checkbox.Content>
              </Checkbox>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-foreground mb-3 block text-sm font-medium">
          Status
        </Label>
        <div className="border-divider bg-content1/40 flex flex-col gap-0 rounded-xl border p-1">
          {STATUSES.map((opt) => (
            <div
              key={opt.value}
              className="hover:bg-default-100/80 rounded-lg px-1 py-0.5"
            >
              <Checkbox
                isSelected={draft.status === opt.value}
                onChange={(selected) => {
                  if (selected) setDraft({ status: opt.value })
                }}
                className="w-full flex-row items-center gap-3 py-2 pl-2 pr-3"
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content className="text-sm">{opt.label}</Checkbox.Content>
              </Checkbox>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
