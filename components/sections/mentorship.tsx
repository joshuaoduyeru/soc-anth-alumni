"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Plus, Users, Clock, Briefcase, Target, Check } from "lucide-react"
import { useAlumniStore, type Mentor } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { toast } from "sonner"

const mentorSchema = z.object({
  expertise: z.string().min(1, "Expertise is required"),
  experience: z.coerce.number().min(0).optional().or(z.literal("")),
  availability: z.enum(["Weekly", "Bi-weekly", "Monthly"]),
  industry: z.string().optional(),
  bio: z.string().optional(),
})

type MentorFormData = z.infer<typeof mentorSchema>

interface MentorshipSectionProps {
  onViewProfile: (id: number | string) => void
}

export function MentorshipSection({ onViewProfile }: MentorshipSectionProps) {
  const { 
    currentUser, 
    alumni,
    mentors, 
    mentorRequests,
    addMentor,
    requestMentorship 
  } = useAlumniStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const form = useForm<MentorFormData>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      expertise: "",
      experience: "",
      availability: "Weekly",
      industry: "",
      bio: "",
    },
  })

  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q || 
        m.expertise.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        m.industry?.toLowerCase().includes(q)

      const matchesAvailability = availabilityFilter === "all" || m.availability === availabilityFilter

      return matchesSearch && matchesAvailability
    })
  }, [mentors, searchQuery, availabilityFilter])

  const getAlumniForMentor = (alumniId: number | string | undefined) => {
    return alumni.find((a) => a.id === alumniId || a._id === alumniId)
  }

  const hasRequestedMentorship = (mentorId: number | string) => {
    return mentorRequests.some(
      (r) => r.mentorId === mentorId && r.userId === currentUser?.id
    )
  }

  const handleRequestMentorship = (mentorId: number | string, mentorName: string) => {
    if (hasRequestedMentorship(mentorId)) {
      toast.info("Request already sent.")
      return
    }
    requestMentorship(mentorId, currentUser?.id || null)
    toast.success(`Mentorship request sent to ${mentorName}!`)
  }

  const openMentorModal = () => {
    form.reset({
      expertise: "",
      experience: "",
      availability: "Weekly",
      industry: "",
      bio: "",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (data: MentorFormData) => {
    addMentor({
      alumniId: currentUser?._id || currentUser?.id || alumni[0]?._id || alumni[0]?.id || "1",
      expertise: data.expertise,
      experience: data.experience ? String(data.experience) : undefined,
      availability: data.availability,
      industry: data.industry || undefined,
      bio: data.bio || undefined,
    })
    toast.success("Registered as mentor!")
    setIsModalOpen(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.1)_0%,transparent_70%)]" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">Mentorship</h1>
        <p className="text-white/45 text-sm relative">Connect with experienced alumni who give back.</p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expertise, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Any Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Availability</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openMentorModal} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
            <Plus className="h-4 w-4 mr-2" />
            Register as Mentor
          </Button>
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMentors.map((mentor) => {
              if (mentor.id === undefined) return null
              const alumniRecord = getAlumniForMentor(mentor.alumniId)
              const initials = alumniRecord 
                ? `${alumniRecord.firstName[0]}${alumniRecord.lastName[0]}`
                : "?"
              const name = alumniRecord 
                ? `${alumniRecord.firstName} ${alumniRecord.lastName}`
                : "Unknown"
              const title = alumniRecord 
                ? `${alumniRecord.jobTitle || ""} · ${alumniRecord.company || ""}`.trim().replace(/^·\s*|·\s*$/g, "")
                : ""
              const hasRequested = hasRequestedMentorship(mentor.id)

              return (
                <div
                  key={mentor.id}
                  className="bg-card border border-border rounded-xl p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-green-400"
                >
                  {/* Header */}
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-lg font-bold text-white font-serif shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div 
                        className="font-bold text-base cursor-pointer hover:text-[var(--secondary)] truncate"
                        onClick={() => alumniRecord && onViewProfile(alumniRecord._id || alumniRecord.id!)}
                      >
                        {name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{title || "—"}</div>
                    </div>
                  </div>

                  {/* Expertise */}
                  <div className="flex items-start gap-2 mb-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{mentor.expertise}</span>
                  </div>

                  {/* Industry */}
                  {mentor.industry && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{mentor.industry}</span>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {mentor.experience || 0} yrs exp
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {mentor.availability}
                    </span>
                  </div>

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => mentor.id !== undefined && handleRequestMentorship(mentor.id, name)}
                    disabled={hasRequested}
                    className={`w-full py-2 px-4 rounded-lg font-bold text-sm transition-all ${
                      hasRequested
                        ? "bg-green-50 border border-green-200 text-green-600 cursor-default"
                        : "border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    }`}
                  >
                    {hasRequested ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="h-4 w-4" />
                        Request Sent
                      </span>
                    ) : (
                      "Request Mentorship"
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty>
              <EmptyHeader>
                <EmptyMedia><Users className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle>No mentors registered yet</EmptyTitle>
                <EmptyDescription>Be the first to register as a mentor and help fellow alumni!</EmptyDescription>
              </EmptyHeader>
            </Empty>
        )}
      </div>

      {/* Register as Mentor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Register as Mentor</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Areas of Expertise *</FieldLabel>
                <Input 
                  {...form.register("expertise")} 
                  placeholder="e.g. Software Engineering, Finance, Leadership" 
                />
                {form.formState.errors.expertise && (
                  <FieldError>{form.formState.errors.expertise.message}</FieldError>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Years of Experience</FieldLabel>
                  <Input 
                    {...form.register("experience")} 
                    type="number" 
                    min={0} 
                    placeholder="10" 
                  />
                </Field>
                <Field>
                  <FieldLabel>Availability</FieldLabel>
                  <Select
                    value={form.watch("availability") || ""}
                    onValueChange={(v) => {
                      if (v === "Weekly" || v === "Bi-weekly" || v === "Monthly") {
                        form.setValue("availability", v)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel>Industry / Sector</FieldLabel>
                <Input 
                  {...form.register("industry")} 
                  placeholder="Technology, Finance, Healthcare..." 
                />
              </Field>
              <Field>
                <FieldLabel>About Me</FieldLabel>
                <textarea
                  {...form.register("bio")}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  placeholder="What can you offer mentees?"
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--primary)]">
                Register
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
