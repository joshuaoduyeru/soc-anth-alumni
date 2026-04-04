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
  const { setCurrentUser } = useAlumniStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })

      if (res.ok) {
        const user = await res.json()
        setCurrentUser({
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.fullName ?? `${user.firstName} ${user.lastName}`,
          fullName: user.fullName ?? `${user.firstName} ${user.lastName}`,
          role: user.role,
          isAdmin: user.role === "admin",
          avatarUrl: user.avatarUrl,
          company: user.company,
          jobTitle: user.jobTitle,
        })
        toast.success(`Welcome back, ${user.firstName}!`)
      } else {
        const err = await res.json()
        toast.error(err.error ?? "Login failed. Please try again.")
      }
    } catch {
      toast.error("Unable to connect to the server. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
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
            Welcome <em className="text-[var(--gold-light)] italic">back</em><br />
            to the network.
          </h2>
          <p className="mt-6 text-white/70 text-lg max-w-md">
            Sign in to reconnect with fellow graduates, access opportunities, and stay engaged with the community.
          </p>
        </div>

        <div className="relative z-10 text-sm text-white/60">
          Obafemi Awolowo University<br />
          Department of Sociology & Anthropology
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-14 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <h1 className="font-serif text-xl font-black text-foreground tracking-tight">
              OAU-<span className="text-[var(--secondary)]">SAN</span>
            </h1>
          </div>

          <h2 className="font-serif text-4xl font-bold mb-2">Sign In</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Enter your credentials to access your account.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="h-11"
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  placeholder="Your password"
                  {...register("password")}
                  className="h-11"
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

          {/* Demo credentials hint */}
          <div className="mt-5 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            <strong className="block text-foreground mb-1">Demo credentials</strong>
            <p>Admin: <code>admin@example.com</code> / <code>admin123</code></p>
            <p>Alumni: <code>alumni@example.com</code> / <code>alumni123</code></p>
          </div>

          {/* Switch to Sign Up */}
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
        </div>
      </div>
    </div>
  )
}
