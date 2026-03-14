"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAlumniStore } from "@/lib/store"
import { toast } from "sonner"
import { Bell, Lock, Eye, Globe, Shield } from "lucide-react"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export function SettingsSection() {
  const { currentUser } = useAlumniStore()
  const [notifications, setNotifications] = useState({
    email: true,
    events: true,
    jobs: true,
    mentorship: true,
    newsletter: false,
  })
  const [privacy, setPrivacy] = useState({
    showEmail: true,
    showPhone: false,
    showLocation: true,
    publicProfile: true,
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onPasswordSubmit = (data: PasswordFormValues) => {
    console.log("Password change:", data)
    toast.success("Password updated successfully")
    passwordForm.reset()
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    toast.success("Notification settings updated")
  }

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }))
    toast.success("Privacy settings updated")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--primary]">Settings</h1>
        <p className="text-[--muted-foreground]">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-[--muted]">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[--primary] data-[state=active]:text-[--primary-foreground]">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-[--primary] data-[state=active]:text-[--primary-foreground]">
            <Eye className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[--primary] data-[state=active]:text-[--primary-foreground]">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card className="border-[--border]">
            <CardHeader>
              <CardTitle className="text-[--primary]">Notification Preferences</CardTitle>
              <CardDescription>Choose what updates you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-[--muted-foreground]">Receive email updates about your account</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange("email")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Event Reminders</Label>
                  <p className="text-sm text-[--muted-foreground]">Get notified about upcoming events</p>
                </div>
                <Switch
                  checked={notifications.events}
                  onCheckedChange={() => handleNotificationChange("events")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Job Opportunities</Label>
                  <p className="text-sm text-[--muted-foreground]">Receive alerts for new job postings</p>
                </div>
                <Switch
                  checked={notifications.jobs}
                  onCheckedChange={() => handleNotificationChange("jobs")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Mentorship Updates</Label>
                  <p className="text-sm text-[--muted-foreground]">Get notified about mentorship requests</p>
                </div>
                <Switch
                  checked={notifications.mentorship}
                  onCheckedChange={() => handleNotificationChange("mentorship")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Newsletter</Label>
                  <p className="text-sm text-[--muted-foreground]">Receive our monthly alumni newsletter</p>
                </div>
                <Switch
                  checked={notifications.newsletter}
                  onCheckedChange={() => handleNotificationChange("newsletter")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="border-[--border]">
            <CardHeader>
              <CardTitle className="text-[--primary]">Privacy Settings</CardTitle>
              <CardDescription>Control what information is visible to others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public Profile
                  </Label>
                  <p className="text-sm text-[--muted-foreground]">Allow other alumni to view your profile</p>
                </div>
                <Switch
                  checked={privacy.publicProfile}
                  onCheckedChange={() => handlePrivacyChange("publicProfile")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Email Address</Label>
                  <p className="text-sm text-[--muted-foreground]">Display your email on your profile</p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={() => handlePrivacyChange("showEmail")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Phone Number</Label>
                  <p className="text-sm text-[--muted-foreground]">Display your phone number on your profile</p>
                </div>
                <Switch
                  checked={privacy.showPhone}
                  onCheckedChange={() => handlePrivacyChange("showPhone")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Location</Label>
                  <p className="text-sm text-[--muted-foreground]">Display your current location</p>
                </div>
                <Switch
                  checked={privacy.showLocation}
                  onCheckedChange={() => handlePrivacyChange("showLocation")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-[--border]">
            <CardHeader>
              <CardTitle className="text-[--primary]">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register("currentPassword")}
                    className="border-[--border]"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-[--destructive]">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword")}
                    className="border-[--border]"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-[--muted-foreground]">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                    className="border-[--border]"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-[--destructive]">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" className="bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90">
                  <Shield className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-[--border] mt-6">
            <CardHeader>
              <CardTitle className="text-[--primary]">Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[--muted-foreground]">Email</Label>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
                <div>
                  <Label className="text-[--muted-foreground]">Member Since</Label>
                  <p className="font-medium">January 2024</p>
                </div>
                <div>
                  <Label className="text-[--muted-foreground]">Account Type</Label>
                  <p className="font-medium capitalize">{currentUser?.role}</p>
                </div>
                <div>
                  <Label className="text-[--muted-foreground]">Last Login</Label>
                  <p className="font-medium">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
