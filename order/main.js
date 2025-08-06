const menuItems = {
  pork: [
    { name: "🐖 Pork Sisig", price: 199 },
    { name: "🐖 Lechon Kawali", price: 229 },
    { name: "🐖 Crispy Pata", price: 499 },
    { name: "🐖 Adobo", price: 179 }
  ],
  chicken: [
    { name: "🐓 Fried Chicken", price: 179 },
    { name: "🐓 Buffalo Wings", price: 189 },
    { name: "🐓 Chicken Inasal", price: 169 },
    { name: "🐓 Chicken Curry", price: 189 }
  ],
  beef: [
    { name: "🐄 Beef Steak Tagalog", price: 299 },
    { name: "🐄 Kalderetang Baka", price: 320 }
  ],
  vegetables: [
    { name: "🥦 Pinakbet", price: 149 },
    { name: "🥦 Chopsuey", price: 159 },
    { name: "🥦 Ginisang Monggo", price: 129 }
  ],
  noodles: [
    { name: "🍜 Bam-i", price: 149 },
    { name: "🍜 Pancit Canton", price: 139 },
    { name: "🍝 Spaghetti", price: 129 }
  ],
  fish: [
    { name: "🐟 Grilled Bangus", price: 199 },
    { name: "🐟 Sweet & Sour Fish", price: 219 },
    { name: "🐟 Fried Tilapia", price: 189 }
  ],
  squid: [
    { name: "🦑 Calamares", price: 199 },
    { name: "🦑 Stuffed Squid", price: 249 }
  ],
  shrimp: [
    { name: "🦐 Buttered Shrimp", price: 259 },
    { name: "🦐 Garlic Shrimp", price: 279 }
  ],
  crabs: [
    { name: "🦀 Chili Garlic Crab", price: 399 },
    { name: "🦀 Steamed Crab", price: 369 }
  ],
  soup: [
    { name: "🍲 Sinigang na Baboy", price: 219 },
    { name: "🍲 Tinolang Manok", price: 199 },
    { name: "🍲 Bulalo", price: 329 }
  ],
  bbq: [
    { name: "🔥 Pork BBQ Stick", price: 45 },
    { name: "🔥 Chicken BBQ", price: 99 }
  ],
  specialties: [
    { name: "⭐ Seafood Boodle Tray", price: 1099 },
    { name: "⭐ Set-C Meal", price: 599 }
  ]
};

let cart = [];
let selectedItems = [];
let selectedCategory = "";

function togglePersons() {
  const orderType = document.getElementById("orderType").value;
  document.getElementById("personCount").style.display = orderType === "Dine-in" ? "block" : "none";
}

function openCategoryPopup() {
  document.getElementById("categoryPopup").classList.remove("hidden");
  const container = document.getElementById("popupItems");
  const title = document.getElementById("popupTitle");
  container.innerHTML = "";
  title.textContent = "Select a Category";

  const categoryList = {
    pork: "🐖 Pork", chicken: "🐓 Chicken", beef: "🐄 Beef", vegetables: "🥦 Vegetables",
    noodles: "🍜 Noodles & Pasta", fish: "🐟 Fish", squid: "🦑 Squid", shrimp: "🦐 Shrimp",
    crabs: "🦀 Crabs", soup: "🍲 Soups", bbq: "🔥 Grilled & BBQ", specialties: "⭐ Specialties"
  };

  Object.keys(menuItems).forEach(cat => {
    const div = document.createElement("div");
    div.className = "selectable-item";
    div.innerText = categoryList[cat];
    div.onclick = () => loadCategory(cat);
    container.appendChild(div);
  });
}

function loadCategory(category) {
  const container = document.getElementById("popupItems");
  const title = document.getElementById("popupTitle");
  selectedCategory = category;
  selectedItems = [];
  container.innerHTML = "";
  title.textContent = "Select " + formatCategoryName(category) + " Items";

  menuItems[category].forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "selectable-item";
    div.innerText = `${item.name} (₱${item.price})`;
    div.onclick = () => toggleHighlight(div, category, i);
    container.appendChild(div);
  });
}

function formatCategoryName(cat) {
  return cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ");
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

function closePopup() {
  document.getElementById("categoryPopup").classList.add("hidden");
}

function addSelectedItems() {
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
  closePopup();
}

function renderCart() {
  const cartDiv = document.getElementById("cartItems");
  cartDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.qty * item.price;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <span class="item-name">${item.qty}x ${item.name}</span>
      <span class="item-price">₱${item.qty * item.price}</span>
      <button class="delete-btn" onclick="removeFromCart(${i})">🗑</button>
    `;
    cartDiv.appendChild(row);
  });

  document.getElementById("dropdownTotal").textContent = total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}
window.removeFromCart = removeFromCart;

// Submit order
const orderForm = document.getElementById("orderForm");
orderForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    mobile: document.getElementById("mobile").value,
    orderType: document.getElementById("orderType").value,
    persons: document.getElementById("persons").value || "",
    datetime: document.getElementById("datetime").value,
    requests: document.getElementById("requests").value,
    cart: cart.map(item => `${item.qty}x ${item.name} (₱${item.price})`).join("\n"),
    total: document.getElementById("dropdownTotal").textContent
  };

  const telegramMessage = `📌 New Order from ${data.name}\n📞 ${data.mobile}\n📍 ${data.orderType} ${data.persons ? `(${data.persons} pax)` : ""}\n📅 ${data.datetime}\n\n🧾 Ordered Items:\n${data.cart}\n\n💰 Total: ₱${data.total}\n\n📝 Note: ${data.requests}`;
  showFloatingMessage("Sending order...");

  fetch("https://api.telegram.org/bot7538084446:AAFPKNaEWB0ijOJM0BiusNOOUj6tBUmab0s/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: "-1002531095369", text: telegramMessage })
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
      throw new Error("Telegram failed.");
    }
  })
  .then(res => res && res.text())
  .then(response => {
    if (response === "OK") {
      showFloatingMessage("✅ Order sent successfully. Staff will handle your order after payment.");
      orderForm.reset();
      cart = [];
      renderCart();
    } else {
      showFloatingMessage("⚠️ Sent to Telegram but failed to record in Google Sheets.");
    }
  })
  .catch(err => {
    showFloatingMessage("❌ Error: " + err.message);
  });
});

// Floating Message
function showFloatingMessage(msg) {
  let floatMsg = document.createElement("div");
  floatMsg.innerText = msg;
  floatMsg.className = "floating-msg";
  document.body.appendChild(floatMsg);
  setTimeout(() => floatMsg.remove(), 5000);
}

// +63 auto format
const mobileInput = document.getElementById("mobile");
mobileInput.addEventListener("input", function () {
  let val = mobileInput.value;
  if (val.length > 1 && val.startsWith("0")) {
    mobileInput.value = "+63" + val.slice(1);
  }
  if (val.includes("++")) {
    mobileInput.value = val.replace("++", "+");
  }
});