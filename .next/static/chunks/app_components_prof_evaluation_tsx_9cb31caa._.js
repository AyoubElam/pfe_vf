(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/app_components_prof_evaluation_tsx_9cb31caa._.js", {

"[project]/app/components/prof/evaluation.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/* eslint-disable @typescript-eslint/no-explicit-any */ /* eslint-disable react/no-unescaped-entities */ __turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const EvaluationPage = ()=>{
    _s();
    const [students, setStudents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [updating, setUpdating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [successMessage, setSuccessMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [validationErrors, setValidationErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const idEncadrant = 1; // For example purposes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EvaluationPage.useEffect": ()=>{
            async function fetchStudents() {
                try {
                    const res = await fetch(`http://localhost:5000/api/groups-students/${idEncadrant}`);
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || "Erreur lors du chargement des données");
                    }
                    const data = await res.json();
                    if (data.some({
                        "EvaluationPage.useEffect.fetchStudents": (student)=>!student.idSoutenance
                    }["EvaluationPage.useEffect.fetchStudents"])) {
                        throw new Error("Some students are missing idSoutenance from the backend");
                    }
                    const studentsWithTotal = data.map({
                        "EvaluationPage.useEffect.fetchStudents.studentsWithTotal": (student)=>({
                                ...student,
                                noteTotale: calculateTotal(student)
                            })
                    }["EvaluationPage.useEffect.fetchStudents.studentsWithTotal"]);
                    setStudents(studentsWithTotal);
                } catch (error) {
                    setError(error.message);
                } finally{
                    setLoading(false);
                }
            }
            fetchStudents();
        }
    }["EvaluationPage.useEffect"], [
        idEncadrant
    ]);
    const calculateTotal = (student)=>{
        const grades = [
            student.noteRapport,
            student.notePresentation,
            student.noteDiscussion,
            student.noteSavoirFaireSavoirEtre
        ].filter((grade)=>grade !== undefined && !isNaN(grade));
        if (grades.length === 0) return undefined;
        const sum = grades.reduce((acc, grade)=>acc + grade, 0);
        return Number((sum / grades.length).toFixed(2));
    };
    const validateGrade = (value, index, field)=>{
        const numValue = Number(value);
        const errorKey = `${index}-${field}`;
        if (value && (isNaN(numValue) || numValue < 0 || numValue > 20)) {
            setValidationErrors((prev)=>({
                    ...prev,
                    [errorKey]: "La note doit être entre 0 et 20"
                }));
            return false;
        } else {
            setValidationErrors((prev)=>{
                const newErrors = {
                    ...prev
                };
                delete newErrors[errorKey];
                return newErrors;
            });
            return true;
        }
    };
    const handleInputChange = (index, field, value)=>{
        const gradeFields = [
            "noteRapport",
            "notePresentation",
            "noteDiscussion",
            "noteSavoirFaireSavoirEtre"
        ];
        if (gradeFields.includes(field)) {
            if (!validateGrade(value.toString(), index, field)) return;
        }
        const updatedStudents = [
            ...students
        ];
        const parsedValue = field === "remarque" ? value : value === "" ? undefined : Number(value);
        updatedStudents[index][field] = parsedValue;
        if (gradeFields.includes(field)) {
            updatedStudents[index].noteTotale = calculateTotal(updatedStudents[index]);
        }
        setStudents(updatedStudents);
    };
    const handleSave = async (index)=>{
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
                noteTotale: calculateTotal(student),
                remarque: student.remarque
            };
            const response = await fetch("http://localhost:5000/api/evaluations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idEncadrant,
                    evaluation
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la sauvegarde");
            }
            const result = await response.json();
            setSuccessMessage(result.message || "Évaluation sauvegardée avec succès!");
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            const refreshedRes = await fetch(`http://localhost:5000/api/groups-students/${idEncadrant}`);
            const refreshedData = await refreshedRes.json();
            setStudents(refreshedData.map((student)=>({
                    ...student,
                    noteTotale: calculateTotal(student)
                })));
        } catch (error) {
            setError(error.message);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } finally{
            setUpdating(null);
        }
    };
    const handleUpdate = async (index)=>{
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
                noteTotale: calculateTotal(student),
                remarque: student.remarque
            };
            const response = await fetch("http://localhost:5000/api/evaluations", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idEncadrant,
                    evaluation
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la mise à jour");
            }
            const result = await response.json();
            setSuccessMessage(result.message || "Évaluation mise à jour avec succès!");
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            const refreshedRes = await fetch(`http://localhost:5000/api/groups-students/${idEncadrant}`);
            const refreshedData = await refreshedRes.json();
            setStudents(refreshedData.map((student)=>({
                    ...student,
                    noteTotale: calculateTotal(student)
                })));
        } catch (error) {
            setError(error.message);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } finally{
            setUpdating(null);
        }
    };
    const handleGeneratePDF = async ()=>{
        try {
            const response = await fetch(`http://localhost:5000/api/generate-pdf/${idEncadrant}`, {
                method: "GET"
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la génération du PDF");
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
            setSuccessMessage("PDF généré avec succès!");
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } catch (error) {
            setError(error.message);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: "Chargement..."
    }, void 0, false, {
        fileName: "[project]/app/components/prof/evaluation.tsx",
        lineNumber: 219,
        columnNumber: 23
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 max-w-7xl mx-auto",
        children: [
            successMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4 p-4 bg-green-100 text-green-700 rounded",
                children: successMessage
            }, void 0, false, {
                fileName: "[project]/app/components/prof/evaluation.tsx",
                lineNumber: 224,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4 p-4 bg-red-100 text-red-700 rounded",
                children: error
            }, void 0, false, {
                fileName: "[project]/app/components/prof/evaluation.tsx",
                lineNumber: 227,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-bold mb-6",
                children: "Évaluation des étudiants"
            }, void 0, false, {
                fileName: "[project]/app/components/prof/evaluation.tsx",
                lineNumber: 229,
                columnNumber: 7
            }, this),
            students.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Aucun étudiant trouvé."
            }, void 0, false, {
                fileName: "[project]/app/components/prof/evaluation.tsx",
                lineNumber: 231,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full border-collapse",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "bg-gray-200",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Groupe"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 238,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Étudiant"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 239,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Rapport"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 240,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Présentation"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 241,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Discussion"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 242,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Savoir-faire"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 243,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Total"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 244,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Remarque"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 245,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "border p-2",
                                                children: "Action"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                lineNumber: 246,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/prof/evaluation.tsx",
                                        lineNumber: 237,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                    lineNumber: 236,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: students.map((student, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2",
                                                    children: student.nomGroupe
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2",
                                                    children: student.etudiant
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "20",
                                                            step: "0.01",
                                                            value: student.noteRapport ?? "",
                                                            onChange: (e)=>handleInputChange(index, "noteRapport", e.target.value),
                                                            className: `w-full p-1 border rounded ${validationErrors[`${index}-noteRapport`] ? "border-red-500" : ""}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                                            lineNumber: 255,
                                                            columnNumber: 23
                                                        }, this),
                                                        validationErrors[`${index}-noteRapport`] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-xs",
                                                            children: validationErrors[`${index}-noteRapport`]
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                                            lineNumber: 265,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 254,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "20",
                                                            step: "0.01",
                                                            value: student.notePresentation ?? "",
                                                            onChange: (e)=>handleInputChange(index, "notePresentation", e.target.value),
                                                            className: `w-full p-1 border rounded ${validationErrors[`${index}-notePresentation`] ? "border-red-500" : ""}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                                            lineNumber: 269,
                                                            columnNumber: 23
                                                        }, this),
                                                        validationErrors[`${index}-notePresentation`] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-xs",
                                                            children: validationErrors[`${index}-notePresentation`]
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                                            lineNumber: 279,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 268,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "20",
                                                            step: "0.01",
                                                            value: student.noteDiscussion ?? "",
                                                            onChange: (e)=>handleInputChange(index, "noteDiscussion", e.target.value),
                                                            className: `w-full p-1 border rounded ${validationErrors[`${index}-noteDiscussion`] ? "border-red-500" : ""}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                                            lineNumber: 283,
                                                            columnNumber: 23
                                                        }, this),
                                                        validationErrors[`${index}-noteDiscussion`] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-xs",
                                                            children: validationErrors[`${index}-noteDiscussion`]
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                                            lineNumber: 293,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "20",
                                                            step: "0.01",
                                                            value: student.noteSavoirFaireSavoirEtre ?? "",
                                                            onChange: (e)=>handleInputChange(index, "noteSavoirFaireSavoirEtre", e.target.value),
                                                            className: `w-full p-1 border rounded ${validationErrors[`${index}-noteSavoirFaireSavoirEtre`] ? "border-red-500" : ""}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                                            lineNumber: 297,
                                                            columnNumber: 23
                                                        }, this),
                                                        validationErrors[`${index}-noteSavoirFaireSavoirEtre`] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-xs",
                                                            children: validationErrors[`${index}-noteSavoirFaireSavoirEtre`]
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                                            lineNumber: 307,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 296,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2 text-center",
                                                    children: student.noteTotale !== undefined && !isNaN(student.noteTotale) ? student.noteTotale.toFixed(2) : "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        value: student.remarque ?? "",
                                                        onChange: (e)=>handleInputChange(index, "remarque", e.target.value),
                                                        className: "w-full p-1 border rounded",
                                                        rows: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/prof/evaluation.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 315,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "border p-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                onClick: ()=>handleSave(index),
                                                                disabled: updating === index || Object.keys(validationErrors).length > 0,
                                                                className: "w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded",
                                                                children: "Sauvegarder"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                                lineNumber: 325,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                onClick: ()=>handleUpdate(index),
                                                                disabled: updating === index || Object.keys(validationErrors).length > 0,
                                                                className: "w-full bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded",
                                                                children: "Mettre à jour"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/prof/evaluation.tsx",
                                                                lineNumber: 332,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/prof/evaluation.tsx",
                                                        lineNumber: 324,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                                    lineNumber: 323,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, `${student.idSoutenance}-${student.idGroupe}-${student.idEtudiant}`, true, {
                                            fileName: "[project]/app/components/prof/evaluation.tsx",
                                            lineNumber: 251,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/components/prof/evaluation.tsx",
                                    lineNumber: 249,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/prof/evaluation.tsx",
                            lineNumber: 235,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/prof/evaluation.tsx",
                        lineNumber: 234,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleGeneratePDF,
                            className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded",
                            children: "Générer PDF"
                        }, void 0, false, {
                            fileName: "[project]/app/components/prof/evaluation.tsx",
                            lineNumber: 347,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/prof/evaluation.tsx",
                        lineNumber: 346,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/prof/evaluation.tsx",
        lineNumber: 222,
        columnNumber: 5
    }, this);
};
_s(EvaluationPage, "4IfRJeijtoEWdJM10WIVi02iS2k=");
_c = EvaluationPage;
const __TURBOPACK__default__export__ = EvaluationPage;
var _c;
__turbopack_context__.k.register(_c, "EvaluationPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=app_components_prof_evaluation_tsx_9cb31caa._.js.map