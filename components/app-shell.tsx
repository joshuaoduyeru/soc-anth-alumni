"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAlumniStore } from "@/lib/store"
import { UserProfileDropdown } from "@/components/user-profile-dropdown"

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

export function AppShell() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [viewingProfileId, setViewingProfileId] = useState<number | string | null>(null)
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

  const handleViewProfile = (id: number | string) => {
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
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--cream)' }}>
      {/* Top Bar */}
      <header 
        className="h-16 flex items-center px-4 lg:px-9 gap-2 sticky top-0 z-50 border-b"
        style={{
          backgroundColor: 'var(--ink)',
          borderBottomColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div 
          className="font-serif text-lg font-black cursor-pointer whitespace-nowrap mr-4"
          onClick={() => setActiveSection("dashboard")}
          style={{ color: 'var(--cream)' }}
        >
          OAU-<span style={{ color: 'var(--gold)' }}>SAN</span>
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
                  ? "text-white"
                  : "text-white/55 hover:bg-white/10 hover:text-white"
              )}
              style={
                activeSection === item.id
                  ? { backgroundColor: 'rgba(200, 150, 62, 0.18)', color: 'var(--gold-l)' }
                  : {}
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          <UserProfileDropdown />
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav 
        className="md:hidden flex gap-1 p-2 overflow-x-auto border-b"
        style={{
          backgroundColor: 'var(--ink)',
          borderBottomColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap"
            )}
            style={
              activeSection === item.id
                ? { 
                    backgroundColor: 'rgba(200, 150, 62, 0.18)',
                    color: 'var(--gold-l)',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: 'rgba(255,255,255,0.55)',
                  }
            }
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
