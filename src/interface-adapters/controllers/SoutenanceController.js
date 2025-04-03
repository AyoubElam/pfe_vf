export class SoutenanceController {
  constructor(
    createSoutenanceUseCase,
    getAllSoutenancesUseCase,
    getSoutenanceByIdUseCase,
    updateSoutenanceUseCase,
    deleteSoutenanceUseCase,
    bulkUpdateSoutenanceStatusesUseCase,
    getJuryGroupsUseCase,
    getSoutenancesByEncadrantUseCase
  ) {
    // Assign all use cases with correct property names
    this.createSoutenanceUseCase = createSoutenanceUseCase;
    this.getAllSoutenancesUseCase = getAllSoutenancesUseCase;
    this.getSoutenanceByIdUseCase = getSoutenanceByIdUseCase;
    this.updateSoutenanceUseCase = updateSoutenanceUseCase;
    this.deleteSoutenanceUseCase = deleteSoutenanceUseCase;
    this.bulkUpdateSoutenanceStatusesUseCase = bulkUpdateSoutenanceStatusesUseCase;
    this.getJuryGroupsUseCase = getJuryGroupsUseCase;
    this.getSoutenancesByEncadrantUseCase = getSoutenancesByEncadrantUseCase;

    // Auto-bind methods to maintain 'this' context
    this.bindMethods();
  }

  bindMethods() {
    const methods = [
      'getAll',
      'create',
      'getById',
      'update',
      'delete',
      'bulkUpdate',
      'getJuryGroups',
      'getSoutenancesByEncadrant'
    ];
    
    methods.forEach(method => {
      if (typeof this[method] === 'function') {
        this[method] = this[method].bind(this);
      } else {
        console.warn(`Method ${method} not found in SoutenanceController`);
      }
    });
  }

  async getAll(req, res) {
    try {
      const year = req.query.year;
      const soutenances = await this.getAllSoutenancesUseCase.execute(year);
      res.json(soutenances);
    } catch (err) {
      console.error("❌ Error fetching soutenance data:", err);
      res.status(500).json({ 
        error: "Failed to fetch soutenances", 
        details: err.message 
      });
    }
  }

  async create(req, res) {
    try {
      const { date, time, location, juryIds, groupIds, status } = req.body;
      const soutenance = await this.createSoutenanceUseCase.execute({ 
        date, 
        time, 
        location, 
        juryIds, 
        groupIds, 
        status 
      });
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
      const soutenance = await this.getSoutenanceByIdUseCase.execute(id);
      res.json(soutenance);
    } catch (err) {
      console.error("❌ Error fetching soutenance:", err);
      res.status(err.message === "Soutenance not found" ? 404 : 500).json({
        error: err.message || "Error fetching soutenance",
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { date, time, location, status, groupIds, juryIds } = req.body;
      const updatedSoutenance = await this.updateSoutenanceUseCase.execute(id, {
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
      await this.deleteSoutenanceUseCase.execute(id);
      res.status(200).json({ message: "Soutenance deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting soutenance:", err);
      res.status(500).json({ error: "Failed to delete soutenance" });
    }
  }

  async bulkUpdate(req, res) {
    try {
      const { ids, status } = req.body;
      const affectedRows = await this.bulkUpdateSoutenanceStatusesUseCase.execute(ids, status);
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
      const groups = await this.getJuryGroupsUseCase.execute(idJury);
      res.json(groups);
    } catch (err) {
      console.error("❌ Error fetching jury groups:", err);
      res.status(500).json({ 
        error: "Failed to fetch jury groups", 
        details: err.message 
      });
    }
  }

  async getSoutenancesByEncadrant(req, res) {
    try {
      const { idEncadrant } = req.params;
      const { year } = req.query;
      
      const soutenances = await this.getSoutenancesByEncadrantUseCase.execute(
        idEncadrant, 
        year
      );
      
      res.json(soutenances || []);
    } catch (err) {
      console.error("Error fetching soutenances:", err);
      res.status(500).json({ 
        error: "Failed to fetch soutenances",
        details: err.message 
      });
    }
  }
}