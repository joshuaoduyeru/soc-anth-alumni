"use client"

import { useAlumniStore } from "@/lib/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User, Shield, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserProfileDropdown() {
  const { currentUser, logout } = useAlumniStore()
  const router = useRouter()

  if (!currentUser) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleProfile = () => {
    router.push("/?section=my-profile")
  }

  const handleAdminSettings = () => {
    router.push("/?section=admin-settings")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full p-0 hover:bg-opacity-0"
        >
          <Avatar className="h-9 w-9 cursor-pointer transition-transform hover:scale-110">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback 
              className="font-bold text-sm"
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--ink)',
              }}
            >
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {/* User Info Section */}
        <DropdownMenuLabel className="flex flex-col space-y-2 px-3 py-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            {currentUser.name}
          </p>
          <p 
            className="text-xs" 
            style={{ color: 'var(--slate)' }}
          >
            {currentUser.email}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Role Badge */}
        <div className="px-3 py-2">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md w-full"
            style={{
              backgroundColor: currentUser.isAdmin ? 'var(--gold-pale)' : 'var(--mist)',
            }}
          >
            <Shield 
              className="h-3.5 w-3.5" 
              style={{
                color: currentUser.isAdmin ? 'var(--gold)' : 'var(--slate)',
              }}
            />
            <span 
              className="text-xs font-bold tracking-wider"
              style={{
                color: currentUser.isAdmin ? 'var(--rust)' : 'var(--slate)',
              }}
            >
              {currentUser.isAdmin ? 'ADMIN' : 'ALUMNI'}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem 
          onClick={handleProfile}
          className="cursor-pointer focus:bg-opacity-0 hover:bg-opacity-50"
          style={{
            '--hover-bg': 'var(--gold-pale)',
          } as React.CSSProperties}
        >
          <User className="mr-2 h-4 w-4" style={{ color: 'var(--gold)' }} />
          <span style={{ color: 'var(--ink)' }}>View Profile</span>
        </DropdownMenuItem>

        {currentUser.isAdmin && (
          <DropdownMenuItem 
            onClick={handleAdminSettings}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" style={{ color: 'var(--gold)' }} />
            <span style={{ color: 'var(--ink)' }}>Admin Settings</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer focus:bg-opacity-0"
          style={{ color: 'var(--rust)' }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
