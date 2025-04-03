/* eslint-disable react/no-unescaped-entities */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CalendarClock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileUp,
  FileText,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Soutenance {
  idSoutenance: number;
  date: string;
  time: string;
  location: string;
  nomGroupe: string;
  juryNames: string[] | string | null;
  status: string;
  idGroupe: number;
  subjectTitle?: string;
  studentNames?: string;
}

interface StatusConfig {
  color: string;
  bg: string;
  hoverBg: string;
  icon: React.ReactNode;
  text: string;
}

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "Scheduled":
      return {
        color: "text-blue-700 dark:text-blue-300",
        bg: "bg-blue-100 dark:bg-blue-900/50",
        hoverBg: "hover:bg-blue-200 dark:hover:bg-blue-900/70",
        icon: <CalendarClock className="w-3.5 h-3.5" />,
        text: "Planifié",
      };
    case "Completed":
      return {
        color: "text-green-700 dark:text-green-300",
        bg: "bg-green-100 dark:bg-green-900/50",
        hoverBg: "hover:bg-green-200 dark:hover:bg-green-900/70",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: "Terminé",
      };
    case "Pending":
      return {
        color: "text-yellow-700 dark:text-yellow-300",
        bg: "bg-yellow-100 dark:bg-yellow-900/50",
        hoverBg: "hover:bg-yellow-200 dark:hover:bg-yellow-900/70",
        icon: <Clock className="w-3.5 h-3.5" />,
        text: "En attente",
      };
    case "Cancelled":
      return {
        color: "text-red-700 dark:text-red-300",
        bg: "bg-red-100 dark:bg-red-900/50",
        hoverBg: "hover:bg-red-200 dark:hover:bg-red-900/70",
        icon: <XCircle className="w-3.5 h-3.5" />,
        text: "Annulé",
      };
    default:
      return {
        color: "text-gray-700 dark:text-gray-300",
        bg: "bg-gray-100 dark:bg-gray-800",
        hoverBg: "hover:bg-gray-200 dark:hover:bg-gray-800/70",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        text: "Inconnu",
      };
  }
}

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={`
        ${config.bg} 
        ${config.color} 
        ${config.hoverBg}
        border-0 
        font-medium 
        gap-1.5
        px-2.5 
        py-0.5 
        transition-colors duration-200
        inline-flex items-center
        cursor-default select-none shadow-sm
      `}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
}

const formatJuryNames = (juryNames: string[] | string | null) => {
  if (Array.isArray(juryNames)) {
    return juryNames.join(" | ");
  } else if (typeof juryNames === "string") {
    return juryNames;
  } else {
    return "Aucun jury assigné";
  }
};

export default function ProfSoutenancesPage() {
  const [soutenances, setSoutenances] = useState<Soutenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState("all");
  const router = useRouter();

  const idEncadrant = 1; // Example ID, replace with actual professor ID

  useEffect(() => {
    const fetchSoutenances = async () => {
      try {
        setLoading(true);
        const url = new URL(`http://localhost:5000/api/prof/encadrant/${idEncadrant}/soutenances`);
        
        if (yearFilter && yearFilter !== "all") {
          url.searchParams.append('year', yearFilter);
        }
    
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setSoutenances(data);
      } catch (error) {
        console.error("Error fetching soutenances:", error);
        setError("Erreur de chargement des soutenances");
      } finally {
        setLoading(false);
      }
    };
    fetchSoutenances();
  }, [idEncadrant, yearFilter]);

  const handleDownloadPdf = async (idSoutenance: number) => {
    try {
      // Use full backend URL in development
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/prof/soutenances'
        : '/api/prof/soutenances';
  
      const response = await fetch(`${apiUrl}/${idSoutenance}/pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          `Server responded with ${response.status}`
        );
      }
  
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soutenance_${idSoutenance}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  
    } catch (error) {
      console.error('PDF download error:', error);
      
      let errorMessage = 'Failed to download PDF';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const groupName = soutenances.length > 0 ? soutenances[0].nomGroupe : "Inconnu";

  if (loading) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-3/4" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow-sm border p-6 w-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-10 w-40" />
                </div>
                <div className="flex flex-col space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-6 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h3 className="text-xl font-semibold">Erreur de chargement</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-b from-background to-muted/20">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-2xl font-bold text-center md:text-left">
            Soutenances du{" "}
            <span className="text-primary font-extrabold">{groupName}</span>
          </CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="yearFilter" className="text-sm font-medium text-muted-foreground">
                Année :
              </label>
              <select
                id="yearFilter"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-card text-sm font-medium"
              >
                <option value="all">Toutes</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <Button
              variant="default"
              className="rounded-full h-10 px-4 flex items-center gap-2 shadow-md"
              onClick={() => router.push("/pages/prof_soumis")}
            >
              <FileUp className="h-4 w-4" />
              <span>Visualisation des documents</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {soutenances.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <CalendarClock className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Aucune soutenance planifiée</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas encore de soutenances programmées.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto">
            {soutenances.map((soutenance) => (
              <div
                key={soutenance.idSoutenance}
                className="bg-card rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group w-full"
              >
                <div className="absolute top-4 right-4">
                  <StatusBadge status={soutenance.status} />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 left-4 gap-1.5 text-sm"
                  onClick={() => handleDownloadPdf(
                    soutenance.idSoutenance,
                    soutenance.nomGroupe,
                    soutenance.date
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Télécharger PDF
                </Button>

                <div className="flex flex-col space-y-6 pt-8">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                      {soutenance.nomGroupe}
                    </Badge>
                    {soutenance.subjectTitle && (
                      <Badge variant="outline" className="text-sm">
                        {soutenance.subjectTitle}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 text-foreground">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="font-medium">
                          {format(parseISO(soutenance.date), "d MMMM yyyy", { locale: fr })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-foreground">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Heure</div>
                        <div className="font-medium">{soutenance.time}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-foreground">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Lieu</div>
                        <div className="font-medium">{soutenance.location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-foreground">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Jury</div>
                        <div className="font-medium">{formatJuryNames(soutenance.juryNames)}</div>
                      </div>
                    </div>
                    
                    {soutenance.studentNames && (
                      <div className="flex items-center gap-3 text-foreground">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Étudiants</div>
                          <div className="font-medium">{soutenance.studentNames}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}