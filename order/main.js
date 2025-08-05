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
    let existing = cart.find(i => i.name === item.name);
    if (existing) {
      existing.qty += 1;
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

document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();
  if (cart.length === 0) {
    alert("Please select at least 1 item.");
    return;
  }

  const data = {
    name: document.getElementById("name").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    orderType: document.getElementById("orderType").value,
    persons: document.getElementById("persons").value || "",
    datetime: document.getElementById("datetime").value,
    requests: document.getElementById("requests").value.trim(),
    cart: JSON.stringify(cart),
    total: document.getElementById("dropdownTotal").textContent
  };

  // Format cart for Telegram
  let cartText = cart.map(i => `- ${i.qty} x ${i.name} = ₱${i.qty * i.price}`).join("\n");
  const telegramMsg =
    `🧾 *New Order Received!*\n\n👤 Name: ${data.name}\n📱 Mobile: ${data.mobile}\n📦 Type: ${data.orderType}\n👥 Persons: ${data.persons || 'N/A'}\n🗓️ Date: ${data.datetime.split('T')[0]}
⏰ Time: ${data.datetime.split('T')[1]}\n\n📝 *Order List:*\n${cartText}\n\n💬 Special: ${data.requests || 'None'}\n\n💰 *Total: ₱${data.total}*`;

  // Telegram Send
  fetch("https://api.telegram.org/bot7538084446:AAFPKNaEWB0ijOJM0BiusNOOUj6tBUmab0s/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "-1002531095369",
      text: telegramMsg,
      parse_mode: "Markdown"
    })
  })
    .then(r => r.json())
    .then(res => {
      if (res.ok) {
        // Save to Google Sheet
        return fetch("https://script.google.com/macros/s/1IUPNsqjOgW9YamwN0yQXzFH9PncU_ZBVF9jjkAlQ9nVvr1C9Eb0ryIN4/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        alert("❌ Failed to send to Telegram.");
        throw new Error("Telegram failed.");
      }
    })
    .then(r => r.text())
    .then(response => {
      if (response === "OK") {
        alert("✅ Order sent! Our staff will handle it after payment is received.");
        document.getElementById("orderForm").reset();
        document.getElementById("personCount").style.display = "none";
        cart = [];
        renderCart();
      } else {
        alert("⚠️ Failed to save to Google Sheets.");
      }
    })
    .catch(err => {
      alert("❗ Something went wrong: " + err.message);
    });
});

window.removeFromCart = removeFromCart;