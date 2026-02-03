// ---------------- Load pending booking ----------------
const booking = JSON.parse(sessionStorage.getItem('pendingBooking'));

if (!booking) {
  alert('No booking found. Please start again.');
  window.location.href = 'index.html';
}

// ---------------- Helpers ----------------
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function calculateNights() {
  const start = new Date(booking.check_in);
  const end = new Date(booking.check_out);
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

// ---------------- Populate Booking Details ----------------
document.getElementById('confirmedCheckIn').textContent =
  formatDate(booking.check_in);

document.getElementById('confirmedCheckOut').textContent =
  formatDate(booking.check_out);

document.getElementById('confirmedGuests').textContent =
  booking.number_of_guests;

// Use first room guest as main contact
document.getElementById('confirmedGuestName').textContent =
  booking.rooms[0].guest.name;

document.getElementById('confirmedGuestEmail').textContent =
  booking.rooms[0].guest.email;

document.getElementById('invoiceDate').textContent =
  new Date().toLocaleDateString();

// ---------------- Populate Items Table ----------------
const tbody = document.querySelector('.table-invoice tbody');
tbody.innerHTML = '';

const nights = calculateNights();
let subtotal = 0;

booking.rooms.forEach(room => {
  const amount = room.price * nights;
  subtotal += amount;

  tbody.innerHTML += `
    <tr>
      <td>${room.type}</td>
      <td>${nights} night${nights > 1 ? 's' : ''}</td>
      <td>₱${room.price.toLocaleString()}</td>
      <td>₱${amount.toLocaleString()}</td>
    </tr>
  `;
});

// ---------------- Totals ----------------
// const vat = subtotal * 0.12;
// const total = subtotal + vat;

document.getElementById('confirmedTotalAmount').textContent =
  `₱${subtotal.toLocaleString()}`;

// document.getElementById('confirmedTaxes').textContent =
//   `₱${vat.toLocaleString()}`;

document.getElementById('confirmedRemainingBalance').textContent =
  `₱${subtotal.toLocaleString()}`;

// ---------------- Payment Summary ----------------
const paymentSummary = document.querySelector('.payment-summary');

booking.rooms.forEach(room => {
  const div = document.createElement('div');
  div.className = 'payment-method';
  div.style.fontSize = '0.80rem';
  div.style.fontFamily = 'poppins, sans-serif';

  div.innerHTML = `
    <strong>${room.type}</strong> — Paid via <strong>${room.payment_method}</strong>
  `;

  paymentSummary.appendChild(div);
});

// ---------------- Final Booking (API call) ----------------
async function finalizeBooking() {
  try {
    const res = await fetch('http://localhost:8000/api/guest/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(booking)
    });

    const data = await res.json();
    if (!res.ok) throw data;

    sessionStorage.removeItem('pendingBooking');
    alert(`BOOKING SUCCESSFULLY! REFERENCE NUMBER: ${data.reference_number}`)
    window.location.href = `/client/manage-booking.html`;
  } catch (err) {
    console.error(err);
    alert('Booking failed. Please try again.');
  }
}
