import db from "../../../config/db.js";
import { Jury } from "../../entities/models/Jury.js";

export class JuryRepository {
  async getAll() {
    const query = "SELECT idJury, nom FROM jury";
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(row => new Jury(row.idJury, row.nom)));
      });
    });
  }

  async create(nom) {
    const query = "INSERT INTO jury (nom, valideDeliberation) VALUES (?, 0)";
    return new Promise((resolve, reject) => {
      db.query(query, [nom], (err, result) => {
        if (err) return reject(err);
        resolve(new Jury(result.insertId, nom, 0));
      });
    });
  }

  async update(idJury, nom) {
    const query = "UPDATE jury SET nom = ? WHERE idJury = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [nom, idJury], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  async delete(idJury) {
    const query = "DELETE FROM jury WHERE idJury = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [idJury], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}