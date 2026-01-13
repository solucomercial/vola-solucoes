"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface RequestActionsProps {
  requestId: string
  status: string
}

export function RequestActions({ requestId, status }: RequestActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("flight_requests").delete().eq("id", requestId)

      if (error) throw error

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting request:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (status !== "pending") {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Solicitação</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Manter solicitação
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Cancelando..." : "Cancelar Solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
