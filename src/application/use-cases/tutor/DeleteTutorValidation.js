/* eslint-disable @typescript-eslint/no-unused-vars */
// src/use-cases/tuteur/DeleteTutorValidation.js
import { ValidationRepository } from "../../repositories/ValidationRepository.js";

export class DeleteTutorValidation {
  constructor(validationRepository) {
    this.validationRepository = validationRepository;
  }

  async execute({ idPFE, pfeLivrableId, idTuteur }) {
    if (!idPFE || !pfeLivrableId || !idTuteur) throw new Error("Missing required fields");
    return await this.validationRepository.deleteTutorValidation(idPFE, pfeLivrableId, idTuteur);
  }
}