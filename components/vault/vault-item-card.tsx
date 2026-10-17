"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Edit, Trash2, Copy } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface VaultItem {
  id: string
  title: string
  category: "Login" | "Credit Card" | "Secure Note" | "Identity" | "Other Documents"
  data: Record<string, string>
  createdAt: string
  updatedAt: string
}

interface VaultItemCardProps {
  item: VaultItem
  onEdit: (item: VaultItem) => void
  onDelete: (id: string) => void
}

export function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showSensitive, setShowSensitive] = useState(false)
  const { toast } = useToast()

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Login":
        return "bg-primary/20 text-primary border-primary/30"
      case "Credit Card":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "Secure Note":
        return "bg-success/20 text-success border-success/30"
      case "Identity":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "Other Documents":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const renderSensitiveField = (key: string, value: string) => {
    const isSensitive =
      key.toLowerCase().includes("password") || key.toLowerCase().includes("pin") || key.toLowerCase().includes("cvv")

    return (
      <div key={key} className="flex items-center justify-between p-2 bg-muted/10 rounded">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
          <p className="text-sm font-mono">{isSensitive && !showSensitive ? "••••••••" : value}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copyToClipboard(value, key)}
          className="h-6 w-6 p-0 hover:bg-primary/20"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="bg-card/30 backdrop-blur-sm neon-border hover-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-foreground">{item.title}</h3>
            <Badge className={`text-xs ${getCategoryColor(item.category)}`}>{item.category}</Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSensitive(!showSensitive)}
              className="h-6 w-6 p-0 hover:bg-primary/20"
            >
              {showSensitive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(item)} className="h-6 w-6 p-0 hover:bg-success/20">
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="h-6 w-6 p-0 hover:bg-destructive/20"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(item.data).map(([key, value]) => renderSensitiveField(key, value))}
        <div className="text-xs text-muted-foreground pt-2 border-t border-muted/20">
          Updated: {new Date(item.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}
