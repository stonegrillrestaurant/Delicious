const form = document.getElementById("orderForm");
const totalDisplay = document.getElementById("total");
const summaryBox = document.getElementById("summary");
const summaryText = document.getElementById("summaryText");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const mobile = document.getElementById("mobile").value;
  const requests = document.getElementById("requests").value;
  const total = totalDisplay.textContent;

  const data = {
    name: name,
    mobile: mobile,
    requests: requests,
    cart: "Not detailed here",
    total: total
  };

  const message = `New Order from ${data.name}\nTotal: ₱${data.total}`;

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
      throw new Error("Telegram send failed");
    }
  })
  .then(() => {
    summaryBox.classList.remove("hidden");
    summaryText.innerHTML = `<strong>Your order has been sent!</strong>`;
    form.reset();
  })
  .catch(err => {
    summaryBox.classList.remove("hidden");
    summaryText.innerHTML = `<span style='color:red;'>Order not sent. Try again.</span>`;
  });
});
