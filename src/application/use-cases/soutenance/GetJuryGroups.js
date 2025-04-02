export class GetJuryGroups {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute(idJury) {
    return await this.soutenanceRepository.getJuryGroups(idJury);
  }
}