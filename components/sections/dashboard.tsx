"use client"

import { GraduationCap, Calendar, Briefcase, Users } from "lucide-react"
import { useAlumniStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardSectionProps {
  onViewProfile: (id: number | string) => void
}

export function DashboardSection({ onViewProfile }: DashboardSectionProps) {
  const { currentUser, alumni, events, jobs, mentors, badges } = useAlumniStore()

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date())

  // Derive display name safely
  const displayName =
    currentUser?.fullName ||
    currentUser?.name ||
    (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "")

  const stats = [
    { label: "Total Alumni",    value: alumni.length,          icon: GraduationCap },
    { label: "Upcoming Events", value: upcomingEvents.length,  icon: Calendar },
    { label: "Active Jobs",     value: jobs.length,            icon: Briefcase },
    { label: "Mentors",         value: mentors.length,         icon: Users },
  ]

  const recentActivity = [
    { text: "Platform launched with seed data", time: "Recently" },
    ...badges.slice(-3).reverse().map((b) => {
      const al = alumni.find((a) => a._id === b.alumniId)
      return {
        text: `Badge awarded to ${al?.firstName ?? "Alumni"} ${al?.lastName ?? ""}`.trim(),
        time: b.date ? new Date(b.date).toLocaleDateString() : "Recently",
      }
    }),
  ]

  const degreeBreakdown = {
    "Bachelor's": alumni.filter((a) => a.degree === "Bachelor's").length,
    "Master's":   alumni.filter((a) => a.degree === "Master's").length,
    PhD:          alumni.filter((a) => a.degree === "PhD").length,
  }

  const uniqueCompanies  = new Set(alumni.map((a) => a.company).filter(Boolean)).size
  const uniqueLocations  = new Set(
    alumni.map((a) => a.location?.split(",").pop()?.trim()).filter(Boolean)
  ).size

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.1)_0%,transparent_70%)]" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">Dashboard</h1>
        <p className="text-white/45 text-sm relative">
          Welcome to OAU-SAN (Obafemi Awolowo University Sociology and Anthropology Alumni Network)
          {displayName ? `, ${displayName}` : ""}.
        </p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-6 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--secondary)]" />
              <stat.icon className="absolute right-5 top-5 h-7 w-7 text-foreground/10" />
              <div className="font-serif text-5xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm">{activity.text}</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No recent activity.</p>
              )}
            </CardContent>
          </Card>

          {/* Network Snapshot */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Network Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">Bachelor&apos;s</span>
                  <span className="font-serif text-lg font-bold">{degreeBreakdown["Bachelor's"]}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">Master&apos;s</span>
                  <span className="font-serif text-lg font-bold">{degreeBreakdown["Master's"]}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">PhD</span>
                  <span className="font-serif text-lg font-bold">{degreeBreakdown.PhD}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">Companies represented</span>
                  <span className="font-serif text-lg font-bold">{uniqueCompanies}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Locations</span>
                  <span className="font-serif text-lg font-bold">{uniqueLocations}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
