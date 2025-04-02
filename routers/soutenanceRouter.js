import express from "express";
import { SoutenanceRepository } from "../src/application/repositories/SoutenanceRepository.js";
import { CreateSoutenance } from "../src/application/use-cases/soutenance/CreateSoutenance.js";
import { GetAllSoutenances } from "../src/application/use-cases/soutenance/GetAllSoutenances.js";
import { GetSoutenanceById } from "../src/application/use-cases/soutenance/GetSoutenanceById.js";
import { UpdateSoutenance } from "../src/application/use-cases/soutenance/UpdateSoutenance.js";
import { DeleteSoutenance } from "../src/application/use-cases/soutenance/DeleteSoutenance.js";
import { BulkUpdateSoutenanceStatuses } from "../src/application/use-cases/soutenance/BulkUpdateSoutenances.js";
import { GetJuryGroups } from "../src/application/use-cases/soutenance/GetJuryGroups.js";
import { SoutenanceController } from "../src/interface-adapters/controllers/SoutenanceController.js";



const router = express.Router();

// Create all the dependencies
const soutenanceRepository = new SoutenanceRepository();
const createSoutenanceUseCase = new CreateSoutenance(soutenanceRepository);
const getAllSoutenancesUseCase = new GetAllSoutenances(soutenanceRepository);
const getSoutenanceByIdUseCase = new GetSoutenanceById(soutenanceRepository);
const updateSoutenanceUseCase = new UpdateSoutenance(soutenanceRepository);
const deleteSoutenanceUseCase = new DeleteSoutenance(soutenanceRepository);
const bulkUpdateSoutenanceStatusesUseCase = new BulkUpdateSoutenanceStatuses(soutenanceRepository);
const getJuryGroupsUseCase = new GetJuryGroups(soutenanceRepository);

// Create the controller with all dependencies
const soutenanceController = new SoutenanceController(
  createSoutenanceUseCase,
  getAllSoutenancesUseCase,
  getSoutenanceByIdUseCase,
  updateSoutenanceUseCase,
  deleteSoutenanceUseCase,
  bulkUpdateSoutenanceStatusesUseCase,
  getJuryGroupsUseCase
);

// Define routes - CRITICAL: Order matters! More specific routes must come before generic ones
router.get("/", (req, res) => soutenanceController.getAll(req, res));
router.post("/", (req, res) => soutenanceController.create(req, res));
router.put("/bulk-update", (req, res) => soutenanceController.bulkUpdate(req, res));

// This specific route MUST come BEFORE the generic "/:id" route
router.get("/jury-groups/:idJury", (req, res) => soutenanceController.getJuryGroups(req, res));

// Generic ID routes
router.get("/:id", (req, res) => soutenanceController.getById(req, res));
router.put("/:id", (req, res) => soutenanceController.update(req, res));
router.delete("/:id", (req, res) => soutenanceController.delete(req, res));

export default router;