"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ApprovalActionsProps {
  requestId: string
  approverId: string
}

export function ApprovalActions({ requestId, approverId }: ApprovalActionsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [comments, setComments] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async () => {
    setIsApproving(true)

    try {
      const { error } = await supabase.from("approvals").insert({
        request_id: requestId,
        approver_id: approverId,
        status: "approved",
        comments: comments.trim() || null,
      })

      if (error) throw error

      setOpenApprove(false)
      setComments("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error approving request:", error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!comments.trim()) {
      return
    }

    setIsRejecting(true)

    try {
      const { error } = await supabase.from("approvals").insert({
        request_id: requestId,
        approver_id: approverId,
        status: "rejected",
        comments: comments.trim(),
      })

      if (error) throw error

      setOpenReject(false)
      setComments("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error rejecting request:", error)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <Button variant="outline" onClick={() => setOpenReject(true)}>
          <X className="h-4 w-4 mr-1" />
          Rejeitar
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar solicitação</DialogTitle>
            <DialogDescription>Por favor, forneça um motivo para rejeitar esta solicitação</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reject-comments">Comentários *</Label>
              <Textarea
                id="reject-comments"
                placeholder="Explique o motivo da rejeição..."
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReject(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting || !comments.trim()}>
              {isRejecting ? "Rejeitando..." : "Rejeitar Solicitação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <Button onClick={() => setOpenApprove(true)}>
          <Check className="h-4 w-4 mr-1" />
          Aprovar
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar solicitação</DialogTitle>
            <DialogDescription>Confirmar aprovação desta solicitação de voo</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="approve-comments">Comentários (optional)</Label>
              <Textarea
                id="approve-comments"
                placeholder="Adicione quaisquer observações adicionais..."
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenApprove(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? "Aprovando..." : "Aprovar Solicitação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
