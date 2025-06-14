"use client"

import { useState } from "react"
import { v4 as uuid } from "uuid"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { PageService } from "@/lib/page-service"
import { ALLOWED_COMPONENT_TYPES } from "@/lib/services/page-service"
import type { IComponent } from "@/types/page"

interface Props {
  restaurantId: string
  pageId: string
  initialComponents: IComponent[]
}

export function ComponentsManager({ restaurantId, pageId, initialComponents }: Props) {
  const [components, setComponents] = useState<IComponent[]>(initialComponents)
  const [newType, setNewType] = useState<string>(ALLOWED_COMPONENT_TYPES[0])
  const [newContent, setNewContent] = useState("")

  async function addComponent() {
    if (!newContent.trim()) {
      toast.error("Content cannot be empty")
      return
    }

    const component: IComponent = {
      component_id: uuid(),
      type: newType,
      props: { content: newContent },
      position: components.length,
    }

    try {
      const updated = await PageService.updateComponents(restaurantId, pageId, {
        operation: "add",
        component
      })
      setComponents(updated)
      setNewContent("")
      toast.success("Component added")
    } catch (e) {
      console.error(e)
      toast.error("Failed to add component")
    }
  }

  async function updateComponent(c: IComponent) {
    try {
      const updated = await PageService.updateComponents(restaurantId, pageId, {
        operation: "update",
        component: c
      })
      setComponents(updated)
      toast.success("Component updated")
    } catch (e) {
      console.error(e)
      toast.error("Failed to update component")
    }
  }

  async function deleteComponent(id: string) {
    try {
      const updated = await PageService.updateComponents(restaurantId, pageId, {
        operation: "delete",
        component: { component_id: id }
      })
      setComponents(updated)
      toast.success("Component deleted")
    } catch (e) {
      console.error(e)
      toast.error("Failed to delete component")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <Select value={newType} onValueChange={setNewType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {ALLOWED_COMPONENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Content"
          className="w-60"
        />
        <Button onClick={addComponent}>Add</Button>
      </div>

      <ul className="space-y-2">
        {components.map((c) => (
          <li
            key={c.component_id}
            className="flex items-center gap-2 border p-2 rounded-md"
          >
            <span className="flex-1 font-semibold">{c.type}</span>
            <Input
              className="w-60"
              value={(c.props as any).content || ""}
              onChange={(e) => {
                const val = e.target.value
                setComponents((prev) =>
                  prev.map((p) =>
                    p.component_id === c.component_id
                      ? { ...p, props: { content: val } }
                      : p
                  )
                )
              }}
            />
            <Button size="sm" variant="outline" onClick={() => updateComponent(c)}>
              Save
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteComponent(c.component_id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
