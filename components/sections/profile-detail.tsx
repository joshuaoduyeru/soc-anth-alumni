"use client"

import {
  ArrowLeft, Mail, MapPin, Linkedin, Briefcase, GraduationCap, Award,
  Rocket, Users, Mic, Heart, HandHelping, TrendingUp,
} from "lucide-react"
import { useAlumniStore, BADGE_DEFINITIONS } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useState } from "react"

// Keys must match the BADGE_TYPES ids exactly
const badgeIcons: Record<string, React.ReactNode> = {
  pioneer:               <Rocket        className="h-4 w-4" />,
  super_mentor:          <GraduationCap className="h-4 w-4" />,
  network_champion:      <Users         className="h-4 w-4" />,
  distinguished_speaker: <Mic           className="h-4 w-4" />,
  generous_donor:        <Heart         className="h-4 w-4" />,
  active_volunteer:      <HandHelping   className="h-4 w-4" />,
  career_achiever:       <TrendingUp    className="h-4 w-4" />,
  top_recruiter:         <Briefcase     className="h-4 w-4" />,
  alumni_of_the_year:    <Award         className="h-4 w-4" />,
}

interface ProfileDetailProps {
  alumniId: number | string
  onBack: () => void
}

export function ProfileDetail({ alumniId, onBack }: ProfileDetailProps) {
  const { currentUser, alumni, badges, logout } = useAlumniStore()
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const alumniRecord = alumni.find((a) => a.id === alumniId || a._id === alumniId)
  // Badges for this specific alumnus
  const alumniBadges = badges.filter(
    (b) => b.alumniId === alumniId || b.alumniId === alumniRecord?._id || b.alumniId === alumniRecord?.id
  )
  const isAdmin = currentUser?.role === "admin"

  if (!alumniRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Alumni not found.</p>
      </div>
    )
  }

  const initials = `${alumniRecord.firstName?.[0] ?? ""}${alumniRecord.lastName?.[0] ?? ""}`

  const handleDelete = () => {
    toast.info("Delete functionality coming soon.")
    setDeleteConfirm(false)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const displayName =
    currentUser?.fullName ||
    currentUser?.name ||
    `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="bg-[var(--primary)] h-16 flex items-center px-4 lg:px-9 gap-2 sticky top-0 z-50 border-b border-white/5">
        <div className="font-serif text-lg font-black text-white cursor-pointer whitespace-nowrap mr-4" onClick={onBack}>
          OAU-<span className="text-[var(--secondary)]">SAN</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--secondary)] flex items-center justify-center font-bold text-sm text-[var(--primary)]">
            {currentUser ? `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.toUpperCase() : "?"}
          </div>
          <span className="hidden lg:block text-sm text-white/75 whitespace-nowrap">{displayName}</span>
          <span className="hidden lg:block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--secondary)]/20 text-[var(--gold-light)]">
            {currentUser?.role}
          </span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-white/60 border border-white/15 hover:bg-white/10 hover:text-white">
            Sign out
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute -top-48 -right-36 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.12)_0%,transparent_65%)]" />
        <button onClick={onBack} className="inline-flex items-center gap-2 text-white/45 text-sm mb-7 hover:text-white transition-colors relative">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end gap-6 max-w-7xl mx-auto relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--secondary)] to-orange-500 flex items-center justify-center text-4xl font-bold text-white font-serif border-4 border-[var(--secondary)]/35 shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-4xl font-bold text-white leading-none mb-2">
              {alumniRecord.firstName} {alumniRecord.lastName}
            </h1>
            <p className="text-white/55 text-base mb-3">
              {alumniRecord.jobTitle ?? "—"} at {alumniRecord.company ?? "—"}
            </p>
            <div className="flex flex-wrap gap-4">
              {alumniRecord.email && (
                <span className="flex items-center gap-1.5 text-sm text-white/45">
                  <Mail className="h-4 w-4" />{alumniRecord.email}
                </span>
              )}
              {alumniRecord.location && (
                <span className="flex items-center gap-1.5 text-sm text-white/45">
                  <MapPin className="h-4 w-4" />{alumniRecord.location}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-white/45">
                <GraduationCap className="h-4 w-4" />Class of {alumniRecord.year}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            {alumniRecord.linkedin && (
              <Button variant="outline" asChild className="bg-transparent border-white/20 text-white hover:bg-white/10">
                <a href={alumniRecord.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />LinkedIn
                </a>
              </Button>
            )}
            {alumniRecord.email && (
              <Button variant="outline" asChild className="bg-transparent border-white/20 text-white hover:bg-white/10">
                <a href={`mailto:${alumniRecord.email}`}>
                  <Mail className="h-4 w-4 mr-2" />Email
                </a>
              </Button>
            )}
            {isAdmin && (
              <Button variant="outline" onClick={() => setDeleteConfirm(true)} className="bg-transparent border-red-400/50 text-red-300 hover:bg-red-500/20">
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-6 px-6 lg:px-10 py-9 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <div className="space-y-5">
          {/* Contact */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</h4>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Email",    value: alumniRecord.email,    href: `mailto:${alumniRecord.email}` },
                { label: "Phone",    value: alumniRecord.phone    ?? "Not provided" },
                { label: "Location", value: alumniRecord.location ?? "Not provided" },
              ].map(({ label, value, href }) => (
                <div key={label}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                  {href ? (
                    <a href={href} className="text-sm text-[var(--secondary)] hover:underline">{value}</a>
                  ) : (
                    <div className="text-sm">{value}</div>
                  )}
                </div>
              ))}
              {alumniRecord.linkedin && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">LinkedIn</div>
                  <a href={alumniRecord.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--secondary)] hover:underline">
                    View profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Education</h4>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Degree",          value: alumniRecord.degree },
                { label: "Major",           value: alumniRecord.major ?? "—" },
                { label: "Graduation Year", value: alumniRecord.year  ?? "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                  <div className="text-sm">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Badges ({alumniBadges.length})
              </h4>
            </div>
            <div className="p-5">
              {alumniBadges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {alumniBadges.map((b) => {
                    const def = BADGE_DEFINITIONS.find((d) => d._id === (b.type ?? b.badgeType))
                    return def ? (
                      <span key={b._id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--gold-pale)] border border-[var(--secondary)]/20 text-sm">
                        <span className="text-[var(--secondary)]">
                          {badgeIcons[def._id] ?? <Award className="h-4 w-4" />}
                        </span>
                        <span>
                          <span className="font-bold text-xs">{def.name}</span>
                          {(b.awardedAt ?? b.date) && (
                            <span className="block text-[10px] text-muted-foreground">
                              {formatDate(b.awardedAt ?? b.date)}
                            </span>
                          )}
                        </span>
                      </span>
                    ) : null
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No badges yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="space-y-5">
          {alumniRecord.bio && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About</h4>
              </div>
              <div className="p-5">
                <p className="text-base leading-relaxed text-muted-foreground">{alumniRecord.bio}</p>
              </div>
            </div>
          )}

          {/* Career Timeline */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Career Timeline</h4>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex gap-3.5 relative">
                <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-border" />
                <div className="w-8 h-8 rounded-full bg-[var(--gold-pale)] border-2 border-[var(--secondary)] flex items-center justify-center shrink-0 z-10">
                  <Briefcase className="h-3.5 w-3.5 text-[var(--secondary)]" />
                </div>
                <div className="pt-0.5">
                  <div className="font-bold text-sm">{alumniRecord.jobTitle ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {alumniRecord.company ?? "—"}{alumniRecord.location ? ` · ${alumniRecord.location}` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Current position</div>
                </div>
              </div>
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[var(--gold-pale)] border-2 border-[var(--secondary)] flex items-center justify-center shrink-0 z-10">
                  <GraduationCap className="h-3.5 w-3.5 text-[var(--secondary)]" />
                </div>
                <div className="pt-0.5">
                  <div className="font-bold text-sm">{alumniRecord.degree} in {alumniRecord.major ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">OAU Sociology & Anthropology · Class of {alumniRecord.year}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recognition History */}
          {alumniBadges.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recognition History</h4>
              </div>
              <div className="p-5 space-y-5">
                {alumniBadges.map((b, index) => {
                  const def = BADGE_DEFINITIONS.find((d) => d._id === (b.type ?? b.badgeType))
                  return def ? (
                    <div key={b._id} className="flex gap-3.5 relative">
                      {index < alumniBadges.length - 1 && (
                        <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-border" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-[var(--gold-pale)] border-2 border-[var(--secondary)] flex items-center justify-center shrink-0 z-10 text-[var(--secondary)]">
                        {badgeIcons[def._id] ?? <Award className="h-3.5 w-3.5" />}
                      </div>
                      <div className="pt-0.5">
                        <div className="font-bold text-sm">{def.name}</div>
                        {(b.awardedAt ?? b.date) && (
                          <div className="text-xs text-muted-foreground">{formatDate(b.awardedAt ?? b.date)}</div>
                        )}
                        {/* Use description (not the removed desc) */}
                        <div className="text-xs text-muted-foreground mt-1">{b.reason ?? def.description}</div>
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>Delete this alumni record? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
