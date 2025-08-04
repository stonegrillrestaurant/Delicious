
document.getElementById("fullOrderForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById("name").value,
    mobile: document.getElementById("mobile").value,
    orderType: document.getElementById("orderType").value,
    persons: document.getElementById("persons").value || "",
    datetime: document.getElementById("datetime").value,
    requests: document.getElementById("requests").value,
    cart: "Sample cart items",
    total: document.getElementById("dropdownTotal").textContent
  };

  fetch("https://api.telegram.org/bot7538084446:AAFPKNaEWB0ijOJM0BiusNOOUj6tBUmab0s/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "-1002531095369",
      text: `New Order from ${data.name}\nTotal: ₱${data.total}`,
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
      alert("Telegram error: " + res.description);
    }
  })
  .then(r => r && r.text())
  .then(response => {
    if (response && response.trim() === "OK") {
      alert("Order submitted successfully!");
    } else {
      alert("Order failed to save to sheet.");
    }
  })
  .catch(err => {
    alert("Network error: " + err.message);
  });
});
