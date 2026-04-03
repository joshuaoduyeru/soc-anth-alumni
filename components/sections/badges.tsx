"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Rocket, GraduationCap, Users, Mic, Heart, HandHelping, TrendingUp, Briefcase, Award, Trophy } from "lucide-react"
import { useAlumniStore, BADGE_DEFINITIONS } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { toast } from "sonner"

const badgeSchema = z.object({
  alumniId: z.coerce.number().min(1, "Select an alumni"),
  type: z.string().min(1, "Select a badge"),
  reason: z.string().optional(),
})

type BadgeFormData = z.infer<typeof badgeSchema>

const badgeIcons: Record<string, React.ReactNode> = {
  pioneer: <Rocket className="h-9 w-9" />,
  mentor: <GraduationCap className="h-9 w-9" />,
  networker: <Users className="h-9 w-9" />,
  speaker: <Mic className="h-9 w-9" />,
  donor: <Heart className="h-9 w-9" />,
  volunteer: <HandHelping className="h-9 w-9" />,
  career: <TrendingUp className="h-9 w-9" />,
  recruiter: <Briefcase className="h-9 w-9" />,
  alumni_year: <Award className="h-9 w-9" />,
}

interface BadgesSectionProps {
  onViewProfile: (id: number | string) => void
}

export function BadgesSection({ onViewProfile }: BadgesSectionProps) {
  const { currentUser, alumni, badges, awardBadge } = useAlumniStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isAdmin = currentUser?.role === "admin"

  const form = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      alumniId: 0,
      type: "",
      reason: "",
    },
  })

  // Badge catalog with counts
  const badgeCatalog = BADGE_DEFINITIONS.map((def) => ({
    ...def,
    count: badges.filter((b) => b.type === def.id).length,
  }))

  // Leaderboard: alumni sorted by badge count
  const leaderboard = alumni
    .map((a) => {
      const alumniIdentifier = a._id || a.id
      return {
        ...a,
        badgeCount: badges.filter((b) => b.alumniId === alumniIdentifier || b.alumniId === a.id).length,
        userBadges: badges.filter((b) => b.alumniId === alumniIdentifier || b.alumniId === a.id),
      }
    })
    .filter((a) => a.badgeCount > 0)
    .sort((a, b) => b.badgeCount - a.badgeCount)

  const openBadgeModal = () => {
    form.reset({
      alumniId: 0,
      type: "",
      reason: "",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (data: BadgeFormData) => {
    const alumniRecord = alumni.find((a) => a.id === data.alumniId)
    const badgeDef = BADGE_DEFINITIONS.find((d) => d.id === data.type)
    
    awardBadge({
      alumniId: data.alumniId,
      type: data.type,
      reason: data.reason || undefined,
    })
    
    toast.success(`${badgeDef?.name || "Badge"} awarded to ${alumniRecord?.firstName || "alumni"}!`)
    setIsModalOpen(false)
  }

  const getRankColor = (index: number) => {
    if (index === 0) return "#ffd700" // Gold
    if (index === 1) return "#c0c0c0" // Silver
    if (index === 2) return "#cd7f32" // Bronze
    return "var(--secondary)"
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.1)_0%,transparent_70%)]" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">Badges & Achievements</h1>
        <p className="text-white/45 text-sm relative">Recognising outstanding alumni contributions.</p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        {/* Toolbar */}
        {isAdmin && (
          <div className="flex gap-3 mb-6">
            <Button onClick={openBadgeModal} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
              <Plus className="h-4 w-4 mr-2" />
              Award Badge
            </Button>
          </div>
        )}

        {/* Badge Catalogue */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Badge Catalogue
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {badgeCatalog.map((badge) => (
              <div
                key={badge.id}
                className="bg-card border border-border rounded-xl p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[var(--secondary)]"
              >
                <div className="text-[var(--secondary)] mb-2 flex justify-center">
                  {badgeIcons[badge.id] || <Award className="h-9 w-9" />}
                </div>
                <div className="font-bold text-sm mb-1">{badge.name}</div>
                <div className="text-[11px] text-muted-foreground mb-2">{badge.desc}</div>
                {badge.count > 0 && (
                  <span className="inline-block px-2 py-0.5 bg-[var(--gold-pale)] rounded-full text-[11px] font-bold text-[var(--secondary)]">
                    {badge.count} awarded
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Leaderboard
          </h2>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((alumniRecord, index) => (
                <div
                  key={alumniRecord._id || alumniRecord.id}
                  onClick={() => onViewProfile(alumniRecord._id || alumniRecord.id!)}
                  className="bg-card border border-border rounded-lg p-3.5 flex items-center gap-3.5 cursor-pointer transition-all hover:border-[var(--secondary)] hover:bg-[var(--gold-pale)]"
                >
                  {/* Rank */}
                  <div 
                    className="font-serif text-xl font-bold w-8 text-center shrink-0"
                    style={{ color: getRankColor(index) }}
                  >
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base">
                      {alumniRecord.firstName} {alumniRecord.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {alumniRecord.jobTitle || "—"} · {alumniRecord.company || "—"}
                    </div>
                  </div>

                  {/* Badges preview */}
                  <div className="flex gap-1">
                    {alumniRecord.userBadges.slice(0, 6).map((b) => {
                      const def = BADGE_DEFINITIONS.find((d) => d.id === b.type)
                      return def ? (
                        <span 
                          key={b.id} 
                          title={def.name}
                          className="text-[var(--secondary)]"
                        >
                          {badgeIcons[def.id] ? (
                            <span className="[&>svg]:h-5 [&>svg]:w-5">{badgeIcons[def.id]}</span>
                          ) : (
                            <Award className="h-5 w-5" />
                          )}
                        </span>
                      ) : null
                    })}
                  </div>

                  {/* Badge count */}
                  <div className="font-serif text-xl font-bold text-right min-w-6">
                    {alumniRecord.badgeCount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia><Trophy className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle>No badges awarded yet</EmptyTitle>
                <EmptyDescription>Start recognizing outstanding alumni contributions!</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>

      {/* Award Badge Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Award Badge</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Select Alumni *</FieldLabel>
                <Select
                  value={form.watch("alumniId") ? String(form.watch("alumniId")) : ""}
                  onValueChange={(v) => form.setValue("alumniId", parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose alumni..." />
                  </SelectTrigger>
                  <SelectContent>
                    {alumni.map((a) => (
                      <SelectItem key={a._id || a.id} value={String(a._id || a.id)}>
                        {a.firstName} {a.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.alumniId && (
                  <FieldError>{form.formState.errors.alumniId.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Badge *</FieldLabel>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select badge..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_DEFINITIONS.map((def) => (
                      <SelectItem key={def.id} value={def.id}>
                        {def.name} - {def.desc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <FieldError>{form.formState.errors.type.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Reason / Note</FieldLabel>
                <textarea
                  {...form.register("reason")}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y"
                  placeholder="Why is this badge being awarded?"
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--primary)]">
                Award Badge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
