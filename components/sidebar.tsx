"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ticket, Settings, ScanLine, LogOut, Bike, User, List } from "lucide-react"
import { useClerk, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()

  const navItems = [
    {
      href: "/",
      label: "Generar Ticket",
      icon: Ticket,
    },
    {
      href: "/tickets",
      label: "Ver Tickets",
      icon: List,
    },
    {
      href: "/scanner",
      label: "Escanear QR",
      icon: ScanLine,
    },
    {
      href: "/settings",
      label: "Configuración",
      icon: Settings,
    },
  ]

  const handleLogout = () => {
    signOut({ redirectUrl: '/sign-in' })
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-border flex flex-col shadow-lg">
      <div className="p-6 gradient-primary">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Bike className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Buffa-Bikes</h2>
            <p className="text-xs text-white/90 font-medium">QR System</p>
          </div>
        </div>
        <p className="text-xs text-white/80 mt-2">Imantación de Volantes</p>
      </div>

      <nav className="flex-1 p-6">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "gradient-primary text-white shadow-lg shadow-primary/25 scale-105"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-102"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-border space-y-3">
        {user && (
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg mb-3">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.fullName || ''} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.fullName || user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
        <p className="text-xs text-muted-foreground text-center">© 2025 Buffa-Bikes QR</p>
      </div>
    </aside>
  )
}
