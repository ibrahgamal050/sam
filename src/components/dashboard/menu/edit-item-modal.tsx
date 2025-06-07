"use client"

import { useState } from "react"
import { Plus, X, ImagePlus } from "lucide-react"
import { Types } from "mongoose"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MenuImageManager } from "./menu-image-manager"
import type { IMenuItem, ISize, IMenuImage } from "@/types/menu"

interface EditItemModalProps {
  item: IMenuItem
  currency: {
    en?: string
    ar?: string
  }
  menuImages: IMenuImage[]
  onSave: (item: IMenuItem) => void
  onCancel: () => void
  onDelete: () => void
  onImagesChange?: (images: IMenuImage[]) => void
}

export function EditItemModal({
  item,
  currency,
  menuImages = [],
  onSave,
  onCancel,
  onDelete,
  onImagesChange,
}: EditItemModalProps) {
  const [editedItem, setEditedItem] = useState<IMenuItem>({ ...item })
  const [activeTab, setActiveTab] = useState("info")
  const [activeLanguage, setActiveLanguage] = useState<"en" | "ar">("en")
  const [hasSizes, setHasSizes] = useState(item.sizes && item.sizes.length > 0)
  const [newSize, setNewSize] = useState<ISize>({
    name: { en: "", ar: "" },
    price: 0,
  })
  const [imageManagerOpen, setImageManagerOpen] = useState(false)

  const handleChange = (field: string, value: any) => {
    setEditedItem({ ...editedItem, [field]: value })
  }

  const handleNameChange = (lang: "en" | "ar", value: string) => {
    setEditedItem({
      ...editedItem,
      name: {
        ...editedItem.name,
        [lang]: value,
      },
    })
  }

  const handleDescriptionChange = (lang: "en" | "ar", value: string) => {
    setEditedItem({
      ...editedItem,
      description: {
        ...editedItem.description,
        [lang]: value,
      },
    })
  }

  const handlePriceChange = (value: string) => {
    const numericValue = Number.parseFloat(value)
    if (!isNaN(numericValue)) {
      setEditedItem({
        ...editedItem,
        price: numericValue,
      })
    }
  }

  const handleSizeNameChange = (index: number, lang: "en" | "ar", value: string) => {
    const updatedSizes = [...(editedItem.sizes || [])]
    updatedSizes[index] = {
      ...updatedSizes[index],
      name: {
        ...updatedSizes[index].name,
        [lang]: value,
      },
    }
    setEditedItem({
      ...editedItem,
      sizes: updatedSizes,
    })
  }

  const handleSizePriceChange = (index: number, value: string) => {
    const numericValue = Number.parseFloat(value)
    if (!isNaN(numericValue)) {
      const updatedSizes = [...(editedItem.sizes || [])]
      updatedSizes[index] = {
        ...updatedSizes[index],
        price: numericValue,
      }
      setEditedItem({
        ...editedItem,
        sizes: updatedSizes,
      })
    }
  }

  const handleNewSizeNameChange = (lang: "en" | "ar", value: string) => {
    setNewSize({
      ...newSize,
      name: {
        ...newSize.name,
        [lang]: value,
      },
    })
  }

  const handleNewSizePriceChange = (value: string) => {
    const numericValue = Number.parseFloat(value)
    if (!isNaN(numericValue)) {
      setNewSize({
        ...newSize,
        price: numericValue,
      })
    }
  }

  const addSize = () => {
    if (newSize.name.en || newSize.name.ar) {
      const newSizeWithId = {
        ...newSize,
        _id: new Types.ObjectId().toString() as unknown as Types.ObjectId,
      }
      setEditedItem({
        ...editedItem,
        sizes: [...(editedItem.sizes || []), newSizeWithId],
      })
      setNewSize({
        name: { en: "", ar: "" },
        price: 0,
      })
    }
  }

  const removeSize = (index: number) => {
    const updatedSizes = [...(editedItem.sizes || [])]
    updatedSizes.splice(index, 1)
    setEditedItem({
      ...editedItem,
      sizes: updatedSizes,
    })
    if (updatedSizes.length === 0) {
      setHasSizes(false)
    }
  }

  const toggleHasSizes = (checked: boolean) => {
    setHasSizes(checked)
    if (!checked) {
      setEditedItem({
        ...editedItem,
        sizes: [],
      })
    }
  }

  const handleSelectImage = (image: IMenuImage) => {
    setEditedItem({
      ...editedItem,
      image: image.url,
    })
    setImageManagerOpen(false)
  }

  const handleSave = () => {
    // If we have sizes, remove the direct price
    if (hasSizes && editedItem.sizes && editedItem.sizes.length > 0) {
      const { price, ...itemWithoutPrice } = editedItem
      onSave(itemWithoutPrice)
    } else {
      // If we don't have sizes, ensure we have a price
      const itemWithoutSizes = {
        ...editedItem,
        sizes: [],
        price: editedItem.price || 0,
      }
      onSave(itemWithoutSizes)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit item details</DialogTitle>
          <div className="text-lg font-normal">{editedItem.name.en || editedItem.name.ar || "New Item"}</div>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={() => setActiveLanguage(activeLanguage === "en" ? "ar" : "en")}>
            {activeLanguage === "en" ? "العربية" : "English"}
          </Button>
        </div>

        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="sizes">Sizes</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-base">
                Item name ({activeLanguage}) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="item-name"
                value={editedItem.name[activeLanguage] || ""}
                onChange={(e) => handleNameChange(activeLanguage, e.target.value)}
                dir={activeLanguage === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description" className="text-base">
                Item description ({activeLanguage})
              </Label>
              <Textarea
                id="item-description"
                value={editedItem.description?.[activeLanguage] || ""}
                onChange={(e) => handleDescriptionChange(activeLanguage, e.target.value)}
                rows={4}
                dir={activeLanguage === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="item-price" className="text-base">
                  Price <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Switch id="price-per-variant" checked={hasSizes} onCheckedChange={toggleHasSizes} />
                  <Label htmlFor="price-per-variant" className="text-sm">
                    Set price per size
                  </Label>
                </div>
              </div>

              {!hasSizes && (
                <div className="flex items-center">
                  <Input
                    id="item-price"
                    type="number"
                    value={editedItem.price || ""}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <span className="ml-2 text-lg">{currency[activeLanguage] || currency.en}</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sizes" className="py-4">
            {hasSizes ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Item Sizes</h3>

                {editedItem.sizes && editedItem.sizes.length > 0 ? (
                  <div className="space-y-4">
                    {editedItem.sizes.map((size, index) => (
                      <div key={size._id?.toString() || index} className="flex items-end gap-2 border p-3 rounded-md">
                        <div className="flex-1">
                          <Label className="text-xs mb-1 block">Size name ({activeLanguage})</Label>
                          <Input
                            value={size.name[activeLanguage] || ""}
                            onChange={(e) => handleSizeNameChange(index, activeLanguage, e.target.value)}
                            dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs mb-1 block">Price</Label>
                          <Input
                            type="number"
                            value={size.price || ""}
                            onChange={(e) => handleSizePriceChange(index, e.target.value)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeSize(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No sizes added yet.</p>
                )}

                <div className="flex items-end gap-2 border p-3 rounded-md border-dashed">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">New size name ({activeLanguage})</Label>
                    <Input
                      value={newSize.name[activeLanguage] || ""}
                      onChange={(e) => handleNewSizeNameChange(activeLanguage, e.target.value)}
                      dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                      placeholder={`Size name in ${activeLanguage === "en" ? "English" : "Arabic"}`}
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs mb-1 block">Price</Label>
                    <Input
                      type="number"
                      value={newSize.price || ""}
                      onChange={(e) => handleNewSizePriceChange(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={addSize}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Enable "Set price per size" in the Info tab to add sizes.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="image" className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">Item Image</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImageManagerOpen(true)}
                  className="flex items-center gap-1"
                >
                  <ImagePlus className="h-4 w-4 mr-1" />
                  Browse Images
                </Button>
              </div>

              {editedItem.image ? (
                <div className="relative">
                  <div className="border rounded-md overflow-hidden w-full aspect-video">
                    <img
                      src={editedItem.image || "/placeholder.svg"}
                      alt={editedItem.name.en || "Item image"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleChange("image", "")}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div
                  className="border border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setImageManagerOpen(true)}
                >
                  <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Click to select an image</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onDelete} className="text-destructive hover:bg-destructive/10">
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>

      {/* Image Manager Dialog */}
      <MenuImageManager
        open={imageManagerOpen}
        onOpenChange={setImageManagerOpen}
        images={menuImages}
        onImagesChange={onImagesChange || (() => {})}
        onSelectImage={handleSelectImage}
      />
    </Dialog>
  )
}
