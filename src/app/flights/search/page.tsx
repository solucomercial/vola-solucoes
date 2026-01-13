import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FlightSearchForm } from "@/components/flight-search-form"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plane, ArrowLeft } from "lucide-react"

export default async function FlightSearchPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

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
              <h1 className="text-xl font-semibold">Pesquisar voos</h1>
            </div>
          </div>
          <UserNav user={profile || {}} />
        </div>
      </header>

      <main className="flex-1 bg-muted/40">
        <div className="container py-8 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Encontre o seu voo</h2>
              <p className="text-muted-foreground">Pesquise voos disponíveis e crie uma solicitação</p>
            </div>

            <FlightSearchForm userId={data.user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
