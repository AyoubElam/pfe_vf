"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Users, Calendar, Home, User, Loader2, X, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Types
interface Group {
  idGroupe: string
  nomGroupe: string
  nbEtudiants?: number // Optional since not all queries return this
  annee?: number
  tuteurNom?: string
  sujetTitre?: string
  encadrantNom?: string
}

interface Jury {
  idJury: number
  nom: string
  valideDeliberation: number
}

interface Room {
  id: string
  name: string
}

interface FormData {
  date: Date | undefined
  time: string
  location: string
  jury: string[]
  group: string[]
}

interface Toast {
  message: string
  type: "success" | "error" | "info"
}

type SelectionMode = "manual" | "aleatoire" | "semi-aleatoire"

// Constants
const INITIAL_FORM_STATE: FormData = {
  date: undefined,
  time: "",
  location: "",
  jury: [],
  group: [],
}

const rooms: Room[] = [
  { id: "Salle 1", name: "Salle 1" },
  { id: "Salle 2", name: "Salle 2" },
  { id: "Salle 3", name: "Salle 3" },
  { id: "Salle 4", name: "Salle 4" },
  { id: "Salle 5", name: "Salle 5" },
  { id: "Salle 6", name: "Salle 6" },
  { id: "Salle 7", name: "Salle 7" },
  { id: "Salle 8", name: "Salle 8" },
  { id: "Salle 9", name: "Salle 9" },
]

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
]

