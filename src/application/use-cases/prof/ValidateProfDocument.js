/* eslint-disable @typescript-eslint/no-unused-vars */
// src/use-cases/prof/ValidateProfDocument.js
import { ValidationRepository } from "../../repositories/ValidationRepository.js";

export class ValidateProfDocument {
  constructor(validationRepository) {
    this.validationRepository = validationRepository;
  }

  async execute({ idPFE, pfeLivrableId, idEncadrant, validationStatus, comment }) {
    if (!idPFE || !pfeLivrableId || !idEncadrant || !validationStatus) {
      throw new Error("Missing required fields");
    }
    return await this.validationRepository.validateProfDocument(idPFE, pfeLivrableId, idEncadrant, validationStatus, comment);
  }
}