/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
const router = express.Router();
import db from "../../../config/db.js";

// POST /api/validate_document - Add or modify a validation and comment
// POST /api/validate_document - Add or modify a validation and comment
router.post('/', (req, res) => {
  const { idPFE, idLivrable, idTuteur, idEncadrant, validationStatus, comment } = req.body;

  if (!idPFE || !idLivrable || (!idTuteur && !idEncadrant) || !validationStatus) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validatorId = idTuteur || idEncadrant;
  const validatorType = idTuteur ? 'idTuteur' : 'idEncadrant';

  const query = `
    INSERT INTO validation_comment (idPFE, idLivrable, ${validatorType}, validationStatus, comment)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      validationStatus = VALUES(validationStatus), 
      comment = VALUES(comment)
  `;

  db.query(query, [idPFE, idLivrable, validatorId, validationStatus, comment || null], (err, result) => {
    if (err) {
      console.error('Error inserting or updating validation:', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
    return res.json({ 
      message: result.affectedRows > 1 ? 'Validation updated successfully' : 'Validation created successfully' 
    });
  });
});

// DELETE /api/validate_document - Delete a validation and comment
router.delete('/', (req, res) => {
  const { idPFE, idLivrable, idTuteur, idEncadrant } = req.query;

  if (!idPFE || !idLivrable || (!idTuteur && !idEncadrant)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validatorType = idTuteur ? 'idTuteur' : 'idEncadrant';
  const validatorId = idTuteur || idEncadrant;

  const query = `
    DELETE FROM validation_comment 
    WHERE idP]");
FE = ? AND idLivrable = ? AND ${validatorType} = ?
  `;

  db.query(query, [idPFE, idLivrable, validatorId], (err, result) => {
    if (err) {
      console.error('Error deleting validation:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Validation not found' });
    }
    return res.json({ message: 'Validation deleted successfully' });
  });
});

// DELETE /api/validate_document - Delete a validation and comment
router.delete('/', (req, res) => {
  const { idPFE, idLivrable, idTuteur, idEncadrant } = req.query;

  if (!idPFE || !idLivrable || (!idTuteur && !idEncadrant)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validatorType = idTuteur ? 'idTuteur' : 'idEncadrant';
  const validatorId = idTuteur || idEncadrant;

  const query = `
    DELETE FROM validation_comment 
    WHERE idPFE = ? AND idLivrable = ? AND ${validatorType} = ?
  `;

  db.query(query, [idPFE, idLivrable, validatorId], (err, result) => {
    if (err) {
      console.error('Error deleting validation:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Validation not found' });
    }
    return res.json({ message: 'Validation deleted successfully' });
  });
});

export default router;