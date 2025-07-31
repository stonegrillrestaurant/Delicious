const inputs = document.querySelectorAll('input[type="number"]');
const totalDisplay = document.getElementById('total');
const form = document.getElementById('orderForm');
const summaryBox = document.getElementById('summary');
const summaryText = document.getElementById('summaryText');

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

form.addEventListener('submit', function(e) {
  e.preventDefault();

  let name = document.getElementById('name').value;
  let mobile = document.getElementById('mobile').value;
  let requests = document.getElementById('requests').value;
  let summary = `Name: ${name}<br>Mobile: ${mobile}<br><br>Ordered:<br>`;

  inputs.forEach(input => {
    const quantity = parseInt(input.value);
    const label = input.previousElementSibling.textContent;
    if (quantity > 0) {
      summary += `- ${label} × ${quantity}<br>`;
    }
  });

  summary += `<br>Special Requests: ${requests}<br>`;
  summary += `<strong>Total: ₱${totalDisplay.textContent}</strong>`;

  summaryText.innerHTML = summary;
  summaryBox.classList.remove('hidden');

  form.reset();
  updateTotal();
});