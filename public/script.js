const baseURL = "";

function renderInventory(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (items.length === 0) {
    container.innerText = "Tidak ada stok tercatat.";
    return;
  }
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item-card";
    // Mengakses properti name dan quantity, yang kini dijamin ada.
    div.innerHTML = `
            <strong>${item.name}</strong>: ${item.quantity} unit 
            <span style="float: right; font-size: 0.8em; color: #6c757d;">(Updated: ${item.timestamp})</span>
        `;
    container.appendChild(div);
  });
}

async function writeInventory(mode) {
  const name = document.getElementById(`${mode}Name`).value;
  const quantity = parseInt(document.getElementById(`${mode}Qty`).value);
  const user = document.getElementById("username").value || "Anonymous";

  if (!name || isNaN(quantity)) {
    alert("Nama item dan kuantitas harus diisi!");
    return;
  }

  const endpoint = `/${mode}/write`;
  const res = await fetch(baseURL + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, user }),
  });
  const data = await res.json();

  if (mode === "strong") {
    renderInventory("strongOutput", data.data);
  } else if (mode === "weak") {
    alert(data.message);
  } else if (mode === "eventual") {
    document.getElementById("eventualMessage").innerText = data.message;
  }
}

async function readInventory(mode) {
  const endpoint = `/${mode}/read`;
  const res = await fetch(baseURL + endpoint);
  const data = await res.json();

  const outputId = `${mode}Output`;

  if (mode === "strong") {
    renderInventory(outputId, data.data);
  } else if (mode === "weak") {
    renderInventory(outputId, data.data);
    if (data.data.length === 0) {
      console.warn("Weak Replica is empty. This proves Weak Consistency!");
    }
  } else if (mode === "eventual") {
    renderInventory(outputId, data.data);
  }
}

// === FUNGSI PEMBAGIAN PERAN ===
function setRole(role, username) {
  sessionStorage.setItem("userRole", role);
  document.getElementById("username").value = username;
  initApp();
}

function initApp() {
  const role = sessionStorage.getItem("userRole");
  const roleSelector = document.getElementById("roleSelector");
  const appContent = document.getElementById("appContent");
  const strongSection = document.getElementById("strongSection");
  const weakSection = document.getElementById("weakSection");
  const eventualSection = document.getElementById("eventualSection");

  if (role) {
    roleSelector.classList.add("hidden");
    appContent.classList.remove("hidden");

    if (role === "strong") {
      strongSection.classList.remove("hidden");
      weakSection.classList.add("hidden");
      eventualSection.classList.add("hidden");
    } else if (role === "weak_eventual") {
      strongSection.classList.add("hidden");
      weakSection.classList.remove("hidden");
      eventualSection.classList.remove("hidden");
    }
  } else {
    roleSelector.classList.remove("hidden");
    appContent.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", initApp);
