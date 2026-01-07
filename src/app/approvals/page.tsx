import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Plane, ArrowLeft, Calendar, Users, FileText, Building } from "lucide-react"
import { ApprovalActions } from "@/components/approval-actions"

export default async function ApprovalsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Check if user is approver or admin
  if (profile?.role !== "approver" && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all pending requests with user and flight details
  const { data: pendingRequests } = await supabase
    .from("flight_requests")
    .select(
      `
      *,
      profiles!flight_requests_user_id_fkey (full_name, email, department),
      flights (airline, flight_number, departure_time, arrival_time)
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Get all completed requests that the current user approved/rejected
  const { data: myApprovals } = await supabase
    .from("approvals")
    .select(
      `
      *,
      flight_requests (
        *,
        profiles!flight_requests_user_id_fkey (full_name, email, department),
        flights (airline, flight_number, departure_time, arrival_time)
      )
    `,
    )
    .eq("approver_id", data.user.id)
    .order("created_at", { ascending: false })

  const pendingCount = pendingRequests?.length || 0

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
              <h1 className="text-xl font-semibold">Approval Dashboard</h1>
            </div>
          </div>
          <UserNav user={profile || {}} />
        </div>
      </header>

      <main className="flex-1 bg-muted/40">
        <div className="container py-8 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Review Requests</h2>
              <p className="text-muted-foreground">Approve or reject flight requests from your team</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="pending">
                  Pending {pendingCount > 0 && <Badge className="ml-2">{pendingCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                {pendingRequests && pendingRequests.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {pendingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {request.origin} → {request.destination}
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  Pending
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                {request.flights?.airline} {request.flights?.flight_number}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">R$ {request.total_price.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">{request.passengers} passenger(s)</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-4">
                            <div className="rounded-lg border bg-muted/50 p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{request.profiles?.full_name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                              {request.profiles?.department && (
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  <Building className="h-3 w-3 text-muted-foreground" />
                                  <span>{request.profiles.department}</span>
                                </div>
                              )}
                            </div>

                            <div className="grid gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Departure:</span>
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
                              {request.return_date && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Return:</span>
                                  <span>{new Date(request.return_date).toLocaleDateString()}</span>
                                </div>
                              )}
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="font-medium">Reason:</span>
                                <span className="flex-1">{request.reason}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <p className="text-xs text-muted-foreground">
                                Submitted {new Date(request.created_at).toLocaleDateString()}
                              </p>
                              <ApprovalActions requestId={request.id} approverId={data.user.id} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Plane className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                      <p className="text-sm text-muted-foreground">All requests have been reviewed</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                {myApprovals && myApprovals.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {myApprovals.map((approval) => {
                      const request = approval.flight_requests
                      if (!request) return null

                      return (
                        <Card key={approval.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                  {request.origin} → {request.destination}
                                  <Badge
                                    variant="secondary"
                                    className={
                                      approval.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {approval.status}
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
                              <div className="rounded-lg border bg-muted/50 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold">{request.profiles?.full_name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                              </div>

                              <div className="grid gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Departure:</span>
                                  <span>{new Date(request.departure_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <span className="font-medium">Reason:</span>
                                  <span className="flex-1">{request.reason}</span>
                                </div>
                              </div>

                              {approval.comments && (
                                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                                  <p className="font-medium mb-1">Your comments:</p>
                                  <p className="text-muted-foreground">{approval.comments}</p>
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground pt-3 border-t">
                                Reviewed on {new Date(approval.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No approval history</h3>
                      <p className="text-sm text-muted-foreground">You haven&apos;t reviewed any requests yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
