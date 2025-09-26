"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Loader2, Pencil, Plus, Trash } from "lucide-react"

export type DashboardPost = {
  _id: string
  title: string
  content: string
  image: string
  createdAt: string
  updatedAt: string
}

interface PostsManagerProps {
  restaurantId: string
  initialPosts: DashboardPost[]
}

const EMPTY_FORM = {
  title: "",
  image: "",
  content: "",
}

const normalizePost = (post: any): DashboardPost => ({
  _id: post._id,
  title: post.title,
  content: post.content,
  image: post.image,
  createdAt: new Date(post.createdAt).toISOString(),
  updatedAt: new Date(post.updatedAt).toISOString(),
})

export function PostsManager({ restaurantId, initialPosts }: PostsManagerProps) {
  const { toast } = useToast()
  const [posts, setPosts] = useState<DashboardPost[]>(() => initialPosts.map(normalizePost))

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)
  const [isCreating, setIsCreating] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const hasPosts = useMemo(() => posts.length > 0, [posts.length])

  const resetCreateForm = () => {
    setCreateForm(EMPTY_FORM)
    setIsCreateOpen(false)
  }

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsCreating(true)

      const response = await fetch(`/api/restaurants/${restaurantId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Failed to create post")
      }

      const post = normalizePost(await response.json())
      setPosts((prev) => [post, ...prev])
      toast({
        title: "تم إنشاء المقال",
        description: "تمت إضافة المقال الجديد بنجاح.",
      })
      resetCreateForm()
    } catch (error) {
      console.error("Error creating post", error)
      toast({
        variant: "destructive",
        title: "تعذر إنشاء المقال",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع.",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const startEdit = (post: DashboardPost) => {
    setEditingId(post._id)
    setEditForm({ title: post.title, image: post.image, content: post.content })
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingId) return

    try {
      setIsUpdating(true)

      const response = await fetch(`/api/restaurants/${restaurantId}/posts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Failed to update post")
      }

      const updated = normalizePost(await response.json())
      setPosts((prev) =>
        prev.map((post) =>
          post._id === updated._id
            ? updated
            : post,
        ),
      )
      toast({
        title: "تم تحديث المقال",
        description: "تم حفظ التعديلات بنجاح.",
      })
      setIsEditOpen(false)
      setEditingId(null)
      setEditForm(EMPTY_FORM)
    } catch (error) {
      console.error("Error updating post", error)
      toast({
        variant: "destructive",
        title: "تعذر تحديث المقال",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (postId: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المقال؟")
    if (!confirmed) return

    try {
      setDeletingId(postId)
      const response = await fetch(`/api/restaurants/${restaurantId}/posts/${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Failed to delete post")
      }

      setPosts((prev) => prev.filter((post) => post._id !== postId))
      toast({
        title: "تم حذف المقال",
        description: "تمت إزالة المقال بنجاح.",
      })
    } catch (error) {
      console.error("Error deleting post", error)
      toast({
        variant: "destructive",
        title: "تعذر حذف المقال",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع.",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>المنشورات</CardTitle>
            <p className="text-sm text-muted-foreground">قم بإنشاء وتحديث المقالات لتحسين ظهور مطعمك.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> مقال جديد
          </Button>
        </CardHeader>
        <CardContent>
          {hasPosts ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead className="hidden md:table-cell">آخر تحديث</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell className="max-w-[320px] font-medium">
                        <div className="line-clamp-2">{post.title}</div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {post.content.replace(/<[^>]*>/g, "").slice(0, 80)}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {format(new Date(post.updatedAt), "PPpp")}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(post)}>
                          <Pencil className="mr-2 h-4 w-4" /> تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post._id)}
                          disabled={deletingId === post._id}
                        >
                          {deletingId === post._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="mr-2 h-4 w-4" />
                          )}
                          حذف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
              <Plus className="h-8 w-8" />
              <div>
                <p className="font-medium text-foreground">لا توجد مقالات حتى الآن</p>
                <p className="text-sm">ابدأ بإنشاء أول مقال للترويج للمطعم.</p>
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> مقال جديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? setIsCreateOpen(true) : resetCreateForm())}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>إنشاء مقال جديد</DialogTitle>
            <DialogDescription>أضف مقالاً جديداً لزيادة تفاعل العملاء مع مطعمك.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="space-y-2">
              <Label htmlFor="create-title">عنوان المقال</Label>
              <Input
                id="create-title"
                required
                value={createForm.title}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-image">رابط الصورة</Label>
              <Input
                id="create-image"
                required
                value={createForm.image}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, image: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-content">المحتوى</Label>
              <Textarea
                id="create-content"
                required
                rows={8}
                value={createForm.content}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="اكتب محتوى المقال مع دعم HTML بسيط عند الحاجة"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetCreateForm} disabled={isCreating}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}إنشاء المقال
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditOpen(false)
            setEditingId(null)
            setEditForm(EMPTY_FORM)
          } else {
            setIsEditOpen(true)
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل المقال</DialogTitle>
            <DialogDescription>قم بتحديث تفاصيل المقال وحفظ التغييرات.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="space-y-2">
              <Label htmlFor="edit-title">عنوان المقال</Label>
              <Input
                id="edit-title"
                required
                value={editForm.title}
                onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">رابط الصورة</Label>
              <Input
                id="edit-image"
                required
                value={editForm.image}
                onChange={(event) => setEditForm((prev) => ({ ...prev, image: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">المحتوى</Label>
              <Textarea
                id="edit-content"
                required
                rows={8}
                value={editForm.content}
                onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}حفظ التعديلات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
