/* eslint-disable @typescript-eslint/no-unused-vars */
// src/use-cases/prof/DeleteProfValidation.js
import { ValidationRepository } from "../../repositories/ValidationRepository.js";

export class DeleteProfValidation {
  constructor(validationRepository) {
    this.validationRepository = validationRepository;
  }

  async execute({ idPFE, pfeLivrableId, idEncadrant }) {
    if (!idPFE || !pfeLivrableId || !idEncadrant) throw new Error("Missing required fields");
    return await this.validationRepository.deleteProfValidation(idPFE, pfeLivrableId, idEncadrant);
  }
}