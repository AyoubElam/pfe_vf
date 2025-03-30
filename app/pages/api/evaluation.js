/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import db from "../../../config/db.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const router = express.Router();

// Helper function to convert grade fields to numbers or null
const convertGradesToNumbers = (row) => ({
  ...row,
  noteRapport: row.noteRapport != null && !isNaN(Number(row.noteRapport)) ? Number(row.noteRapport) : null,
  notePresentation: row.notePresentation != null && !isNaN(Number(row.notePresentation)) ? Number(row.notePresentation) : null,
  noteDiscussion: row.noteDiscussion != null && !isNaN(Number(row.noteDiscussion)) ? Number(row.noteDiscussion) : null,
  noteSavoirFaireSavoirEtre: row.noteSavoirFaireSavoirEtre != null && !isNaN(Number(row.noteSavoirFaireSavoirEtre)) ? Number(row.noteSavoirFaireSavoirEtre) : null,
  noteTotale: row.noteTotale != null && !isNaN(Number(row.noteTotale)) ? Number(row.noteTotale) : null,
});

// GET /groups-students/:idEncadrant
router.get("/groups-students/:idEncadrant", async (req, res) => {
  const { idEncadrant } = req.params;
  const idEncadrantNum = parseInt(idEncadrant, 10);
  if (isNaN(idEncadrantNum)) {
    return res.status(400).json({ error: "idEncadrant must be a valid number" });
  }

  try {
    const query = `
      SELECT DISTINCT
        g.idGroupe,
        g.nomGroupe,
        e.idEtudiant,
        CONCAT(e.nom, ' ', e.prenom) AS etudiant,
        s.idSoutenance,
        ev.noteRapport,
        ev.notePresentation,
        ev.noteDiscussion,
        ev.noteSavoirFaireSavoirEtre,
        ev.noteTotale,
        ev.remarque
      FROM smart.soutenance s
      JOIN smart.soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
      JOIN smart.groupe g ON sg.idGroupe = g.idGroupe
      JOIN smart.etudiantgroupe eg ON g.idGroupe = eg.idGroupe
      JOIN smart.etudiant e ON eg.idEtudiant = e.idEtudiant
      JOIN smart.soutenance_jury sj ON s.idSoutenance = sj.idSoutenance
      JOIN smart.jury j ON sj.idJury = j.idJury
      LEFT JOIN smart.evaluation ev ON e.idEtudiant = ev.idEtudiant 
        AND g.idGroupe = ev.idGroupe
        AND s.idSoutenance = ev.idSoutenance
        AND ev.idEncadrant = ?
      WHERE j.idEncadrant = ?
      GROUP BY e.idEtudiant, g.idGroupe, s.idSoutenance
      ORDER BY g.idGroupe, e.nom;
    `;
    const [rows] = await db.promise().query(query, [idEncadrantNum, idEncadrantNum]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No students found for this jury member" });
    }
    const students = rows.map(convertGradesToNumbers);
    console.log("Backend response for idEncadrant", idEncadrantNum, ":", students);
    res.json(students);
  } catch (error) {
    console.error("SQL Error in GET /groups-students:", error.message);
    res.status(500).json({ error: "Server error fetching student data", details: error.message });
  }
});

