import db from "../../../config/db.js";
import { Group } from "../../entities/models/Group.js";

export class GroupRepository {
  async getAll() {
    const query = `
      SELECT 
        g.idGroupe, 
        g.nomGroupe, 
        COUNT(e.idEtudiant) AS nbEtudiants,
        GROUP_CONCAT(CONCAT(e.prenom, ' ', e.nom) SEPARATOR ', ') AS students
      FROM groupe g
      LEFT JOIN etudiant e ON g.idGroupe = e.idGroupe
      GROUP BY g.idGroupe, g.nomGroupe;
    `;
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(row => new Group(
          row.idGroupe.toString(),
          row.nomGroupe,
          row.nbEtudiants,
          row.students ? row.students.split(", ") : []
        )));
      });
    });
  }
}