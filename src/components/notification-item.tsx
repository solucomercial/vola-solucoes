"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

interface NotificationItemProps {
  notification: {
    id: string
    title: string
    message: string
    type: string
    read: boolean
    related_request_id: string | null
    created_at: string
  }
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter()
  const supabase = createClient()
  const hasMarkedAsRead = useRef(false)

  useEffect(() => {
    if (!notification.read && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true
      const markAsRead = async () => {
        await supabase.from("notifications").update({ read: true }).eq("id", notification.id)
        router.refresh()
      }
      markAsRead()
    }
  }, [notification.id, notification.read, supabase, router])

  const handleClick = () => {
    if (notification.related_request_id) {
      router.push("/requests")
    }
  }

  const icon =
    notification.type === "request_approved" ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : notification.type === "request_rejected" ? (
      <XCircle className="h-5 w-5 text-red-600" />
    ) : (
      <Clock className="h-5 w-5 text-yellow-600" />
    )

  return (
    <Card
      className={`transition-colors cursor-pointer hover:bg-muted/50 ${!notification.read ? "border-primary/50 bg-primary/5" : ""}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{notification.title}</h4>
              {!notification.read && (
                <Badge variant="secondary" className="text-xs">
                  Nova
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(notification.created_at).toLocaleDateString()} at{" "}
              {new Date(notification.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
