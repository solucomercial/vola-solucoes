import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest } from 'next/server' // Adicione esta importação

export async function middleware(request: NextRequest) { // Altere de Request para NextRequest
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}