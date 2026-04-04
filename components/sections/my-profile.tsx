"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Edit, Users, Award, Briefcase, Check, ExternalLink,
  Rocket, GraduationCap, Mic, Heart, HandHelping, TrendingUp,
} from "lucide-react"
import { useAlumniStore, BADGE_DEFINITIONS } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const badgeIcons: Record<string, React.ReactNode> = {
  pioneer:               <Rocket       className="h-4 w-4" />,
  super_mentor:          <GraduationCap className="h-4 w-4" />,
  network_champion:      <Users        className="h-4 w-4" />,
  distinguished_speaker: <Mic          className="h-4 w-4" />,
  generous_donor:        <Heart        className="h-4 w-4" />,
  active_volunteer:      <HandHelping  className="h-4 w-4" />,
  career_achiever:       <TrendingUp   className="h-4 w-4" />,
  top_recruiter:         <Briefcase    className="h-4 w-4" />,
  alumni_of_the_year:    <Award        className="h-4 w-4" />,
}

interface MyProfileSectionProps {
  onViewProfile: (id: string) => void
}

export function MyProfileSection({ onViewProfile }: MyProfileSectionProps) {
  const {
    currentUser,
    alumni,
    badges,
    mentors,
    mentorRequests,
    events,
    jobs,
    eventRegistrations,
    savedJobs,
    updateAlumni,
    setCurrentUser,
    toggleSaveJob,
  } = useAlumniStore()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const alumniRecord = alumni.find(
    (a) => a._id === currentUser?._id
  )
  const alumniIdentifier = alumniRecord?._id

  const alumniBadges = alumniRecord
    ? badges.filter((b) => b.alumniId === alumniIdentifier)
    : []

  const mentor = alumniRecord
    ? mentors.find((m) => m.alumniId === alumniIdentifier)
    : null

  const myEventRegs = eventRegistrations.filter(
    (r) => r.userId === currentUser?._id
  )

  const mySavedJobs = jobs.filter(
    (j) => j._id !== undefined && savedJobs.includes(j._id!)
  )

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: alumniRecord?.firstName ?? "",
      lastName:  alumniRecord?.lastName  ?? "",
      company:   alumniRecord?.company   ?? "",
      jobTitle:  alumniRecord?.jobTitle  ?? "",
      phone:     alumniRecord?.phone     ?? "",
      location:  alumniRecord?.location  ?? "",
      linkedin:  alumniRecord?.linkedin  ?? "",
      bio:       alumniRecord?.bio       ?? "",
    },
  })

  const openEditModal = () => {
    if (alumniRecord) {
      form.reset({
        firstName: alumniRecord.firstName,
        lastName:  alumniRecord.lastName,
        company:   alumniRecord.company   ?? "",
        jobTitle:  alumniRecord.jobTitle  ?? "",
        phone:     alumniRecord.phone     ?? "",
        location:  alumniRecord.location  ?? "",
        linkedin:  alumniRecord.linkedin  ?? "",
        bio:       alumniRecord.bio       ?? "",
      })
    }
    setIsModalOpen(true)
  }

  const onSubmit = (data: ProfileFormData) => {
    if (alumniRecord && currentUser) {
      updateAlumni(alumniRecord._id!, data)
      const fullName = `${data.firstName} ${data.lastName}`
      setCurrentUser({
        ...currentUser,
        firstName: data.firstName,
        lastName:  data.lastName,
        name:      fullName,
        fullName,
      })
      toast.success("Profile updated!")
      setIsModalOpen(false)
    }
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

  // ── Admin view ────────────────────────────────────────────────────────────
  if (currentUser?.role === "admin") {
    const displayName =
      currentUser.fullName ||
      currentUser.name ||
      `${currentUser.firstName} ${currentUser.lastName}`

    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
          <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">My Profile</h1>
          <p className="text-white/45 text-sm relative">Your admin profile.</p>
        </div>
        <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-2xl font-bold text-white">
                {currentUser.firstName?.[0] ?? "A"}
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">{displayName}</h2>
                <span className="inline-block mt-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-200">
                  System Administrator
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="py-2.5 border-b border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Email</div>
                <div className="text-sm">{currentUser.email}</div>
              </div>
              <div className="py-2.5 border-b border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Role</div>
                <div className="text-sm">Administrator — full access</div>
              </div>
              <div className="py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Permissions</div>
                <div className="text-sm">Add/Edit/Delete alumni · Manage events & jobs · Award badges · Send newsletters · View reports</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Alumni view ────────────────────────────────────────────────────────────
  if (!alumniRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    )
  }

  const initials = `${alumniRecord.firstName?.[0] ?? ""}${alumniRecord.lastName?.[0] ?? ""}`

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">My Profile</h1>
        <p className="text-white/45 text-sm relative">Your alumni record and achievements.</p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        {/* Actions */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Button onClick={openEditModal} className="bg-[var(--primary)]">
            <Edit className="h-4 w-4 mr-2" />
            Edit My Profile
          </Button>
          {!mentor && (
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Become a Mentor
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-5">
          {/* Sidebar */}
          <div className="space-y-5">
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile</h4>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--secondary)] to-orange-500 flex items-center justify-center text-xl font-bold text-white font-serif">
                    {initials}
                  </div>
                  <div>
                    <div className="font-bold">{alumniRecord.firstName} {alumniRecord.lastName}</div>
                    <div className="text-xs text-muted-foreground">{alumniRecord.jobTitle ?? "—"}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Email",    value: alumniRecord.email },
                    { label: "Company",  value: alumniRecord.company  ?? "—" },
                    { label: "Location", value: alumniRecord.location ?? "—" },
                    { label: "Degree",   value: alumniRecord.degree ? `${alumniRecord.degree} in ${alumniRecord.major ?? "—"}, ${alumniRecord.year}` : "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                      <div className="text-sm">{value}</div>
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
            </div>

            {/* Badges Card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  My Badges ({alumniBadges.length})
                </h4>
              </div>
              <div className="p-5">
                {alumniBadges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {alumniBadges.map((b) => {
                      const def = BADGE_DEFINITIONS.find((d) => d.id === (b.type ?? b.badgeType))
                      return def ? (
                        <span
                          key={b.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--gold-pale)] border border-[var(--secondary)]/20 text-sm"
                        >
                          <span className="text-[var(--secondary)]">
                            {badgeIcons[def.id] ?? <Award className="h-4 w-4" />}
                          </span>
                          <span>
                            <span className="font-bold text-xs">{def.name}</span>
                            {b.date && (
                              <span className="block text-[10px] text-muted-foreground">
                                {formatDate(b.date)}
                              </span>
                            )}
                          </span>
                        </span>
                      ) : null
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Stay active to earn badges!</p>
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

            {/* Registered Events */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  My Registered Events ({myEventRegs.length})
                </h4>
              </div>
              <div className="p-5">
                {myEventRegs.length > 0 ? (
                  <div className="space-y-3">
                    {events
                      .filter((e) => myEventRegs.some((r) => r.eventId === (e._id!)))
                      .map((event) => (
                        <div key={event._id} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                          <div>
                            <div className="font-bold text-sm">{event.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(event.date)} · {event.location ?? "TBD"}
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold border border-green-200 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Registered
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No events registered. Browse the Events tab!</p>
                )}
              </div>
            </div>

            {/* Saved Jobs */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Saved Jobs ({mySavedJobs.length})
                </h4>
              </div>
              <div className="p-5">
                {mySavedJobs.length > 0 ? (
                  <div className="space-y-3">
                    {mySavedJobs.map((job) => (
                      <div key={job._id} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                        <div>
                          <div className="font-bold text-sm">{job.title}</div>
                          <div className="text-xs text-muted-foreground">{job.company} · {job.type}</div>
                        </div>
                        <div className="flex gap-2">
                          {job.link ? (
                            <Button size="sm" asChild className="bg-[var(--primary)]">
                              <a href={job.link} target="_blank" rel="noopener noreferrer">
                                Apply <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          ) : (
                            <Button size="sm" className="bg-[var(--primary)]" onClick={() => toast.success("Applied!")}>
                              Apply
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (job._id !== undefined) {
                                toggleSaveJob(job._id!)
                                toast.success("Job removed from saved.")
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No saved jobs. Browse the Job Board!</p>
                )}
              </div>
            </div>

            {/* Mentorship Profile */}
            {mentor && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    My Mentorship Profile
                  </h4>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Expertise</div>
                    <div className="text-sm">{mentor.expertise}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Availability</div>
                    <div className="text-sm">{mentor.availability}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Requests received</div>
                    <div className="text-sm">
                      {mentorRequests.filter((r) => r.mentorId === (mentor._id!)).length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Edit My Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>First Name</FieldLabel>
                  <Input {...form.register("firstName")} />
                </Field>
                <Field>
                  <FieldLabel>Last Name</FieldLabel>
                  <Input {...form.register("lastName")} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Current Company</FieldLabel>
                  <Input {...form.register("company")} />
                </Field>
                <Field>
                  <FieldLabel>Job Title</FieldLabel>
                  <Input {...form.register("jobTitle")} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Phone</FieldLabel>
                  <Input {...form.register("phone")} />
                </Field>
                <Field>
                  <FieldLabel>Location</FieldLabel>
                  <Input {...form.register("location")} />
                </Field>
              </div>
              <Field>
                <FieldLabel>LinkedIn URL</FieldLabel>
                <Input {...form.register("linkedin")} type="url" />
              </Field>
              <Field>
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  {...form.register("bio")}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-y"
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--primary)]">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
