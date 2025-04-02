// src/entities/models/PFE.js
export default class PFE {
  constructor(idPFE, statut, annee, idTuteur, idGroupe) {
    this.idPFE = idPFE;
    this.statut = statut;
    this.annee = annee;
    this.idTuteur = idTuteur;
    this.idGroupe = idGroupe;
  }
}