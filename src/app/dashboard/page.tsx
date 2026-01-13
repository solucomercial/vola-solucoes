import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plane, Clock, CheckCircle, XCircle, Bell } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { NotificationsBell } from "@/components/notifications-bell"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user's request statistics
  const { data: requests } = await supabase
    .from("flight_requests")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0
  const approvedCount = requests?.filter((r) => r.status === "approved").length || 0
  const rejectedCount = requests?.filter((r) => r.status === "rejected").length || 0

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  const unreadNotifications = notifications?.filter((n) => !n.read) || []

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">Sistema de solicitação de voo</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell notifications={notifications || []} unreadCount={unreadNotifications.length} />
            <UserNav user={profile || {}} />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/40">
        <div className="container py-8 px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Bem-vindo de volta, {profile?.full_name || "User"}</h2>
            <p className="text-muted-foreground">Gerencie suas solicitações de voo e acompanhe as aprovações.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Pronto para reservar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejectedCount}</div>
                <p className="text-xs text-muted-foreground">Não aprovadas</p>
              </CardContent>
            </Card>

            <Link href="/notifications">
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Notificações</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{unreadNotifications.length}</div>
                  <p className="text-xs text-muted-foreground">Mensagens não lidas</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Comece com suas solicitações de voo</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href="/flights/search">
                    <Plane className="mr-2 h-4 w-4" />
                    Pesquisar voos
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
                  <Link href="/requests">Ver minhas solicitações</Link>
                </Button>
                {(profile?.role === "approver" || profile?.role === "admin") && (
                  <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
                    <Link href="/approvals">Revisar Aprovações</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Solicitações Recentes</CardTitle>
                <CardDescription>Suas últimas solicitações de voo</CardDescription>
              </CardHeader>
              <CardContent>
                {requests && requests.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {requests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <div className="flex-1">
                          <p className="font-medium">
                            {request.origin} → {request.destination}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.departure_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status}
                        </div>
                      </div>
                    ))}
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/requests">Ver todas as solicitações</Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">Nenhuma solicitação ainda</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
