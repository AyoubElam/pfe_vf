export class UpdateSoutenance {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute(id, { date, time, location, status, groupIds, juryIds }) {
    if (!date || !time || !location || !status || !groupIds || !juryIds) {
      throw new Error("All fields are required");
    }

    return await this.soutenanceRepository.update(id, { date, time, location, status, groupIds, juryIds });
  }
}