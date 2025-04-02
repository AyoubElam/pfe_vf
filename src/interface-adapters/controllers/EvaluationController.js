// src/interface-adapters/controllers/EvaluationController.js
import EvaluationRepository from "../../application/repositories/EvaluationRepository.js";
import PDFDocument from "pdfkit";

export default class EvaluationController {
  constructor() {
    this.evaluationRepository = new EvaluationRepository();
  }
  
  async getGroupsStudents(req, res) {
    const { idEncadrant } = req.params;
    
    if (!idEncadrant) {
      return res.status(400).json({ error: "idEncadrant is required" });
    }
    
    try {
      const students = await this.evaluationRepository.findByEncadrant(idEncadrant);
      res.json(students);
    } catch (error) {
      if (error.message === "No students found for this encadrant") {
        return res.status(404).json({ message: error.message });
      }
      console.error("SQL Error in GET /groups-students:", error.message);
      res.status(500).json({ error: "Server error fetching student data", details: error.message });
    }
  }
  
  async generatePDF(req, res) {
    const { idEncadrant } = req.params;
    
    if (!idEncadrant) {
      return res.status(400).json({ error: "idEncadrant is required" });
    }
    
    try {
      const students = await this.evaluationRepository.findByEncadrant(idEncadrant);
      
      // Group students by group
      const groups = {};
      students.forEach((student) => {
        if (!groups[student.idGroupe]) {
          groups[student.idGroupe] = {
            id: student.idGroupe,
            name: student.nomGroupe,
            students: [],
          };
        }
        groups[student.idGroupe].students.push(student);
      });
      
      // Generate PDF
      const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="evaluations-${idEncadrant}.pdf"`);
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
          "Remarques",
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
        doc.fontSize(10).fillColor("#000000").text(group.id.toString(), tableLeft, y + totalRowHeight / 2 - 5, {
          width: colWidths[0],
          align: "center",
        });
        
        group.students.forEach((student, index) => {
          if (y + rowHeight > doc.page.height - 50) {
            doc.addPage();
            y = 50;
          }
          if (index % 2 === 0) {
            doc
              .rect(tableLeft + colWidths[0], y, colWidths.reduce((sum, w) => sum + w, 0) - colWidths[0], rowHeight)
              .fill("#f2f7fd");
          }
          x = tableLeft + colWidths[0];
          doc
            .fillColor("#000000")
            .fontSize(8)
            .text(student.etudiant || "", x + 2, y + 8, { width: colWidths[1] - 4, align: "left" });
          x += colWidths[1];
          doc.text(student.noteRapport != null ? student.noteRapport.toFixed(2) : "", x + 2, y + 8, {
            width: colWidths[2] - 4,
            align: "center",
          });
          x += colWidths[2];
          doc.text(student.notePresentation != null ? student.notePresentation.toFixed(2) : "", x + 2, y + 8, {
            width: colWidths[3] - 4,
            align: "center",
          });
          x += colWidths[3];
          doc.text(student.noteDiscussion != null ? student.noteDiscussion.toFixed(2) : "", x + 2, y + 8, {
            width: colWidths[4] - 4,
            align: "center",
          });
          x += colWidths[4];
          doc.text(
            student.noteSavoirFaireSavoirEtre != null ? student.noteSavoirFaireSavoirEtre.toFixed(2) : "",
            x + 2,
            y + 8,
            { width: colWidths[5] - 4, align: "center" },
          );
          x += colWidths[5];
          doc.text(student.noteTotale != null ? student.noteTotale.toFixed(2) : "", x + 2, y + 8, {
            width: colWidths[6] - 4,
            align: "center",
          });
          x += colWidths[6];
          doc.text(student.remarque || "", x + 2, y + 8, { width: colWidths[7] - 4, align: "left" });
          
          doc
            .rect(tableLeft + colWidths[0], y, colWidths.reduce((sum, w) => sum + w, 0) - colWidths[0], rowHeight)
            .stroke();
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
  }
  
  async createEvaluation(req, res) {
    const { idEncadrant, evaluation } = req.body;
    
    if (!idEncadrant || !evaluation || typeof evaluation !== "object") {
      return res.status(400).json({ error: "idEncadrant and evaluation data are required" });
    }
    
    try {
      const result = await this.evaluationRepository.createOrUpdate({
        ...evaluation,
        idEncadrant
      });
      
      res.json({ message: "Evaluation saved successfully!", noteTotale: result.noteTotale });
    } catch (error) {
      console.error("SQL Error in POST /evaluations:", error.message);
      res.status(500).json({ error: error.message || "Error saving evaluation" });
    }
  }
  
  async updateEvaluation(req, res) {
    const { idEncadrant, evaluation } = req.body;
    
    if (!idEncadrant || !evaluation || typeof evaluation !== "object") {
      return res.status(400).json({ error: "idEncadrant and evaluation data are required" });
    }
    
    try {
      await this.evaluationRepository.update({
        ...evaluation,
        idEncadrant
      });
      
      res.json({ message: "Evaluation updated successfully!" });
    } catch (error) {
      console.error("SQL Error in PUT /evaluations:", error.message);
      res.status(500).json({ error: error.message || "Error updating evaluation" });
    }
  }
}