"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Grid3X3, List, Plus, X, Award } from "lucide-react"
import { useAlumniStore, type Alumni, BADGE_DEFINITIONS } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

const alumniSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  year: z.coerce.number().min(1950).max(2035),
  degree: z.enum(["Bachelor's", "Master's", "PhD"]),
  major: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
})

type AlumniFormData = z.infer<typeof alumniSchema>

interface DirectorySectionProps {
  onViewProfile: (id: string) => void
}

const PER_PAGE = 12

export function DirectorySection({ onViewProfile }: DirectorySectionProps) {
  const { currentUser, alumni, badges, addAlumni, updateAlumni, deleteAlumni } = useAlumniStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [degreeFilter, setDegreeFilter] = useState<string>("all")
  const [majorFilter, setMajorFilter] = useState<string>("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Alumni | null>(null)

  const isAdmin = currentUser?.role === "admin"

  const form = useForm<AlumniFormData>({
    resolver: zodResolver(alumniSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      year: new Date().getFullYear(),
      degree: "Bachelor's",
      major: "",
      company: "",
      jobTitle: "",
      phone: "",
      location: "",
      linkedin: "",
      bio: "",
    },
  })

  // Filter options
  const years = useMemo(() => 
    [...new Set(alumni.map((a) => a.year))].sort((a, b) => b - a),
    [alumni]
  )
  const majors = useMemo(() => 
    [...new Set(alumni.map((a) => a.major).filter(Boolean))].sort(),
    [alumni]
  )
  const companies = useMemo(() => 
    [...new Set(alumni.map((a) => a.company).filter(Boolean))].sort(),
    [alumni]
  )

  // Filtered alumni
  const filteredAlumni = useMemo(() => {
    return alumni.filter((a) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.company?.toLowerCase().includes(q) ||
        a.major?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q)

      const matchesYear = yearFilter === "all" || a.year === parseInt(yearFilter)
      const matchesDegree = degreeFilter === "all" || a.degree === degreeFilter
      const matchesMajor = majorFilter === "all" || a.major === majorFilter
      const matchesCompany = companyFilter === "all" || a.company === companyFilter

      return matchesSearch && matchesYear && matchesDegree && matchesMajor && matchesCompany
    })
  }, [alumni, searchQuery, yearFilter, degreeFilter, majorFilter, companyFilter])

  const totalPages = Math.ceil(filteredAlumni.length / PER_PAGE)
  const paginatedAlumni = filteredAlumni.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openAddModal = () => {
    setEditingAlumni(null)
    form.reset({
      firstName: "",
      lastName: "",
      email: "",
      year: new Date().getFullYear(),
      degree: "Bachelor's",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (alumniRecord: Alumni) => {
    setEditingAlumni(alumniRecord)
    form.reset({
      firstName: alumniRecord.firstName,
      lastName: alumniRecord.lastName,
      email: alumniRecord.email,
      year: alumniRecord.year,
      degree: alumniRecord.degree as "Bachelor's" | "Master's" | "PhD",
      major: alumniRecord.major || "",
      company: alumniRecord.company || "",
      jobTitle: alumniRecord.jobTitle || "",
      phone: alumniRecord.phone || "",
      location: alumniRecord.location || "",
      linkedin: alumniRecord.linkedin || "",
      bio: alumniRecord.bio || "",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (data: AlumniFormData) => {
    if (editingAlumni) {
      updateAlumni(editingAlumni._id || editingAlumni.id!, data)
      toast.success(`${data.firstName} ${data.lastName} updated.`)
    } else {
      addAlumni(data as Omit<Alumni, "id">)
      toast.success(`${data.firstName} ${data.lastName} added to the network.`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteAlumni(deleteConfirm._id || deleteConfirm.id!)
      toast.success("Alumni deleted.")
      setDeleteConfirm(null)
    }
  }

  const getAlumniBadges = (alumniId: string | undefined) => {
    return badges.filter((b) => b.alumniId === alumniId)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.1)_0%,transparent_70%)]" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">Alumni Directory</h1>
        <p className="text-white/45 text-sm relative">Browse and connect with graduates.</p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, company, major, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={degreeFilter} onValueChange={(v) => { setDegreeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Degrees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Degrees</SelectItem>
              <SelectItem value="Bachelor's">Bachelor&apos;s</SelectItem>
              <SelectItem value="Master's">Master&apos;s</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={majorFilter} onValueChange={(v) => { setMajorFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Majors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Majors</SelectItem>
              {majors.map((m) => (
                <SelectItem key={m} value={m!}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={companyFilter} onValueChange={(v) => { setCompanyFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c!}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-[var(--gold-pale)] border-[var(--secondary)] text-foreground" : ""}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-[var(--gold-pale)] border-[var(--secondary)] text-foreground" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {isAdmin && (
            <Button onClick={openAddModal} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Alumni
            </Button>
          )}
        </div>

        {/* Results info */}
        <p className="text-xs text-muted-foreground mb-4">
          Showing {paginatedAlumni.length} of {filteredAlumni.length} alumni
        </p>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedAlumni.map((a) => {
              const alBadges = getAlumniBadges(a._id!)
              return (
                <div
                  key={a._id}
                  onClick={() => onViewProfile(a._id!)}
                  className="bg-card border border-border rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[var(--secondary)]"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--secondary)] to-orange-500 flex items-center justify-center text-xl font-bold text-white font-serif mb-3">
                    {a.firstName[0]}{a.lastName[0]}
                  </div>
                  <div className="font-semibold text-base mb-1">{a.firstName} {a.lastName}</div>
                  <div className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    {a.jobTitle || "—"} at {a.company || "—"}
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--gold-pale)] text-[var(--secondary)] border border-[var(--secondary)]/25">
                      {a.degree}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                      {a.year}
                    </span>
                    {a.major && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                        {a.major}
                      </span>
                    )}
                  </div>
                  {alBadges.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {alBadges.slice(0, 3).map((b) => {
                        const def = BADGE_DEFINITIONS.find((d) => d.id === b.type)
                        return def ? (
                          <span key={b.id} title={def.name} className="text-base">
                            <Award className="h-4 w-4 text-[var(--secondary)]" />
                          </span>
                        ) : null
                      })}
                      {alBadges.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{alBadges.length - 3}</span>
                      )}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(a) }}
                        className="px-3 py-1 text-xs font-semibold bg-muted rounded hover:bg-muted/80"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(a) }}
                        className="px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background">
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border">Name</th>
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border">Company</th>
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border">Degree</th>
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border">Year</th>
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border">Location</th>
                  {isAdmin && <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedAlumni.map((a) => (
                  <tr 
                    key={a._id} 
                    onClick={() => onViewProfile(a._id!)}
                    className="hover:bg-[var(--gold-pale)] cursor-pointer"
                  >
                    <td className="p-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--secondary)] to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                          {a.firstName[0]}{a.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{a.firstName} {a.lastName}</div>
                          <div className="text-xs text-muted-foreground">{a.jobTitle || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 border-b border-border text-sm">{a.company || "—"}</td>
                    <td className="p-3 border-b border-border text-sm">{a.degree}</td>
                    <td className="p-3 border-b border-border text-sm">{a.year}</td>
                    <td className="p-3 border-b border-border text-sm">{a.location || "—"}</td>
                    {isAdmin && (
                      <td className="p-3 border-b border-border">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(a) }}
                            className="px-2 py-1 text-xs font-semibold bg-muted rounded hover:bg-muted/80"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(a) }}
                            className="px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded hover:bg-red-100"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredAlumni.length === 0 && (
          <Empty>
              <EmptyHeader>
                <EmptyMedia><GraduationCap className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle>No alumni found</EmptyTitle>
                <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
              </EmptyHeader>
            </Empty>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={page === p ? "bg-[var(--primary)]" : ""}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingAlumni ? "Edit Alumni" : "Add Alumni"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>First Name *</FieldLabel>
                  <Input {...form.register("firstName")} placeholder="Jane" />
                  {form.formState.errors.firstName && (
                    <FieldError>{form.formState.errors.firstName.message}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Last Name *</FieldLabel>
                  <Input {...form.register("lastName")} placeholder="Doe" />
                  {form.formState.errors.lastName && (
                    <FieldError>{form.formState.errors.lastName.message}</FieldError>
                  )}
                </Field>
              </div>
              <Field>
                <FieldLabel>Email *</FieldLabel>
                <Input {...form.register("email")} type="email" placeholder="jane@example.com" />
                {form.formState.errors.email && (
                  <FieldError>{form.formState.errors.email.message}</FieldError>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Graduation Year *</FieldLabel>
                  <Input {...form.register("year")} type="number" min={1950} max={2035} placeholder="2022" />
                  {form.formState.errors.year && (
                    <FieldError>{form.formState.errors.year.message}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Degree *</FieldLabel>
                  <Select
                    value={form.watch("degree")}
                    onValueChange={(v) => form.setValue("degree", v as "Bachelor's" | "Master's" | "PhD")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelor's">Bachelor&apos;s</SelectItem>
                      <SelectItem value="Master's">Master&apos;s</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel>Major / Field of Study</FieldLabel>
                <Input {...form.register("major")} placeholder="Computer Science" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Current Company</FieldLabel>
                  <Input {...form.register("company")} placeholder="Acme Corp" />
                </Field>
                <Field>
                  <FieldLabel>Job Title</FieldLabel>
                  <Input {...form.register("jobTitle")} placeholder="Software Engineer" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Phone</FieldLabel>
                  <Input {...form.register("phone")} placeholder="+1 555 000 0000" />
                </Field>
                <Field>
                  <FieldLabel>Location</FieldLabel>
                  <Input {...form.register("location")} placeholder="San Francisco, CA" />
                </Field>
              </div>
              <Field>
                <FieldLabel>LinkedIn URL</FieldLabel>
                <Input {...form.register("linkedin")} type="url" placeholder="https://linkedin.com/in/..." />
              </Field>
              <Field>
                <FieldLabel>Bio / About</FieldLabel>
                <textarea
                  {...form.register("bio")}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y"
                  placeholder="A short introduction..."
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--primary)]">
                {editingAlumni ? "Save Changes" : "Save Alumni"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this alumni record? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Import GraduationCap for Empty icon
import { GraduationCap } from "lucide-react"
