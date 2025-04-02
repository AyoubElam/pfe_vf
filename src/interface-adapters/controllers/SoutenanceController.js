export class SoutenanceController {
  constructor(
    createSoutenance,
    getAllSoutenances,
    getSoutenanceById,
    updateSoutenance,
    deleteSoutenance,
    bulkUpdateSoutenanceStatuses,
    getJuryGroupsUseCase  // Changed the name here to avoid conflict
  ) {
    this.createSoutenance = createSoutenance;
    this.getAllSoutenances = getAllSoutenances;
    this.getSoutenanceById = getSoutenanceById;
    this.updateSoutenance = updateSoutenance;
    this.deleteSoutenance = deleteSoutenance;
    this.bulkUpdateSoutenanceStatuses = bulkUpdateSoutenanceStatuses;
    this.getJuryGroupsUseCase = getJuryGroupsUseCase;  // Changed name here too
  }

  async getAll(req, res) {
    try {
      const year = req.query.year;
      const soutenances = await this.getAllSoutenances.execute(year);
      res.json(soutenances);
    } catch (err) {
      console.error("❌ Error fetching soutenance data:", err);
      res.status(500).json({ error: "Failed to fetch soutenance", details: err.message });
    }
  }

  async create(req, res) {
    try {
      const { date, time, location, juryIds, groupIds, status } = req.body;
      const soutenance = await this.createSoutenance.execute({ date, time, location, juryIds, groupIds, status });
      res.status(201).json(soutenance);
    } catch (err) {
      console.error("❌ Error creating soutenance:", err);
      res.status(err.message === "All fields are required" ? 400 : 500).json({
        error: err.message || "Failed to create soutenance",
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const soutenance = await this.getSoutenanceById.execute(id);
      res.json(soutenance);
    } catch (err) {
      console.error("❌ Error fetching soutenance:", err);
      res.status(err.message === "Soutenance not found" ? 404 : 500).json({
        message: err.message || "Error fetching soutenance",
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { date, time, location, status, groupIds, juryIds } = req.body;
      const updatedSoutenance = await this.updateSoutenance.execute(id, {
        date,
        time,
        location,
        status,
        groupIds,
        juryIds,
      });
      res.json(updatedSoutenance);
    } catch (err) {
      console.error("❌ Error updating soutenance:", err);
      res.status(err.message === "All fields are required" ? 400 : 500).json({
        error: err.message || "Failed to update soutenance",
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.deleteSoutenance.execute(id);
      res.status(200).json({ message: "Soutenance deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting soutenance:", err);
      res.status(500).json({ error: "Failed to delete soutenance" });
    }
  }

  async bulkUpdate(req, res) {
    try {
      const { ids, status } = req.body;
      const affectedRows = await this.bulkUpdateSoutenanceStatuses.execute(ids, status);
      res.json({ message: `Successfully updated ${affectedRows} soutenances` });
    } catch (err) {
      console.error("❌ DB Error:", err);
      res.status(err.message === "IDs and status are required" ? 400 : 500).json({
        error: err.message || "Failed to update soutenances",
      });
    }
  }

  async getJuryGroups(req, res) {
    try {
      const { idJury } = req.params;
      // Here's the key change - use the correctly named property
      const groups = await this.getJuryGroupsUseCase.execute(idJury);
      res.json(groups);
    } catch (err) {
      console.error("❌ Error fetching jury groups:", err);
      console.error("Full error stack:", err.stack);
      res.status(500).json({ error: "Failed to fetch jury groups", details: err.message });
    }
  }
}