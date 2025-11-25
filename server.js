import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let primaryDB = [];
let replicaWeak = [];
let replicaEventual = [];

function createNote(value, user) {
  return { value, user, timestamp: new Date().toLocaleTimeString() };
}

// STRONG
app.post("/strong/write", (req,res)=>{
  const note = createNote(req.body.value, req.body.user);
  primaryDB.push(note);
  res.json({mode:"strong", data:primaryDB});
});
app.get("/strong/read",(req,res)=>{
  res.json({mode:"strong", data:primaryDB});
});

// WEAK
app.post("/weak/write",(req,res)=>{
  res.json({mode:"weak", data:replicaWeak});
});
app.get("/weak/read",(req,res)=>{
  res.json({mode:"weak", data:replicaWeak});
});

// EVENTUAL
app.post("/eventual/write",(req,res)=>{
  const note = createNote(req.body.value, req.body.user);
  setTimeout(()=>{ replicaEventual.push(note); },5000);
  res.json({mode:"eventual", message:"write queued"});
});
app.get("/eventual/read",(req,res)=>{
  res.json({mode:"eventual", data:replicaEventual});
});

app.listen(3000, ()=>console.log("Server running on port 3000"));
