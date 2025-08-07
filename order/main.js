const menuItems = {
  pork: [
    { name: "🐖 Pork Sisig", price: 230 },
    { name: "🐖 Lechon Kawali", price: 300 },
    { name: "🐖 Crispy Pata", price: 650 },
    { name: "🐖 Pork Steak", price: 240 },
    { name: "🐖 Sweet and sour pork", price: 230 },
    { name: "🐖 Pork Sinigang", price: 280 },
    { name: "🐖 Pork with Cabage", price: 260 }
  ],
  chicken: [
    { name: "🐓 Fried Chicken", price: 210 },
    { name: "🐓 Buffalo Wings", price: 240 },
    { name: "🐓 Chicken Teriyaki", price: 250 },
    { name: "🐓 Chicken Curry", price: 250 },
    { name: "🐓 Naked Chicken", price: 220 },
    { name: "🐓 Buttered Chicken", price: 220 }
  ],
  beef: [
    { name: "🐄 Beef Steak", price: 300 },
    { name: "🐄 Kalderetang Baka", price: 320 },
    { name: "🐄 Beef with Broccoli", price: 320 },
    { name: "🐄 Beef With mushroom", price: 310 },
    { name: "🐄 Beef with Ampalaya", price: 300 }
  ],
  vegetables: [
    { name: "🥦 Pinakbet", price: 230 },
    { name: "🥦 Chopsuey", price: 210 },
    { name: "🥦 Beef w/ Ampalaya", price: 300 },
    { name: "🥦 Buttered mix Vegetable", price: 210 }
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
  boodle: [
    { name: "⭐ Seafood Boodle Tray", price: 2300 },
    { name: "⭐ Set-C Meal", price: 1980 },
    { name: "⭐ Seafood Inferno", price: 1980 }
  ]
};

let cart = [];
let selectedItems = [];

function togglePersons() {
  const orderType = document.getElementById("orderType").value;
  document.getElementById("personCount").style.display = orderType === "Dine-in" ? "block" : "none";
}

function openCategoryPopup() {
  document.getElementById("categoryPopup").classList.remove("hidden");
  document.getElementById("popupOverlay").classList.remove("hidden");

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

  container.innerHTML = "";
  title.textContent = "Select " + category.charAt(0).toUpperCase() + category.slice(1) + " Item";

  menuItems[category].forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "selectable-item";
    div.innerText = `${item.name} (₱${item.price})`;

    div.onclick = () => {
      const existing = cart.find(i => i.name === item.name);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ ...item, qty: 1 });
      }
      renderCart();
      closePopup();
      showFloatingMessage(`${item.name} added to your order ✅`);
    };

    container.appendChild(div);
  });
}

function closePopup() {
  document.getElementById("categoryPopup").classList.add("hidden");
  document.getElementById("popupOverlay").classList.add("hidden");
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
      <div class="item-name">${item.qty}x ${item.name}</div>
      <div class="item-price">₱${item.qty * item.price}</div>
      <button class="delete-btn" onclick="removeFromCart(${i})">❌</button>
    `;
    cartDiv.appendChild(row);
  });

  const totalRow = document.createElement("div");
  totalRow.className = "cart-total-row";
  totalRow.innerHTML = `
    <hr class="cart-divider" />
    <div class="cart-total-label">Total</div>
    <div class="cart-total-amount">₱${total}</div>
  `;
  cartDiv.appendChild(totalRow);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}
window.removeFromCart = removeFromCart;

const orderForm = document.getElementById("orderForm");
orderForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const rawDateTime = document.getElementById("datetime").value;
const dateObj = new Date(rawDateTime);

// ✅ Format the date: "August 8, 2025"
const formattedDate = dateObj.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// ✅ Format the time: "11:30 AM"
const formattedTime = dateObj.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
});

const data = {
  name: document.getElementById("name").value,
  mobile: document.getElementById("mobile").value,
  orderType: document.getElementById("orderType").value,
  persons: document.getElementById("persons").value || "",
  datetime: `${formattedDate}\n🕒 ${formattedTime}`, // ✅ Formatted output
  requests: document.getElementById("requests").value,
  cart: cart.map(item => `${item.qty}x ${item.name} (₱${item.price})`).join("\n"),
  total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
};

  const telegramMessage = `📌  ${data.name}\n📞 ${data.mobile}\n📍 ${data.orderType} ${data.persons ? `(${data.persons} pax)` : ""}\n📅 ${data.datetime}\n\n🧾 Order:\n${data.cart}\n\n💰 Total: ₱${data.total}\n\n📝 Note: ${data.requests}`;
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

function showFloatingMessage(msg) {
  let floatMsg = document.createElement("div");
  floatMsg.innerText = msg;
  floatMsg.className = "floating-msg";
  document.body.appendChild(floatMsg);
  setTimeout(() => floatMsg.remove(), 3000);
}

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

// Clicking outside popup closes it
document.getElementById("popupOverlay").addEventListener("click", closePopup);