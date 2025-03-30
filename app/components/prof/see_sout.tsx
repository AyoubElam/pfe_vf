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
  Users,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarClock,
  Calendar,
  MapPin,
  Plus,
  X,
  Filter,
  Download,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
        bg: "bg-blue-100 dark:bg-blue-900/50",
        hoverBg: "hover:bg-blue-200 dark:hover:bg-blue-900/70",
        icon: <CalendarClock className="w-3.5 h-3.5" />,
        text: "Planifié",
      }
    case "Completed":
      return {
        color: "text-green-700 dark:text-green-300",
        bg: "bg-green-100 dark:bg-green-900/50",
        hoverBg: "hover:bg-green-200 dark:hover:bg-green-900/70",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: "Terminé",
      }
    case "Pending":
      return {
        color: "text-yellow-700 dark:text-yellow-300",
        bg: "bg-yellow-100 dark:bg-yellow-900/50",
        hoverBg: "hover:bg-yellow-200 dark:hover:bg-yellow-900/70",
        icon: <Clock className="w-3.5 h-3.5" />,
        text: "En attente",
      }
    case "Cancelled":
      return {
        color: "text-red-700 dark:text-red-300",
        bg: "bg-red-100 dark:bg-red-900/50",
        hoverBg: "hover:bg-red-200 dark:hover:bg-red-900/70",
        icon: <XCircle className="w-3.5 h-3.5" />,
        text: "Annulé",
      }
    default:
      return {
        color: "text-gray-700 dark:text-gray-300",
        bg: "bg-gray-100 dark:bg-gray-800",
        hoverBg: "hover:bg-gray-200 dark:hover:bg-gray-800/70",
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

export default function ProfessorSoutenancesPage() {
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

  const getStudentsForGroup = (groupName: string): string[] => {
    const group = groups.find((g) => g.nomGroupe === groupName)
    if (group && Array.isArray(group.students) && group.students.length > 0) {
      return group.students
    }

    const studentMatch = groupName.match(/$$([^)]+)$$/)
    if (studentMatch && studentMatch[1]) {
      return studentMatch[1].split(",").map((name) => name.trim())
    }

    return [groupName]
  }

  const generatePDFFile = async () => {
    try {
      setIsGeneratingPDF(true)
      const doc = new jsPDF()

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

      const tableData: any[] = []
      const juryGroups = groupSoutenancesByJury(filteredSoutenances)

      Object.entries(juryGroups).forEach(([juryNames, soutenances]) => {
        const formattedJuryNames = juryNames
          .split(", ")
          .map((name) => name.trim())
          .join("\n")

        const dateGroups: { [key: string]: Soutenance[] } = {}
        soutenances.forEach((soutenance) => {
          const dateKey = `${formatDate(soutenance.date)} à ${soutenance.time}`
          if (!dateGroups[dateKey]) dateGroups[dateKey] = []
          dateGroups[dateKey].push(soutenance)
        })

        Object.entries(dateGroups).forEach(([dateTime, dateSoutenances]) => {
          let isFirstGroup = true

          dateSoutenances.forEach((soutenance) => {
            soutenance.groupNames.forEach((groupName) => {
              const students = getStudentsForGroup(groupName)
              const groupNumber = groupName.match(/\d+/) ? groupName.match(/\d+/)![0] : "-"

              if (students.length === 0 || students[0] === groupName) {
                tableData.push([
                  isFirstGroup ? formattedJuryNames : "",
                  isFirstGroup ? dateTime : "",
                  groupNumber,
                  groupName,
                  isFirstGroup ? soutenance.location : "",
                ])
                isFirstGroup = false
              } else {
                students.forEach((student, studentIndex) => {
                  tableData.push([
                    isFirstGroup && studentIndex === 0 ? formattedJuryNames : "",
                    isFirstGroup && studentIndex === 0 ? dateTime : "",
                    studentIndex === 0 ? groupNumber : "",
                    student,
                    isFirstGroup && studentIndex === 0 ? soutenance.location : "",
                  ])
                  if (studentIndex === 0) isFirstGroup = false
                })
              }
            })
          })
        })
      })

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
          fillColor: [159, 197, 232],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 40, halign: "center", valign: "middle" },
          1: { cellWidth: 30, halign: "center", valign: "middle" },
          2: { cellWidth: 15, halign: "center", valign: "middle" },
          3: { cellWidth: 65, halign: "left", valign: "middle" },
          4: { cellWidth: 30, halign: "center", valign: "middle" },
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            if (data.column.index === 0 || data.column.index === 4) {
              if (data.cell.text[0] === "") {
                data.cell.styles.fillColor = [255, 255, 255]
              }
            }
            if (data.column.index === 1) {
              if (data.cell.text[0] === "") {
                data.cell.styles.fillColor = [255, 255, 255]
              }
            }
          }
        },
      })

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EFEFEE] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] bg-clip-text text-transparent">
                Soutenances
              </h1>
              <p className="text-muted-foreground mt-2">Vue des sessions de soutenance</p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Card className="w-full border-[#b17a56]/10 shadow-md">
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
          <Card className="w-full border-[#b17a56]/10 shadow-md">
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
            <p className="text-muted-foreground mt-2">Vue des sessions de soutenance</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generatePDFFile}
              disabled={isGeneratingPDF}
              className="bg-[#5b8cb5] hover:bg-[#5b8cb5]/90 text-white rounded-full px-4 py-2 flex items-center gap-2"
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
                Il n'y a actuellement aucune soutenance planifiée.
              </p>
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
                      className="pl-10 pr-10 py-2 text-base rounded-full border-[#b17a56]/20 focus-visible:ring-[#b17a56]"
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
                        <Button variant="outline" className="gap-2">
                          <Filter className="h-4 w-4" />
                          Filtres
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 p-4">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Année</label>
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="Toutes les années" />
                              </SelectTrigger>
                              <SelectContent>
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
                              <SelectTrigger>
                                <SelectValue placeholder="Toutes les salles" />
                              </SelectTrigger>
                              <SelectContent>
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
                              <SelectTrigger>
                                <SelectValue placeholder="Tous les jurys" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tous les jurys</SelectItem>
                                {juryMembers.map((jury) => (
                                  <SelectItem key={jury} value={jury}>
                                    {jury}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="outline" onClick={resetFilters} className="mt-2">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSoutenances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucune soutenance trouvée</h3>
                            <p className="text-muted-foreground">
                              Essayez d'ajuster vos filtres.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSoutenances.map((soutenance, index) => (
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
                                      className="mr-2 bg-[#5b8cb5]/10 text-[#5b8cb5] hover:bg-[#5b8cb5]/20"
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
                                <TooltipContent>
                                  <p className="max-w-xs">{soutenance.juryNames.join(", ")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={soutenance.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}