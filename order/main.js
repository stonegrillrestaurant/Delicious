// ===== MENU ITEMS LIST (Editable Prices)
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

// ===== GLOBAL STATE
let cart = [];
let selectedItems = [];

// ===== TOGGLE PERSON COUNT IF DINE-IN
function togglePersons() {
  const val = document.getElementById("orderType").value;
  document.getElementById("personCount").style.display = (val === "Dine-in") ? "block" : "none";
}

// ===== SHOW ITEMS BASED ON SELECTED CATEGORY
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

// ===== HIGHLIGHT ITEM WHEN SELECTED
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

// ===== ADD SELECTED ITEMS TO CART
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

// ===== SHOW CART ITEMS
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

// ===== REMOVE FROM CART
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}
window.removeFromCart = removeFromCart; // make globally accessible

// ===== MOBILE NUMBER FORMAT (+63)
const mobileInput = document.getElementById("mobile");
mobileInput.addEventListener("input", function () {
  let val = mobileInput.value;
  if (val.length > 1 && val.startsWith("0")) {
    val = "+63" + val.slice(1);
    mobileInput.value = val;
  }
  if (val.includes("++")) {
    mobileInput.value = val.replace("++", "+");
  }
});

// ===== SUBMIT FORM
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Validate form
  const name = document.getElementById("name");
  const mobile = document.getElementById("mobile");
  const orderType = document.getElementById("orderType");
  const datetime = document.getElementById("datetime");

  if (!name.value.trim()) return alertMark(name, "Name is required");
  if (!mobile.value.startsWith("+63")) return alertMark(mobile, "Mobile must start with +63");
  if (!orderType.value) return alertMark(orderType, "Please choose order type");
  if (!datetime.value) return alertMark(datetime, "Date and Time required");
  if (cart.length === 0) return alert("Please select at least 1 item.");

  const data = {
    name: name.value,
    mobile: mobile.value,
    orderType: orderType.value,
    persons: document.getElementById("persons").value || "",
    datetime: datetime.value,
    requests: document.getElementById("requests").value,
    cart: JSON.stringify(cart),
    total: document.getElementById("dropdownTotal").textContent
  };

  showFloatingMessage("Sending order...");

  // Send to Telegram
  fetch("https://api.telegram.org/bot7538084446:AAFPKNaEWB0ijOJM0BiusNOOUj6tBUmab0s/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "-1002531095369",
      text: `📦 New Order from ${data.name}\n🧾 Total: ₱${data.total}\n📱 ${data.mobile}`,
      parse_mode: "Markdown"
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.ok) {
      // Send to Google Sheets
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
      showFloatingMessage("✅ Order received! Our staff will assist you after payment.");
      document.getElementById("orderForm").reset();
      cart = [];
      renderCart();
    } else {
      throw new Error("Google Sheets saving failed.");
    }
  })
  .catch(err => {
    showFloatingMessage("❌ " + err.message);
  });
});

// ===== FORM ERROR HIGHLIGHT
function alertMark(input, message) {
  input.focus();
  input.style.borderColor = "red";
  alert(message);
}

// ===== FLOATING CONFIRMATION
function showFloatingMessage(text) {
  let msg = document.createElement("div");
  msg.className = "floating-message";
  msg.innerText = text;
  document.body.appendChild(msg);
  setTimeout(() => {
    msg.remove();
  }, 5000);
}