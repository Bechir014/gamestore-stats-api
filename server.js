const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());

// IMPORTANT: on va ajouter le fichier serviceAccountKey.json à côté de server.js
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.get("/stats", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("projet").get();

    let enCours = 0;
    let enAttente = 0;
    let termines = 0;

    snapshot.forEach((doc) => {
      const statut = (doc.data().statut || "").toString().trim().toLowerCase();
      if (statut === "en cours") enCours++;
      else if (statut === "en atente") enAttente++;
      else if (statut === "termines") termines++;
    });

    const total = enCours + enAttente + termines;
    const tauxReussite = total === 0 ? 0 : Math.round((termines / total) * 100);

    return res.json({ enCours, enAttente, termines, total, tauxReussite });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port " + PORT));