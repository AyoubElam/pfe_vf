/* eslint-disable @typescript-eslint/no-unused-vars */
// src/use-cases/etu/GetStudentDocuments.js
import { DocumentRepository } from "../../repositories/DocumentRepository.js";

export class GetStudentDocuments {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(idEtudiant) {
    if (!idEtudiant) throw new Error("Missing idEtudiant");
    return await this.documentRepository.getStudentDocuments(idEtudiant);
  }
}