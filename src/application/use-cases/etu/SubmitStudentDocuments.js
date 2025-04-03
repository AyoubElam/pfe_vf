/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "path";
import { DocumentRepository } from "../../repositories/DocumentRepository.js";

export class SubmitStudentDocuments {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute({ idEtudiant, idGroupe, files }) {
    if (!idEtudiant || !idGroupe || !files || files.length === 0) {
      throw new Error("Missing required fields or files");
    }

    const authQuery = "SELECT idGroupe FROM etudiant WHERE idEtudiant = ? AND idGroupe = ?";
    const authResult = await this.documentRepository.queryPromise(authQuery, [idEtudiant, idGroupe]);
    if (authResult.length === 0) throw new Error("Unauthorized");

    const pfeQuery = "SELECT idPFE, annee FROM pfe WHERE idGroupe = ?";
    const pfeResult = await this.documentRepository.queryPromise(pfeQuery, [idGroupe]);
    if (pfeResult.length === 0) throw new Error("PFE not found");

    const idPFE = pfeResult[0].idPFE;
    const annee = pfeResult[0].annee;

    for (const file of files) {
      const filePath = `/uploads/${file.filename}`;
      const extension = path.extname(file.originalname).toLowerCase();
      const fileType = extension === ".pdf" ? "PDF" : "Presentation";

      const livrableQuery = "SELECT idLivrable FROM livrable WHERE type = ? AND annee = ? LIMIT 1";
      let livrableResult = await this.documentRepository.queryPromise(livrableQuery, [fileType, annee]);
      let idLivrable = livrableResult[0]?.idLivrable;

      if (!idLivrable) {
        const insertLivrableQuery = "INSERT INTO livrable (type, nom, annee) VALUES (?, ?, ?)";
        const livrableInsert = await this.documentRepository.queryPromise(insertLivrableQuery, [fileType, file.originalname, annee]);
        idLivrable = livrableInsert.insertId;
      }

      await this.documentRepository.submitStudentDocument(idPFE, idGroupe, filePath, fileType, idLivrable);
    }
  }
}