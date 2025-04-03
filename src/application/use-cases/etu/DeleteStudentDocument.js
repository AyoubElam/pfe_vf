/* eslint-disable @typescript-eslint/no-unused-vars */
// src/application/use-cases/etu/DeleteStudentDocument.js
import fs from "fs";
import path from "path";
import { DocumentRepository } from "../../repositories/DocumentRepository.js";

export class DeleteStudentDocument {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute({ idEtudiant, idPFE, id }) {
    if (!idEtudiant || !idPFE || !id) {
      throw new Error("Missing required fields");
    }

    // Verify student has permission to delete this document
    const authQuery = `
      SELECT e.idGroupe 
      FROM etudiant e 
      JOIN pfe_livrable pl ON e.idGroupe = pl.idGroupe
      WHERE e.idEtudiant = ? AND pl.idPFE = ? AND pl.id = ?
    `;
    
    const authResult = await this.documentRepository.queryPromise(authQuery, [idEtudiant, idPFE, id]);
    if (authResult.length === 0) {
      throw new Error("Unauthorized: You don't have permission to delete this document");
    }

    // Get file path before deletion
    const fileQuery = "SELECT fichier FROM pfe_livrable WHERE idPFE = ? AND id = ?";
    const fileResult = await this.documentRepository.queryPromise(fileQuery, [idPFE, id]);
    
    if (fileResult.length === 0) {
      throw new Error("Document not found");
    }

    // Delete physical file
    const filePath = fileResult[0].fichier;
    if (filePath) {
      const fullPath = path.join(process.cwd(), "uploads", path.basename(filePath));
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error("Error deleting file:", err);
        // Continue with DB deletion even if file deletion fails
      }
    }

    // Delete database record
    await this.documentRepository.deleteStudentDocument(idPFE, id);
    
    return { success: true, message: "Document deleted successfully" };
  }
}