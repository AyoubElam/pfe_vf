import { GroupRepository } from "../../application/repositories/GroupRepository.js";
import { GetAllGroups } from "../../application/use-cases/GetAllGroups.js";

export class GroupController {
  constructor() {
    this.groupRepository = new GroupRepository();
    this.getAllGroups = new GetAllGroups(this.groupRepository);
  }

  async getAll(req, res) {
    try {
      const groups = await this.getAllGroups.execute();
      res.json(groups);
    } catch (err) {
      console.error("Error fetching groups data:", err);
      res.status(500).json({ error: "Failed to fetch groups", details: err.sqlMessage });
    }
  }
}