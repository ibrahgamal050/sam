'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DashboardHeader } from '@/components/dashboard/restaurants/dashboard-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { BranchesTable } from '@/components/dashboard/restaurants/branches-table'
import { BranchForm, BranchFormValues } from '@/components/dashboard/branches/branch-form'
import type { IBranch } from '@/types'

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [open, setOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleSave = (values: BranchFormValues) => {
    if (editingIndex !== null) {
      setBranches((prev) =>
        prev.map((b, i) => (i === editingIndex ? { ...values, id: b.id } : b)),
      )
      toast({ title: 'Branch updated' })
    } else {
      setBranches((prev) => [...prev, { ...values, id: crypto.randomUUID() }])
      toast({ title: 'Branch added' })
    }
    setOpen(false)
  }

  const handleEdit = (branch: Branch) => {
    const idx = branches.findIndex((b) => b.id === branch.id)
    setEditingIndex(idx)
    setOpen(true)
  }

  const handleDelete = (branch: Branch) => {
    setBranches((prev) => prev.filter((b) => b.id !== branch.id))
    toast({ title: 'Branch deleted' })
  }

  const initial = editingIndex !== null ? branches[editingIndex] : undefined

  return (
    <DashboardShell>
      <DashboardHeader heading="Branches" description="Manage restaurant branches">
        <Button onClick={() => { setEditingIndex(null); setOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </DashboardHeader>

      <BranchesTable branches={branches} onEdit={handleEdit} onDelete={handleDelete} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Branch' : 'New Branch'}</DialogTitle>
          </DialogHeader>
          <BranchForm initialData={initial} onSubmit={handleSave} />
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
