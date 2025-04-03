/* eslint-disable @typescript-eslint/no-unused-vars */
// src/use-cases/prof/GetProfDocuments.js
import { DocumentRepository } from "../../repositories/DocumentRepository.js";

export class GetProfDocuments {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(idEncadrant) {
    if (!idEncadrant) throw new Error("Missing idEncadrant parameter");
    return await this.documentRepository.getProfDocuments(idEncadrant);
  }
}