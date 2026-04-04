"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAlumniStore } from "@/lib/store"
import { toast } from "sonner"

const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    year: z.coerce
      .number()
      .min(1950, "Invalid year")
      .max(new Date().getFullYear(), "Year cannot be in the future"),
    degree: z.enum(["Bachelor's", "Master's", "PhD"], {
      required_error: "Please select a degree",
    }),
    major: z.string().min(2, "Major is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormData = z.infer<typeof signupSchema>

interface SignupViewProps {
  onSwitchToLogin: () => void
}

export function SignupView({ onSwitchToLogin }: SignupViewProps) {
  const { addAlumni, setCurrentUser } = useAlumniStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { degree: undefined },
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const newAlumni = await addAlumni({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        education: [
          {
            degree: data.degree,
            major: data.major,
            graduationYear: data.year,
            institution: "Obafemi Awolowo University",
          },
        ],
      })

      if (newAlumni) {
        const fullName = `${data.firstName} ${data.lastName}`
        setCurrentUser({
          id: newAlumni._id ?? "",
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          name: fullName,
          fullName,
          role: "alumni",
          isAdmin: false,
        })
        toast.success(`Welcome to OAU-SAN, ${data.firstName}!`)
      } else {
        toast.error("Failed to create account. The email may already be in use.")
      }
    } catch {
      toast.error("Unable to connect to the server. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[var(--primary)] p-14 relative overflow-hidden">
        <div className="absolute -top-44 -right-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.18)_0%,transparent_70%)]" />
        <div className="absolute -bottom-32 -left-24 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.18)_0%,transparent_70%)]" />

        <div className="relative z-10">
          <h1 className="font-serif text-2xl font-black text-white tracking-tight">
            OAU-<span className="text-[var(--secondary)]">SAN</span>
          </h1>
        </div>

        <div className="relative z-10">
          <h2 className="font-serif text-5xl font-bold text-white leading-tight tracking-tight">
            Join our <em className="text-[var(--gold-light)] italic">vibrant</em>
            <br />
            alumni community.
          </h2>
          <p className="mt-6 text-white/70 text-lg max-w-md">
            Connect with fellow graduates, access career resources, and stay engaged with the department.
          </p>
        </div>

        <div className="relative z-10 text-sm text-white/60">
          Obafemi Awolowo University
          <br />
          Department of Sociology & Anthropology
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8 lg:p-14 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <h1 className="font-serif text-xl font-black text-foreground tracking-tight">
              OAU-<span className="text-[var(--secondary)]">SAN</span>
            </h1>
          </div>

          <h2 className="font-serif text-4xl font-bold mb-2">Create Account</h2>
          <p className="text-muted-foreground text-sm mb-6">Register to join the alumni network.</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>First Name</FieldLabel>
                  <Input type="text" placeholder="John" {...register("firstName")} className="h-11" />
                  {errors.firstName && <FieldError>{errors.firstName.message}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel>Last Name</FieldLabel>
                  <Input type="text" placeholder="Doe" {...register("lastName")} className="h-11" />
                  {errors.lastName && <FieldError>{errors.lastName.message}</FieldError>}
                </Field>
              </div>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" placeholder="you@example.com" {...register("email")} className="h-11" />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input type="password" placeholder="Min 6 chars" {...register("password")} className="h-11" />
                  {errors.password && <FieldError>{errors.password.message}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <Input type="password" placeholder="Re-enter" {...register("confirmPassword")} className="h-11" />
                  {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Graduation Year</FieldLabel>
                  <Select onValueChange={(val) => setValue("year", parseInt(val))}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.year && <FieldError>{errors.year.message}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel>Degree</FieldLabel>
                  <Select onValueChange={(val) => setValue("degree", val as SignupFormData["degree"])}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelor's">Bachelor&apos;s</SelectItem>
                      <SelectItem value="Master's">Master&apos;s</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.degree && <FieldError>{errors.degree.message}</FieldError>}
                </Field>
              </div>

              <Field>
                <FieldLabel>Major / Field of Study</FieldLabel>
                <Input
                  type="text"
                  placeholder="e.g., Sociology, Anthropology"
                  {...register("major")}
                  className="h-11"
                />
                {errors.major && <FieldError>{errors.major.message}</FieldError>}
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </FieldGroup>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[var(--primary)] hover:text-[var(--secondary)] font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
