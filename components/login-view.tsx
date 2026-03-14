"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useAlumniStore } from "@/lib/store"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginViewProps {
  onSwitchToSignup: () => void
}

export function LoginView({ onSwitchToSignup }: LoginViewProps) {
  const { alumni, setCurrentUser } = useAlumniStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (data.email === "admin@university.edu" && data.password === "admin123") {
      setCurrentUser({
        email: data.email,
        role: "admin",
        name: "Admin User",
        id: null,
      })
      toast.success("Welcome back, Admin!")
    } else if (data.email === "alumni@example.com" && data.password === "alumni123") {
      const alumniRecord = alumni.find((a) => a.email === data.email)
      setCurrentUser({
        email: data.email,
        role: "alumni",
        name: alumniRecord ? `${alumniRecord.firstName} ${alumniRecord.lastName}` : "Alumni",
        id: alumniRecord?.id || null,
      })
      toast.success(`Welcome back, ${alumniRecord?.firstName || "Alumni"}!`)
    } else {
      toast.error("Invalid credentials. Use a demo account.")
    }
    
    setIsLoading(false)
  }

  const fillDemoCredentials = (email: string, password: string) => {
    setValue("email", email)
    setValue("password", password)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-[var(--primary)] p-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-44 -right-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.18)_0%,transparent_70%)]" />
        <div className="absolute -bottom-32 -left-24 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(253,200,0,0.18)_0%,transparent_70%)]" />
        
        <div className="relative z-10">
          <h1 className="font-serif text-2xl font-black text-white tracking-tight">
            Sociology & Anthropology <span className="text-[var(--secondary)]">Alumni</span>
          </h1>
        </div>
        
        <div className="relative z-10">
          <h2 className="font-serif text-5xl font-bold text-white leading-tight tracking-tight">
            Where <em className="text-[var(--gold-light)] italic">great minds</em><br />
            reunite & thrive.
          </h2>
        </div>
        
        <div className="relative z-10 flex gap-9">
          <div>
            <strong className="block font-serif text-3xl text-white">{alumni.length}</strong>
            <span className="text-xs text-white/45 uppercase tracking-widest">Alumni</span>
          </div>
          <div>
            <strong className="block font-serif text-3xl text-white">0</strong>
            <span className="text-xs text-white/45 uppercase tracking-widest">Events</span>
          </div>
          <div>
            <strong className="block font-serif text-3xl text-white">0</strong>
            <span className="text-xs text-white/45 uppercase tracking-widest">Jobs</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-14 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <h1 className="font-serif text-xl font-black text-foreground tracking-tight">
              Sociology & Anthropology <span className="text-[var(--secondary)]">Alumni</span>
            </h1>
          </div>

          <h2 className="font-serif text-4xl font-bold mb-2">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-9">
            Sign in to access the alumni network.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="h-12"
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="h-12"
                />
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </FieldGroup>
          </form>

          {/* Switch to Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-[var(--primary)] hover:text-[var(--secondary)] font-semibold transition-colors"
              >
                Create one
              </button>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-4 p-4 bg-[var(--gold-pale)] border border-[var(--secondary)]/30 rounded-lg">
            <strong className="block text-sm text-foreground mb-3">Quick Demo Access</strong>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin@university.edu", "admin123")}
                className="px-3 py-1.5 bg-[var(--primary)] text-white text-xs font-semibold rounded transition-colors hover:bg-[var(--secondary)] hover:text-[var(--primary)]"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("alumni@example.com", "alumni123")}
                className="px-3 py-1.5 bg-[var(--primary)] text-white text-xs font-semibold rounded transition-colors hover:bg-[var(--secondary)] hover:text-[var(--primary)]"
              >
                Alumni
              </button>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Admin: admin@university.edu / admin123<br />
              Alumni: alumni@example.com / alumni123
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
