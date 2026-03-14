"use client"

import { useMemo } from "react"
import { useAlumniStore } from "@/lib/store"

export function ReportsSection() {
  const { alumni, badges, events, jobs, communications } = useAlumniStore()

  const currentYear = new Date().getFullYear()

  // Calculate statistics
  const stats = useMemo(() => {
    const degrees: Record<string, number> = {}
    const majors: Record<string, number> = {}
    const companies: Record<string, number> = {}
    const locations: Record<string, number> = {}
    const byYear: Record<number, number> = {}

    alumni.forEach((a) => {
      if (a.degree) degrees[a.degree] = (degrees[a.degree] || 0) + 1
      if (a.major) majors[a.major] = (majors[a.major] || 0) + 1
      if (a.company) companies[a.company] = (companies[a.company] || 0) + 1
      
      const loc = a.location?.split(",").pop()?.trim()
      if (loc) locations[loc] = (locations[loc] || 0) + 1
      
      if (a.year) byYear[a.year] = (byYear[a.year] || 0) + 1
    })

    const topMajors = Object.entries(majors).sort((a, b) => b[1] - a[1]).slice(0, 6)
    const topCompanies = Object.entries(companies).sort((a, b) => b[1] - a[1]).slice(0, 6)
    const topLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 6)
    const topYears = Object.entries(byYear).sort((a, b) => b[1] - a[1]).slice(0, 6)
    
    const recentGrads = alumni.filter((a) => currentYear - a.year <= 5).length

    return {
      degrees,
      topMajors,
      topCompanies,
      topLocations,
      topYears,
      recentGrads,
      maxMajor: topMajors[0]?.[1] || 1,
      maxCompany: topCompanies[0]?.[1] || 1,
      maxLocation: topLocations[0]?.[1] || 1,
    }
  }, [alumni, currentYear])

  const ProgressBar = ({ value, max }: { value: number; max: number }) => (
    <div className="flex-1 h-1.5 bg-muted rounded-full mx-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-[var(--secondary)] to-orange-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.round((value / max) * 100)}%` }}
      />
    </div>
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.1)_0%,transparent_70%)]" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">Reports & Analytics</h1>
        <p className="text-white/45 text-sm relative">Data insights across the alumni network.</p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        {/* Top Row */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Degrees */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Degrees
            </h4>
            <div className="space-y-3">
              {Object.entries(stats.degrees).map(([degree, count]) => (
                <div key={degree} className="flex items-center justify-between text-sm">
                  <span>{degree}</span>
                  <ProgressBar value={count} max={alumni.length} />
                  <span className="font-serif text-base font-bold min-w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Majors */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Top Majors
            </h4>
            <div className="space-y-3">
              {stats.topMajors.map(([major, count]) => (
                <div key={major} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[120px]" title={major}>{major}</span>
                  <ProgressBar value={count} max={stats.maxMajor} />
                  <span className="font-serif text-base font-bold min-w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Employers */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Top Employers
            </h4>
            <div className="space-y-3">
              {stats.topCompanies.map(([company, count]) => (
                <div key={company} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[120px]" title={company}>{company}</span>
                  <ProgressBar value={count} max={stats.maxCompany} />
                  <span className="font-serif text-base font-bold min-w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Geographic Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Geographic Distribution
            </h4>
            <div className="space-y-3">
              {stats.topLocations.map(([location, count]) => (
                <div key={location} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[120px]" title={location}>{location || "Unknown"}</span>
                  <ProgressBar value={count} max={stats.maxLocation} />
                  <span className="font-serif text-base font-bold min-w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alumni Overview */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Alumni Overview
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-border">
                <span>Total alumni</span>
                <span className="font-serif text-lg font-bold">{alumni.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-border">
                <span>Recent graduates (5 yrs)</span>
                <span className="font-serif text-lg font-bold">{stats.recentGrads}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-border">
                <span>Total badges awarded</span>
                <span className="font-serif text-lg font-bold">{badges.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-border">
                <span>Events created</span>
                <span className="font-serif text-lg font-bold">{events.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-border">
                <span>Job postings</span>
                <span className="font-serif text-lg font-bold">{jobs.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5">
                <span>Newsletters sent</span>
                <span className="font-serif text-lg font-bold">{communications.length}</span>
              </div>
            </div>
          </div>

          {/* Graduation by Year */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Graduation by Year (top 6)
            </h4>
            <div className="space-y-3">
              {stats.topYears.map(([year, count]) => (
                <div key={year} className="flex items-center justify-between text-sm">
                  <span>{year}</span>
                  <ProgressBar value={count} max={alumni.length} />
                  <span className="font-serif text-base font-bold min-w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
