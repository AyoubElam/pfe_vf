/* eslint-disable @typescript-eslint/no-unused-vars */
import { SoutenanceRepository } from "../../repositories/SoutenanceRepository.js";

export class GetSoutenancesByEncadrant {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute(idEncadrant, year) {
    if (!idEncadrant) throw new Error("Missing idEncadrant");
    return this.soutenanceRepository.getByEncadrant(idEncadrant, year);
}
}