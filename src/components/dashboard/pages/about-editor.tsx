"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Utensils,
  FileText,
  Settings2,
  Globe,
  ChevronUp,
  Trash,
  Save as SaveIcon,
} from "lucide-react"
import { Disclosure } from "@headlessui/react"
import type { IPage, IComponent } from "@/types/page"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { PageService } from "@/lib/page-service"

interface AboutEditorProps {
  page: IPage
  restaurantId: string
}

export function AboutEditor({ page, restaurantId }: AboutEditorProps) {
  const [components, setComponents] = useState<IComponent[]>(page.components)
  const [seo, setSeo] = useState(page.seo)
  const [headerImage, setHeaderImage] = useState(page.headerImage)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"components" | "settings" | "seo">(
    "components",
  )

  useEffect(() => {
    const interval = setInterval(handleSave, 30000)
    return () => clearInterval(interval)
  }, [components, seo, headerImage])

  const updateComponent = (
    index: number,
    key: string,
    value: any,
    subIndex?: number,
  ) => {
    setComponents((prev) => {
      const newComps = [...prev]
      const comp = { ...newComps[index] }
      const props = { ...comp.props }
      if (subIndex !== undefined) {
        const arr = [...(props[key] as any[])]
        arr[subIndex] = value
        props[key] = arr
      } else {
        props[key] = value
      }
      comp.props = props
      newComps[index] = comp
      return newComps
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await PageService.updatePage(restaurantId, page._id, {
        components,
        seo,
        headerImage,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const getDefaultPropsForType = (type: string): any => {
    switch (type) {
      case "header":
        return { title: "", subtitle: "", heroImage: "" }
      case "story":
        return { title: "", contentParagraphs: ["Paragraph 1"] }
      case "mission":
        return { title: "", content: "" }
      case "values":
        return { title: "", items: [{ number: "1", title: "", description: "" }] }
      case "team":
        return { members: [{ image: "", name: "", role: "" }] }
      default:
        return {}
    }
  }

  const addComponent = (type: string) => {
    const newComponent: IComponent = {
      component_id: crypto.randomUUID(),
      type,
      props: getDefaultPropsForType(type),
      position: components.length,
    }
    setComponents([...components, newComponent])
  }

  const removeComponent = (index: number) => {
    if (confirm("Are you sure you want to delete this component?")) {
      const newComps = [...components]
      newComps.splice(index, 1)
      setComponents(newComps)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newComps = Array.from(components)
    const [removed] = newComps.splice(result.source.index, 1)
    newComps.splice(result.destination.index, 0, removed)
    setComponents(newComps)
  }

  const renderComponentEditor = (comp: IComponent, idx: number) => (
    <Draggable draggableId={comp.component_id} index={idx} key={comp.component_id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="cursor-grab active:cursor-grabbing"
        >
          <Disclosure defaultOpen>
            {({ open }) => (
              <div className="border rounded-md overflow-hidden">
                <Disclosure.Button className="w-full px-4 py-2 bg-gray-100 text-left font-medium flex justify-between items-center hover:bg-gray-200">
                  <span
                    className="capitalize text-gray-800 flex items-center gap-2"
                    {...provided.dragHandleProps}
                  >
                    {comp.type}
                  </span>
                  <ChevronUp
                    className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="p-4 bg-white border-t space-y-3">
                  <div className="grid gap-4">
                    <Input
                      value={comp.props.title || ""}
                      onChange={(e) => updateComponent(idx, "title", e.target.value)}
                      placeholder="Title"
                    />
                    {comp.type === "header" && (
                      <>
                        <Input
                          value={comp.props.subtitle || ""}
                          onChange={(e) => updateComponent(idx, "subtitle", e.target.value)}
                          placeholder="Subtitle"
                        />
                        <Input
                          value={comp.props.heroImage || ""}
                          onChange={(e) => updateComponent(idx, "heroImage", e.target.value)}
                          placeholder="Hero Image URL"
                        />
                      </>
                    )}
                    {comp.type === "story" && (
                      <Textarea
                        value={comp.props.contentParagraphs?.[0] || ""}
                        onChange={(e) =>
                          updateComponent(idx, "contentParagraphs", [e.target.value])
                        }
                        placeholder="Story content"
                      />
                    )}
                    {comp.type === "mission" && (
                      <Textarea
                        value={comp.props.content || ""}
                        onChange={(e) => updateComponent(idx, "content", e.target.value)}
                        placeholder="Mission content"
                      />
                    )}
                    {comp.type === "values" && (
                      <div className="space-y-2">
                        {comp.props.items?.map((v: any, vIdx: number) => (
                          <div key={vIdx} className="grid gap-2 border p-2 rounded">
                            <Input
                              value={v.number}
                              onChange={(e) => {
                                const arr = [...comp.props.items]
                                arr[vIdx] = { ...v, number: e.target.value }
                                updateComponent(idx, "items", arr)
                              }}
                              placeholder="Number"
                            />
                            <Input
                              value={v.title}
                              onChange={(e) => {
                                const arr = [...comp.props.items]
                                arr[vIdx] = { ...v, title: e.target.value }
                                updateComponent(idx, "items", arr)
                              }}
                              placeholder="Title"
                            />
                            <Textarea
                              value={v.description}
                              onChange={(e) => {
                                const arr = [...comp.props.items]
                                arr[vIdx] = { ...v, description: e.target.value }
                                updateComponent(idx, "items", arr)
                              }}
                              placeholder="Description"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {comp.type === "team" && (
                      <div className="space-y-2">
                        {comp.props.members?.map((m: any, mIdx: number) => (
                          <div key={mIdx} className="grid gap-2 border p-2 rounded">
                            <Input
                              value={m.image}
                              onChange={(e) => {
                                const arr = [...comp.props.members]
                                arr[mIdx] = { ...m, image: e.target.value }
                                updateComponent(idx, "members", arr)
                              }}
                              placeholder="Image URL"
                            />
                            <Input
                              value={m.name}
                              onChange={(e) => {
                                const arr = [...comp.props.members]
                                arr[mIdx] = { ...m, name: e.target.value }
                                updateComponent(idx, "members", arr)
                              }}
                              placeholder="Name"
                            />
                            <Input
                              value={m.role}
                              onChange={(e) => {
                                const arr = [...comp.props.members]
                                arr[mIdx] = { ...m, role: e.target.value }
                                updateComponent(idx, "members", arr)
                              }}
                              placeholder="Role"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => removeComponent(idx)}
                    className="text-red-600 hover:bg-red-50 gap-2"
                  >
                    <Trash className="w-4 h-4" /> Remove Component
                  </Button>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        </div>
      )}
    </Draggable>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-white to-blue-50 border-b px-6 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="h-6 w-6 text-blue-500" />
            About Page Editor
          </h1>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-sm text-blue-600 animate-pulse">Saving...</span>
            )}
            <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2">
              <SaveIcon className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
      <div className="flex gap-1 mt-4 border-b border-gray-200 px-6">
        {["components", "settings", "seo"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "components" && <FileText className="h-4 w-4 inline mr-2" />}
            {tab === "settings" && <Settings2 className="h-4 w-4 inline mr-2" />}
            {tab === "seo" && <Globe className="h-4 w-4 inline mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="p-6 max-w-4xl mx-auto">
        {activeTab === "components" && (
          <div className="space-y-6">
            <Card className="border-dashed border-2 border-gray-300 bg-white">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Add New Component</h3>
                <p className="text-gray-600">Choose a component type to add to your page</p>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {[
                    { type: "header", label: "Header", icon: Utensils, color: "text-blue-500" },
                    { type: "story", label: "Story", icon: FileText, color: "text-green-500" },
                    { type: "mission", label: "Mission", icon: FileText, color: "text-purple-500" },
                    { type: "values", label: "Values", icon: FileText, color: "text-orange-500" },
                    { type: "team", label: "Team", icon: FileText, color: "text-teal-500" },
                  ].map(({ type, label, icon: Icon, color }) => (
                    <Button
                      key={type}
                      variant="outline"
                      onClick={() => addComponent(type)}
                      className={`gap-2 hover:scale-105 transition-transform ${color}`}
                    >
                      <Icon className="h-4 w-4" /> Add {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            {components.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Page Components</h2>
                  <Badge variant="secondary">
                    {components.length} component{components.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="components">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {components.map((comp, idx) => renderComponentEditor(comp, idx))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            ) : (
              <Card className="text-center py-12 bg-white">
                <CardContent>
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Components Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start building your about page by adding your first component above.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={headerImage}
                  onChange={(e) => setHeaderImage(e.target.value)}
                  placeholder="Header image URL"
                />
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={seo.title || ""}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                  placeholder="SEO title"
                />
                <Textarea
                  className="min-h-[100px]"
                  value={seo.description || ""}
                  onChange={(e) =>
                    setSeo({ ...seo, description: e.target.value })
                  }
                  placeholder="SEO description"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}