// Component
export default function PlanifierSoutenance() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE)
  const [groups, setGroups] = useState<Group[]>([])
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])
  const [jurys, setJurys] = useState<Jury[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [openTimePopover, setOpenTimePopover] = useState(false)
  const [mode, setMode] = useState<SelectionMode>("manual")
  const [isSubmitting, setIsSubmitting] = useState(false)

// Fetch data
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupsResponse, jurysResponse] = await Promise.all([
        fetch("http://localhost:5000/api/groups"),
        fetch("http://localhost:5000/api/jurys"),
      ])

      if (!groupsResponse.ok || !jurysResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const [groupsData, jurysData] = await Promise.all([groupsResponse.json(), jurysResponse.json()])

      setGroups(groupsData)
      setAvailableGroups(groupsData)
      setJurys(jurysData)
    } catch (error) {
      setError("Erreur lors du chargement des données. Veuillez réessayer.")
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])
  // Reset form when mode changes
  useEffect(() => {
    setFormData(INITIAL_FORM_STATE)
    setAvailableGroups(groups)
  }, [mode, groups])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Form submission
  const onAddSoutenance = async () => {
    if (
      !formData.date ||
      !formData.time ||
      !formData.location ||
      formData.jury.length === 0 ||
      formData.group.length === 0
    ) {
      setToast({
        type: "error",
        message: "Veuillez remplir tous les champs obligatoires",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("http://localhost:5000/api/soutenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date.toISOString(),
          time: formData.time,
          location: formData.location,
          juryIds: formData.jury.map((id) => Number.parseInt(id, 10)),
          groupIds: formData.group.map((id) => Number.parseInt(id, 10)),
          status: "Pending",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "An error occurred")
      }

      setToast({ type: "success", message: "Soutenance planifiée avec succès !" })
      setFormData(INITIAL_FORM_STATE)
      setAvailableGroups(groups)
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Échec de l'ajout de la soutenance",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle jury selection
  const handleJuryChange = async (juryId: string, checked: boolean) => {
    let newJury = [...formData.jury]

    if (mode === "aleatoire") {
      if (checked) {
        if (newJury.length === 0) {
          newJury = [juryId]
        } else {
          setToast({ type: "error", message: "En mode aléatoire, vous ne pouvez sélectionner qu'un jury." })
          return
        }
      } else {
        newJury = newJury.filter((id) => id !== juryId)
      }
    } else if (mode === "semi-aleatoire" || mode === "manual") {
      if (checked) {
        if (newJury.length < 3) {
          newJury.push(juryId)
        } else {
          setToast({ type: "error", message: "Vous ne pouvez sélectionner que 3 jurys maximum." })
          return
        }
      } else {
        newJury = newJury.filter((id) => id !== juryId)
      }
    }

    setFormData({ ...formData, jury: newJury })

    if (newJury.length > 0 && (mode === "aleatoire" || mode === "semi-aleatoire")) {
      try {
        if (mode === "aleatoire") {
          const response = await fetch(`http://localhost:5000/api/soutenance/jury-groups/${newJury[0]}`)
          if (!response.ok) throw new Error("Failed to fetch jury groups")
          const associatedGroups: Group[] = await response.json()
          setAvailableGroups(associatedGroups)

          if (associatedGroups.length > 0) {
            setFormData((prev) => ({ ...prev, group: [associatedGroups[0].idGroupe] }))
            setToast({ type: "success", message: "1 groupe automatiquement sélectionné." })
          } else {
            setFormData((prev) => ({ ...prev, group: [] }))
            setToast({ type: "info", message: "Aucun groupe associé à ce jury." })
          }
        } else if (mode === "semi-aleatoire") {
          const groupPromises = newJury.map((id) =>
            fetch(`http://localhost:5000/api/soutenance/jury-groups/${id}`).then((res) => res.json())
          )
          const groupArrays: Group[][] = await Promise.all(groupPromises)
          const autoSelectedGroups = groupArrays
            .map((groups) => (groups.length > 0 ? groups[0].idGroupe : null))
            .filter((g): g is string => g !== null)
          const uniqueGroups = Array.from(new Set(autoSelectedGroups))
          const mergedAvailable = groupArrays.flat()
          setAvailableGroups(mergedAvailable)
          setFormData((prev) => ({ ...prev, group: uniqueGroups }))

          if (uniqueGroups.length > 0) {
            setToast({
              type: "success",
              message: `${uniqueGroups.length} groupe(s) automatiquement sélectionné(s).`,
            })
          } else {
            setToast({
              type: "info",
              message: "Aucun groupe associé aux jurys sélectionnés.",
            })
          }
        }
      } catch (error) {
        setAvailableGroups(groups)
        setToast({ type: "error", message: "Erreur lors de la récupération des groupes." })
      }
    } else if (newJury.length === 0) {
      setAvailableGroups(groups)
      setFormData((prev) => ({ ...prev, group: [] }))
    }
  }

  // Handle group selection (manual mode only)
  const handleGroupChange = (groupId: string, checked: boolean) => {
    if (mode !== "manual") return

    setFormData((prev) => ({
      ...prev,
      group: checked ? [...prev.group, groupId] : prev.group.filter((id) => id !== groupId),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#EFEFEE]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-12 w-12 animate-spin text-[#b17a56]" />
          <p className="text-lg font-medium text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-b from-background to-muted/20">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription className="text-center">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#EFEFEE]">
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300 w-full max-w-md">
          <Alert
            variant={toast.type === "error" ? "destructive" : "default"}
            className={`flex items-center justify-between p-4 text-lg rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-[#b17a56]/10 text-[#b17a56] border border-[#b17a56]/20"
                : toast.type === "error"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-[#5b8cb5]/10 text-[#5b8cb5] border border-[#5b8cb5]/20"
            }`}
          >
            <AlertDescription className="font-medium">{toast.message}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-transparent text-current opacity-70 hover:opacity-100"
              onClick={() => setToast(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </Alert>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] bg-clip-text text-transparent">
            Planification des Soutenances
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Organisez les soutenances en sélectionnant des groupes, une date, une salle et un jury
          </p>
        </div>

        <Card className="overflow-hidden bg-[#EFEFEE] border-[#b17a56]/10 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#b17a56]/10 to-[#5b8cb5]/5 pb-6">
            <CardTitle className="text-2xl text-center text-[#b17a56]">Formulaire de Planification</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#b17a56]">Mode de Sélection</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectionModeCard
                  mode="manual"
                  currentMode={mode}
                  setMode={setMode}
                  title="Manuel"
                  description="Sélection manuelle de tous les éléments"
                />
                <SelectionModeCard
                  mode="aleatoire"
                  currentMode={mode}
                  setMode={setMode}
                  title="Aléatoire"
                  description="1 jury, 1 groupe automatique"
                />
                <SelectionModeCard
                  mode="semi-aleatoire"
                  currentMode={mode}
                  setMode={setMode}
                  title="Semi-Aléatoire"
                  description="2-3 jurys, 1 groupe par jury"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GroupSelection
                availableGroups={availableGroups}
                selectedGroups={formData.group}
                onGroupChange={handleGroupChange}
                isManualMode={mode === "manual"}
              />
              <DateTimeSelection
                date={formData.date}
                time={formData.time}
                onDateChange={(date) => setFormData({ ...formData, date })}
                onTimeChange={(time) => {
                  setFormData({ ...formData, time })
                  setOpenTimePopover(false)
                }}
                openTimePopover={openTimePopover}
                setOpenTimePopover={setOpenTimePopover}
                timeSlots={timeSlots}
              />
              <RoomSelection
                selectedRoom={formData.location}
                onRoomChange={(roomId) => setFormData({ ...formData, location: roomId })}
                rooms={rooms}
              />
              <JurySelection jurys={jurys} selectedJurys={formData.jury} onJuryChange={handleJuryChange} mode={mode} />
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={onAddSoutenance}
                className="h-12 px-8 text-lg font-medium rounded-full bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] hover:from-[#b17a56]/90 hover:to-[#5b8cb5]/90 shadow-md hover:shadow-lg transition-all"
                disabled={
                  !formData.date ||
                  !formData.time ||
                  !formData.location ||
                  formData.jury.length === 0 ||
                  formData.group.length === 0 ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Planification en cours...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-5 w-5" />
                    Planifier la soutenance
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Sub-components
interface SelectionModeCardProps {
  mode: SelectionMode
  currentMode: SelectionMode
  setMode: (mode: SelectionMode) => void
  title: string
  description: string
}

function SelectionModeCard({ mode, currentMode, setMode, title, description }: SelectionModeCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        currentMode === mode
          ? "border-[#b17a56] bg-[#b17a56]/10"
          : "border-muted hover:border-[#b17a56]/50 hover:bg-muted/50"
      }`}
      onClick={() => setMode(mode)}
    >
      <RadioGroup value={currentMode} onValueChange={(value) => setMode(value as SelectionMode)}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={mode} id={mode} className="text-[#b17a56]" />
          <Label htmlFor={mode} className="font-medium">
            {title}
          </Label>
        </div>
      </RadioGroup>
      <p className="mt-2 text-sm text-muted-foreground pl-6">{description}</p>
    </div>
  )
}

interface GroupSelectionProps {
  availableGroups: Group[]
  selectedGroups: string[]
  onGroupChange: (groupId: string, checked: boolean) => void
  isManualMode: boolean
}

function GroupSelection({ availableGroups, selectedGroups, onGroupChange, isManualMode }: GroupSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xl text-[#b17a56]">
        <Users className="h-6 w-6" />
        <h3 className="font-semibold">Groupes d'étudiants</h3>
      </div>
      <div className="border rounded-lg p-4">
        <div className="space-y-2 max-h-60 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-[#b17a56]/20 scrollbar-track-transparent">
          {availableGroups.map((group) => (
            <div
              key={group.idGroupe}
              className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                selectedGroups.includes(group.idGroupe) ? "bg-[#b17a56]/10" : "hover:bg-muted/50"
              }`}
            >
              <Checkbox
                id={`group-${group.idGroupe}`}
                checked={selectedGroups.includes(group.idGroupe)}
                onCheckedChange={(checked) => onGroupChange(group.idGroupe, checked === true)}
                disabled={!isManualMode}
                className={selectedGroups.includes(group.idGroupe) ? "text-[#b17a56]" : ""}
              />
              <Label
                htmlFor={`group-${group.idGroupe}`}
                className={`text-base cursor-pointer ${selectedGroups.includes(group.idGroupe) ? "font-medium" : ""}`}
              >
                {group.nomGroupe} {group.nbEtudiants !== undefined ? `(${group.nbEtudiants} étudiants)` : ""}
              </Label>
            </div>
          ))}
        </div>
        {selectedGroups.length > 0 && (
          <div className="mt-4 p-3 bg-[#b17a56]/5 rounded-md border border-[#b17a56]/10">
            <p className="font-medium text-sm text-[#b17a56]">Groupes sélectionnés:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedGroups.map((id) => (
                <div
                  key={id}
                  className="inline-flex items-center gap-1 bg-[#b17a56]/15 text-[#b17a56] rounded-full px-3 py-1 text-sm font-medium shadow-sm"
                >
                  {availableGroups.find((g) => g.idGroupe === id)?.nomGroupe}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface DateTimeSelectionProps {
  date: Date | undefined
  time: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
  openTimePopover: boolean
  setOpenTimePopover: (open: boolean) => void
  timeSlots: string[]
}

function DateTimeSelection({
  date,
  time,
  onDateChange,
  onTimeChange,
  openTimePopover,
  setOpenTimePopover,
  timeSlots,
}: DateTimeSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xl text-[#b17a56]">
        <Calendar className="h-6 w-6" />
        <h3 className="font-semibold">Date de soutenance</h3>
      </div>
      <div className="border rounded-lg p-4 bg-[#EFEFEE]">
        <div className="grid gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 text-base border-2 hover:bg-muted/50 transition-colors",
                  date ? "border-[#b17a56]/30 text-foreground" : "text-muted-foreground",
                )}
              >
                <Calendar className="mr-2 h-5 w-5 text-[#b17a56]" />
                {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={onDateChange}
                initialFocus
                className="[&_.rbc-day-selected]:bg-[#b17a56] [&_.rbc-day-selected]:text-white [&_.rbc-day-today]:bg-[#b17a56]/10 [&_.rbc-day-today]:text-[#b17a56]"
              />
            </PopoverContent>
          </Popover>

          <Popover open={openTimePopover} onOpenChange={setOpenTimePopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 text-base",
                  !time && "text-muted-foreground",
                )}
              >
                <Clock className="mr-2 h-4 w-4 text-[#5b8cb5]" />
                {time ? time : "Sélectionner une heure"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Rechercher une heure..." />
                <CommandList>
                  <CommandEmpty>Aucune heure trouvée.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {timeSlots.map((timeSlot) => (
                      <CommandItem
                        key={timeSlot}
                        value={timeSlot}
                        onSelect={() => onTimeChange(timeSlot)}
                        className="aria-selected:bg-[#5b8cb5]/10 aria-selected:text-[#5b8cb5]"
                      >
                        <Check className={cn("mr-2 h-4 w-4", time === timeSlot ? "opacity-100" : "opacity-0")} />
                        {timeSlot}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

interface RoomSelectionProps {
  selectedRoom: string
  onRoomChange: (roomId: string) => void
  rooms: Room[]
}

function RoomSelection({ selectedRoom, onRoomChange, rooms }: RoomSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xl text-[#5b8cb5]">
        <Home className="h-6 w-6" />
        <h3 className="font-semibold">Salle</h3>
      </div>
      <div className="border rounded-lg p-4 bg-[#EFEFEE]">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-full justify-between h-12 text-base">
              {selectedRoom ? rooms.find((room) => room.id === selectedRoom)?.name : "Sélectionner une salle"}
              <Home className="ml-2 h-4 w-4 shrink-0 opacity-50 text-[#5b8cb5]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher une salle..." />
              <CommandList>
                <CommandEmpty>Aucune salle trouvée.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {rooms.map((room) => (
                    <CommandItem
                      key={room.id}
                      value={room.name}
                      onSelect={() => onRoomChange(room.id)}
                      className="aria-selected:bg-[#5b8cb5]/10 aria-selected:text-[#5b8cb5]"
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedRoom === room.id ? "opacity-100" : "opacity-0")} />
                      {room.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

interface JurySelectionProps {
  jurys: Jury[]
  selectedJurys: string[]
  onJuryChange: (juryId: string, checked: boolean) => void
  mode: SelectionMode
}

function JurySelection({ jurys, selectedJurys, onJuryChange, mode }: JurySelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xl text-[#5b8cb5]">
        <User className="h-6 w-6" />
        <h3 className="font-semibold">Jury (max. 3)</h3>
      </div>
      <div className="border rounded-lg p-4 bg-[#EFEFEE]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {jurys.map((jury) => (
              <div
                key={jury.idJury}
                className={`flex items-center space-x-2 rounded-md border p-3 transition-colors ${
                  selectedJurys.includes(jury.idJury.toString())
                    ? "bg-[#5b8cb5]/10 border-[#5b8cb5]/30"
                    : "hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  id={`jury-${jury.idJury}`}
                  checked={selectedJurys.includes(jury.idJury.toString())}
                  onCheckedChange={(checked) => onJuryChange(jury.idJury.toString(), checked === true)}
                  disabled={
                    mode === "aleatoire" &&
                    selectedJurys.length === 1 &&
                    !selectedJurys.includes(jury.idJury.toString())
                  }
                  className={selectedJurys.includes(jury.idJury.toString()) ? "text-[#5b8cb5]" : ""}
                />
                <Label
                  htmlFor={`jury-${jury.idJury}`}
                  className={`flex-1 cursor-pointer text-base ${
                    selectedJurys.includes(jury.idJury.toString()) ? "font-medium" : ""
                  }`}
                >
                  {jury.nom}
                </Label>
              </div>
            ))}
          </div>

          {selectedJurys.length > 0 && (
            <div className="mt-4 p-3 bg-[#5b8cb5]/5 rounded-md border border-[#5b8cb5]/10">
              <p className="font-medium text-sm text-[#5b8cb5]">Jurys sélectionnés:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedJurys.map((id) => {
                  const juryName = jurys.find((jury) => jury.idJury.toString() === id)?.nom
                  return (
                    <div
                      key={id}
                      className="inline-flex items-center gap-1 bg-[#5b8cb5]/15 text-[#5b8cb5] rounded-full px-3 py-1 text-sm font-medium shadow-sm"
                    >
                      <User className="h-3 w-3" />
                      {juryName}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}