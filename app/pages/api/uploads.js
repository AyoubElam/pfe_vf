/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const app = express();
const path = require("path");

// Serve static files from 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Your API route
app.get("/api/tut_soumettre/group-documents", (req, res) => {
  // Example response (replace with real DB logic)
  const documents = [
    {
      idPFE: 1,
      idLivrable: 1,
      fichier: "/uploads/f80eb620bc155ce2ff06cd6d3be6f311",
      nomGroupe: "Groupe A",
    },
  ];
  res.json(documents);
});

app.listen(5000, () => console.log("Server running on port 5000"));