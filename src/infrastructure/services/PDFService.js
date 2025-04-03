/* eslint-disable @typescript-eslint/no-unused-vars */
import PDFDocument from "pdfkit"

export class PDFService {
  async generateSoutenancePdf(data) {
    return new Promise((resolve, reject) => {
      try {
        // Create a document with better margins
        const doc = new PDFDocument({
          margin: 50,
          size: "A4",
          info: {
            Title: "Fiche d'évaluation des soutenances",
            Author: "Université Cadi Ayyad",
          },
        })

        const buffers = []
        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
          const pdfData = Buffer.concat(buffers)
          resolve(pdfData)
        })

        // Generate content with improved styling
        this.generateHeader(doc, data.universityInfo)
        this.generateTitle(doc)
        this.generateEvaluationTable(doc, data.entries)

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  generateHeader(doc, universityInfo) {
    // Simple header table with clean lines
    const tableTop = 50
    const tableWidth = doc.page.width - 100

    // Draw table with lighter lines
    doc.lineWidth(0.5)
    doc.strokeColor("#555555")

    // Draw outer border
    doc.rect(50, tableTop, tableWidth, 75).stroke()

    // Draw middle vertical line
    doc
      .moveTo(50 + tableWidth / 2, tableTop)
      .lineTo(50 + tableWidth / 2, tableTop + 75)
      .stroke()

    // Draw horizontal lines
    doc
      .moveTo(50, tableTop + 25)
      .lineTo(50 + tableWidth, tableTop + 25)
      .stroke()

    doc
      .moveTo(50, tableTop + 50)
      .lineTo(50 + tableWidth, tableTop + 50)
      .stroke()

    // Add text with better typography
    doc.font("Helvetica")
    doc.fontSize(10)

    // Left column
    doc.fillColor("#000000")
    doc.text(universityInfo.name, 55, tableTop + 8)
    doc.text(`${universityInfo.school}`, 55, tableTop + 33)
    doc.text(`Département : ${universityInfo.department}`, 55, tableTop + 58)

    // Right column
    doc.text(`A.U: ${universityInfo.year || "2021-2022"}`, 50 + tableWidth / 2 + 5, tableTop + 8)
    doc.text(`Niveau : ${universityInfo.level}`, 50 + tableWidth / 2 + 5, tableTop + 58)
  }

  generateTitle(doc) {
    const y = 150

    // Draw a simple box for the title with lighter border
    doc.lineWidth(0.5)
    doc.strokeColor("#555555")
    doc.rect(50, y, doc.page.width - 100, 40).stroke()

    // Add title with better typography
    doc.font("Helvetica-Bold")
    doc.fontSize(14)
    doc.fillColor("#000000")
    doc.text("Fiche d'évaluation des soutenances (PFE)", {
      align: "center",
      y: y + 13,
    })
  }

  generateEvaluationTable(doc, entries) {
    const tableTop = 220
    const tableWidth = doc.page.width - 100

    // Define column widths for better proportions
    const colWidths = [120, 60, 220, 100]
    const colPositions = [
      50, // Signature Jury
      50 + colWidths[0], // N°Groupe
      50 + colWidths[0] + colWidths[1], // Nom/Prénom
      50 + colWidths[0] + colWidths[1] + colWidths[2], // Note
    ]

    // Draw header with lighter lines
    doc.lineWidth(0.5)
    doc.strokeColor("#555555")
    doc.rect(50, tableTop, tableWidth, 30).stroke()

    // Draw vertical lines for columns
    for (let i = 1; i < colPositions.length; i++) {
      doc
        .moveTo(colPositions[i], tableTop)
        .lineTo(colPositions[i], tableTop + 30)
        .stroke()
    }

    // Add header text with better typography
    doc.font("Helvetica-Bold")
    doc.fontSize(11)
    doc.fillColor("#000000")

    const headerLabels = ["Signature Jury", "N°Groupe", "Nom/Prénom", "Note"]
    headerLabels.forEach((label, i) => {
      const x = colPositions[i] + 10
      doc.text(label, x, tableTop + 10)
    })

    // Draw table body
    let currentY = tableTop + 30
    const rowHeight = 25

    // Process entries
    let lastJury = null
    let lastGroup = null
    let juryStartY = currentY
    let groupStartY = currentY

    // Flatten the entries for simpler processing
    const flatEntries = []
    entries.forEach((entry) => {
      entry.students.forEach((student) => {
        flatEntries.push({
          jury: entry.jury,
          groupNumber: entry.groupNumber,
          student: student,
        })
      })
    })

    // Sort by jury then by group
    flatEntries.sort((a, b) => {
      if (a.jury !== b.jury) return a.jury.localeCompare(b.jury)
      return a.groupNumber - b.groupNumber
    })

    // Draw rows
    doc.font("Helvetica")
    doc.fontSize(10)

    flatEntries.forEach((entry, index) => {
      // Draw horizontal line for row
      doc
        .moveTo(50, currentY)
        .lineTo(50 + tableWidth, currentY)
        .stroke()

      // Check if jury changed
      const juryChanged = lastJury !== entry.jury
      if (juryChanged && lastJury !== null) {
        // Draw jury cell border
        doc.rect(50, juryStartY, colWidths[0], currentY - juryStartY).stroke()
        juryStartY = currentY
      }

      // Check if group changed
      const groupChanged = lastGroup !== entry.groupNumber || juryChanged
      if (groupChanged && lastGroup !== null) {
        // Draw group cell border
        doc.rect(colPositions[1], groupStartY, colWidths[1], currentY - groupStartY).stroke()
        groupStartY = currentY
      }

      // Draw jury name if changed
      if (juryChanged) {
        lastJury = entry.jury
        doc.text(entry.jury, colPositions[0] + 10, currentY + 8)
      }

      // Draw group number if changed
      if (groupChanged) {
        lastGroup = entry.groupNumber
        doc.text(entry.groupNumber.toString(), colPositions[1] + 10, currentY + 8)
      }

      // Draw student name
      doc.text(entry.student.name, colPositions[2] + 10, currentY + 8)

      // Move to next row
      currentY += rowHeight

      // Draw vertical lines for this row
      if (index === flatEntries.length - 1) {
        // Last row, complete all cells
        doc.rect(50, juryStartY, colWidths[0], currentY - juryStartY).stroke()
        doc.rect(colPositions[1], groupStartY, colWidths[1], currentY - groupStartY).stroke()

        // Draw remaining vertical lines
        for (let i = 2; i < colPositions.length; i++) {
          doc
            .moveTo(colPositions[i], tableTop + 30)
            .lineTo(colPositions[i], currentY)
            .stroke()
        }

        // Draw outer right border
        doc
          .moveTo(50 + tableWidth, tableTop + 30)
          .lineTo(50 + tableWidth, currentY)
          .stroke()

        // Draw final horizontal line
        doc
          .moveTo(50, currentY)
          .lineTo(50 + tableWidth, currentY)
          .stroke()
      }
    })

    // If no entries, draw an empty table
    if (flatEntries.length === 0) {
      doc.rect(50, tableTop + 30, tableWidth, rowHeight).stroke()

      // Draw vertical lines
      for (let i = 1; i < colPositions.length; i++) {
        doc
          .moveTo(colPositions[i], tableTop + 30)
          .lineTo(colPositions[i], tableTop + 30 + rowHeight)
          .stroke()
      }

      currentY = tableTop + 30 + rowHeight
    }

    // Add a note at the bottom
    doc.fontSize(9)
    doc.fillColor("#555555")
    doc.text("* Les notes sont sur 20 points", 50, currentY + 20)
  }
}

