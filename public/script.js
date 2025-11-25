const baseURL = "";

function renderNotes(containerId, notes) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  notes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerText = `[${note.timestamp}] ${note.user}: ${note.value}`;
    container.appendChild(div);
  });
}

async function writeStrong() {
  const value = document.getElementById("strongInput").value;
  const user = document.getElementById("username").value || "Anonymous";
  const res = await fetch(baseURL + "/strong/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value, user }),
  });
  const data = await res.json();
  renderNotes("strongOutput", data.data);
}
async function readStrong() {
  const res = await fetch(baseURL + "/strong/read");
  const data = await res.json();
  renderNotes("strongOutput", data.data);
}

// WEAK (delay lebih lama)
app.post("/weak/write", (req, res) => {
  const note = createNote(req.body.value, req.body.user);
  setTimeout(() => {
    replicaWeak.push(note);
  }, 5000); // delay 5 detik
  res.json({ mode: "weak", message: "write queued" });
});

// EVENTUAL (delay menengah)
app.post("/eventual/write", (req, res) => {
  const note = createNote(req.body.value, req.body.user);
  setTimeout(() => {
    replicaEventual.push(note);
  }, 2000); // delay 2 detik
  res.json({ mode: "eventual", message: "write queued" });
});
