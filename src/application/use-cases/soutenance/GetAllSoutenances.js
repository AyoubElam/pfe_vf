export class GetAllSoutenances {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute(year) {
    return await this.soutenanceRepository.getAll(year);
  }
}