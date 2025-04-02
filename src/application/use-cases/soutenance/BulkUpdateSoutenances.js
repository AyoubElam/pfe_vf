export class BulkUpdateSoutenanceStatuses {
  constructor(soutenanceRepository) {
    this.soutenanceRepository = soutenanceRepository;
  }

  async execute(ids, status) {
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      throw new Error("IDs and status are required");
    }
    return await this.soutenanceRepository.bulkUpdate(ids, status);
  }
}