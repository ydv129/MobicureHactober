"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface VaultSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function VaultSearch({ searchTerm, onSearchChange, selectedCategory, onCategoryChange }: VaultSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vault items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted/20 border-primary/20"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-48 bg-muted/20 border-primary/20">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-md border-primary/20">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Login">Login</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Secure Note">Secure Note</SelectItem>
            <SelectItem value="Identity">Identity</SelectItem>
            <SelectItem value="Other Documents">Other Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
