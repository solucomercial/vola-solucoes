import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plane, ArrowLeft, Calendar, Users, FileText } from "lucide-react"
import { RequestActions } from "@/components/request-actions"

export default async function RequestsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user's requests with flight details
  const { data: requests } = await supabase
    .from("flight_requests")
    .select(
      `
      *,
      flights (
        airline,
        flight_number,
        departure_time,
        arrival_time
      )
    `,
    )
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  // Get approvals for each request
  const requestsWithApprovals = await Promise.all(
    (requests || []).map(async (request) => {
      const { data: approvals } = await supabase
        .from("approvals")
        .select(
          `
          *,
          profiles (full_name)
        `,
        )
        .eq("request_id", request.id)
        .single()

      return { ...request, approval: approvals }
    }),
  )

  const pendingRequests = requestsWithApprovals.filter((r) => r.status === "pending")
  const completedRequests = requestsWithApprovals.filter((r) => r.status !== "pending")

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
              <h1 className="text-xl font-semibold">Minhas Solicitações</h1>
            </div>
          </div>
          <UserNav user={profile || {}} />
        </div>
      </header>

      <main className="flex-1 bg-muted/40">
        <div className="container py-8 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Solicitações de Voo</h2>
                <p className="text-muted-foreground">Acompanhe e gerencie suas solicitações de viagem</p>
              </div>
              <Button asChild>
                <Link href="/flights/search">
                  <Plane className="mr-2 h-4 w-4" />
                  Nova Solicitação
                </Link>
              </Button>
            </div>

            <div className="flex flex-col gap-8">
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Aguardando Aprovação</h3>
                  <div className="flex flex-col gap-4">
                    {pendingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {request.origin} → {request.destination}
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  Pendente
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                {request.flights?.airline} {request.flights?.flight_number}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">R$ {request.total_price.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-4">
                            <div className="grid gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Partida:</span>
                                <span>
                                  {new Date(request.departure_date).toLocaleDateString()} at{" "}
                                  {request.flights?.departure_time
                                    ? new Date(request.flights.departure_time).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Passageiros:</span>
                                <span>{request.passengers}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="font-medium">Motivo:</span>
                                <span className="flex-1">{request.reason}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t">
                              <p className="text-xs text-muted-foreground">
                                Enviado {new Date(request.created_at).toLocaleDateString()}
                              </p>
                              <RequestActions requestId={request.id} status={request.status} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {completedRequests.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Solicitações Concluídas</h3>
                  <div className="flex flex-col gap-4">
                    {completedRequests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {request.origin} → {request.destination}
                                <Badge
                                  variant="secondary"
                                  className={
                                    request.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {request.status}
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                {request.flights?.airline} {request.flights?.flight_number}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">R$ {request.total_price.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-4">
                            <div className="grid gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Partida:</span>
                                <span>
                                  {new Date(request.departure_date).toLocaleDateString()} at{" "}
                                  {request.flights?.departure_time
                                    ? new Date(request.flights.departure_time).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Passageiros:</span>
                                <span>{request.passengers}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="font-medium">Motivo:</span>
                                <span className="flex-1">{request.reason}</span>
                              </div>
                            </div>
                            {request.approval && (
                              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                                <p className="font-medium mb-1">
                                  {request.status === "approved" ? "Approved" : "Rejected"} by{" "}
                                  {request.approval.profiles?.full_name}
                                </p>
                                {request.approval.comments && (
                                  <p className="text-muted-foreground">{request.approval.comments}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(request.approval.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!requests || requests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plane className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ainda não há solicitações</h3>
                    <p className="text-sm text-muted-foreground mb-4">Comece pesquisando voos</p>
                    <Button asChild>
                      <Link href="/flights/search">Pesquisar voos</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
