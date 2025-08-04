const cartItems = [];
const cartContainer = document.getElementById("cartItems");
const totalDisplay = document.getElementById("dropdownTotal");

let selectedItem = null;
document.querySelectorAll(".item").forEach(item => {
  item.addEventListener("click", () => {
    item.classList.toggle("selected");
    selectedItem = item.classList.contains("selected") ? item : null;
  });
});

document.getElementById("addBtn").addEventListener("click", () => {
  if (!selectedItem) return;
  const name = selectedItem.dataset.name;
  const price = parseFloat(selectedItem.dataset.price);
  const qty = 1;
  cartItems.push({ name, price, qty });
  renderCart();
  selectedItem.classList.remove("selected");
  selectedItem = null;
});

function renderCart() {
  cartContainer.innerHTML = "";
  let total = 0;
  cartItems.forEach((item, index) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.classList.add("cart-line");
    div.innerHTML = `<button onclick="removeItem(${index})">❌</button> [${item.qty}] ${item.name}<span>₱${item.price}</span>`;
    cartContainer.appendChild(div);
  });
  totalDisplay.textContent = total;
}

function removeItem(index) {
  cartItems.splice(index, 1);
  renderCart();
}

document.getElementById("fullOrderForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const mobile = document.getElementById("mobile").value;
  const orderType = document.getElementById("orderType").value;
  const persons = document.getElementById("persons").value;
  const datetime = document.getElementById("datetime").value;
  const requests = document.getElementById("requests").value;
  const total = totalDisplay.textContent;
  const cart = JSON.stringify(cartItems);

  const data = { name, mobile, orderType, persons, datetime, requests, cart, total };

  const message = `New Order from ${data.name}
Mobile: ${data.mobile}
Type: ${data.orderType}
PAX: ${data.persons}
DateTime: ${data.datetime}
Items: ${cart}
Total: ₱${total}
Request: ${data.requests}`;

  fetch("https://api.telegram.org/bot7538084446:AAFPKNaEWB0ijOJM0BiusNOOUj6tBUmab0s/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: "-1002531095369", text: message })
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
      alert("Telegram send failed.");
    }
  })
  .then(r => r && r.text())
  .then(response => {
    if (response === "OK") {
      alert("Order received. Thank you!");
    } else {
      alert("Failed to save to sheet.");
    }
  });
});
