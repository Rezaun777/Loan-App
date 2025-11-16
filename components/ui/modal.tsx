import type React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">{children}</DialogContent>
    </Dialog>
  )
}
