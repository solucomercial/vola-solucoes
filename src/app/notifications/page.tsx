import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Plane, ArrowLeft, Bell } from "lucide-react"
import { NotificationItem } from "@/components/notification-item"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get all notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  const unreadNotifications = notifications?.filter((n) => !n.read) || []
  const readNotifications = notifications?.filter((n) => n.read) || []

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Plane className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">Notifications</h1>
            </div>
          </div>
          <UserNav user={profile || {}} />
        </div>
      </header>

      <main className="flex-1 bg-muted/40">
        <div className="container py-8 px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Notifications</h2>
              <p className="text-muted-foreground">Stay updated on your flight request status</p>
            </div>

            {unreadNotifications.length === 0 && readNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-6">
                {unreadNotifications.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Unread</h3>
                    <div className="flex flex-col gap-2">
                      {unreadNotifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                    </div>
                  </div>
                )}

                {readNotifications.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Read</h3>
                    <div className="flex flex-col gap-2">
                      {readNotifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
