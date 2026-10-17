"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VaultItem {
  id: string
  title: string
  category: "Login" | "Credit Card" | "Secure Note" | "Identity" | "Other Documents"
  data: Record<string, string>
  createdAt: string
  updatedAt: string
}

interface AddItemDialogProps {
  onAdd: (item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">) => void
}

export function AddItemDialog({ onAdd }: AddItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<VaultItem["category"]>("Login")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const categoryFields = {
    Login: ["username", "password", "website", "notes"],
    "Credit Card": ["cardNumber", "expiryDate", "cvv", "cardholderName", "notes"],
    "Secure Note": ["content"],
    Identity: ["firstName", "lastName", "email", "phone", "address", "notes"],
    "Other Documents": ["documentType", "documentNumber", "issueDate", "expiryDate", "notes"],
  }

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      })
      return
    }

    onAdd({
      title: title.trim(),
      category,
      data: formData,
    })

    // Reset form
    setTitle("")
    setCategory("Login")
    setFormData({})
    setOpen(false)

    toast({
      title: "Success",
      description: "Item added to vault",
    })
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const renderField = (field: string) => {
    const isTextarea = field === "content" || field === "notes" || field === "address"
    const isPassword = field === "password" || field === "cvv"

    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field} className="text-sm font-medium capitalize">
          {field.replace(/([A-Z])/g, " $1").trim()}
        </Label>
        {isTextarea ? (
          <Textarea
            id={field}
            value={formData[field] || ""}
            onChange={(e) => updateFormData(field, e.target.value)}
            className="bg-muted/20 border-primary/20"
            rows={3}
          />
        ) : (
          <Input
            id={field}
            type={isPassword ? "password" : "text"}
            value={formData[field] || ""}
            onChange={(e) => updateFormData(field, e.target.value)}
            className="bg-muted/20 border-primary/20"
          />
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-md border-primary/20 max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary font-[var(--font-heading)]">Add New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter item title"
              className="bg-muted/20 border-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={category}
              onValueChange={(value: VaultItem["category"]) => {
                setCategory(value)
                setFormData({}) // Reset form data when category changes
              }}
            >
              <SelectTrigger className="bg-muted/20 border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-md border-primary/20">
                <SelectItem value="Login">Login</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Secure Note">Secure Note</SelectItem>
                <SelectItem value="Identity">Identity</SelectItem>
                <SelectItem value="Other Documents">Other Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">{categoryFields[category].map(renderField)}</div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-muted/30 hover:border-muted/50">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
