/* eslint-disable @typescript-eslint/no-unused-vars */
// src/use-cases/tuteur/GetTutorSoutenances.js
import { SoutenanceRepository } from "../../repositories/SoutenanceRepository.js";

export class GetTutorSoutenances {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute(idTuteur) {
    if (!idTuteur) throw new Error("Missing idTuteur");
    return await this.soutenanceRepository.getTutorSoutenances(idTuteur);
  }
}