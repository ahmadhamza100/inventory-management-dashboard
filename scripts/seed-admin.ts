import * as readline from "readline"
import { env } from "@/env.config"
import { createAdminClient } from "@/utils/supabase/admin"

const DEFAULT_EMAIL = "admin@example.com"
const DEFAULT_PASSWORD = "admin123456"

function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function createAdmin() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set")
    process.exit(1)
  }

  try {
    const emailInput = await question(
      rl,
      `Enter email (default: ${DEFAULT_EMAIL}): `
    )
    const passwordInput = await question(
      rl,
      `Enter password (default: ${DEFAULT_PASSWORD}): `
    )
    const name = await question(
      rl,
      "Enter name (optional, press Enter to skip): "
    )

    const email = emailInput || DEFAULT_EMAIL
    const password = passwordInput || DEFAULT_PASSWORD

    if (!email || !password) {
      console.error("Email and password are required")
      process.exit(1)
    }

    const supabaseAdmin = createAdminClient()

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find((u) => u.email === email)

    if (existingUser) {
      // Update existing user to admin
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            full_name: name || email.split("@")[0],
            role: "admin",
            banned: false
          }
        })

      if (updateError) {
        console.error("Error updating user:", updateError.message)
        process.exit(1)
      }

      console.log(`✅ User ${email} updated to admin role`)
    } else {
      // Create new admin user
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name || email.split("@")[0],
            role: "admin",
            banned: false
          }
        })

      if (authError) {
        console.error(
          "Error creating user in Supabase Auth:",
          authError.message
        )
        process.exit(1)
      }

      if (!authUser.user) {
        console.error("Failed to create user")
        process.exit(1)
      }

      console.log(`✅ Admin user created successfully:`)
      console.log(`   Email: ${email}`)
      console.log(`   Name: ${name || "N/A"}`)
      console.log(`   Role: admin`)
    }
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

createAdmin()
