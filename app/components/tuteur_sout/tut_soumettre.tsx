"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader,
  FileText,
  FileIcon as FilePresentation,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  Upload,
  MessageSquare,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Filter,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SubmittedDocument {
  idPFE: number
  id: number
  fichier: string
  nomGroupe: string
  authorName: string
  type: "PDF" | "Presentation"
  validationStatus?: "validated" | "rejected" | "pending"
  comment?: string
}

export default function TuteurGroupDocumentsPage() {
  const searchParams = useSearchParams()
  const idTuteur = useMemo(() => searchParams.get("idTuteur") || "10", [searchParams])

  const [submittedDocuments, setSubmittedDocuments] = useState<SubmittedDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showValidationForm, setShowValidationForm] = useState(false)
  const [currentDoc, setCurrentDoc] = useState<SubmittedDocument | null>(null)
  const [validationStatus, setValidationStatus] = useState<"validated" | "rejected" | "pending">("pending")
  const [comment, setComment] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const livrableNames: Record<string, string> = {
    PDF: "Document PDF",
    Presentation: "Présentation",
  }

  const livrableIcons: Record<string, React.ReactNode> = {
    PDF: <FileText className="h-5 w-5" />,
    Presentation: <FilePresentation className="h-5 w-5" />,
  }

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await fetch(`http://localhost:5000/api/tut_soumettre/group-documents?idTuteur=${idTuteur}`)
      if (response.ok) {
        const data = await response.json()
        setSubmittedDocuments(data)
      } else {
        setFetchError("Impossible de récupérer les documents du groupe")
      }
    } catch (error) {
      setFetchError("Erreur lors de la récupération des documents")
      console.error("Fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [idTuteur])

  const openValidationForm = (doc: SubmittedDocument) => {
    setCurrentDoc(doc)
    setValidationStatus(doc.validationStatus || "pending")
    setComment(doc.comment || "")
    setShowValidationForm(true)
  }

  const closeValidationForm = () => {
    setShowValidationForm(false)
    setCurrentDoc(null)
  }

  const submitValidation = async () => {
    if (!currentDoc) return;
  
    try {
      const response = await fetch("http://localhost:5000/api/validate_document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idPFE: currentDoc.idPFE,
          idLivrable: currentDoc.id,
          idTuteur: String(idTuteur), // Ensure it’s a string
          validationStatus,
          comment,
        }),
      });
  
      if (response.ok) {
        fetchDocuments();
        closeValidationForm();
      } else {
        console.error("Failed to submit validation:", await response.json());
      }
    } catch (error) {
      console.error("Error submitting validation:", error);
    }
  };

  const deleteValidation = async () => {
    if (!currentDoc) return

    try {
      const response = await fetch(
        `http://localhost:5000/api/validate_document?idPFE=${currentDoc.idPFE}&idLivrable=${currentDoc.id}&idTuteur=${idTuteur}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (response.ok) {
        fetchDocuments()
        closeValidationForm()
      } else {
        console.error("Failed to delete validation:", await response.json())
      }
    } catch (error) {
      console.error("Error deleting validation:", error)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "validated":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-amber-500" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "validated":
        return "Validé"
      case "rejected":
        return "Rejeté"
      default:
        return "En attente"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "validated":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
    }
  }

  const filteredDocuments = useMemo(() => {
    let filtered = [...submittedDocuments]
    if (activeTab === "validated") {
      filtered = filtered.filter((doc) => doc.validationStatus === "validated")
    } else if (activeTab === "rejected") {
      filtered = filtered.filter((doc) => doc.validationStatus === "rejected")
    } else if (activeTab === "pending") {
      filtered = filtered.filter((doc) => !doc.validationStatus || doc.validationStatus === "pending")
    }
    if (activeFilter) {
      filtered = filtered.filter((doc) => doc.nomGroupe === activeFilter)
    }
    return filtered
  }, [submittedDocuments, activeFilter, activeTab])

  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>()
    submittedDocuments.forEach((doc) => groups.add(doc.nomGroupe))
    return Array.from(groups)
  }, [submittedDocuments])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto shadow-lg border-0 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <CardHeader className="pb-6 border-b border-border/40 bg-muted/30">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Documents des Groupes Supervisés
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Consultez et validez les documents soumis par les groupes que vous encadrez
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all" className="text-sm">Tous</TabsTrigger>
                <TabsTrigger value="pending" className="text-sm">En attente</TabsTrigger>
                <TabsTrigger value="validated" className="text-sm">Validés</TabsTrigger>
                <TabsTrigger value="rejected" className="text-sm">Rejetés</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      {activeFilter ? `Groupe: ${activeFilter}` : "Filtrer par groupe"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {activeFilter && (
                      <DropdownMenuItem onClick={() => setActiveFilter(null)}>Tous les groupes</DropdownMenuItem>
                    )}
                    {uniqueGroups.map((group) => (
                      <DropdownMenuItem key={group} onClick={() => setActiveFilter(group)}>
                        {group}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDocuments}
                  disabled={isLoading}
                  className="h-8 hover:bg-primary/5 hover:text-primary"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                  Actualiser
                </Button>
              </div>
            </div>

            <TabsContent value={activeTab} className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents {activeTab !== "all" ? `(${getStatusText(activeTab)})` : ""}
                  {activeFilter && (
                    <Badge variant="outline" className="ml-2">Groupe: {activeFilter}</Badge>
                  )}
                </h2>
                <Badge variant="outline" className="px-2 py-1">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center p-8 bg-muted/10 rounded-xl border border-border/40">
                  <Loader className="h-5 w-5 animate-spin mr-2 text-primary" />
                  <p className="text-muted-foreground">Chargement des documents...</p>
                </div>
              ) : fetchError ? (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{fetchError}</AlertDescription>
                  <Button variant="link" onClick={fetchDocuments} className="text-destructive mt-2">
                    Réessayer
                  </Button>
                </Alert>
              ) : filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <Card
                      key={`${doc.idPFE}-${doc.id}`}
                      className="overflow-hidden border border-border/40 hover:shadow-md transition-all duration-300 hover:border-primary/20"
                    >
                      <div className="flex items-center justify-between p-4 bg-muted/20 border-b border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2.5 rounded-full">
                            {livrableIcons[doc.type] ?? <FileText className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-medium">{livrableNames[doc.type]}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{doc.nomGroupe}</Badge>
                              {doc.authorName && (
                                <Badge variant="outline" className="text-xs">{doc.authorName}</Badge>
                              )}
                              <Badge
                                className={`text-xs ${doc.validationStatus ? getStatusColor(doc.validationStatus) : "bg-muted"}`}
                              >
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(doc.validationStatus)}
                                  {getStatusText(doc.validationStatus)}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${doc.fichier}`}
                              download={doc.fichier.split("/").pop()}
                            >
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Télécharger
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${doc.fichier}`,
                                "_blank",
                              )
                            }
                            className="h-8 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Prévisualiser
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openValidationForm(doc)}
                            className="h-8 text-xs"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            {doc.validationStatus ? "Modifier" : "Valider"}
                          </Button>
                        </div>
                      </div>
                      {doc.comment && (
                        <div className="p-4 text-sm">
                          <div className="font-medium mb-1 text-muted-foreground">Commentaire:</div>
                          <div className="bg-muted/20 p-3 rounded-md border border-border/30">{doc.comment}</div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-xl border border-border/40">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">
                    {activeFilter
                      ? `Aucun document ${activeTab !== "all" ? getStatusText(activeTab).toLowerCase() : ""} pour le groupe ${activeFilter}.`
                      : activeTab !== "all"
                        ? `Aucun document ${getStatusText(activeTab).toLowerCase()}.`
                        : "Aucun document soumis par vos groupes pour le moment."}
                  </p>
                  {(activeFilter || activeTab !== "all") && (
                    <Button
                      variant="link"
                      onClick={() => {
                        setActiveFilter(null)
                        setActiveTab("all")
                      }}
                      className="mt-2 text-primary"
                    >
                      Voir tous les documents
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="p-4 border-t border-border/40 bg-muted/30 flex justify-between">
          <p className="text-xs text-muted-foreground">ID Tuteur: {idTuteur}</p>
          <p className="text-xs text-muted-foreground">Dernière mise à jour: {new Date().toLocaleDateString()}</p>
        </CardFooter>
      </Card>

      <Dialog open={showValidationForm} onOpenChange={setShowValidationForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentDoc?.validationStatus ? "Modifier la validation" : "Valider le document"}</DialogTitle>
            <DialogDescription>
              {currentDoc && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{livrableNames[currentDoc.type]}</Badge>
                  <Badge variant="secondary">{currentDoc.nomGroupe}</Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="status">Statut de validation</Label>
              <Select
                value={validationStatus}
                onValueChange={(value) => setValidationStatus(value as "validated" | "rejected" | "pending")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      En attente
                    </div>
                  </SelectItem>
                  <SelectItem value="validated">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Validé
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Rejeté
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Entrez votre commentaire ici (optionnel)"
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              {currentDoc?.validationStatus && (
                <Button variant="destructive" onClick={deleteValidation} type="button">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeValidationForm} type="button">Annuler</Button>
              <Button onClick={submitValidation} type="button">
                {currentDoc?.validationStatus ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </>
                ) : (
                  "Soumettre"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}