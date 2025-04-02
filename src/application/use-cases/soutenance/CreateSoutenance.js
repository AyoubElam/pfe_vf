/* eslint-disable @typescript-eslint/no-unused-vars */
import { Soutenance } from "../../../entities/models/Soutenance.js";

export class CreateSoutenance {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute({ date, time, location, juryIds, groupIds, status }) {
    if (!date || !time || !location || !juryIds || !groupIds || !status) {
      throw new Error("All fields are required");
    }

    const soutenanceData = {
      date,
      time,
      location,
      juryIds,
      groupIds,
      status
    };
    
    return await this.soutenanceRepository.create(soutenanceData);
  }
}