let foundBooking = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('retrieveBtn')?.addEventListener('click', retrieveBooking);
  document.getElementById('closeDetailsBtn')?.addEventListener('click', closeDetails);
  document.getElementById('requestCancelBtn')?.addEventListener('click', redirectToCancel);
  document.getElementById('paymentProofForm')?.addEventListener('submit', submitPaymentProof);
});

/* ===============================
   FETCH BOOKING
================================ */
async function retrieveBooking() {
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
    const res = await fetch(`/api/guest/bookings/${reference}?${params}`);
    const data = await res.json();
    if (!res.ok) throw data;

    renderBooking(data);
  } catch (err) {
    alert(err.message || 'Booking not found');
  }
}

/* ===============================
   RENDER BOOKING
================================ */
function renderBooking(booking) {
  foundBooking = booking;

  document.getElementById('retrieveBookingCard').classList.add('d-none');
  document.getElementById('bookingDetails').classList.remove('d-none');

  document.getElementById('bookingRef').textContent = booking.reference;
  document.getElementById('bookingStatus').textContent = booking.status;
  document.getElementById('checkIn').textContent = booking.check_in;
  document.getElementById('checkOut').textContent = booking.check_out;
  document.getElementById('guestCount').textContent = booking.guests_count;

  document.getElementById('guestName').textContent = booking.primary_guest.name;
  document.getElementById('guestEmail').textContent = booking.primary_guest.email;

  document.getElementById('totalAmount').textContent =
    `₱${Number(booking.total).toLocaleString()}`;

  renderStatusBadge(booking.status);
  renderRooms(booking.rooms);
  renderPaymentSection(booking);

  new bootstrap.Modal(document.getElementById('detailsModal')).show();
}

/* ===============================
   STATUS BADGE
================================ */
function renderStatusBadge(status) {
  const badge = document.getElementById('statusBadge');
  badge.textContent = status;
  badge.className = `badge me-2 ${
    status === 'confirmed'
      ? 'bg-success'
      : status === 'pending'
      ? 'bg-warning text-dark'
      : 'bg-danger'
  }`;
}

/* ===============================
   ROOMS TABLE
================================ */
function renderRooms(rooms = []) {
  const tbody = document.getElementById('roomsTableBody');
  tbody.innerHTML = '';

  if (!rooms.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          No room data available
        </td>
      </tr>`;
    return;
  }

  rooms.forEach(room => {
    tbody.innerHTML += `
      <tr>
        <td>${room.type} (Room ${room.room_number})</td>
        <td>${room.nights}</td>
        <td>₱${Number(room.price_per_night).toLocaleString()}</td>
        <td>₱${Number(room.subtotal).toLocaleString()}</td>
      </tr>`;
  });
}

/* ===============================
   PAYMENT SECTION
================================ */
function renderPaymentSection(booking) {
  const form = document.getElementById('paymentProofForm');
  const statusBox = document.getElementById('paymentStatus');
  if (!form || !statusBox) return;

  const status = booking.payment_status || 'pending';

  if (status === 'pending') {
    form.style.display = '';
    statusBox.classList.add('d-none');
  }

  if (status === 'submitted') {
    form.style.display = 'none';
    statusBox.className = 'alert alert-warning mt-3';
    statusBox.innerHTML =
      '<i class="fas fa-hourglass-half me-2"></i>Payment proof submitted. Waiting for admin verification.';
    statusBox.classList.remove('d-none');
  }

  if (status === 'verified') {
    form.style.display = 'none';
    statusBox.className = 'alert alert-success mt-3';
    statusBox.innerHTML =
      '<i class="fas fa-check-circle me-2"></i>Payment verified successfully!';
    statusBox.classList.remove('d-none');
  }

  if (status === 'failed') {
    form.style.display = '';
    statusBox.className = 'alert alert-danger mt-3';
    statusBox.innerHTML =
      '<i class="fas fa-times-circle me-2"></i>Payment verification failed. Please resubmit.';
    statusBox.classList.remove('d-none');
  }
}

/* ===============================
   PAYMENT PROOF SUBMIT
================================ */
async function submitPaymentProof(e) {
  e.preventDefault();
  if (!foundBooking?.reference) return;

  const formData = new FormData(e.target);

  try {
    const res = await fetch(`/api/guest/bookings/${foundBooking.reference}/payment-proof`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw data;

    foundBooking.payment_status = 'submitted';
    renderPaymentSection(foundBooking);
    e.target.reset();

  } catch (err) {
    alert(err.message || 'Payment upload failed');
  }
}

/* ===============================
   CANCEL REDIRECT
================================ */
function redirectToCancel() {
  if (!foundBooking?.reference) {
    alert('Booking reference not found');
    return;
  }
  window.location.href =
    `cancel-page.html?ref=${encodeURIComponent(foundBooking.reference)}`;
}

/* ===============================
   CLOSE DETAILS
================================ */
function closeDetails() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById('detailsModal')
  );
  if (modal) modal.hide();

  document.getElementById('bookingDetails').classList.add('d-none');
  document.getElementById('retrieveBookingCard').classList.remove('d-none');
  document.getElementById('paymentProofForm')?.reset();
  document.getElementById('paymentStatus')?.classList.add('d-none');
}
