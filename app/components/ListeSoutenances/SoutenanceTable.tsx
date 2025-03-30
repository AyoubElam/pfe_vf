/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit2,
  Users,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarClock,
  Trash2,
  Calendar,
  MapPin,
  Plus,
  X,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "../../hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Interfaces
interface Soutenance {
  idSoutenance: number
  date: string
  time: string
  location: string
  groupNames: string[]
  juryNames: string[]
  status: string
}

interface StatusConfig {
  color: string
  bg: string
  hoverBg: string
  icon: React.ReactNode
  text: string
}

interface Salle {
  idSalle: string
  nomSalle: string
}

interface Group {
  idGroupe: string
  nomGroupe: string
  nbEtudiants: number
  students: string[]
}

// Status Badge Config
function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "Scheduled":
      return {
        color: "text-blue-700 dark:text-blue-300",
        bg: "bg-blue-200 dark:bg-blue-900/50",
        hoverBg: "hover:bg-blue-300 dark:hover:bg-blue-900/70",
        icon: <CalendarClock className="w-3.5 h-3.5" />,
        text: "Planifié",
      }
    case "Completed":
      return {
        color: "text-green-700 dark:text-green-300",
        bg: "bg-green-200 dark:bg-green-900/50",
        hoverBg: "hover:bg-green-300 dark:hover:bg-green-900/70",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: "Terminé",
      }
    case "Pending":
      return {
        color: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-200 dark:bg-amber-900/50",
        hoverBg: "hover:bg-amber-300 dark:hover:bg-amber-900/70",
        icon: <Clock className="w-3.5 h-3.5" />,
        text: "En attente",
      }
    case "Cancelled":
      return {
        color: "text-red-700 dark:text-red-300",
        bg: "bg-red-200 dark:bg-red-900/50",
        hoverBg: "hover:bg-red-300 dark:hover:bg-red-900/70",
        icon: <XCircle className="w-3.5 h-3.5" />,
        text: "Annulé",
      }
    default:
      return {
        color: "text-gray-700 dark:text-gray-300",
        bg: "bg-gray-200 dark:bg-gray-700",
        hoverBg: "hover:bg-gray-300 dark:hover:bg-gray-700/70",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        text: "Inconnu",
      }
  }
}

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status)
  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.color} ${config.hoverBg} border-0 font-medium gap-1.5 px-2.5 py-0.5 transition-colors duration-200 inline-flex items-center cursor-default select-none shadow-sm`}
    >
      {config.icon}
      {config.text}
    </Badge>
  )
}

function DeleteDialog({ onDelete, idSoutenance }: { onDelete: () => void; idSoutenance: number }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Supprimer la soutenance</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md bg-[#EFEFEE]">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette soutenance ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-[#EFEFEE]">Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700 dark:hover:bg-red-700">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function SoutenancesPage() {
  const [soutenances, setSoutenances] = useState<Soutenance[]>([])
  const [filteredSoutenances, setFilteredSoutenances] = useState<Soutenance[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [groups, setGroups] = useState<Group[]>([])
  const [salles, setSalles] = useState<Salle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const currentYear = new Date().getFullYear().toString()
  const [yearFilter, setYearFilter] = useState(currentYear)
  const [locationFilter, setLocationFilter] = useState("all")
  const [juryFilter, setJuryFilter] = useState("all")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 4
  const [paginatedSoutenances, setPaginatedSoutenances] = useState<Soutenance[]>([])
  const [totalPages, setTotalPages] = useState(0)

  // Sample data
  const rooms: Salle[] = [
    { idSalle: "1", nomSalle: "Salle 1" },
    { idSalle: "2", nomSalle: "Salle 2" },
    { idSalle: "3", nomSalle: "Salle 3" },
    { idSalle: "4", nomSalle: "Salle 4" },
    { idSalle: "5", nomSalle: "Salle 5" },
    { idSalle: "6", nomSalle: "Salle 6" },
  ]
  const juryMembers = ["Prof. Martin", "Dr. Dubois", "Prof. Laurent", "Dr. Bernard", "Prof. Moreau", "Dr. Petit"]

  const fetchSoutenances = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:5000/api/soutenance")
      if (!response.ok) throw new Error("Erreur lors du chargement des soutenances")
      const data: Soutenance[] = await response.json()
      const normalizedData = data.map((s) => ({
        ...s,
        groupNames: Array.isArray(s.groupNames) ? s.groupNames : s.groupNames ? s.groupNames.split(" | ") : [],
        juryNames: Array.isArray(s.juryNames) ? s.juryNames : s.juryNames ? s.juryNames.split(" | ") : [],
      }))
      setSoutenances(normalizedData)
    } catch (error) {
      console.error("Error fetching soutenances:", error)
      setError("Impossible de charger les soutenances. Veuillez réessayer plus tard.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchGroupsAndSalles = useCallback(async () => {
    try {
      const groupsResponse = await fetch("http://localhost:5000/api/groups")
      if (!groupsResponse.ok) throw new Error("Failed to fetch groups")
      const groupsData: Group[] = await groupsResponse.json()
      setGroups(groupsData)
      setSalles(rooms)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [])

  useEffect(() => {
    fetchSoutenances()
    fetchGroupsAndSalles()
  }, [fetchSoutenances, fetchGroupsAndSalles])

  useEffect(() => {
    applyFilters()
  }, [soutenances, searchTerm, statusFilter, yearFilter, locationFilter, juryFilter])

  // Update pagination when filtered soutenances change
  useEffect(() => {
    const total = Math.ceil(filteredSoutenances.length / itemsPerPage)
    setTotalPages(total)

    // Reset to first page if current page is now invalid
    if (currentPage >= total) {
      setCurrentPage(0)
    }

    updatePaginatedSoutenances()
  }, [filteredSoutenances, currentPage])

  const updatePaginatedSoutenances = () => {
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedSoutenances(filteredSoutenances.slice(startIndex, endIndex))
  }

  const applyFilters = () => {
    let filtered = [...soutenances]
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.groupNames.some((group) => group.toLowerCase().includes(searchTerm.toLowerCase())) ||
          s.juryNames.some((jury) => jury.toLowerCase().includes(searchTerm.toLowerCase())) ||
          s.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "all") filtered = filtered.filter((s) => s.status === statusFilter)
    if (yearFilter !== "all")
      filtered = filtered.filter((s) => new Date(s.date).getFullYear().toString() === yearFilter)
    if (locationFilter !== "all") filtered = filtered.filter((s) => s.location === locationFilter)
    if (juryFilter !== "all") filtered = filtered.filter((s) => s.juryNames.some((jury) => jury === juryFilter))
    setFilteredSoutenances(filtered)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setActiveTab("all")
    setYearFilter(currentYear)
    setLocationFilter("all")
    setJuryFilter("all")
  }

  const handleEdit = (soutenance: Soutenance) => {
    router.push(`/pages/edit_soutenance/${soutenance.idSoutenance}`)
  }

  const handleDelete = async (id: number) => {
    if (!id) {
      setError("Données de soutenance manquantes")
      return
    }
    try {
      const response = await fetch(`http://localhost:5000/api/soutenance/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error(`Erreur serveur: ${await response.text()}`)
      await fetchSoutenances()
      toast({ title: "Succès", description: "Soutenance supprimée avec succès." })
    } catch (error) {
      console.error("Erreur de suppression:", error)
      setError(`Échec de la suppression: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const handleAddNew = () => {
    router.push("/pages/PlanifierSoutenance")
  }

  const getTabCount = (status: string) => {
    return status === "all" ? soutenances.length : soutenances.filter((s) => s.status === status).length
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const groupSoutenancesByJury = (soutenances: Soutenance[]) => {
    const juryGroups: { [key: string]: Soutenance[] } = {}
    soutenances.forEach((soutenance) => {
      const juryKey = soutenance.juryNames.join(", ")
      if (!juryGroups[juryKey]) juryGroups[juryKey] = []
      juryGroups[juryKey].push(soutenance)
    })
    return juryGroups
  }

  // Function to get student names for a group
  const getStudentsForGroup = (groupName: string): string[] => {
    const group = groups.find((g) => g.nomGroupe === groupName)
    if (group && Array.isArray(group.students) && group.students.length > 0) {
      return group.students
    }

    // If no students found, try to extract student names from the group name
    // This is a fallback in case the API doesn't return student information
    const studentMatch = groupName.match(/$$([^)]+)$$/)
    if (studentMatch && studentMatch[1]) {
      return studentMatch[1].split(",").map((name) => name.trim())
    }

    return [groupName] // Return the group name as a fallback
  }

  const generatePDFFile = async () => {
    try {
      setIsGeneratingPDF(true)
      const doc = new jsPDF()

      // Header Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Université Cadi Ayyad", 105, 10, { align: "center" })

      doc.setFontSize(12)
      doc.text("Ecole Supérieure de Technologie -Safi-", 105, 20, { align: "center" })
      doc.setFont("helvetica", "italic")
      doc.text(`A.U: ${new Date().getFullYear() - 1}-${new Date().getFullYear()}`, 190, 20, { align: "right" })

      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("Département: Informatique", 14, 30)
      doc.text("Niveau: 2ème Année", 14, 40)

      doc.setFontSize(14)
      doc.text("Planning des Soutenances (PFE)", 105, 50, { align: "center" })

      // Prepare table data
      const tableData: any[] = []
      const juryGroups = groupSoutenancesByJury(filteredSoutenances)

      Object.entries(juryGroups).forEach(([juryNames, soutenances]) => {
        // Format jury names for display
        const formattedJuryNames = juryNames
          .split(", ")
          .map((name) => name.trim())
          .join("\n")

        // Group soutenances by date and time
        const dateGroups: { [key: string]: Soutenance[] } = {}
        soutenances.forEach((soutenance) => {
          const dateKey = `${formatDate(soutenance.date)} à ${soutenance.time}`
          if (!dateGroups[dateKey]) dateGroups[dateKey] = []
          dateGroups[dateKey].push(soutenance)
        })

        // Process each date group
        Object.entries(dateGroups).forEach(([dateTime, dateSoutenances]) => {
          let isFirstGroup = true

          // Process each soutenance for this date/time
          dateSoutenances.forEach((soutenance) => {
            // Process each group in this soutenance
            soutenance.groupNames.forEach((groupName) => {
              // Get students for this group
              const students = getStudentsForGroup(groupName)

              // Extract group number from group name (if any)
              const groupNumber = groupName.match(/\d+/) ? groupName.match(/\d+/)![0] : "-"

              if (students.length === 0 || students[0] === groupName) {
                // If no students, just add the group
                tableData.push([
                  isFirstGroup ? formattedJuryNames : "",
                  isFirstGroup ? dateTime : "",
                  groupNumber,
                  groupName,
                  isFirstGroup ? soutenance.location : "",
                ])
                isFirstGroup = false
              } else {
                // Add each student in the group
                students.forEach((student, studentIndex) => {
                  tableData.push([
                    isFirstGroup && studentIndex === 0 ? formattedJuryNames : "",
                    isFirstGroup && studentIndex === 0 ? dateTime : "",
                    studentIndex === 0 ? groupNumber : "",
                    student, // Show student name instead of group name
                    isFirstGroup && studentIndex === 0 ? soutenance.location : "",
                  ])
                  if (studentIndex === 0) isFirstGroup = false
                })
              }
            })
          })
        })
      })

      // Generate table using autoTable
      autoTable(doc, {
        startY: 60,
        head: [["Jury", "Jours", "N°", "Nom", "Lieu"]],
        body: tableData,
        styles: {
          fontSize: 10,
          cellPadding: 2,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [159, 197, 232], // Light blue background (9FC5E8)
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 40, halign: "center", valign: "middle" }, // Jury
          1: { cellWidth: 30, halign: "center", valign: "middle" }, // Jours
          2: { cellWidth: 15, halign: "center", valign: "middle" }, // N°
          3: { cellWidth: 65, halign: "left", valign: "middle" }, // Nom
          4: { cellWidth: 30, halign: "center", valign: "middle" }, // Lieu
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            // Merge cells vertically for Jury and Lieu columns
            if (data.column.index === 0 || data.column.index === 4) {
              if (data.cell.text[0] === "") {
                data.cell.styles.fillColor = [239, 239, 238] // Use #EFEFEE for empty cells
              }
            }
            if (data.column.index === 1) {
              if (data.cell.text[0] === "") {
                data.cell.styles.fillColor = [239, 239, 238] // Use #EFEFEE for empty Jours cells
              }
            }
          }
        },
      })

      // Save the PDF
      doc.save(`planning_soutenances_${new Date().toISOString().split("T")[0]}.pdf`)
      toast({ title: "Téléchargement réussi", description: "Le fichier PDF a été généré avec succès." })
    } catch (error) {
      console.error("Error generating PDF file:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération du fichier PDF.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EFEFEE] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] bg-clip-text text-transparent">
                Soutenances
              </h1>
              <p className="text-muted-foreground mt-2">Gestion des sessions de soutenance</p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Card className="w-full border-[#b17a56]/10 shadow-md bg-[#EFEFEE]">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-full sm:w-96" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                <Skeleton className="h-8 w-full mb-4" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full mb-2" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EFEFEE] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Card className="w-full border-[#b17a56]/10 shadow-md bg-[#EFEFEE]">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EFEFEE] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] bg-clip-text text-transparent">
              Soutenances
            </h1>
            <p className="text-muted-foreground mt-2">Gestion des sessions de soutenance</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddNew}
              className="bg-[#b17a56] hover:bg-[#b17a56]/90 text-[#EFEFEE] rounded-full px-4 py-2 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Nouvelle soutenance
            </Button>
            <Button
              onClick={generatePDFFile}
              disabled={isGeneratingPDF}
              className="bg-[#5b8cb5] hover:bg-[#5b8cb5]/90 text-[#EFEFEE] rounded-full px-4 py-2 flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              {isGeneratingPDF ? "Génération..." : "Télécharger PDF"}
            </Button>
          </div>
        </div>

        {soutenances.length === 0 ? (
          <Card className="w-full bg-[#EFEFEE] border-[#b17a56]/10 shadow-md">
            <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Calendar className="h-10 w-10 text-[#b17a56]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucune soutenance disponible</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Il n'y a actuellement aucune soutenance planifiée. Commencez par en créer une nouvelle.
              </p>
              <Button onClick={handleAddNew} className="bg-[#b17a56] hover:bg-[#b17a56]/90 text-[#EFEFEE]">
                <Plus className="h-4 w-4 mr-2" />
                Planifier une soutenance
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full bg-[#EFEFEE] border-[#b17a56]/10 shadow-md">
            <CardHeader className="pb-2 border-b">
              <div className="flex flex-col gap-4">
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={(value) => {
                    setActiveTab(value)
                    setStatusFilter(value === "all" ? "all" : value)
                  }}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-5 w-full bg-[#EFEFEE]">
                    <TabsTrigger value="all" className="text-sm">
                      Toutes ({getTabCount("all")})
                    </TabsTrigger>
                    <TabsTrigger value="Pending" className="text-sm">
                      En attente ({getTabCount("Pending")})
                    </TabsTrigger>
                    <TabsTrigger value="Scheduled" className="text-sm">
                      Planifiées ({getTabCount("Scheduled")})
                    </TabsTrigger>
                    <TabsTrigger value="Completed" className="text-sm">
                      Terminées ({getTabCount("Completed")})
                    </TabsTrigger>
                    <TabsTrigger value="Cancelled" className="text-sm">
                      Annulé ({getTabCount("Cancelled")})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par groupe, jury ou salle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10 py-2 text-base rounded-full border-[#b17a56]/20 focus-visible:ring-[#b17a56] bg-[#EFEFEE]"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearchTerm("")}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Effacer la recherche</span>
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 items-center w-full sm:w-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-[#EFEFEE]">
                          <Filter className="h-4 w-4" />
                          Filtres
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 p-4 bg-[#EFEFEE]">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Année</label>
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                              <SelectTrigger className="bg-[#EFEFEE]">
                                <SelectValue placeholder="Toutes les années" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#EFEFEE]">
                                <SelectItem value="all">Toutes les années</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2025">2025</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Salle</label>
                            <Select value={locationFilter} onValueChange={setLocationFilter}>
                              <SelectTrigger className="bg-[#EFEFEE]">
                                <SelectValue placeholder="Toutes les salles" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#EFEFEE]">
                                <SelectItem value="all">Toutes les salles</SelectItem>
                                {rooms.map((room) => (
                                  <SelectItem key={room.idSalle} value={room.nomSalle}>
                                    {room.nomSalle}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Jury</label>
                            <Select value={juryFilter} onValueChange={setJuryFilter}>
                              <SelectTrigger className="bg-[#EFEFEE]">
                                <SelectValue placeholder="Tous les jurys" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#EFEFEE]">
                                <SelectItem value="all">Tous les jurys</SelectItem>
                                {juryMembers.map((jury) => (
                                  <SelectItem key={jury} value={jury}>
                                    {jury}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="outline" onClick={resetFilters} className="mt-2 bg-[#EFEFEE]">
                            Réinitialiser les filtres
                          </Button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[200px] font-semibold">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-[#b17a56]" /> Date
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px] font-semibold">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-[#b17a56]" /> Heure
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px] font-semibold">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-[#b17a56]" /> Lieu
                        </div>
                      </TableHead>
                      <TableHead className="w-[250px] font-semibold">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-[#b17a56]" /> Groupes
                        </div>
                      </TableHead>
                      <TableHead className="w-[250px] font-semibold">Jury</TableHead>
                      <TableHead className="w-[120px] font-semibold">Statut</TableHead>
                      <TableHead className="w-[100px] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSoutenances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucune soutenance trouvée</h3>
                            <p className="text-muted-foreground">
                              Essayez d'ajuster vos filtres ou de créer une nouvelle soutenance.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSoutenances.map((soutenance, index) => {
                        const soutenanceYear = new Date(soutenance.date).getFullYear().toString()
                        const isCurrentYear = soutenanceYear === currentYear
                        return (
                          <TableRow
                            key={soutenance.idSoutenance ?? `soutenance-${index}`}
                            className="transition-colors hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {new Date(soutenance.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell>{soutenance.time}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {soutenance.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {soutenance.groupNames.map((groupName, idx) => {
                                  const group = groups.find((g) => g.nomGroupe === groupName)
                                  const students =
                                    group && Array.isArray(group.students) ? group.students.join(", ") : "N/A"
                                  return (
                                    <div key={idx} className="text-sm">
                                      <Badge
                                        variant="secondary"
                                        className="mr-2 bg-[#5b8cb5]/20 text-[#5b8cb5] font-medium hover:bg-[#5b8cb5]/30"
                                      >
                                        {group ? group.nomGroupe : groupName}
                                      </Badge>
                                      {students}
                                    </div>
                                  )
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span className="truncate max-w-[200px]">{soutenance.juryNames.join(", ")}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-[#EFEFEE]">
                                    <p className="max-w-xs">{soutenance.juryNames.join(", ")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={soutenance.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isCurrentYear ? (
                                  <>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-[#b17a56]/10 hover:text-[#b17a56]"
                                            onClick={() => handleEdit(soutenance)}
                                          >
                                            <Edit2 className="h-4 w-4" />
                                            <span className="sr-only">Modifier la soutenance</span>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-[#EFEFEE]">
                                          <p>Modifier la soutenance</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <DeleteDialog
                                            onDelete={() => handleDelete(soutenance.idSoutenance)}
                                            idSoutenance={soutenance.idSoutenance}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-[#EFEFEE]">
                                          <p>Supprimer la soutenance</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground"></span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

