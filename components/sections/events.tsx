"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Plus, Clock, MapPin, Users, Calendar } from "lucide-react"
import { useAlumniStore, type Event } from "@/lib/store"
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

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  maxAttendees: z.coerce.number().min(1).optional().or(z.literal("")),
  type: z.enum(["In-Person", "Virtual", "Hybrid"]),
})

type EventFormData = z.infer<typeof eventSchema>

export function EventsSection() {
  const { 
    currentUser, 
    events, 
    eventRegistrations,
    addEvent, 
    updateEvent, 
    deleteEvent,
    registerEvent,
    unregisterEvent 
  } = useAlumniStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Event | null>(null)

  const isAdmin = currentUser?.role === "admin"

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      type: "In-Person",
    },
  })

  const filteredEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter((e) => {
        const eventDate = new Date(e.date)
        if (filter === "upcoming" && eventDate < now) return false
        if (filter === "past" && eventDate >= now) return false
        
        const q = searchQuery.toLowerCase()
        return !q || 
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        if (filter === "past") {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
  }, [events, searchQuery, filter])

  const openAddModal = () => {
    setEditingEvent(null)
    form.reset({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      type: "In-Person",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    form.reset({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location || "",
      description: event.description || "",
      maxAttendees: (event.maxAttendees !== undefined ? Number(event.maxAttendees) || "" : "") as number | "",
      type: event.type as "In-Person" | "Virtual" | "Hybrid",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (data: EventFormData) => {
    const eventData = {
      ...data,
      maxAttendees: data.maxAttendees ? Number(data.maxAttendees) : undefined,
    }
    
    if (editingEvent) {
      updateEvent(editingEvent._id || editingEvent.id!, eventData)
      toast.success("Event updated.")
    } else {
      addEvent(eventData as Omit<Event, "id">)
      toast.success(`Event "${data.title}" created!`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteEvent(deleteConfirm._id || deleteConfirm.id!)
      toast.success("Event deleted.")
      setDeleteConfirm(null)
    }
  }

  const getRegistrations = (eventId: string | number) => {
    return eventRegistrations.filter((r) => r.eventId === eventId)
  }

  const isRegistered = (eventId: number | string) => {
    return eventRegistrations.some(
      (r) => r.eventId === eventId && r.userId === currentUser?._id
    )
  }

  const handleRegister = (eventId: number | string) => {
    if (isRegistered(eventId)) {
      toast.info("Already registered.")
      return
    }
    registerEvent(eventId, currentUser?._id || null)
    toast.success("Registered! Confirmation sent.")
  }

  const handleUnregister = (eventId: number | string) => {
    unregisterEvent(eventId, currentUser?._id || null)
    toast.info("Registration cancelled.")
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.1)_0%,transparent_70%)]" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">Events</h1>
        <p className="text-white/45 text-sm relative">Reunions, webinars, and networking gatherings.</p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="all">All Events</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={openAddModal} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => {
              const eventId = event._id || event.id!
              const eventDate = new Date(event.date)
              const isPast = eventDate < new Date()
              const regs = getRegistrations(eventId)
              const myReg = isRegistered(eventId)
              const isFull = event.maxAttendees && regs.length >= Number(event.maxAttendees)

              return (
                <div
                  key={eventId}
                  className={`bg-card border border-border rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg ${isPast ? "opacity-65" : ""}`}
                >
                  <div className="h-2 bg-gradient-to-r from-[var(--secondary)] to-orange-500" />
                  <div className="p-5">
                    {/* Date badge */}
                    <div className="inline-flex flex-col items-center px-3 py-1.5 bg-[var(--gold-pale)] border border-[var(--secondary)]/30 rounded-lg mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--secondary)]">
                        {eventDate.toLocaleString("default", { month: "short" }).toUpperCase()}
                      </span>
                      <span className="text-2xl font-bold font-serif">{eventDate.getDate()}</span>
                    </div>

                    <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                    <div className="text-xs text-muted-foreground mb-2 space-x-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time || "TBD"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location || "TBD"}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        event.type === "Virtual" 
                          ? "bg-blue-50 text-blue-600" 
                          : event.type === "Hybrid" 
                          ? "bg-[var(--gold-pale)] text-[var(--secondary)]" 
                          : "bg-green-50 text-green-600"
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description || "No description."}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        <Users className="h-3 w-3 inline mr-1" />
                        {regs.length}{event.maxAttendees ? ` / ${event.maxAttendees}` : ""} registered
                      </span>

                      <div className="flex gap-2 flex-wrap">
                        {!isPast && (
                          myReg ? (
                            <>
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-600">
                                Registered
                              </span>
<Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnregister(eventId)}
                            >
                              Cancel
                            </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              disabled={!!isFull}
                              onClick={() => handleRegister(eventId)}
                              className="bg-[var(--primary)]"
                            >
                              {isFull ? "Full" : "Register"}
                            </Button>
                          )
                        )}
                        {isPast && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                            Past
                          </span>
                        )}
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(event)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(event)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Del
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty>
              <EmptyHeader>
                <EmptyMedia><Calendar className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle>Nothing here yet</EmptyTitle>
                <EmptyDescription>{filter === "upcoming" ? "No upcoming events. Create one!" : "No past events."}</EmptyDescription>
              </EmptyHeader>
            </Empty>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingEvent ? "Edit Event" : "Create Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Event Title *</FieldLabel>
                <Input {...form.register("title")} placeholder="Annual Alumni Reunion 2026" />
                {form.formState.errors.title && (
                  <FieldError>{form.formState.errors.title.message}</FieldError>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Date *</FieldLabel>
                  <Input {...form.register("date")} type="date" />
                  {form.formState.errors.date && (
                    <FieldError>{form.formState.errors.date.message}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Time *</FieldLabel>
                  <Input {...form.register("time")} type="time" />
                  {form.formState.errors.time && (
                    <FieldError>{form.formState.errors.time.message}</FieldError>
                  )}
                </Field>
              </div>
              <Field>
                <FieldLabel>Location</FieldLabel>
                <Input {...form.register("location")} placeholder="Main Campus Auditorium / Online" />
              </Field>
              <Field>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  {...form.register("description")}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  placeholder="What should alumni expect..."
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Max Attendees</FieldLabel>
                  <Input {...form.register("maxAttendees")} type="number" min={1} placeholder="200" />
                </Field>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(v) => form.setValue("type", v as "In-Person" | "Virtual" | "Hybrid")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-Person">In-Person</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--primary)]">
                {editingEvent ? "Save Changes" : "Save Event"}
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
              Delete this event? This cannot be undone.
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
