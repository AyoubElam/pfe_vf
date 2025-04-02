// src/entities/models/Encadrant.js
export default class Encadrant {
  constructor(idEncadrant, nom, prenom, email, motDePasse, annee) {
    this.idEncadrant = idEncadrant;
    this.nom = nom;
    this.prenom = prenom;
    this.email = email;
    this.motDePasse = motDePasse;
    this.annee = annee;
  }
}