export class DeleteSoutenance {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute(id) {
    return await this.soutenanceRepository.delete(id);
  }
}