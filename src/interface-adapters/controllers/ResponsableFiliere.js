// src/entities/models/ResponsableFiliere.js
export default class ResponsableFiliere {
    constructor(idResponsableFiliere, nom, prenom, email, motDePasse, departement, annee) {
      this.idResponsableFiliere = idResponsableFiliere;
      this.nom = nom;
      this.prenom = prenom;
      this.email = email;
      this.motDePasse = motDePasse;
      this.departement = departement;
      this.annee = annee;
    }
  }