// POST /evaluations
router.post("/evaluations", async (req, res) => {
  const { idEncadrant, evaluation } = req.body;

  if (!idEncadrant || typeof idEncadrant !== "number") {
    return res.status(400).json({ error: "idEncadrant must be a number" });
  }
  if (!evaluation || typeof evaluation !== "object") {
    return res.status(400).json({ error: "Evaluation data is required" });
  }

  const { idSoutenance, idEtudiant, idGroupe, noteRapport, notePresentation, noteDiscussion, noteSavoirFaireSavoirEtre, remarque } = evaluation;

  if (!idSoutenance || !idEtudiant || !idGroupe) {
    return res.status(400).json({ error: "idSoutenance, idEtudiant, and idGroupe are required" });
  }

  const validateGrade = (grade, field) => {
    if (grade !== undefined && (typeof grade !== "number" || isNaN(grade) || grade < 0 || grade > 20)) {
      throw new Error(`${field} must be a number between 0 and 20`);
    }
    return typeof grade === "number" ? grade : null;
  };

  try {
    const validatedNotes = {
      noteRapport: validateGrade(noteRapport, "noteRapport"),
      notePresentation: validateGrade(notePresentation, "notePresentation"),
      noteDiscussion: validateGrade(noteDiscussion, "noteDiscussion"),
      noteSavoirFaireSavoirEtre: validateGrade(noteSavoirFaireSavoirEtre, "noteSavoirFaireSavoirEtre"),
    };

    const notes = Object.values(validatedNotes).filter(n => n !== null);
    const noteTotale = notes.length > 0 ? Number((notes.reduce((sum, val) => sum + val, 0) / notes.length).toFixed(2)) : null;

    await db.promise().query(
      `INSERT INTO smart.evaluation (
        idSoutenance, idEtudiant, idGroupe, idEncadrant,
        noteRapport, notePresentation, noteDiscussion,
        noteSavoirFaireSavoirEtre, noteTotale, remarque
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        noteRapport = VALUES(noteRapport),
        notePresentation = VALUES(notePresentation),
        noteDiscussion = VALUES(noteDiscussion),
        noteSavoirFaireSavoirEtre = VALUES(noteSavoirFaireSavoirEtre),
        noteTotale = VALUES(noteTotale),
        remarque = VALUES(remarque)`,
      [
        idSoutenance,
        idEtudiant,
        idGroupe,
        idEncadrant,
        validatedNotes.noteRapport,
        validatedNotes.notePresentation,
        validatedNotes.noteDiscussion,
        validatedNotes.noteSavoirFaireSavoirEtre,
        noteTotale,
        remarque || null,
      ]
    );

    res.json({ message: "Evaluation saved successfully!", noteTotale });
  } catch (error) {
    console.error("SQL Error in POST /evaluations:", error.message);
    res.status(500).json({ error: error.message || "Error saving evaluation" });
  }
});

