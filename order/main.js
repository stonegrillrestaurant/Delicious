const menuItems = {
  pork: [
    { name: "Pork Sisig", price: 199 },
    { name: "Lechon Kawali", price: 229 },
    { name: "Pork BBQ (3pcs)", price: 99 }
  ],
  chicken: [
    { name: "Fried Chicken", price: 179 },
    { name: "Buffalo Wings", price: 189 },
    { name: "Chicken Inasal", price: 195 }
  ],
  beef: [
    { name: "Beef Steak", price: 299 },
    { name: "Kalderetang Baka", price: 320 },
    { name: "Bulalo", price: 349 }
  ],
  vegetable: [
    { name: "Pinakbet", price: 149 },
    { name: "Chopsuey", price: 159 },
    { name: "Adobong Kangkong", price: 119 }
  ],
  fish: [
    { name: "Grilled Bangus", price: 199 },
    { name: "Sweet & Sour Fish", price: 219 },
    { name: "Tuna Belly", price: 239 }
  ],
  noodles: [
    { name: "Pancit Canton", price: 139 },
    { name: "Bam-i", price: 149 },
    { name: "Sotanghon Guisado", price: 159 }
  ],
  pasta: [
    { name: "Spaghetti", price: 149 },
    { name: "Carbonara", price: 159 }
  ],
  squid: [
    { name: "Calamares", price: 199 },
    { name: "Grilled Squid", price: 239 }
  ],
  shrimp: [
    { name: "Buttered Shrimp", price: 259 },
    { name: "Garlic Shrimp", price: 269 }
  ],
  crabs: [
    { name: "Crab w/ Sauce", price: 389 },
    { name: "Steamed Crabs", price: 369 }
  ],
  grilledbbq: [
    { name: "BBQ Platter", price: 349 },
    { name: "Grilled Liempo", price: 229 }
  ],
  soup: [
    { name: "Sinigang na Baboy", price: 199 },
    { name: "Tinolang Manok", price: 189 }
  ],
  specialties: [
    { name: "Seafood Boodle Tray", price: 899 },
    { name: "Set-C Meal", price: 599 }
  ],
  refreshments: [
    { name: "Iced Tea Pitcher", price: 99 },
    { name: "Mineral Water", price: 25 }
  ]
};

// ===== Functional Cart Logic =====
let cart = [];
let selectedItems = [];

function togglePersons() {
  const val = document.getElementById("orderType").value;
  document.getElementById("personCount").style.display = (val === "Dine-in") ? "block" : "none";
}

function updateItems() {
  const category = document.getElementById("category").value;
  const container = document.getElementById("itemSelection");
  container.innerHTML = "";
  selectedItems = [];

  if (menuItems[category]) {
    menuItems[category].forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "selectable-item";
      div.innerText = `${item.name} (₱${item.price})`;
      div.onclick = () => toggleHighlight(div, category, i);
      container.appendChild(div);
    });
  }
}

function toggleHighlight(element, cat, index) {
  const key = `${cat}-${index}`;
  const idx = selectedItems.indexOf(key);
  if (idx >= 0) {
    selectedItems.splice(idx, 1);
    element.classList.remove("selected");
  } else {
    selectedItems.push(key);
    element.classList.add("selected");
  }
}

document.getElementById("addSelectedBtn").onclick = function () {
  selectedItems.forEach(key => {
    const [cat, idx] = key.split("-");
    const item = menuItems[cat][parseInt(idx)];
    const existing = cart.find(i => i.name === item.name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...item, qty: 1 });
    }
  });
  selectedItems = [];
  document.querySelectorAll(".selectable-item").forEach(el => el.classList.remove("selected"));
  renderCart();
};

function renderCart() {
  const cartDiv = document.getElementById("cartItems");
  cartDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.qty * item.price;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <button class="delete-btn" onclick="removeFromCart(${i})">🗑</button>
      <span>${item.qty}x ${item.name}</span>
      <span>₱${item.price}</span>
    `;
    cartDiv.appendChild(row);
  });

  document.getElementById("dropdownTotal").textContent = total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// ===== Submit Order + Telegram + Google Sheets + Floating Msg =====
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();
  if (cart.length === 0) {
    showFloatingMsg("Please select at least 1 item.", false);
    return;
  }

  const name = document.getElementById("name").value;
  const mobile = document.getElementById("mobile").value;
  const datetime = document.getElementById("datetime").value;
  const orderType = document.getElementById("orderType").value;
  const persons = document.getElementById("persons").value || "";
  const requests = document.getElementById("requests").value;

  const itemsText = cart.map(i => `• ${i.qty}x ${i.name} @₱${i.price}`).join("\n");
  const total = document.getElementById("dropdownTotal").textContent;

  const message = `🧾 *New Order Received!*\n👤 Name: ${name}\n📱 Mobile: ${mobile}\n🗓 Date: ${datetime}\n🍽 Type: ${orderType} ${persons ? "(" + persons + " pax)" : ""}\n\n📦 Orders:\n${itemsText}\n\n📝 Notes: ${requests}\n💰 Total: ₱${total}`;

  const data = {
    name, mobile, datetime, orderType, persons, requests,
    cart: JSON.stringify(cart), total
  };

  fetch("https://api.telegram.org/bot7538084446:AAFPKNaEWB0ijOJM0BiusNOOUj6tBUmab0s/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "-1002531095369",
      text: message,
      parse_mode: "Markdown"
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.ok) {
      return fetch("https://script.google.com/macros/s/1IUPNsqjOgW9YamwN0yQXzFH9PncU_ZBVF9jjkAlQ9nVvr1C9Eb0ryIN4/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } else {
      throw new Error("Telegram failed to send.");
    }
  })
  .then(r => r && r.text())
  .then(response => {
    if (response === "OK") {
      showFloatingMsg("Order received! Staff will handle it after payment.", true);
      document.getElementById("orderForm").reset();
      cart = [];
      renderCart();
    } else {
      showFloatingMsg("Saving to sheet failed.", false);
    }
  })
  .catch(err => {
    showFloatingMsg("Error: " + err.message, false);
  });
});

function showFloatingMsg(msg, success) {
  const float = document.createElement("div");
  float.className = success ? "floating success" : "floating error";
  float.innerText = msg;
  document.body.appendChild(float);
  setTimeout(() => float.remove(), 4000);
}

// ===== Auto-format +63 Mobile =====
document.getElementById("mobile").addEventListener("input", function () {
  let val = this.value;
  if (val.startsWith("0")) {
    this.value = "+63" + val.slice(1);
  }
  if (val.includes("++")) {
    this.value = val.replace("++", "+");
  }
});

// Expose removeFromCart globally
window.removeFromCart = removeFromCart;