"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

interface NotificationsBellProps {
  notifications: Notification[]
  unreadCount: number
}

export function NotificationsBell({ notifications, unreadCount }: NotificationsBellProps) {
  const router = useRouter()

  const recentNotifications = notifications.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentNotifications.length > 0 ? (
          <>
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start py-3 cursor-pointer"
                onClick={() => router.push("/notifications")}
              >
                <div className="flex items-center gap-2 mb-1">
                  {notification.type === "request_approved" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium text-sm">{notification.title}</span>
                  {!notification.read && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Nova
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.created_at).toLocaleDateString()}
                </p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="text-center justify-center">
                Ver todas as notificações
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
