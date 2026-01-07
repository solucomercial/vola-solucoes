import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Plane } from "lucide-react"

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">Flight Request System</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link. Please check your email to verify your account and complete the
              signup process.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-sm text-muted-foreground">
              After confirming your email, you&apos;ll be able to sign in and start managing your flight requests.
            </p>
            <Button asChild>
              <Link href="/auth/login">Return to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
