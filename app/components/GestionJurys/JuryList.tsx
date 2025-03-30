"use client"

import { useState, useEffect, useMemo } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Jury {
  idJury: number
  nom: string
  valideDeliberation: boolean
}

interface JuryListProps {
  onDelete?: (id: number) => Promise<void>
}

export default function JuryList({ onDelete }: JuryListProps) {
  const [jurys, setJurys] = useState<Jury[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteJuryId, setDeleteJuryId] = useState<number | null>(null)
  const [editJuryId, setEditJuryId] = useState<number | null>(null)
  const [editJuryData, setEditJuryData] = useState<{ nom: string } | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 4

  useEffect(() => {
    const fetchJurys = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://localhost:5000/api/jurys")
        if (!response.ok) throw new Error("Failed to fetch jurys")
        const data = await response.json()
        setJurys(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jury list.")
        console.error("Error fetching jurors:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJurys()
  }, [])

  // Use useMemo to prevent recalculation on every render
  const filteredJurys = useMemo(() => {
    return jurys.filter((jury) => jury.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [jurys, searchTerm])

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredJurys.length / itemsPerPage))
  }, [filteredJurys, itemsPerPage])

  // Get current page items
  const currentJurys = useMemo(() => {
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredJurys.slice(startIndex, endIndex)
  }, [filteredJurys, currentPage, itemsPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm])

  // Pagination handlers
  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleEdit = (jury: Jury) => {
    setEditJuryId(jury.idJury)
    setEditJuryData({ nom: jury.nom })
  }

  const handleUpdateJury = async () => {
    if (!editJuryId || !editJuryData) return

    try {
      const response = await fetch(`http://localhost:5000/api/jurys/${editJuryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: editJuryData.nom,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update jury")
      }

      setJurys((prevJurys) =>
        prevJurys.map((jury) => (jury.idJury === editJuryId ? { ...jury, nom: editJuryData.nom } : jury)),
      )

      setEditJuryId(null)
      setEditJuryData(null)
    } catch (err) {
      console.error("Error updating jury:", err)
      alert(err instanceof Error ? err.message : "Une erreur s'est produite.")
    }
  }

  const handleDelete = async () => {
    if (!deleteJuryId) return

    try {
      if (onDelete) {
        await onDelete(deleteJuryId)
      } else {
        const response = await fetch(`http://localhost:5000/api/jurys/${deleteJuryId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete jury")
        }
      }

      setJurys((prevJurys) => prevJurys.filter((jury) => jury.idJury !== deleteJuryId))
    } catch (err) {
      console.error("Error deleting jury:", err)
      alert(err instanceof Error ? err.message : "Une erreur s'est produite.")
    } finally {
      setDeleteJuryId(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardContent className="flex justify-center items-center h-96">
          <Loader2 className="h-16 w-16 animate-spin text-[#b17a56]" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-8">
        <CardContent className="p-8 text-2xl text-center text-red-500">{error}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] bg-clip-text text-transparent">
          Liste des Jurys
        </CardTitle>
        <div className="relative mt-6">
          <Search className="absolute left-3 top-3 h-6 w-6 text-[#b17a56]" />
          <Input
            placeholder="Rechercher un jury..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 text-xl border-[#b17a56]/20 focus-visible:ring-[#b17a56]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-lg font-semibold">Nom</TableHead>
              <TableHead className="w-48 text-lg font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentJurys.length > 0 ? (
              currentJurys.map((jury) => (
                <TableRow key={jury.idJury} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium text-lg">{jury.nom}</TableCell>
                  <TableCell>
                    <div className="flex space-x-4">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleEdit(jury)}
                        className="hover:bg-[#5b8cb5]/10 hover:text-[#5b8cb5]"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setDeleteJuryId(jury.idJury)}
                        className="hover:bg-red-100 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-lg text-muted-foreground">
                  Aucun jury trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="w-full flex justify-center items-center my-6">
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-[#5b8cb5]/10"
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`rounded-full w-3 h-3 p-0 min-w-0 ${
                      index === currentPage
                        ? "bg-[#5b8cb5] hover:bg-[#5b8cb5]"
                        : "bg-[#5b8cb5]/30 hover:bg-[#5b8cb5]/50"
                    }`}
                    onClick={() => goToPage(index)}
                  >
                    <span className="sr-only">Page {index + 1}</span>
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-[#5b8cb5]/10"
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {editJuryId !== null && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-xl font-semibold mb-4 text-center">Edit Jury</h2>
              <div className="mb-4">
                <Input
                  type="text"
                  value={editJuryData?.nom || ""}
                  onChange={(e) => setEditJuryData({ nom: e.target.value })}
                  placeholder="Enter jury name"
                  className="w-full rounded-lg border-2 border-[#b17a56]/30 px-4 py-2 focus:ring-2 focus:ring-[#b17a56]"
                />
              </div>
              <div className="flex justify-between">
                <Button
                  className="bg-[#b17a56] text-white w-28 hover:bg-[#b17a56]/90 focus:outline-none focus:ring-2 focus:ring-[#b17a56]"
                  onClick={handleUpdateJury}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="w-28 text-gray-600 hover:bg-gray-100"
                  onClick={() => setEditJuryId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <AlertDialog open={deleteJuryId !== null} onOpenChange={() => setDeleteJuryId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription className="text-lg">
                Êtes-vous sûr de vouloir supprimer ce jury ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-lg">Annuler</AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-lg" onClick={handleDelete}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

