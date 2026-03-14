"use client"

import { useState } from "react"
import { useAlumniStore } from "@/lib/store"
import { LoginView } from "@/components/login-view"
import { SignupView } from "@/components/signup-view"
import { AppShell } from "@/components/app-shell"

export default function Home() {
  const currentUser = useAlumniStore((state) => state.currentUser)
  const logout = useAlumniStore((state) => state.logout)
  const [authView, setAuthView] = useState<"signup" | "login">("signup")

  if (!currentUser) {
    if (authView === "signup") {
      return <SignupView onSwitchToLogin={() => setAuthView("login")} />
    }
    return <LoginView onSwitchToSignup={() => setAuthView("signup")} />
  }

  return <AppShell onLogout={logout} />
}
