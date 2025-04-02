import { JuryRepository } from "../../application/repositories/JuryRepository.js";
import { GetAllJurys } from "../../application/use-cases/GetAllJurys.js";
import { CreateJury } from "../../application/use-cases/CreateJury.js";
import { UpdateJury } from "../../application/use-cases/UpdateJury.js";
import { DeleteJury } from "../../application/use-cases/DeleteJury.js";

export class JuryController {
  constructor() {
    this.juryRepository = new JuryRepository();
    this.getAllJurys = new GetAllJurys(this.juryRepository);
    this.createJury = new CreateJury(this.juryRepository);
    this.updateJury = new UpdateJury(this.juryRepository);
    this.deleteJury = new DeleteJury(this.juryRepository);
  }

  async getAll(req, res) {
    try {
      const jurys = await this.getAllJurys.execute();
      res.json(jurys);
    } catch (err) {
      console.error("Error fetching jurys data:", err);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }

  async create(req, res) {
    const { nom } = req.body;
    try {
      const jury = await this.createJury.execute(nom);
      res.status(201).json(jury);
    } catch (err) {
      console.error("Error inserting jury:", err);
      res.status(err.message === "Nom is required" ? 400 : 500).json({ error: err.message });
    }
  }

  async update(req, res) {
    const { idJury } = req.params;
    const { nom } = req.body;
    try {
      const result = await this.updateJury.execute(idJury, nom);
      res.status(200).json(result);
    } catch (err) {
      console.error("Error updating jury:", err);
      res.status(err.message === "Jury not found" ? 404 : err.message === "Nom is required" ? 400 : 500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const { idJury } = req.params;
    try {
      const result = await this.deleteJury.execute(idJury);
      res.status(200).json(result);
    } catch (err) {
      console.error("Error deleting jury:", err);
      res.status(err.message === "Jury not found" ? 404 : err.message === "idJury is required" ? 400 : 500).json({ error: err.message });
    }
  }
}