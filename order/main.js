const inputs = document.querySelectorAll('input[type="number"]');
const totalDisplay = document.getElementById('total');
const form = document.getElementById('orderForm');
const summaryBox = document.getElementById('summary');
const summaryText = document.getElementById('summaryText');
const personsField = document.getElementById('personsField');

inputs.forEach(input => {
  input.addEventListener('input', updateTotal);
});

function updateTotal() {
  let total = 0;
  inputs.forEach(input => {
    const quantity = parseInt(input.value) || 0;
    const price = parseInt(input.dataset.price);
    total += quantity * price;
  });
  totalDisplay.textContent = total;
}

function togglePersons() {
  const orderType = document.getElementById('orderType').value;
  personsField.classList.toggle('hidden', orderType !== 'Dine-in');
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById("name").value,
    mobile: document.getElementById("mobile").value,
    orderType: document.getElementById("orderType").value,
    persons: document.getElementById("persons").value || "",
    datetime: document.getElementById("datetime").value,
    requests: document.getElementById("requests").value,
    total: totalDisplay.textContent
  };

  const message = `New Order from ${data.name}\nMobile: ${data.mobile}\nOrder: ${data.orderType} ${data.persons ? "(" + data.persons + " pax)" : ""}\nWhen: ${data.datetime}\nRequest: ${data.requests}\nTotal: ₱${data.total}`;

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
      alert("Telegram failed: " + res.description);
      throw new Error("Telegram failed");
    }
  })
  .then(r => r && r.text())
  .then(response => {
    if (response && response.trim() === "OK") {
      summaryText.innerHTML = "<h3>Your order has been submitted!</h3><p>We'll process it after payment is confirmed.</p>";
      summaryBox.classList.remove("hidden");
    } else {
      alert("Google Sheet error.");
    }
  })
  .catch(err => {
    summaryText.innerHTML = "<h3>Your order was not sent.</h3><p>Please try again later.</p>";
    summaryBox.classList.remove("hidden");
    console.error(err);
  });

  form.reset();
  updateTotal();
});
