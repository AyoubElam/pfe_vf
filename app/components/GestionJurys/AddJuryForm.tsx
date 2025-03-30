"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AddJuryFormProps {
  onAdd: (name: string) => Promise<void>
}

export default function AddJuryForm({ onAdd }: AddJuryFormProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() === "") return

    try {
      setIsSubmitting(true)
      await onAdd(name)
      setName("")
    } catch (error) {
      console.error("Error adding jury:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] bg-clip-text text-transparent">
          Ajouter un nouveau jury
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du jury"
            disabled={isSubmitting}
            className="flex-1 border-[#b17a56]/20 focus-visible:ring-[#b17a56]"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="min-w-[100px] bg-[#b17a56] text-[#EFEFEE]"
          >
            {isSubmitting ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