// PUT /evaluations
router.put("/evaluations", async (req, res) => {
  const { idEncadrant, evaluation } = req.body;

  if (!idEncadrant || typeof idEncadrant !== "number") {
    return res.status(400).json({ error: "idEncadrant must be a number" });
  }
  if (!evaluation || typeof evaluation !== "object") {
    return res.status(400).json({ error: "Evaluation data is required" });
  }

  const { idSoutenance, idEtudiant, idGroupe, noteRapport, notePresentation, noteDiscussion, noteSavoirFaireSavoirEtre, noteTotale, remarque } = evaluation;

  if (!idEncadrant || !idSoutenance || !idEtudiant || !idGroupe) {
    return res.status(400).json({ error: "idEncadrant, idSoutenance, idEtudiant, and idGroupe are required" });
  }

  const validateGrade = (grade, field) => {
    if (grade !== undefined && (typeof grade !== "number" || isNaN(grade) || grade < 0 || grade > 20)) {
      throw new Error(`${field} must be a number between 0 and 20`);
    }
    return typeof grade === "number" ? grade : null;
  };

  try {
    const validatedNotes = {
      noteRapport: validateGrade(noteRapport, "noteRapport"),
      notePresentation: validateGrade(notePresentation, "notePresentation"),
      noteDiscussion: validateGrade(noteDiscussion, "noteDiscussion"),
      noteSavoirFaireSavoirEtre: validateGrade(noteSavoirFaireSavoirEtre, "noteSavoirFaireSavoirEtre"),
      noteTotale: validateGrade(noteTotale, "noteTotale"),
    };

    const [result] = await db.promise().query(
      `UPDATE smart.evaluation
       SET noteRapport = ?, notePresentation = ?, noteDiscussion = ?, 
           noteSavoirFaireSavoirEtre = ?, noteTotale = ?, remarque = ?
       WHERE idSoutenance = ? AND idEtudiant = ? AND idGroupe = ? AND idEncadrant = ?`,
      [
        validatedNotes.noteRapport,
        validatedNotes.notePresentation,
        validatedNotes.noteDiscussion,
        validatedNotes.noteSavoirFaireSavoirEtre,
        validatedNotes.noteTotale,
        remarque || "",
        idSoutenance,
        idEtudiant,
        idGroupe,
        idEncadrant,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Évaluation non trouvée pour mise à jour" });
    }

    res.json({ message: "Évaluation mise à jour avec succès!" });
  } catch (error) {
    console.error("SQL Error in PUT /evaluations:", error.message);
    res.status(500).json({ error: error.message || "Erreur lors de la mise à jour" });
  }
});

// GET /generate-pdf/:idEncadrant
router.get("/generate-pdf/:idEncadrant", async (req, res) => {
  const { idEncadrant } = req.params;
  const idEncadrantNum = parseInt(idEncadrant, 10);
  if (isNaN(idEncadrantNum)) {
    return res.status(400).json({ error: "idEncadrant must be a valid number" });
  }

  try {
    const query = `
      SELECT DISTINCT
        g.idGroupe,
        g.nomGroupe,
        e.idEtudiant,
        CONCAT(e.nom, ' ', e.prenom) AS etudiant,
        s.idSoutenance,
        ev.noteRapport,
        ev.notePresentation,
        ev.noteDiscussion,
        ev.noteSavoirFaireSavoirEtre,
        ev.noteTotale,
        ev.remarque
      FROM smart.soutenance s
      JOIN smart.soutenance_groupe sg ON s.idSoutenance = sg.idSoutenance
      JOIN smart.groupe g ON sg.idGroupe = g.idGroupe
      JOIN smart.etudiantgroupe eg ON g.idGroupe = eg.idGroupe
      JOIN smart.etudiant e ON eg.idEtudiant = e.idEtudiant
      JOIN smart.soutenance_jury sj ON s.idSoutenance = sj.idSoutenance
      JOIN smart.jury j ON sj.idJury = j.idJury
      LEFT JOIN smart.evaluation ev ON e.idEtudiant = ev.idEtudiant 
        AND g.idGroupe = ev.idGroupe
        AND s.idSoutenance = ev.idSoutenance
        AND ev.idEncadrant = ?
      WHERE j.idEncadrant = ?
      GROUP BY e.idEtudiant, g.idGroupe, s.idSoutenance
      ORDER BY g.idGroupe, e.nom;
    `;
    
    const [rows] = await db.promise().query(query, [idEncadrantNum, idEncadrantNum]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No students found for this jury member" });
    }

    const students = rows.map(row => ({
      ...row,
      noteRapport: row.noteRapport != null ? Number(row.noteRapport) : null,
      notePresentation: row.notePresentation != null ? Number(row.notePresentation) : null,
      noteDiscussion: row.noteDiscussion != null ? Number(row.noteDiscussion) : null,
      noteSavoirFaireSavoirEtre: row.noteSavoirFaireSavoirEtre != null ? Number(row.noteSavoirFaireSavoirEtre) : null,
      noteTotale: row.noteTotale != null ? Number(row.noteTotale) : null
    }));

    const groups = {};
    students.forEach(student => {
      if (!groups[student.idGroupe]) {
        groups[student.idGroupe] = {
          id: student.idGroupe,
          name: student.nomGroupe,
          students: []
        };
      }
      groups[student.idGroupe].students.push(student);
    });

    const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="evaluations-${idEncadrantNum}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).text("Évaluation des Étudiants", { align: "center" });
    doc.moveDown();

    Object.values(groups).forEach((group, groupIndex) => {
      if (groupIndex > 0) doc.addPage();
      const tableTop = doc.y;
      const tableLeft = 40;
      const colWidths = [60, 100, 50, 50, 50, 70, 50, 90];
      const rowHeight = 25;

      const headers = [
        "Groupe N°",
        "Étudiant",
        "Rapport (/20)",
        "Présentation (/20)",
        "Discussion (/20)",
        "Savoir-faire & Savoir-être (/20)",
        "Total (/20)",
        "Remarques"
      ];

      let y = tableTop;
      doc.rect(tableLeft, y, colWidths.reduce((sum, w) => sum + w, 0), rowHeight).fill("#d6e5f5");
      let x = tableLeft;
      doc.fillColor("#000000");
      headers.forEach((header, i) => {
        doc.fontSize(8).text(header, x + 2, y + 8, { width: colWidths[i] - 4, align: "center" });
        x += colWidths[i];
      });
      doc.rect(tableLeft, y, colWidths.reduce((sum, w) => sum + w, 0), rowHeight).stroke();
      x = tableLeft;
      headers.forEach((_, i) => {
        if (i < headers.length - 1) {
          x += colWidths[i];
          doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
        }
      });

      y += rowHeight;
      const totalRowHeight = group.students.length * rowHeight;
      doc.rect(tableLeft, y, colWidths[0], totalRowHeight).stroke();
      doc.fontSize(10).fillColor("#000000").text(group.id.toString(), tableLeft, y + (totalRowHeight / 2) - 5, { width: colWidths[0], align: "center" });

      group.students.forEach((student, index) => {
        if (y + rowHeight > doc.page.height - 50) {
          doc.addPage();
          y = 50;
        }
        if (index % 2 === 0) {
          doc.rect(tableLeft + colWidths[0], y, colWidths.reduce((sum, w) => sum + w, 0) - colWidths[0], rowHeight).fill("#f2f7fd");
        }
        x = tableLeft + colWidths[0];
        doc.fillColor("#000000").fontSize(8)
          .text(student.etudiant || "", x + 2, y + 8, { width: colWidths[1] - 4, align: "left" });
        x += colWidths[1];
        doc.text(student.noteRapport != null ? student.noteRapport.toFixed(2) : "", x + 2, y + 8, { width: colWidths[2] - 4, align: "center" });
        x += colWidths[2];
        doc.text(student.notePresentation != null ? student.notePresentation.toFixed(2) : "", x + 2, y + 8, { width: colWidths[3] - 4, align: "center" });
        x += colWidths[3];
        doc.text(student.noteDiscussion != null ? student.noteDiscussion.toFixed(2) : "", x + 2, y + 8, { width: colWidths[4] - 4, align: "center" });
        x += colWidths[4];
        doc.text(student.noteSavoirFaireSavoirEtre != null ? student.noteSavoirFaireSavoirEtre.toFixed(2) : "", x + 2, y + 8, { width: colWidths[5] - 4, align: "center" });
        x += colWidths[5];
        doc.text(student.noteTotale != null ? student.noteTotale.toFixed(2) : "", x + 2, y + 8, { width: colWidths[6] - 4, align: "center" });
        x += colWidths[6];
        doc.text(student.remarque || "", x + 2, y + 8, { width: colWidths[7] - 4, align: "left" });

        doc.rect(tableLeft + colWidths[0], y, colWidths.reduce((sum, w) => sum + w, 0) - colWidths[0], rowHeight).stroke();
        x = tableLeft + colWidths[0];
        for (let i = 1; i < headers.length; i++) {
          if (i < headers.length - 1) {
            x += colWidths[i];
            doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
          }
        }
        y += rowHeight;
      });
      doc.moveDown(2);
    });

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(`Page ${i + 1} sur ${pageCount}`, 0, doc.page.height - 30, { align: "center" });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    res.status(500).json({ error: "Server error generating PDF", details: error.message });
  }
});

export default router;