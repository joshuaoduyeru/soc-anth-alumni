"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAlumniStore } from "@/lib/store"

// Sections
import { DashboardSection } from "@/components/sections/dashboard"
import { DirectorySection } from "@/components/sections/directory"
import { EventsSection } from "@/components/sections/events"
import { JobsSection } from "@/components/sections/jobs"
import { MentorshipSection } from "@/components/sections/mentorship"
import { CommunicationsSection } from "@/components/sections/communications"
import { BadgesSection } from "@/components/sections/badges"
import { ReportsSection } from "@/components/sections/reports"
import { MyProfileSection } from "@/components/sections/my-profile"
import { ProfileDetail } from "@/components/sections/profile-detail"

type Section = 
  | "dashboard"
  | "directory"
  | "events"
  | "jobs"
  | "mentorship"
  | "communications"
  | "badges"
  | "reports"
  | "my-profile"

interface AppShellProps {
  onLogout: () => void
}

export function AppShell({ onLogout }: AppShellProps) {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [viewingProfileId, setViewingProfileId] = useState<number | null>(null)
  const { currentUser } = useAlumniStore()

  const navItems: { id: Section; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "directory", label: "Directory" },
    { id: "events", label: "Events" },
    { id: "jobs", label: "Jobs" },
    { id: "mentorship", label: "Mentorship" },
    { id: "communications", label: "Comms" },
    { id: "badges", label: "Badges" },
    { id: "reports", label: "Reports" },
    { id: "my-profile", label: "My Profile" },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleViewProfile = (id: number) => {
    setViewingProfileId(id)
  }

  const handleBackToApp = () => {
    setViewingProfileId(null)
  }

  if (viewingProfileId !== null) {
    return (
      <ProfileDetail
        alumniId={viewingProfileId}
        onBack={handleBackToApp}
        onLogout={onLogout}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="bg-[var(--primary)] h-16 flex items-center px-4 lg:px-9 gap-2 sticky top-0 z-50 border-b border-white/5">
        <div 
          className="font-serif text-lg font-black text-white cursor-pointer whitespace-nowrap mr-4"
          onClick={() => setActiveSection("dashboard")}
        >
          Sociology & Anthropology <span className="text-[var(--secondary)]">Alumni</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex flex-1 gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                activeSection === item.id
                  ? "bg-[var(--secondary)]/20 text-[var(--gold-light)]"
                  : "text-white/55 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="w-9 h-9 rounded-full bg-[var(--secondary)] flex items-center justify-center font-bold text-sm text-[var(--primary)]">
            {currentUser ? getInitials(currentUser.name) : "?"}
          </div>
          <span className="hidden lg:block text-sm text-white/75 whitespace-nowrap">
            {currentUser?.name}
          </span>
          <span className="hidden lg:block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--secondary)]/20 text-[var(--gold-light)]">
            {currentUser?.role}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white/60 border border-white/15 hover:bg-white/10 hover:text-white"
          >
            Sign out
          </Button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex gap-1 p-2 bg-[var(--primary)] overflow-x-auto border-b border-white/5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
              activeSection === item.id
                ? "bg-[var(--secondary)]/20 text-[var(--gold-light)]"
                : "text-white/55 hover:bg-white/10 hover:text-white"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {activeSection === "dashboard" && <DashboardSection onViewProfile={handleViewProfile} />}
        {activeSection === "directory" && <DirectorySection onViewProfile={handleViewProfile} />}
        {activeSection === "events" && <EventsSection />}
        {activeSection === "jobs" && <JobsSection />}
        {activeSection === "mentorship" && <MentorshipSection onViewProfile={handleViewProfile} />}
        {activeSection === "communications" && <CommunicationsSection />}
        {activeSection === "badges" && <BadgesSection onViewProfile={handleViewProfile} />}
        {activeSection === "reports" && <ReportsSection />}
        {activeSection === "my-profile" && <MyProfileSection onViewProfile={handleViewProfile} />}
      </main>
    </div>
  )
}
