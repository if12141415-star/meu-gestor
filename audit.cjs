const fs = require("fs");
const path = require("path");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

let firebaseConfig = {};
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (e) {
  console.error("Failed to read firebase-applet-config.json", e);
}

if (firebaseConfig.projectId) {
  initializeApp({
    projectId: firebaseConfig.projectId
  });
} else {
  initializeApp();
}

const db = firebaseConfig.firestoreDatabaseId ? getFirestore(firebaseConfig.firestoreDatabaseId) : getFirestore();

async function run() {
  console.log("=== COMPANIES ===");
  const companiesSnap = await db.collection("db_companies").get();
  companiesSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });

  console.log("\n=== USERS ===");
  const usersSnap = await db.collection("db_users").get();
  usersSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

run().catch(console.error);
