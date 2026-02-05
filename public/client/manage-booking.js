let foundBooking = null;

document.addEventListener('DOMContentLoaded', () => {

document.getElementById('retrieveBtn').addEventListener('click', async () => {
  const reference = document.getElementById('bookingRefInput').value.trim();
  const contact = document.getElementById('contactInput').value.trim();
  const isEmail = document.getElementById('contactLabel').textContent.includes('Email');

  if (!reference || !contact) {
    alert('Reference and contact are required');
    return;
  }

  const params = new URLSearchParams(
    isEmail ? { email: contact } : { phone: contact }
  );

  try {
    const res = await fetch(`/api/guest/bookings/${reference}?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) throw data;

    console.log('Booking data received:', data);
    renderBooking(data);

  } catch (err) {
    console.error('Fetch error:', err);
    alert(err.message || 'Booking not found');
  }
});

// Close details button
document.getElementById('closeDetailsBtn').addEventListener('click', () => {
  const modal = bootstrap.Modal.getInstance(document.getElementById('detailsModal'));
  if (modal) modal.hide();
  document.getElementById('bookingDetails').classList.add('d-none');
  document.getElementById('retrieveBookingCard').classList.remove('d-none');
  document.getElementById('paymentProofForm').reset();
  document.getElementById('paymentStatus').classList.add('d-none');
});


function renderBooking(booking) {
  foundBooking = booking;

  document.getElementById('retrieveBookingCard').classList.add('d-none');
  document.getElementById('bookingDetails').classList.remove('d-none');

  document.getElementById('bookingRef').textContent = booking.reference;
  document.getElementById('bookingStatus').textContent = booking.status;
  document.getElementById('checkIn').textContent = booking.check_in;
  document.getElementById('checkOut').textContent = booking.check_out;
  document.getElementById('guestCount').textContent = booking.guests_count;
document.getElementById('guestName').textContent =
  booking.primary_guest.name;

document.getElementById('guestEmail').textContent =
  booking.primary_guest.email;

  document.getElementById('totalAmount').textContent =
    `₱${Number(booking.total).toLocaleString()}`;

  // Status badge
  const badge = document.getElementById('statusBadge');
  badge.textContent = booking.status;
  badge.className = `badge me-2 ${
    booking.status === 'confirmed'
      ? 'bg-success'
      : booking.status === 'pending'
      ? 'bg-warning text-dark'
      : 'bg-danger'
  }`;

  // Rooms table
const tbody = document.getElementById('roomsTableBody');
tbody.innerHTML = '';

console.log('Booking rooms:', booking.rooms);

if (!booking.rooms || booking.rooms.length === 0) {
  console.warn('No rooms found in booking');
  tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No room data available</td></tr>';
} else {
  booking.rooms.forEach(room => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${room.type} (Room ${room.room_number})</td>
      <td>${room.nights}</td>
      <td>₱${Number(room.price_per_night).toLocaleString()}</td>
      <td>₱${Number(room.subtotal).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

console.log('tbody rows:', document.querySelectorAll('#roomsTableBody tr').length);

  // Update payment section visibility based on booking.payment_status
  try { renderPaymentSection(booking); } catch (e) { console.warn('renderPaymentSection error', e); }

// ✅ SHOW MODAL AFTER POPULATING
const modal = new bootstrap.Modal(
  document.getElementById('detailsModal')
);
modal.show();

// Payment proof submission
if (document.getElementById('paymentProofForm')) {
  document.getElementById('paymentProofForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookingRef = foundBooking?.reference;
    if (!bookingRef) {
      alert('No booking reference found');
      return;
    }

    const formData = new FormData();
    formData.append('payment_method', document.getElementById('paymentMethod').value);
    formData.append('proof_image', document.getElementById('paymentProof').files[0]);
    formData.append('transaction_id', document.getElementById('transactionId').value);

    try {
      const res = await fetch(`/api/guest/bookings/${bookingRef}/payment-proof`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      const statusDiv = document.getElementById('paymentStatus');
      
      if (res.ok) {
        statusDiv.className = 'alert alert-success';
        statusDiv.innerHTML = '<i class="fas fa-check-circle me-2"></i>' + data.message;
        document.getElementById('paymentProofForm').reset();
        // update UI state
        if (foundBooking) {
          foundBooking.payment_status = 'submitted';
          renderPaymentSection(foundBooking);
        }
      } else {
        statusDiv.className = 'alert alert-danger';
        statusDiv.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>' + (data.message || 'Error uploading payment proof');
      }
      statusDiv.classList.remove('d-none');

    } catch (err) {
      console.error('Upload error:', err);
      const statusDiv = document.getElementById('paymentStatus');
      statusDiv.className = 'alert alert-danger';
      statusDiv.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Upload failed: ' + err.message;
      statusDiv.classList.remove('d-none');
    }
  });



// document.getElementById('confirmCancelBtn').addEventListener('click', async () => {
//   await fetch(`/api/guest/bookings/${foundBooking.reference}/cancel`, {
//     method: 'POST'
//   })
//   alert('Booking cancelled')
//   location.reload()
// })

};

// Render payment section according to booking.payment_status
function renderPaymentSection(booking) {
  const paymentSection = document.querySelector('.payment-proof-section');
  const paymentForm = document.getElementById('paymentProofForm');
  const paymentStatus = document.getElementById('paymentStatus');
  if (!paymentSection || !paymentForm || !paymentStatus) return;

  const status = booking.payment_status || 'pending';

  if (status === 'pending') {
    paymentForm.style.display = '';
    paymentStatus.classList.add('d-none');
    paymentStatus.innerHTML = '';
  } else if (status === 'submitted') {
    paymentForm.style.display = 'none';
    paymentStatus.classList.remove('d-none');
    paymentStatus.className = 'alert alert-warning mt-3';
    paymentStatus.innerHTML = '<i class="fas fa-hourglass-half me-2"></i>Payment proof submitted. Waiting for admin verification.';
  } else if (status === 'verified') {
    paymentForm.style.display = 'none';
    paymentStatus.classList.remove('d-none');
    paymentStatus.className = 'alert alert-success mt-3';
    paymentStatus.innerHTML = '<i class="fas fa-check-circle me-2"></i>Payment verified successfully!';
  } else if (status === 'failed') {
    paymentForm.style.display = '';
    paymentStatus.classList.remove('d-none');
    paymentStatus.className = 'alert alert-danger mt-3';
    paymentStatus.innerHTML = '<i class="fas fa-times-circle me-2"></i>Payment verification failed. Please resubmit.';
  }
}}});
