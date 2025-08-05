const menuItems = {
  pork: [
    { name: "Pork Sisig", price: 199 },
    { name: "Lechon Kawali", price: 229 }
  ],
  chicken: [
    { name: "Fried Chicken", price: 179 },
    { name: "Buffalo Wings", price: 189 }
  ],
  vegetable: [
    { name: "Pinakbet", price: 149 },
    { name: "Chopsuey", price: 159 }
  ],
  noodles: [
    { name: "Bam-i", price: 149 },
    { name: "Pancit Canton", price: 139 }
  ],
  rice: [
    { name: "Platter Rice", price: 100 },
    { name: "Cup Rice", price: 25 }
  ],
  beef: [
    { name: "Beef Steak", price: 299 },
    { name: "Kaldereta", price: 320 }
  ],
  fish: [
    { name: "Sweet & Sour Fish", price: 219 },
    { name: "Grilled Bangus", price: 199 }
  ]
};

let cart = [];
let selectedItems = [];

// ====== TOGGLE PERSON COUNT FOR DINE-IN ======
function togglePersons() {
  const type = document.getElementById("orderType").value;
  document.getElementById("personCount").style.display = type === "Dine-in" ? "block" : "none";
}

// ====== UPDATE ITEMS BY CATEGORY ======
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

function toggleHighlight(el, cat, index) {
  const key = `${cat}-${index}`;
  const idx = selectedItems.indexOf(key);
  if (idx >= 0) {
    selectedItems.splice(idx, 1);
    el.classList.remove("selected");
  } else {
    selectedItems.push(key);
    el.classList.add("selected");
  }
}

// ====== ADD SELECTED ITEMS TO CART ======
document.getElementById("addSelectedBtn").onclick = () => {
  selectedItems.forEach(key => {
    const [cat, idx] = key.split("-");
    const item = menuItems[cat][parseInt(idx)];
    const existing = cart.find(i => i.name === item.name);
    if (!existing) {
      cart.push({ ...item, qty: 1 });
    } else {
      existing.qty += 1;
    }
  });
  selectedItems = [];
  document.querySelectorAll(".selectable-item").forEach(el => el.classList.remove("selected"));
  renderCart();
};

// ====== RENDER CART & CALCULATE TOTAL ======
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
      <span>₱${item.qty * item.price}</span>
    `;
    cartDiv.appendChild(row);
  });

  document.getElementById("dropdownTotal").textContent = total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// ====== SUBMIT ORDER FORM ======
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (cart.length === 0) {
    showToast("Please select items before submitting.", false);
    return;
  }

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const orderType = document.getElementById("orderType").value;
  const persons = document.getElementById("persons").value || "";
  const datetime = document.getElementById("datetime").value;
  const requests = document.getElementById("requests").value;

  // Format readable date/time
  const dateOnly = datetime.split("T")[0];
  const timeOnly = datetime.split("T")[1];

  // Compose items message
  let itemsText = "";
  cart.forEach(item => {
    itemsText += `- ${item.qty} x ${item.name} = ₱${item.qty * item.price}\n`;
  });

  const total = document.getElementById("dropdownTotal").textContent;

  const telegramMessage = `
🧾 New Order Received!
👤 Name: ${name}
📱 Mobile: ${mobile}
📦 Type: ${orderType}
${orderType === "Dine-in" ? `👥 Persons: ${persons}` : ""}
🗓️ Date: ${dateOnly}
⏰ Time: ${timeOnly}

📝 Order List:
${itemsText}
💬 Special: ${requests || 'None'}

💰 Total: ₱${total}
  `.trim();

  // Prepare payload
  const data = {
    name, mobile, orderType, persons, datetime, requests,
    cart: JSON.stringify(cart),
    total
  };

  showToast("Sending order...", true);

  fetch("https://api.telegram.org/bot7538084446:AAFPKNaEWB0ijOJM0BiusNOOUj6tBUmab0s/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "-1002531095369",
      text: telegramMessage
    })
  })
    .then(res => res.json())
    .then(result => {
      if (result.ok) {
        return fetch("https://script.google.com/macros/s/1IUPNsqjOgW9YamwN0yQXzFH9PncU_ZBVF9jjkAlQ9nVvr1C9Eb0ryIN4/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        throw new Error("Telegram failed.");
      }
    })
    .then(r => r && r.text())
    .then(response => {
      if (response && response.trim().toUpperCase() === "OK") {
        showToast("✅ Order sent! Our staff will handle it after payment.", true);
        document.getElementById("orderForm").reset();
        cart = [];
        renderCart();
      } else {
        showToast("⚠️ Failed to save to Google Sheets.", false);
      }
    })
    .catch(err => {
      showToast("❌ Something went wrong: " + err.message, false);
    });
});

// ====== SHOW TOAST/FLOATING MESSAGE ======
function showToast(message, success = true) {
  let toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.right = "30px";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.background = success ? "#28a745" : "#dc3545";
  toast.style.color = "white";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  toast.style.zIndex = "9999";
  toast.style.transition = "opacity 0.5s ease-in-out";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// ====== Make remove function globally available ======
window.removeFromCart = removeFromCart;