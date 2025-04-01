/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileDown,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  GraduationCap,
  FileText,
  MessageSquare,
  Presentation,
  Award,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StudentGroup {
  idGroupe: number;
  nomGroupe: string;
  idEtudiant: string; // VARCHAR
  etudiant: string;
  idSoutenance: number;
  noteRapport?: number | null;
  notePresentation?: number | null;
  noteDiscussion?: number | null;
  noteSavoirFaireSavoirEtre?: number | null;
  noteTotale?: number | null;
  remarque?: string;
}

const EvaluationPage: React.FC = () => {
  const [students, setStudents] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const idEncadrant = "1"; // VARCHAR ID

  // Group students by group
  const studentGroups = students.reduce(
    (groups, student) => {
      const groupId = student.idGroupe;
      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          name: student.nomGroupe,
          students: [],
        };
      }
      groups[groupId].students.push(student);
      return groups;
    },
    {} as Record<number, { id: number; name: string; students: StudentGroup[] }>,
  );

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:5000/api/groups-students/${idEncadrant}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error loading data");
      }
      const data: StudentGroup[] = await res.json();
      if (data.length === 0) {
        setError("No groups found for this encadrant");
        setLoading(false);
        return;
      }
      if (data.some((student) => !student.idSoutenance)) {
        throw new Error("Some students are missing idSoutenance from the backend");
      }
      const studentsWithTotal = data.map((student) => ({
        ...student,
        noteTotale: calculateTotal(student),
      }));
      setStudents(studentsWithTotal);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const calculateTotal = (student: StudentGroup): number | null => {
    const grades = [
      student.noteRapport,
      student.notePresentation,
      student.noteDiscussion,
      student.noteSavoirFaireSavoirEtre,
    ].filter((grade): grade is number => grade !== undefined && grade !== null && !isNaN(grade));
    return grades.length > 0 ? Number((grades.reduce((acc, grade) => acc + grade, 0) / grades.length).toFixed(2)) : null;
  };

  const validateGrade = (value: string, index: number, field: string): boolean => {
    const numValue = Number(value);
    const errorKey = `${index}-${field}`;
    if (value && (isNaN(numValue) || numValue < 0 || numValue > 20)) {
      setValidationErrors((prev) => ({
        ...prev,
        [errorKey]: "Grade must be between 0 and 20",
      }));
      return false;
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
      return true;
    }
  };

  const handleInputChange = (index: number, field: keyof StudentGroup, value: string) => {
    const gradeFields: (keyof StudentGroup)[] = [
      "noteRapport",
      "notePresentation",
      "noteDiscussion",
      "noteSavoirFaireSavoirEtre",
    ];
    if (gradeFields.includes(field)) {
      if (!validateGrade(value, index, field)) return;
    }
    const updatedStudents = [...students];
    const parsedValue = field === "remarque" ? value : value === "" ? null : Number(value);
    updatedStudents[index][field] = parsedValue as any;
    if (gradeFields.includes(field)) {
      updatedStudents[index].noteTotale = calculateTotal(updatedStudents[index]);
    }
    setStudents(updatedStudents);
  };

  const handleSave = async (index: number) => {
    if (updating !== null || Object.keys(validationErrors).length > 0) return;
    setUpdating(index);
    setError(null);
    setSuccessMessage(null);
    try {
      const student = students[index];
      const evaluation = {
        idSoutenance: student.idSoutenance,
        idGroupe: student.idGroupe,
        idEtudiant: student.idEtudiant,
        noteRapport: student.noteRapport,
        notePresentation: student.notePresentation,
        noteDiscussion: student.noteDiscussion,
        noteSavoirFaireSavoirEtre: student.noteSavoirFaireSavoirEtre,
        remarque: student.remarque,
      };
      const response = await fetch("http://localhost:5000/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEncadrant, evaluation }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error saving evaluation");
      }
      const result = await response.json();
      setSuccessMessage(result.message || "Evaluation saved successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      await fetchStudents();
    } catch (error: any) {
      setError(error.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdate = async (index: number) => {
    if (updating !== null || Object.keys(validationErrors).length > 0) return;
    setUpdating(index);
    setError(null);
    setSuccessMessage(null);
    try {
      const student = students[index];
      const evaluation = {
        idSoutenance: student.idSoutenance,
        idGroupe: student.idGroupe,
        idEtudiant: student.idEtudiant,
        noteRapport: student.noteRapport,
        notePresentation: student.notePresentation,
        noteDiscussion: student.noteDiscussion,
        noteSavoirFaireSavoirEtre: student.noteSavoirFaireSavoirEtre,
        remarque: student.remarque,
      };
      const response = await fetch("http://localhost:5000/api/evaluations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEncadrant, evaluation }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating evaluation");
      }
      const result = await response.json();
      setSuccessMessage(result.message || "Evaluation updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      await fetchStudents();
    } catch (error: any) {
      setError(error.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setUpdating(null);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/generate-pdf/${idEncadrant}`, { method: "GET" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error generating PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "evaluations.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage("PDF generated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setError(error.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#EFEFEE]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b17a56]"></div>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#EFEFEE] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#b17a56] to-[#5b8cb5] bg-clip-text text-transparent">
          Évaluation des Étudiants
        </h1>
        <p className="text-muted-foreground mt-2">Gestion des notes et évaluations des soutenances</p>
      </div>

      {successMessage && (
        <Alert variant="default" className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-medium">Succès</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-[#b17a56]/10 shadow-md bg-[#EFEFEE] mb-8">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-[#b17a56]">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Grille d'Évaluation
              </div>
            </CardTitle>
            <Button
              onClick={handleGeneratePDF}
              className="bg-[#5b8cb5] hover:bg-[#5b8cb5]/90 text-[#EFEFEE] rounded-full px-4 py-2 flex items-center gap-2"
            >
              <FileDown className="h-5 w-5" />
              Exporter en PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun étudiant trouvé</h3>
              <p className="text-muted-foreground max-w-md">
                Il n'y a actuellement aucun étudiant à évaluer. Veuillez vérifier votre affectation ou contacter
                l'administration.
              </p>
            </div>
          ) : (
            <Tabs defaultValue={Object.keys(studentGroups)[0].toString()} className="w-full">
              <TabsList className="mb-6 flex flex-wrap bg-[#EFEFEE] p-1 border rounded-lg">
                {Object.values(studentGroups).map((group) => (
                  <TabsTrigger
                    key={group.id}
                    value={group.id.toString()}
                    className="data-[state=active]:bg-[#b17a56] data-[state=active]:text-[#EFEFEE] rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {group.name}
                      <Badge variant="secondary" className="ml-1 bg-[#5b8cb5]/20 text-[#5b8cb5]">
                        {group.students.length}
                      </Badge>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.values(studentGroups).map((group) => (
                <TabsContent key={group.id} value={group.id.toString()} className="border rounded-lg p-4 bg-[#EFEFEE]">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-[#b17a56]" />
                    <h3 className="text-lg font-semibold">Groupe: {group.name}</h3>
                  </div>

                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader className="bg-[#b17a56]/10">
                        <TableRow>
                          <TableHead className="font-semibold">Étudiant</TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex items-center justify-center gap-1">
                              <FileText className="h-4 w-4 text-[#b17a56]" />
                              Rapport (/20)
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex items-center justify-center gap-1">
                              <Presentation className="h-4 w-4 text-[#b17a56]" />
                              Présentation (/20)
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex items-center justify-center gap-1">
                              <MessageSquare className="h-4 w-4 text-[#b17a56]" />
                              Discussion (/20)
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex items-center justify-center gap-1">
                              <Award className="h-4 w-4 text-[#b17a56]" />
                              Savoir-faire & Savoir-être (/20)
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex items-center justify-center gap-1">
                              <CheckCircle className="h-4 w-4 text-[#b17a56]" />
                              Total (/20)
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold">Remarque</TableHead>
                          <TableHead className="text-center font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.students.map((student, idx) => {
                          const studentIndex = students.findIndex(
                            (s) =>
                              s.idSoutenance === student.idSoutenance &&
                              s.idGroupe === student.idGroupe &&
                              s.idEtudiant === student.idEtudiant,
                          );
                          return (
                            <TableRow
                              key={`${student.idSoutenance}-${student.idGroupe}-${student.idEtudiant}`}
                              className={idx % 2 === 0 ? "bg-[#EFEFEE]" : "bg-[#EFEFEE]/50"}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4 text-[#5b8cb5]" />
                                  {student.etudiant}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.01"
                                  value={student.noteRapport ?? ""}
                                  onChange={(e) => handleInputChange(studentIndex, "noteRapport", e.target.value)}
                                  className={`text-center bg-[#EFEFEE] ${
                                    validationErrors[`${studentIndex}-noteRapport`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                />
                                {validationErrors[`${studentIndex}-noteRapport`] && (
                                  <span className="text-red-500 text-xs">
                                    {validationErrors[`${studentIndex}-noteRapport`]}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.01"
                                  value={student.notePresentation ?? ""}
                                  onChange={(e) => handleInputChange(studentIndex, "notePresentation", e.target.value)}
                                  className={`text-center bg-[#EFEFEE] ${
                                    validationErrors[`${studentIndex}-notePresentation`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                />
                                {validationErrors[`${studentIndex}-notePresentation`] && (
                                  <span className="text-red-500 text-xs">
                                    {validationErrors[`${studentIndex}-notePresentation`]}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.01"
                                  value={student.noteDiscussion ?? ""}
                                  onChange={(e) => handleInputChange(studentIndex, "noteDiscussion", e.target.value)}
                                  className={`text-center bg-[#EFEFEE] ${
                                    validationErrors[`${studentIndex}-noteDiscussion`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                />
                                {validationErrors[`${studentIndex}-noteDiscussion`] && (
                                  <span className="text-red-500 text-xs">
                                    {validationErrors[`${studentIndex}-noteDiscussion`]}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.01"
                                  value={student.noteSavoirFaireSavoirEtre ?? ""}
                                  onChange={(e) =>
                                    handleInputChange(studentIndex, "noteSavoirFaireSavoirEtre", e.target.value)
                                  }
                                  className={`text-center bg-[#EFEFEE] ${
                                    validationErrors[`${studentIndex}-noteSavoirFaireSavoirEtre`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                />
                                {validationErrors[`${studentIndex}-noteSavoirFaireSavoirEtre`] && (
                                  <span className="text-red-500 text-xs">
                                    {validationErrors[`${studentIndex}-noteSavoirFaireSavoirEtre`]}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className={`px-3 py-1 ${
                                    student.noteTotale !== undefined && student.noteTotale !== null
                                      ? student.noteTotale >= 10
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-red-100 text-red-800 border-red-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                                  }`}
                                >
                                  {student.noteTotale !== undefined && student.noteTotale !== null
                                    ? student.noteTotale.toFixed(2)
                                    : "-"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Textarea
                                  value={student.remarque ?? ""}
                                  onChange={(e) => handleInputChange(studentIndex, "remarque", e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md bg-[#EFEFEE]"
                                  rows={2}
                                  placeholder="Commentaires sur la performance..."
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    onClick={() => handleSave(studentIndex)}
                                    disabled={updating === studentIndex || Object.keys(validationErrors).length > 0}
                                    className="w-full bg-[#b17a56] hover:bg-[#b17a56]/90 text-[#EFEFEE]"
                                    size="sm"
                                  >
                                    {updating === studentIndex ? (
                                      <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#EFEFEE] mr-2"></div>
                                        Sauvegarde...
                                      </div>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4 mr-1" /> Sauvegarder
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => handleUpdate(studentIndex)}
                                    disabled={updating === studentIndex || Object.keys(validationErrors).length > 0}
                                    className="w-full bg-[#5b8cb5] hover:bg-[#5b8cb5]/90 text-[#EFEFEE]"
                                    size="sm"
                                  >
                                    {updating === studentIndex ? (
                                      <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#EFEFEE] mr-2"></div>
                                        Mise à jour...
                                      </div>
                                    ) : (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-1" /> Mettre à jour
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationPage;