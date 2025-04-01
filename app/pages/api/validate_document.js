import express from "express";
const router = express.Router();
import db from "../../../config/db.js";

// POST /api/validate_document - Add or modify a validation and comment
// validate_document.js
router.post("/", (req, res) => {
  const { idPFE, pfeLivrableId, idTuteur, validationStatus, comment } = req.body;
  console.log("Received validation request:", req.body);

  if (!idPFE || !pfeLivrableId || !idTuteur || !validationStatus) {
    console.log("Missing fields:", { idPFE, pfeLivrableId, idTuteur, validationStatus });
    return res.status(400).json({ error: "Missing required fields" });
  }

  const validateQuery = `
    INSERT INTO validation_comment (idPFE, pfeLivrableId, idTuteur, validationStatus, comment)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      validationStatus = VALUES(validationStatus),
      comment = VALUES(comment)
  `;

  db.query(validateQuery, [idPFE, pfeLivrableId, idTuteur, validationStatus, comment || null], (err, result) => {
    if (err) {
      console.error("Validation insert/update error:", err);
      return res.status(500).json({ error: `Server error: ${err.message}` });
    }
    console.log("Query result:", result);
    res.json({
      message: result.affectedRows > 0 
        ? (result.insertId ? "Validation created successfully" : "Validation updated successfully") 
        : "No changes made",
    });
  });
});

// DELETE /api/validate_document - Delete a validation and comment
// validate_document.js
router.delete("/", (req, res) => {
  const { idPFE, pfeLivrableId, idTuteur } = req.query;

  if (!idPFE || !pfeLivrableId || !idTuteur) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const deleteQuery = `
    DELETE FROM validation_comment
    WHERE idPFE = ? AND pfeLivrableId = ? AND idTuteur = ?
  `;

  db.query(deleteQuery, [idPFE, pfeLivrableId, idTuteur], (err, result) => {
    if (err) {
      console.error("Error deleting validation:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Validation not found" });
    }

    return res.json({ message: "Validation deleted successfully" });
  });
});

export default router;