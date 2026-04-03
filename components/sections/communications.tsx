"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Send, Mail, Inbox } from "lucide-react"
import { useAlumniStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Empty } from "@/components/ui/empty"
import { toast } from "sonner"

const newsletterSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message is required"),
  recipient: z.string().min(1, "Select recipients"),
})

type NewsletterFormData = z.infer<typeof newsletterSchema>

export function CommunicationsSection() {
  const { alumni, mentors, communications, sendNewsletter } = useAlumniStore()

  const currentYear = new Date().getFullYear()
  
  const recipientCounts = {
    all: alumni.length,
    recent: alumni.filter((a) => currentYear - a.year <= 5).length,
    mentors: mentors.length,
    bachelors: alumni.filter((a) => a.degree === "Bachelor's").length,
    masters: alumni.filter((a) => a.degree === "Master's").length,
    phd: alumni.filter((a) => a.degree === "PhD").length,
  }

  const recipientLabels: Record<string, string> = {
    all: "All Alumni",
    recent: "Recent Graduates",
    mentors: "Mentors",
    bachelors: "Bachelor's",
    masters: "Master's",
    phd: "PhD",
  }

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      subject: "",
      body: "",
      recipient: "all",
    },
  })

  const onSubmit = (data: NewsletterFormData) => {
    const count = recipientCounts[data.recipient as keyof typeof recipientCounts] || 0
    const label = recipientLabels[data.recipient] || data.recipient

    sendNewsletter({
      subject: data.subject,
      body: data.body,
      recipient: data.recipient,
      recipientLabel: label,
      count,
    })

    toast.success(`Newsletter sent to ${count} recipient${count !== 1 ? "s" : ""}!`)
    form.reset()
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="bg-[var(--primary)] px-6 lg:px-10 py-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.1)_0%,transparent_70%)]" />
        <h1 className="font-serif text-4xl font-bold text-white mb-1 relative">Communications</h1>
        <p className="text-white/45 text-sm relative">Send newsletters and view sent messages.</p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-9 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Compose Panel */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border bg-[var(--gold-pale)]">
              <h3 className="font-bold flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Newsletter
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Broadcast a message to your alumni audience
              </p>
            </div>
            <div className="p-5">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Subject *</FieldLabel>
                    <Input 
                      {...form.register("subject")} 
                      placeholder="Your subject line..." 
                    />
                    {form.formState.errors.subject && (
                      <FieldError>{form.formState.errors.subject.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Message *</FieldLabel>
                    <textarea
                      {...form.register("body")}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-y"
                      placeholder="Write your message to the community..."
                    />
                    {form.formState.errors.body && (
                      <FieldError>{form.formState.errors.body.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Recipients</FieldLabel>
                    <Select
                      value={form.watch("recipient")}
                      onValueChange={(v) => form.setValue("recipient", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Alumni ({recipientCounts.all})
                        </SelectItem>
                        <SelectItem value="recent">
                          Recent Graduates - last 5 years ({recipientCounts.recent})
                        </SelectItem>
                        <SelectItem value="mentors">
                          Mentors only ({recipientCounts.mentors})
                        </SelectItem>
                        <SelectItem value="bachelors">
                          Bachelor&apos;s Degree holders ({recipientCounts.bachelors})
                        </SelectItem>
                        <SelectItem value="masters">
                          Master&apos;s Degree holders ({recipientCounts.masters})
                        </SelectItem>
                        <SelectItem value="phd">
                          PhD holders ({recipientCounts.phd})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button type="submit" className="w-full bg-[var(--primary)]">
                    <Send className="h-4 w-4 mr-2" />
                    Send Newsletter
                  </Button>
                </FieldGroup>
              </form>
            </div>
          </div>

          {/* Sent Messages Panel */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border bg-[var(--gold-pale)]">
              <h3 className="font-bold flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Sent Messages
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                History of all broadcasts
              </p>
            </div>
            <div className="p-5">
              {communications.length > 0 ? (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {[...communications].reverse().map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 bg-[var(--gold-pale)] rounded-lg border-l-4 border-[var(--secondary)]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">{comm.subject}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatDate(comm.ts)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {comm.body}
                      </p>
                      <div className="text-[11px] text-muted-foreground">
                        Sent to: {comm.recipientLabel} ({comm.count} recipient{comm.count !== 1 ? "s" : ""})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  icon={<Inbox className="h-10 w-10" />}
                  title="No messages sent yet"
                  description="Compose a newsletter to get started."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
