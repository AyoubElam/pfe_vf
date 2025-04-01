  /* eslint-disable react/jsx-no-duplicate-props */
  "use client"

  import type React from "react"
  import { useState, useEffect, useCallback, type JSX } from "react"
  import { useSearchParams } from "next/navigation"
  import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import {
    FileUp,
    Loader,
    FileText,
    FileIcon,
    Download,
    RefreshCw,
    Upload,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
  } from "lucide-react"
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
  import { Label } from "@/components/ui/label"
  import { Badge } from "@/components/ui/badge"
  import { Progress } from "@/components/ui/progress"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

  // Types
  interface DocumentValidation {
    validationStatus: "validated" | "rejected" | "pending"
    comment: string | null
  }

  interface SubmittedDocument {
    id: number;
    idPFE: number;
    fichier: string;
    type: "PDF" | "Presentation";
    nomGroupe: string; // Added for group name
    nbEtudiants: number; // Added for student count
    tutorValidation?: DocumentValidation | null;
    profValidation?: DocumentValidation | null;
  }

  interface LivrableNames {
    [key: string]: string
  }

  // Constants
  const API_BASE_URL = "http://localhost:5000"
  const LIVRABLE_NAMES: LivrableNames = {
    PDF: "Document PDF",
    Presentation: "Présentation",
  }

  const LIVRABLE_ICONS = {
    PDF: <FileText className="h-5 w-5" />,
    Presentation: <FileIcon className="h-5 w-5" />,
  }

  export default function SoumettrePage() {
    const searchParams = useSearchParams()
    const idEtudiant = searchParams.get("idEtudiant") || "E003"
    const idGroupe = searchParams.get("idGroupe") || "2"

    // State
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [presentationFile, setPresentationFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submittedDocuments, setSubmittedDocuments] = useState<SubmittedDocument[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [activeTab, setActiveTab] = useState("submitted")

    // Fetch documents from API
    const fetchDocuments = useCallback(async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/livrable/documents?idEtudiant=${idEtudiant}`);
        if (!response.ok) throw new Error("Failed to fetch documents");
        const data = await response.json();
        console.log("Fetched documents:", JSON.stringify(data, null, 2));
        setSubmittedDocuments(data);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    }, [idEtudiant]);

    useEffect(() => {
      fetchDocuments()
    }, [fetchDocuments])

    // File handling
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
      if (e.target.files?.[0]) {
        setFile(e.target.files[0])
        simulateUploadProgress()
      }
    }

    const simulateUploadProgress = () => {
      setUploadProgress(0)
      const timer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            return 100
          }
          return prev + 10
        })
      }, 100)
    }

    const resetForm = () => {
      setPdfFile(null)
      setPresentationFile(null)
      setUploadProgress(0)
      const pdfInput = document.getElementById("pdf") as HTMLInputElement
      const presentationInput = document.getElementById("presentation") as HTMLInputElement
      if (pdfInput) pdfInput.value = ""
      if (presentationInput) presentationInput.value = ""
    }

    // Form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setSubmitSuccess(false)
      setSubmitError(null)
      setIsSubmitting(true)
      setUploadProgress(0)

      if (!pdfFile || !presentationFile) {
        setSubmitError("Veuillez sélectionner les deux fichiers.")
        setIsSubmitting(false)
        return
      }

      const formData = new FormData()
      formData.append("files", pdfFile)
      formData.append("files", presentationFile)
      formData.append("idEtudiant", idEtudiant)
      formData.append("idGroupe", idGroupe)

      try {
        const response = await fetch(`${API_BASE_URL}/api/livrable/submit-documents`, {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          simulateUploadProgress()
          setSubmitSuccess(true)
          resetForm()
          fetchDocuments()
          setActiveTab("submitted")
        } else {
          const errorText = await response.text()
          setSubmitError(`Erreur lors de la soumission: ${errorText}`)
        }
      } catch (error) {
        console.error("Erreur de connexion:", error)
        setSubmitError("Erreur de connexion au serveur")
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleDelete = async (idPFE: number, id: number) => {
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
    
      try {
        console.log("Sending delete request:", { idEtudiant, idPFE, id });
        const response = await fetch(`${API_BASE_URL}/api/livrable/delete-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idEtudiant, idPFE, id }),
        });
    
        if (response.ok) {
          console.log("Delete successful");
          fetchDocuments();
        } else {
          const errorText = await response.text();
          console.error("Delete failed:", errorText);
          alert(`Erreur lors de la suppression : ${errorText}`);
        }
      } catch (error) {
        console.error("Connection error:", error);
        alert("Erreur de connexion au serveur");
      }
    };

    const normalizeStatus = (status: string) => status?.toLowerCase().trim() || "pending"

    const getStatusIcon = (status: string) => {
      const normalized = normalizeStatus(status)
      switch (normalized) {
        case "validated":
          return <CheckCircle className="h-4 w-4 text-green-500" />
        case "rejected":
          return <XCircle className="h-4 w-4 text-red-500" />
        default:
          return <Clock className="h-4 w-4 text-amber-500" />
      }
    }

    const getStatusText = (status: string) => {
      const normalized = normalizeStatus(status)
      switch (normalized) {
        case "validated":
          return "Validé"
        case "rejected":
          return "Rejeté"
        default:
          return "En attente"
      }
    }

    const getStatusColor = (status: string) => {
      const normalized = normalizeStatus(status)
      switch (normalized) {
        case "validated":
          return "bg-green-100 text-green-800 border-green-300"
        case "rejected":
          return "bg-red-100 text-red-800 border-red-300"
        default:
          return "bg-yellow-100 text-yellow-800 border-yellow-300"
      }
    }

    return (
      <div className="container mx-auto py-6 px-4 md:py-10 md:px-6 lg:px-8 max-w-4xl">
        <Card className="shadow-xl border-none bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-[#b17a56]/10 to-[#5b8cb5]/10 p-6">
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">Soumettre des Documents</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Gérez et soumettez vos documents de projet pour validation
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {submitSuccess && <SubmissionAlert type="success" title="Succès" message="Documents soumis avec succès !" />}
            {submitError && <SubmissionAlert type="error" title="Erreur" message={submitError} />}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4 md:mb-6">
                <TabsTrigger
                  value="submitted"
                  className="py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#b17a56] dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white rounded-md"
                >
                  Documents Soumis
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#5b8cb5] dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white rounded-md"
                >
                  Nouvelle Soumission
                </TabsTrigger>
              </TabsList>

              <TabsContent value="submitted" className="mt-0">
                <SubmittedDocumentsTab
                  isLoading={isLoading}
                  fetchError={fetchError}
                  submittedDocuments={submittedDocuments}
                  fetchDocuments={fetchDocuments}
                  handleDelete={handleDelete}
                  setActiveTab={setActiveTab}
                  livrableIcons={LIVRABLE_ICONS}
                  livrableNames={LIVRABLE_NAMES}
                  getStatusIcon={getStatusIcon}
                  getStatusText={getStatusText}
                  getStatusColor={getStatusColor}
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-0">
                <UploadDocumentsTab
                  handleSubmit={handleSubmit}
                  handleFileChange={handleFileChange}
                  pdfFile={pdfFile}
                  setPdfFile={setPdfFile}
                  presentationFile={presentationFile}
                  setPresentationFile={setPresentationFile}
                  uploadProgress={uploadProgress}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="bg-gray-50 dark:bg-gray-700 p-4 flex flex-col sm:flex-row justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
            <span>ID Groupe: {idGroupe}</span>
            <span>Dernière mise à jour: {new Date().toLocaleDateString()}</span>
          </CardFooter>
        </Card>
      </div>
    )
  }

  interface SubmissionAlertProps {
    type: "success" | "error"
    title: string
    message: string
  }

  function SubmissionAlert({ type, title, message }: SubmissionAlertProps) {
    return (
      <Alert
        className={`mb-6 rounded-lg ${type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
      >
        {type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  interface SubmittedDocumentsTabProps {
    isLoading: boolean
    fetchError: string | null
    submittedDocuments: SubmittedDocument[]
    fetchDocuments: () => Promise<void>
    handleDelete: (idPFE: number, id: number) => Promise<void>
    setActiveTab: (tab: string) => void
    livrableIcons: Record<string, JSX.Element>
    livrableNames: LivrableNames
    getStatusIcon: (status: string) => JSX.Element
    getStatusText: (status: string) => string
    getStatusColor: (status: string) => string
  }

  function SubmittedDocumentsTab({
    isLoading,
    fetchError,
    submittedDocuments,
    fetchDocuments,
    handleDelete,
    setActiveTab,
    livrableIcons,
    livrableNames,
    getStatusIcon,
    getStatusText,
    getStatusColor,
  }: SubmittedDocumentsTabProps) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#b17a56]" />
            Documents Soumis
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            disabled={isLoading}
            className="border-[#b17a56] text-[#b17a56] hover:bg-[#b17a56]/10 w-full md:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Loader className="h-6 w-6 animate-spin text-[#b17a56] mr-3" />
            <span className="text-gray-600 dark:text-gray-300">Chargement...</span>
          </div>
        ) : fetchError ? (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        ) : submittedDocuments.length > 0 ? (
          <div className="grid gap-6">
            {submittedDocuments.map((doc, index) => (
              <DocumentCard
                key={`${doc.id}-${doc.type}-${index}`}
                document={doc}
                handleDelete={handleDelete}
                livrableIcons={livrableIcons}
                livrableNames={livrableNames}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Upload className="h-10 w-10 text-[#5b8cb5] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">Aucun document soumis pour le moment.</p>
            <Button
              variant="outline"
              onClick={() => setActiveTab("upload")}
              className="border-[#b17a56] text-[#b17a56] hover:bg-[#b17a56]/10"
            >
              Soumettre Maintenant
            </Button>
          </div>
        )}
      </div>
    )
  }

  interface DocumentCardProps {
    document: SubmittedDocument
    handleDelete: (idPFE: number, id: number) => Promise<void>
    livrableIcons: Record<string, JSX.Element>
    livrableNames: LivrableNames
    getStatusIcon: (status: string) => JSX.Element
    getStatusText: (status: string) => string
    getStatusColor: (status: string) => string
  }

  function DocumentCard({
    document: doc,
    handleDelete,
    livrableIcons,
    livrableNames,
    getStatusIcon,
    getStatusText,
    getStatusColor,
  }: DocumentCardProps) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b17a56]/10 rounded-full">
              {doc.type in livrableIcons ? livrableIcons[doc.type] : <FileText className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{livrableNames[doc.type]}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-[#5b8cb5]/10 text-[#5b8cb5] border-[#5b8cb5]/20">
                  {doc.nomGroupe} ({doc.nbEtudiants} étudiants)
                </Badge>
                <Badge variant="secondary" className="bg-[#5b8cb5]/10 text-[#5b8cb5] border-[#5b8cb5]/20">
                  Soumis
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button variant="ghost" size="sm" asChild className="text-[#5b8cb5] hover:bg-[#5b8cb5]/10 w-full md:w-auto">
              <a href={`${API_BASE_URL}${doc.fichier}`} download>
                <Download className="h-4 w-4 mr-1" />
                Télécharger
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(doc.idPFE, doc.id)}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full md:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              {doc.tutorValidation ? (
                <ValidationStatus
                  type="Tuteur"
                  validation={doc.tutorValidation}
                  getStatusIcon={getStatusIcon}
                  getStatusText={getStatusText}
                  getStatusColor={getStatusColor}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Tuteur: Pas encore validé</span>
                </div>
              )}
            </div>
            <div>
              {doc.profValidation ? (
                <ValidationStatus
                  type="Professeur"
                  validation={doc.profValidation}
                  getStatusIcon={getStatusIcon}
                  getStatusText={getStatusText}
                  getStatusColor={getStatusColor}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Professeur: Pas encore validé</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  interface ValidationStatusProps {
    type: "Tuteur" | "Professeur"
    validation: DocumentValidation
    getStatusIcon: (status: string) => JSX.Element
    getStatusText: (status: string) => string
    getStatusColor: (status: string) => string
  }

  function ValidationStatus({ type, validation, getStatusIcon, getStatusText, getStatusColor }: ValidationStatusProps) {
    return (
      <div className={`p-4 rounded-lg border ${getStatusColor(validation.validationStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(validation.validationStatus)}
            <span className="font-semibold text-gray-800 dark:text-gray-100">{type}</span>
          </div>
          <Badge variant="outline" className="text-sm">
            {getStatusText(validation.validationStatus)}
          </Badge>
        </div>
        {validation.comment && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic">"{validation.comment}"</p>
        )}
      </div>
    )
  }

  interface UploadDocumentsTabProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => void
    pdfFile: File | null
    setPdfFile: (file: File | null) => void
    presentationFile: File | null
    setPresentationFile: (file: File | null) => void
    uploadProgress: number
    isSubmitting: boolean
  }

  function UploadDocumentsTab({
    handleSubmit,
    handleFileChange,
    pdfFile,
    setPdfFile,
    presentationFile,
    setPresentationFile,
    uploadProgress,
    isSubmitting,
  }: UploadDocumentsTabProps) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FileUp className="h-6 w-6 text-[#b17a56]" />
          Nouvelle Soumission
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {[
              {
                id: "pdf",
                label: "Document PDF",
                icon: <FileText className="h-5 w-5" />,
                state: pdfFile,
                setState: setPdfFile,
                accept: ".pdf",
              },
              {
                id: "presentation",
                label: "Présentation",
                icon: <FileIcon className="h-5 w-5" />,
                state: presentationFile,
                setState: setPresentationFile,
                accept: ".ppt,.pptx,.key,.pdf",
              },
            ].map((item) => (
              <FileUploadCard
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                state={item.state}
                setState={item.setState}
                accept={item.accept}
                handleFileChange={handleFileChange}
                uploadProgress={uploadProgress}
              />
            ))}
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] hover:from-[#b17a56]/90 hover:to-[#5b8cb5]/90 text-white font-semibold py-2 md:py-3 rounded-lg transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Soumission en cours...
              </>
            ) : (
              <>
                <FileUp className="h-5 w-5 mr-2" />
                Soumettre les Documents
              </>
            )}
          </Button>
        </form>
      </div>
    )
  }

  interface FileUploadCardProps {
    id: string
    label: string
    icon: JSX.Element
    state: File | null
    setState: (file: File | null) => void
    accept: string
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => void
    uploadProgress: number
  }

  function FileUploadCard({
    id,
    label,
    icon,
    state,
    setState,
    accept,
    handleFileChange,
    uploadProgress,
  }: FileUploadCardProps) {
    return (
      <Card className="shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <Label htmlFor={id} className="flex items-center gap-2 text-lg font-medium text-gray-800 dark:text-gray-100">
            {icon}
            {label}
          </Label>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative">
            <input
              type="file"
              id={id}
              accept={accept}
              onChange={(e) => handleFileChange(e, setState)}
              className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#b17a56] file:text-white hover:file:bg-[#b17a56]/80 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
              required
            />
            {state && (
              <>
                <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#5b8cb5]/10 text-[#5b8cb5] border-[#5b8cb5]/20 hidden md:flex">
                  {state.name.length > 20 ? `${state.name.substring(0, 20)}...` : state.name}
                </Badge>
                <Badge className="mt-2 bg-[#5b8cb5]/10 text-[#5b8cb5] border-[#5b8cb5]/20 md:hidden w-full justify-center">
                  {state.name.length > 30 ? `${state.name.substring(0, 30)}...` : state.name}
                </Badge>
                <Progress value={uploadProgress} className="mt-2 h-1 bg-gray-200 dark:bg-gray-600" />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
    //hhh
  }

