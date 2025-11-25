import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// === Database Internal ===
// Menggunakan Map untuk mensimulasikan database KV (Key-Value Store)
let inventory = new Map(); // Primary DB (Untuk Strong dan Write Weak/Eventual)
let replicaWeak = new Map(); // Weak Replica DB (Untuk Read Weak)
let replicaEventual = new Map(); // Eventual Replica DB (Untuk Read Eventual)

function createItem(name, quantity) {
  // Properti harus sesuai dengan yang diharapkan frontend
  return {
    name: name,
    quantity: quantity,
    timestamp: new Date().toLocaleTimeString(),
  };
}

function updateInventory(db, name, quantity) {
  const itemData = createItem(name, quantity);
  // Simpan itemData dengan 'name' sebagai key
  db.set(name, itemData);
}
// =========================

// === 1. STRONG CONSISTENCY (Gudang Utama) ===
// Semua operasi pada Primary DB (inventory). Data instan dan terjamin.
app.post("/strong/write", (req, res) => {
  const { name, quantity } = req.body;
  updateInventory(inventory, name, quantity);
  const data = Array.from(inventory.values());
  res.json({ mode: "strong", data: data });
});
app.get("/strong/read", (req, res) => {
  const data = Array.from(inventory.values());
  res.json({ mode: "strong", data: data });
});

// === 2. WEAK CONSISTENCY (Toko Cabang) ===
// Write ke Primary (inventory), Read dari Weak Replica (replicaWeak). ReplikaWeak tidak pernah diupdate oleh server secara otomatis, mensimulasikan data lama/kosong.
app.post("/weak/write", (req, res) => {
  const { name, quantity } = req.body;
  // Tulis ke Primary, JANGAN update Weak Replica di sini (ini simulasinya)
  updateInventory(inventory, name, quantity);

  res.json({
    mode: "weak",
    message:
      "Write successful to Primary. Weak Replica may not reflect changes yet.",
  });
});
app.get("/weak/read", (req, res) => {
  // Read dari Weak Replica
  const data = Array.from(replicaWeak.values());
  res.json({ mode: "weak", data: data });
});

// === 3. EVENTUAL CONSISTENCY (Pembaruan Tertunda) ===
// Write ke Primary, Propagasi ke Eventual Replica tertunda 5 detik.
app.post("/eventual/write", (req, res) => {
  const { name, quantity } = req.body;
  // Tulis ke Primary segera
  updateInventory(inventory, name, quantity);

  // Propagasi ke Eventual Replica tertunda 5 detik
  setTimeout(() => {
    updateInventory(replicaEventual, name, quantity);
    console.log(`[Eventual] Item propagated after 5s: ${name}`);
  }, 5000);

  res.json({
    mode: "eventual",
    message: "Write successful. Replica update delayed 5 seconds.",
  });
});
app.get("/eventual/read", (req, res) => {
  // Read dari Eventual Replica
  const data = Array.from(replicaEventual.values());
  res.json({ mode: "eventual", data: data });
});

app.listen(3000, () => console.log("Server running on port 3000"));
