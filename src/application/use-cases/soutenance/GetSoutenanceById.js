export class GetSoutenanceById {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute(id) {
    const soutenance = await this.soutenanceRepository.getById(id);
    if (!soutenance) throw new Error("Soutenance not found");
    return soutenance;
  }
}