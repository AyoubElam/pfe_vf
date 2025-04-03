/* eslint-disable @typescript-eslint/no-unused-vars */
// src/use-cases/tuteur/ValidateTutorDocument.js
import { ValidationRepository } from "../../repositories/ValidationRepository.js";

export class ValidateTutorDocument {
  constructor(validationRepository) {
    this.validationRepository = validationRepository;
  }

  async execute({ idPFE, pfeLivrableId, idTuteur, validationStatus, comment }) {
    if (!idPFE || !pfeLivrableId || !idTuteur || !validationStatus) {
      throw new Error("Missing required fields");
    }
    return await this.validationRepository.validateTutorDocument(idPFE, pfeLivrableId, idTuteur, validationStatus, comment);
  }
}