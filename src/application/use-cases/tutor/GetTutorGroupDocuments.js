/* eslint-disable @typescript-eslint/no-unused-vars */
// src/use-cases/tuteur/GetTutorGroupDocuments.js
import { DocumentRepository } from "../../repositories/DocumentRepository.js";

export class GetTutorGroupDocuments {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(idTuteur) {
    if (!idTuteur) throw new Error("Missing idTuteur parameter");
    return await this.documentRepository.getTutorGroupDocuments(idTuteur);
  }
}