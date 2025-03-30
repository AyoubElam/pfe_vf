module.exports = {

"[project]/app/components/ListeSoutenances/SoutenanceTable.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
const generateExcelFile = async ()=>{
    try {
        if (!ExcelJS.Workbook) {
            toast({
                title: "Erreur",
                description: "La bibliothèque Excel n'est pas encore chargée. Veuillez réessayer.",
                variant: "destructive"
            });
            return;
        }
        setIsGeneratingExcel(true);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Planning des Soutenances");
        // Title Section
        worksheet.mergeCells("A1:E1");
        worksheet.getCell("A1").value = "Université Cadi Ayyad";
        worksheet.getCell("A1").font = {
            size: 14,
            bold: true
        };
        worksheet.getCell("A1").alignment = {
            horizontal: "center"
        };
        worksheet.mergeCells("A2:D2");
        worksheet.getCell("A2").value = "Ecole Supérieure de Technologie -Safi-";
        worksheet.getCell("A2").font = {
            size: 12,
            bold: true
        };
        worksheet.getCell("A2").alignment = {
            horizontal: "center"
        };
        worksheet.getCell("E2").value = `A.U: ${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
        worksheet.getCell("E2").font = {
            italic: true
        };
        worksheet.getCell("E2").alignment = {
            horizontal: "right"
        };
        worksheet.getCell("A3").value = "Département: Informatique";
        worksheet.getCell("A3").font = {
            bold: true
        };
        worksheet.getCell("A4").value = "Niveau: 2ème Année";
        worksheet.getCell("A4").font = {
            bold: true
        };
        worksheet.mergeCells("A5:E5");
        worksheet.getCell("A5").value = "Planning des Soutenances (PFE)";
        worksheet.getCell("A5").font = {
            size: 14,
            bold: true
        };
        worksheet.getCell("A5").alignment = {
            horizontal: "center"
        };
        worksheet.addRow([]);
        // Table Setup
        const tableStartRow = 7;
        worksheet.getColumn("A").width = 30; // Jury
        worksheet.getColumn("B").width = 25; // Jours
        worksheet.getColumn("C").width = 10; // N°
        worksheet.getColumn("D").width = 40; // Nom
        worksheet.getColumn("E").width = 15; // Lieu
        const headerRow = worksheet.addRow([
            "Jury",
            "Jours",
            "N°",
            "Nom",
            "Lieu"
        ]);
        headerRow.eachCell((cell)=>{
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: "9FC5E8"
                }
            };
            cell.border = {
                top: {
                    style: "thin"
                },
                left: {
                    style: "thin"
                },
                bottom: {
                    style: "thin"
                },
                right: {
                    style: "thin"
                }
            };
            cell.font = {
                bold: true,
                size: 12
            };
            cell.alignment = {
                vertical: "middle",
                horizontal: "center"
            };
        });
        let rowIndex = tableStartRow + 1;
        const juryGroups = groupSoutenancesByJury(filteredSoutenances);
        Object.entries(juryGroups).forEach(([juryNames, soutenances])=>{
            const formattedJuryNames = juryNames.split(", ").map((name)=>name.trim()).join("\n");
            const dateGroups = {};
            soutenances.forEach((soutenance)=>{
                const dateKey = `${formatDate(soutenance.date)} à ${soutenance.time}`;
                if (!dateGroups[dateKey]) {
                    dateGroups[dateKey] = [];
                }
                dateGroups[dateKey].push(soutenance);
            });
            // Calculate total rows for this jury
            let totalRows = 0;
            Object.values(dateGroups).forEach((dateSoutenances)=>{
                dateSoutenances.forEach((soutenance)=>{
                    soutenance.groupNames.forEach((groupName)=>{
                        const group = groups.find((g)=>g.nomGroupe === groupName);
                        totalRows += group && group.students.length > 0 ? group.students.length : 1;
                    });
                });
            });
            // Merge cells for Jury and Lieu
            if (totalRows > 0) {
                worksheet.mergeCells(`A${rowIndex}:A${rowIndex + totalRows - 1}`);
                worksheet.getCell(`A${rowIndex}`).value = formattedJuryNames;
                worksheet.getCell(`A${rowIndex}`).alignment = {
                    vertical: "middle",
                    horizontal: "center",
                    wrapText: true
                };
                worksheet.getCell(`A${rowIndex}`).font = {
                    bold: true,
                    size: 11
                };
                worksheet.getCell(`A${rowIndex}`).border = {
                    top: {
                        style: "thin"
                    },
                    left: {
                        style: "thin"
                    },
                    bottom: {
                        style: "thin"
                    },
                    right: {
                        style: "thin"
                    }
                };
                worksheet.mergeCells(`E${rowIndex}:E${rowIndex + totalRows - 1}`);
                worksheet.getCell(`E${rowIndex}`).value = soutenances[0].location;
                worksheet.getCell(`E${rowIndex}`).alignment = {
                    vertical: "middle",
                    horizontal: "center",
                    wrapText: true
                };
                worksheet.getCell(`E${rowIndex}`).border = {
                    top: {
                        style: "thin"
                    },
                    left: {
                        style: "thin"
                    },
                    bottom: {
                        style: "thin"
                    },
                    right: {
                        style: "thin"
                    }
                };
            }
            Object.entries(dateGroups).forEach(([dateTime, dateSoutenances])=>{
                let dateRowCount = 0;
                const groupsForDate = dateSoutenances.flatMap((s)=>s.groupNames.map((groupName)=>{
                        const group = groups.find((g)=>g.nomGroupe === groupName);
                        const studentCount = group && group.students.length > 0 ? group.students.length : 1;
                        dateRowCount += studentCount;
                        return {
                            groupName,
                            groupNumber: group ? group.nomGroupe : groupName,
                            students: group && group.students ? group.students : []
                        };
                    }));
                groupsForDate.sort((a, b)=>{
                    const numA = Number.parseInt(a.groupNumber.replace(/\D/g, "")) || 0;
                    const numB = Number.parseInt(b.groupNumber.replace(/\D/g, "")) || 0;
                    return numA - numB;
                });
                // Merge date cells
                if (dateRowCount > 0) {
                    worksheet.mergeCells(`B${rowIndex}:B${rowIndex + dateRowCount - 1}`);
                    worksheet.getCell(`B${rowIndex}`).value = dateTime;
                    worksheet.getCell(`B${rowIndex}`).alignment = {
                        vertical: "middle",
                        horizontal: "center",
                        wrapText: true
                    };
                    worksheet.getCell(`B${rowIndex}`).font = {
                        bold: true,
                        size: 11
                    };
                    worksheet.getCell(`B${rowIndex}`).border = {
                        top: {
                            style: "thin"
                        },
                        left: {
                            style: "thin"
                        },
                        bottom: {
                            style: "thin"
                        },
                        right: {
                            style: "thin"
                        }
                    };
                }
                groupsForDate.forEach((group)=>{
                    if (group.students.length === 0) {
                        const row = worksheet.addRow([
                            null,
                            null,
                            group.groupNumber,
                            group.groupName,
                            null
                        ]);
                        row.eachCell((cell, colNumber)=>{
                            if (colNumber === 3) {
                                cell.alignment = {
                                    vertical: "middle",
                                    horizontal: "center"
                                };
                            } else if (colNumber === 4) {
                                cell.alignment = {
                                    vertical: "middle",
                                    horizontal: "left"
                                };
                            }
                            cell.border = {
                                top: {
                                    style: "thin"
                                },
                                left: {
                                    style: "thin"
                                },
                                bottom: {
                                    style: "thin"
                                },
                                right: {
                                    style: "thin"
                                }
                            };
                        });
                        rowIndex++;
                    } else {
                        group.students.forEach((student, idx)=>{
                            const row = worksheet.addRow([
                                null,
                                null,
                                idx === 0 ? group.groupNumber : "",
                                idx === 0 ? group.groupName : student,
                                null
                            ]);
                            row.eachCell((cell, colNumber)=>{
                                if (colNumber === 3) {
                                    cell.alignment = {
                                        vertical: "middle",
                                        horizontal: "center"
                                    };
                                } else if (colNumber === 4) {
                                    cell.alignment = {
                                        vertical: "middle",
                                        horizontal: "left"
                                    };
                                }
                                cell.border = {
                                    top: {
                                        style: "thin"
                                    },
                                    left: {
                                        style: "thin"
                                    },
                                    bottom: {
                                        style: "thin"
                                    },
                                    right: {
                                        style: "thin"
                                    }
                                };
                            });
                            rowIndex++;
                        });
                    }
                });
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([
            buffer
        ], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `planning_soutenances_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        toast({
            title: "Téléchargement réussi",
            description: "Le fichier Excel a été généré avec succès.",
            variant: "default"
        });
    } catch (error) {
        console.error("Error generating Excel file:", error);
        toast({
            title: "Erreur",
            description: "Une erreur s'est produite lors de la génération du fichier Excel.",
            variant: "destructive"
        });
    } finally{
        setIsGeneratingExcel(false);
    }
};
}}),
"[project]/app/pages/ListeSoutenances/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* eslint-disable @typescript-eslint/no-explicit-any */ __turbopack_context__.s({
    "default": (()=>ListeSoutenances)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ListeSoutenances$2f$SoutenanceTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/ListeSoutenances/SoutenanceTable.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ListeSoutenances() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [soutenances, setSoutenances] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchSoutenances = async ()=>{
            try {
                const response = await fetch("http://localhost:5000/api/soutenance");
                if (!response.ok) {
                    throw new Error("Failed to fetch soutenances");
                }
                const data = await response.json();
                setSoutenances(data);
            } catch (err) {
                setError(err?.message || "Something went wrong");
            } finally{
                setLoading(false);
            }
        };
        fetchSoutenances();
    }, []);
    const handleEdit = (id)=>{
        router.push(`/edit-soutenance/${id}`);
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/app/pages/ListeSoutenances/page.tsx",
            lineNumber: 50,
            columnNumber: 12
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-red-500",
            children: [
                "Error: ",
                error
            ]
        }, void 0, true, {
            fileName: "[project]/app/pages/ListeSoutenances/page.tsx",
            lineNumber: 54,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-4xl font-bold mb-8",
                children: "📋 Liste des Soutenances"
            }, void 0, false, {
                fileName: "[project]/app/pages/ListeSoutenances/page.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ListeSoutenances$2f$SoutenanceTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                soutenances: soutenances,
                onEdit: handleEdit
            }, void 0, false, {
                fileName: "[project]/app/pages/ListeSoutenances/page.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/pages/ListeSoutenances/page.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=app_d3cce4ed._.js.map