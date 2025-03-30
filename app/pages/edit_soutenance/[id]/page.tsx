"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle,
  Calendar,
  Clock,
  Users,
  MapPin,
  Activity,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  ListFilter,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "../../../hooks/use-toast";

interface Soutenance {
  idSoutenance: number;
  date: string;
  time: string;
  location: string;
  groupNames: string; // Concatenated group names
  groupIds: string;   // Comma-separated group IDs
  juryNames: string;
  status: string;
}

interface Group {
  idGroupe: string;
  nomGroupe: string;
  nbEtudiants: number;
}

interface Jury {
  idJury: number;
  nom: string;
}

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: JSX.Element;
}

const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case "Scheduled":
      return { label: "Planifié", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-100 dark:bg-blue-900/50", icon: <Calendar className="h-4 w-4" /> };
    case "Completed":
      return { label: "Terminé", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/50", icon: <Activity className="h-4 w-4" /> };
    case "Pending":
      return { label: "En attente", color: "text-yellow-700 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/50", icon: <Clock className="h-4 w-4" /> };
    case "Cancelled":
      return { label: "Annulé", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/50", icon: <AlertCircle className="h-4 w-4" /> };
    default:
      return { label: "Inconnu", color: "text-gray-700 dark:text-gray-300", bgColor: "bg-gray-100 dark:bg-gray-800", icon: <AlertCircle className="h-4 w-4" /> };
  }
};

export default function EditSoutenancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [soutenance, setSoutenance] = useState<Soutenance | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [juryList, setJuryList] = useState<Jury[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [initialGroupIds, setInitialGroupIds] = useState<string[]>([]); // Store initial group IDs for display
  const [selectedJuryIds, setSelectedJuryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [openTimePopover, setOpenTimePopover] = useState(false);
  const [allSoutenances, setAllSoutenances] = useState<Soutenance[]>([]);
  const [selectedSoutenanceIds, setSelectedSoutenanceIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState("edit");

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00",
  ];

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;

      if (!id) {
        setError("ID manquant dans l'URL");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [soutenanceRes, allSoutenancesRes, groupsRes, juryRes] = await Promise.all([
          fetch(`http://localhost:5000/api/soutenance/${id}`),
          fetch("http://localhost:5000/api/soutenance"),
          fetch("http://localhost:5000/api/groups"),
          fetch("http://localhost:5000/api/jurys"),
        ]);

        if (!soutenanceRes.ok) throw new Error("Échec du chargement de la soutenance");
        if (!allSoutenancesRes.ok) throw new Error("Échec du chargement des soutenances");
        if (!groupsRes.ok) throw new Error("Échec du chargement des groupes");
        if (!juryRes.ok) throw new Error("Échec du chargement du jury");

        const [soutenanceData, allSoutenancesData, groupsData, juryData] = await Promise.all([
          soutenanceRes.json(),
          allSoutenancesRes.json(),
          groupsRes.json(),
          juryRes.json(),
        ]);

        setAllSoutenances(allSoutenancesData);
        setGroups(groupsData);
        setJuryList(juryData);

        const formattedDate = soutenanceData.date ? new Date(soutenanceData.date) : undefined;
        setDate(formattedDate);
        setSoutenance({
          ...soutenanceData,
          date: formattedDate?.toISOString().split("T")[0] || "",
        });
        const initialGroups = soutenanceData.groupIds ? soutenanceData.groupIds.split(",") : [];
        setInitialGroupIds(initialGroups); // Store initial groups
        setSelectedGroupIds(initialGroups); // Pre-select initial groups

        if (soutenanceData.juryNames) {
          const existingJuryNames = soutenanceData.juryNames.split(" | ");
          const existingJuryIds = juryData
            .filter((jury: Jury) => existingJuryNames.includes(jury.nom))
            .map((jury: Jury) => jury.idJury);
          setSelectedJuryIds(existingJuryIds);
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des données");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupIds((current) =>
      current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]
    );
  };

  const handleJuryChange = (juryId: number) => {
    setSelectedJuryIds((current) => {
      if (current.includes(juryId)) {
        const newSelection = current.filter((id) => id !== juryId);
        updateJuryNames(newSelection);
        return newSelection;
      } else if (current.length < 3) {
        const newSelection = [...current, juryId];
        updateJuryNames(newSelection);
        return newSelection;
      }
      return current;
    });
  };

  const updateJuryNames = (juryIds: number[]) => {
    const juryNames = juryIds
      .map((id) => juryList.find((j) => j.idJury === id)?.nom)
      .filter(Boolean)
      .join(" | ");
    setSoutenance((prev) => (prev ? { ...prev, juryNames } : null));
  };

  const handleSave = async () => {
    if (!soutenance || !soutenance.idSoutenance) {
      setError("Données de soutenance manquantes");
      toast({ title: "Erreur", description: "Données de soutenance manquantes", variant: "destructive" });
      return;
    }

    if (selectedJuryIds.length !== 3) {
      setError("Veuillez sélectionner exactement 3 membres du jury");
      toast({ title: "Erreur", description: "Veuillez sélectionner exactement 3 membres du jury", variant: "destructive" });
      return;
    }

    if (selectedGroupIds.length === 0) {
      setError("Veuillez sélectionner au moins un groupe");
      toast({ title: "Erreur", description: "Veuillez sélectionner au moins un groupe", variant: "destructive" });
      return;
    }

    const updateData = {
      date: soutenance.date,
      time: soutenance.time,
      location: soutenance.location,
      status: soutenance.status,
      groupIds: selectedGroupIds,
      juryIds: selectedJuryIds,
    };

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/soutenance/${soutenance.idSoutenance}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur serveur: ${errorData}`);
      }

      toast({ title: "Soutenance mise à jour", description: "Les modifications ont été enregistrées avec succès." });
      router.push("/pages/ListeSoutenances");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
      setError(errorMessage);
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSoutenanceSelect = (soutenanceId: number) => {
    setSelectedSoutenanceIds((current) =>
      current.includes(soutenanceId)
        ? current.filter((id) => id !== soutenanceId)
        : [...current, soutenanceId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSoutenanceIds(
      selectedSoutenanceIds.length === allSoutenances.length
        ? []
        : allSoutenances.map((s) => s.idSoutenance)
    );
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedSoutenanceIds.length === 0) {
      toast({ title: "Action impossible", description: "Veuillez sélectionner un statut et au moins une soutenance", variant: "destructive" });
      return;
    }

    const payload = { ids: selectedSoutenanceIds, status: bulkStatus };

    try {
      setIsBulkSaving(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/soutenance/bulk-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Échec de la mise à jour en masse");

      toast({ title: "Mise à jour en masse réussie", description: `${selectedSoutenanceIds.length} soutenances ont été mises à jour.` });

      const refreshResponse = await fetch("http://localhost:5000/api/soutenance");
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setAllSoutenances(refreshedData);
      }

      setSelectedSoutenanceIds([]);
      setBulkStatus("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setError(errorMessage);
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
    } finally {
      setIsBulkSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !soutenance) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Alert variant="destructive" className="animate-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error || "Soutenance non trouvée"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(soutenance.status);

  // Get names of initially selected groups for display
  const initialGroupNames = initialGroupIds
    .map((id) => groups.find((g) => g.idGroupe === id)?.nomGroupe)
    .filter(Boolean)
    .join(" | ") || "Aucun groupe sélectionné";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/pages/ListeSoutenances")} className="mb-4 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gestion des Soutenances
          </h1>
          <p className="mt-3 text-muted-foreground">
            Modifiez les détails des soutenances et effectuez des mises à jour en masse
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Modifier la Soutenance
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              Mise à Jour en Masse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">Soutenance des Groupes {soutenance.groupNames || "Non spécifié"}</CardTitle>
                <CardDescription>Modifiez les informations de la soutenance</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                              setDate(newDate);
                              if (newDate) {
                                setSoutenance((prev) => (prev ? { ...prev, date: newDate.toISOString().split("T")[0] } : null));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Heure
                      </Label>
                      <Popover open={openTimePopover} onOpenChange={setOpenTimePopover}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !soutenance.time && "text-muted-foreground")}>
                            <Clock className="mr-2 h-4 w-4" />
                            {soutenance.time || "Sélectionner une heure"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Rechercher une heure..." />
                            <CommandList>
                              <CommandEmpty>Aucune heure trouvée.</CommandEmpty>
                              <CommandGroup>
                                {timeSlots.map((time) => (
                                  <CommandItem
                                    key={time}
                                    value={time}
                                    onSelect={() => {
                                      setSoutenance((prev) => (prev ? { ...prev, time } : null));
                                      setOpenTimePopover(false);
                                    }}
                                  >
                                    <Clock className={cn("mr-2 h-4 w-4", soutenance.time === time ? "opacity-100" : "opacity-0")} />
                                    {time}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Groupes actuels
                      </Label>
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        {initialGroupNames}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Modifier les groupes
                      </Label>
                      <Badge variant="outline" className={cn("font-medium", selectedGroupIds.length === 0 ? "text-destructive border-destructive" : "text-primary border-primary")}>
                        {selectedGroupIds.length} sélectionné(s)
                      </Badge>
                    </div>
                    <Card className="border-primary/10">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groups.map((group) => (
                            <div
                              key={group.idGroupe}
                              className={cn("flex items-center space-x-2 rounded-lg border p-3 transition-colors", selectedGroupIds.includes(group.idGroupe) ? "bg-primary/5 border-primary" : "hover:bg-muted/50")}
                            >
                              <Checkbox
                                id={`group-${group.idGroupe}`}
                                checked={selectedGroupIds.includes(group.idGroupe)}
                                onCheckedChange={() => handleGroupChange(group.idGroupe)}
                              />
                              <Label htmlFor={`group-${group.idGroupe}`} className="flex-1 cursor-pointer text-sm">
                                {group.nomGroupe} ({group.nbEtudiants} étudiants)
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    {selectedGroupIds.length === 0 && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Veuillez sélectionner au moins un groupe
                      </p>
                    )}
                  </div>

                  <Separator className="my-8" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Jury
                      </Label>
                      <Badge variant="outline" className={cn("font-medium", selectedJuryIds.length !== 3 ? "text-destructive border-destructive" : "text-primary border-primary")}>
                        {selectedJuryIds.length}/3 sélectionnés
                      </Badge>
                    </div>
                    <Card className="border-primary/10">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {juryList.map((jury) => (
                            <div
                              key={jury.idJury}
                              className={cn("flex items-center space-x-2 rounded-lg border p-3 transition-colors", selectedJuryIds.includes(jury.idJury) ? "bg-primary/5 border-primary" : "hover:bg-muted/50")}
                            >
                              <Checkbox
                                id={`jury-${jury.idJury}`}
                                checked={selectedJuryIds.includes(jury.idJury)}
                                onCheckedChange={() => handleJuryChange(jury.idJury)}
                                disabled={!selectedJuryIds.includes(jury.idJury) && selectedJuryIds.length >= 3}
                              />
                              <Label htmlFor={`jury-${jury.idJury}`} className="flex-1 cursor-pointer text-sm">
                                {jury.nom}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    {selectedJuryIds.length !== 3 && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Veuillez sélectionner exactement 3 membres du jury
                      </p>
                    )}
                  </div>

                  <Separator className="my-8" />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Salle
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-between", !soutenance.location && "text-muted-foreground")}>
                            {soutenance.location || "Sélectionner une salle"}
                            <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Rechercher une salle..." />
                            <CommandList>
                              <CommandEmpty>Aucune salle trouvée.</CommandEmpty>
                              <CommandGroup>
                                {Array.from({ length: 12 }, (_, i) => `Salle ${i + 1}`).map((salle) => (
                                  <CommandItem
                                    key={salle}
                                    value={salle}
                                    onSelect={() => setSoutenance((prev) => (prev ? { ...prev, location: salle } : null))}
                                  >
                                    <MapPin className={cn("mr-2 h-4 w-4", soutenance.location === salle ? "opacity-100" : "opacity-0")} />
                                    {salle}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Statut
                      </Label>
                      <Select value={soutenance.status} onValueChange={(value) => setSoutenance((prev) => (prev ? { ...prev, status: value } : null))}>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {soutenance.status && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("font-medium gap-1.5 pl-1 pr-2", statusConfig.color, statusConfig.bgColor, "border-0")}>
                                  {statusConfig.icon}
                                  {statusConfig.label}
                                </Badge>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scheduled">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-medium gap-1.5 pl-1 pr-2 text-blue-700 bg-blue-100 border-0">
                                <Calendar className="h-4 w-4" />
                                Planifié
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Completed">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-medium gap-1.5 pl-1 pr-2 text-green-700 bg-green-100 border-0">
                                <Activity className="h-4 w-4" />
                                Terminé
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Pending">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-medium gap-1.5 pl-1 pr-2 text-yellow-700 bg-yellow-100 border-0">
                                <Clock className="h-4 w-4" />
                                En attente
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Cancelled">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-medium gap-1.5 pl-1 pr-2 text-red-700 bg-red-100 border-0">
                                <AlertCircle className="h-4 w-4" />
                                Annulé
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6">
                    <Button variant="outline" onClick={() => router.push("/pages/ListeSoutenances")} className="transition-all hover:bg-destructive hover:text-destructive-foreground">
                      Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={selectedJuryIds.length !== 3 || selectedGroupIds.length === 0 || isSaving} className="transition-all">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Sauvegarder
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card className="border-primary/10 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Mise à jour en masse</CardTitle>
                <CardDescription>Modifiez le statut de plusieurs soutenances simultanément</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Soutenances</Label>
                      <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs">
                        {selectedSoutenanceIds.length === allSoutenances.length ? "Désélectionner tout" : "Sélectionner tout"}
                      </Button>
                    </div>

                    <Card className="border-primary/10">
                      <ScrollArea className="h-[300px] w-full p-4">
                        <div className="grid grid-cols-1 gap-2">
                          {allSoutenances.map((s) => {
                            const status = getStatusConfig(s.status);
                            return (
                              <div
                                key={s.idSoutenance}
                                className={cn("flex items-center space-x-3 rounded-lg border p-3 transition-colors", selectedSoutenanceIds.includes(s.idSoutenance) ? "bg-primary/5 border-primary" : "hover:bg-muted/50")}
                              >
                                <Checkbox
                                  checked={selectedSoutenanceIds.includes(s.idSoutenance)}
                                  onCheckedChange={() => handleSoutenanceSelect(s.idSoutenance)}
                                  id={`soutenance-${s.idSoutenance}`}
                                />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                                  <Label htmlFor={`soutenance-${s.idSoutenance}`} className="font-medium cursor-pointer">
                                    {s.groupNames}
                                  </Label>
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {s.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {s.time}
                                    </span>
                                    <Badge variant="outline" className={cn("font-medium gap-1 pl-1 pr-2 text-xs", status.color, status.bgColor, "border-0")}>
                                      {status.icon}
                                      {status.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </Card>

                    <div className="pt-4">
                      <Label className="text-base font-medium mb-2 block">Nouveau Statut</Label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Select onValueChange={setBulkStatus} value={bulkStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Scheduled">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                Planifié
                              </div>
                            </SelectItem>
                            <SelectItem value="Completed">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Terminé
                              </div>
                            </SelectItem>
                            <SelectItem value="Pending">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                En attente
                              </div>
                            </SelectItem>
                            <SelectItem value="Cancelled">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                Annulé
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Button onClick={handleBulkStatusChange} disabled={isBulkSaving || !bulkStatus || selectedSoutenanceIds.length === 0} className="sm:w-auto w-full">
                          {isBulkSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Appliquer le statut
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {selectedSoutenanceIds.length > 0 && (
                      <div className="bg-muted/50 p-3 rounded-lg mt-4">
                        <p className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span><strong>{selectedSoutenanceIds.length}</strong> soutenance(s) sélectionnée(s)</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}