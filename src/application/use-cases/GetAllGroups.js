export class GetAllGroups {
    constructor(groupRepository) {
      this.groupRepository = groupRepository;
    }
  
    async execute() {
      return await this.groupRepository.getAll();
    }
  }