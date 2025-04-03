// src/use-cases/etu/GetSoutenancesByGroup.js
export class GetSoutenancesByGroup {
    constructor(soutenanceRepository) {
      this.soutenanceRepository = soutenanceRepository;
    }
  
    async execute(groupId) {
      if (!groupId) throw new Error("Missing groupId");
      return await this.soutenanceRepository.getSoutenancesByGroup(groupId);
    }
  }