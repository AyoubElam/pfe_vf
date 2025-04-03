// src/application/use-cases/evaluation/GenerateEvaluationPDF.js
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export class GenerateEvaluationPDF {
  /**
   * @param {EvaluationRepository} evaluationRepository 
   */
  constructor(evaluationRepository) {
    this.repository = evaluationRepository;
  }

  /**
   * @param {string} idEncadrant
   * @returns {Promise<Buffer>}
   */
  async execute(idEncadrant) {
    const evaluations = await this.repository.getByEncadrant(idEncadrant);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];
      const stream = new PassThrough();
      
      stream.on("data", (chunk) => buffers.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(buffers)));
      stream.on("error", reject);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(18).text("Évaluations des Étudiants", { align: "center" });
      doc.moveDown();

      // Group evaluations by group
      const groups = evaluations.reduce((acc, evaluation) => {
        if (!acc[evaluation.idGroupe]) {
          acc[evaluation.idGroupe] = {
            name: evaluation.nomGroupe,
            evaluations: []
          };
        }
        acc[evaluation.idGroupe].evaluations.push(evaluation);
        return acc;
      }, {});

      // Generate content
      Object.entries(groups).forEach(([groupId, groupData], index) => {
        if (index > 0) doc.addPage();
        
        doc.fontSize(14).text(`Groupe: ${groupData.name} (ID: ${groupId})`);
        doc.moveDown(0.5);
        
        // Table header
        this.drawTableHeader(doc);
        
        // Table rows
        let y = doc.y;
        groupData.evaluations.forEach((evaluation, i) => {
          if (y > doc.page.height - 100) {
            doc.addPage();
            this.drawTableHeader(doc);
            y = 100;
          }
          
          this.drawEvaluationRow(doc, y, evaluation, i);
          y += 30;
        });
      });

      doc.end();
    });
  }

  drawTableHeader(doc) {
    const headers = [
      { text: "Étudiant", width: 150 },
      { text: "Rapport", width: 60 },
      { text: "Présentation", width: 80 },
      { text: "Discussion", width: 70 },
      { text: "Savoir-être", width: 80 },
      { text: "Moyenne", width: 60 }
    ];
    
    let x = 40;
    doc.font("Helvetica-Bold");
    
    headers.forEach(header => {
      doc.text(header.text, x, 100, { width: header.width });
      x += header.width;
    });
    
    doc.moveTo(40, 120).lineTo(x, 120).stroke();
    doc.font("Helvetica");
    doc.y = 130;
  }

  drawEvaluationRow(doc, y, evaluation, index) {
    const rowColor = index % 2 === 0 ? "#f5f5f5" : "#ffffff";
    doc.rect(40, y - 10, 500, 30).fillAndStroke(rowColor, "#e0e0e0");
    
    doc.text(evaluation.etudiant, 45, y, { width: 145 });
    doc.text(evaluation.noteRapport?.toFixed(2) || "-", 195, y, { width: 55, align: "center" });
    doc.text(evaluation.notePresentation?.toFixed(2) || "-", 250, y, { width: 75, align: "center" });
    doc.text(evaluation.noteDiscussion?.toFixed(2) || "-", 325, y, { width: 65, align: "center" });
    doc.text(evaluation.noteSavoirFaireSavoirEtre?.toFixed(2) || "-", 390, y, { width: 75, align: "center" });
    
    // Highlight total grade
    const total = evaluation.noteTotale?.toFixed(2) || "-";
    if (total !== "-") {
      const color = evaluation.noteTotale >= 10 ? "#4CAF50" : "#F44336";
      doc.fillColor(color);
    }
    doc.text(total, 465, y, { width: 55, align: "center" });
    doc.fillColor("#000000");
  }
}