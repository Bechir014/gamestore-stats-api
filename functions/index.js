const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.getProjectStats = functions.https.onRequest(async (req, res) => {
  try {
    // CORS (utile si FlutterFlow Web)
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).send("");

    const snapshot = await admin.firestore().collection("projet").get();

    let enCours = 0;
    let enAttente = 0;
    let termines = 0;

    snapshot.forEach((doc) => {
      const statut = (doc.data().statut || "").toString().trim().toLowerCase();

      if (statut === "en cours") enCours++;
      else if (statut === "en attente") enAttente++;
      else if (statut === "termines") termines++;
    });

    const total = enCours + enAttente + termines;
    const tauxReussite = total === 0 ? 0 : Math.round((termines / total) * 100);

    return res.json({ enCours, enAttente, termines, total, tauxReussite });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});