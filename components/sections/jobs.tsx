"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Plus, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Laptop, TrendingUp, Heart, Palette, Megaphone, Wrench, BookOpen, Scale, FlaskConical, Radio, Building2 } from "lucide-react"
import { useAlumniStore, type Job, JOB_ICONS } from "@/lib/store"
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

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  salary: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url().optional().or(z.literal("")),
})

type JobFormData = z.infer<typeof jobSchema>

const industryIcons: Record<string, React.ReactNode> = {
  Technology: <Laptop className="h-6 w-6" />,
  Finance: <TrendingUp className="h-6 w-6" />,
  Healthcare: <Heart className="h-6 w-6" />,
  Design: <Palette className="h-6 w-6" />,
  Marketing: <Megaphone className="h-6 w-6" />,
  Engineering: <Wrench className="h-6 w-6" />,
  Education: <BookOpen className="h-6 w-6" />,
  Legal: <Scale className="h-6 w-6" />,
  Science: <FlaskConical className="h-6 w-6" />,
  Media: <Radio className="h-6 w-6" />,
}

export function JobsSection() {
  const { 
    currentUser, 
    jobs, 
    savedJobs,
    addJob, 
    updateJob, 
    deleteJob,
    toggleSaveJob 
  } = useAlumniStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null)

  const isAdmin = currentUser?.role === "admin"

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      salary: "",
      industry: "",
      description: "",
      link: "",
    },
  })

  const industries = useMemo(() => 
    [...new Set(jobs.map((j) => j.industry).filter(Boolean))].sort(),
    [jobs]
  )

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q || 
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)

      const matchesType = typeFilter === "all" || j.type === typeFilter
      const matchesIndustry = industryFilter === "all" || j.industry === industryFilter

      return matchesSearch && matchesType && matchesIndustry
    })
  }, [jobs, searchQuery, typeFilter, industryFilter])

  const openAddModal = () => {
    setEditingJob(null)
    form.reset({
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      salary: "",
      industry: "",
      description: "",
      link: "",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (job: Job) => {
    setEditingJob(job)
    form.reset({
      title: job.title,
      company: job.company,
      location: job.location || "",
      type: job.type as JobFormData["type"],
      salary: job.salary || "",
      industry: job.industry || "",
      description: job.description || "",
      link: job.link || "",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (data: JobFormData) => {
    if (editingJob && editingJob.id != null) {
      updateJob(editingJob.id, data)
      toast.success("Job updated.")
    } else {
      addJob(data as Omit<Job, "id">)
      toast.success(`"${data.title}" posted!`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (deleteConfirm && deleteConfirm.id != null) {
      deleteJob(deleteConfirm.id)
      toast.success("Job deleted.")
      setDeleteConfirm(null)
    }
  }

  const handleToggleSave = (jobId: string | number) => {
    const isSaved = savedJobs.includes(jobId)
    toggleSaveJob(jobId)
    toast.success(isSaved ? "Job removed from saved." : "Job saved!")
  }

  const handleApply = (job: Job) => {
    if (job.link) {
      window.open(job.link, "_blank")
    } else {
      toast.success("Application submitted!")
    }
  }

  const getIndustryIcon = (industry?: string) => {
    if (!industry) return <Building2 className="h-6 w-6" />
    return industryIcons[industry] || <Building2 className="h-6 w-6" />
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.1)_0%,transparent_70%)]" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">Job Board</h1>
        <p className="text-white/45 text-sm relative">Opportunities posted by and for the alumni community.</p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind!}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAddModal} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </div>

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              if (!job.id) return null
              const isSaved = savedJobs.includes(job.id)
              
              return (
                <div
                  key={job.id}
                  className="bg-card border border-border rounded-xl p-5 flex gap-4 items-center transition-all hover:border-[var(--secondary)] hover:shadow-md hover:translate-x-1"
                >
                  {/* Icon */}
                  <div className="w-13 h-13 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                    {getIndustryIcon(job.industry)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base mb-1">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {job.company} · {job.location || "Remote"}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">
                        {job.type}
                      </span>
                      {job.salary && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-600">
                          {job.salary}
                        </span>
                      )}
                      {job.industry && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                          {job.industry}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApply(job)}
                        className="bg-[var(--primary)]"
                      >
                        Apply
                        {job.link && <ExternalLink className="h-3 w-3 ml-1" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => job.id !== undefined && handleToggleSave(job.id)}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-[var(--secondary)]" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(job)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(job)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Del
                          </Button>
                        </>
                      )}
                    </div>
                    {isSaved && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--gold-pale)] border border-[var(--secondary)]/30 rounded text-[11px] font-bold text-[var(--secondary)]">
                        <BookmarkCheck className="h-3 w-3" />
                        Saved
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty>
              <EmptyHeader>
                <EmptyMedia><Briefcase className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle>No jobs posted yet</EmptyTitle>
                <EmptyDescription>Be the first to post a job opportunity!</EmptyDescription>
              </EmptyHeader>
            </Empty>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingJob ? "Edit Job" : "Post a Job"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Job Title *</FieldLabel>
                  <Input {...form.register("title")} placeholder="Senior Engineer" />
                  {form.formState.errors.title && (
                    <FieldError>{form.formState.errors.title.message}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Company *</FieldLabel>
                  <Input {...form.register("company")} placeholder="Acme Corp" />
                  {form.formState.errors.company && (
                    <FieldError>{form.formState.errors.company.message}</FieldError>
                  )}
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Location</FieldLabel>
                  <Input {...form.register("location")} placeholder="Remote / New York, NY" />
                </Field>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(v) => form.setValue("type", v as Job["type"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Salary Range</FieldLabel>
                  <Input {...form.register("salary")} placeholder="$100k - $130k" />
                </Field>
                <Field>
                  <FieldLabel>Industry</FieldLabel>
                  <Input {...form.register("industry")} placeholder="Technology" />
                </Field>
              </div>
              <Field>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  {...form.register("description")}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  placeholder="Role overview, requirements..."
                />
              </Field>
              <Field>
                <FieldLabel>Application Link</FieldLabel>
                <Input {...form.register("link")} type="url" placeholder="https://..." />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--primary)]">
                {editingJob ? "Save Changes" : "Post Job"}
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
              Delete this job posting? This cannot be undone.
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
