let foundBooking = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('retrieveBtn')?.addEventListener('click', retrieveBooking);
  document.getElementById('closeDetailsBtn')?.addEventListener('click', closeDetails);
  document.getElementById('requestCancelBtn')?.addEventListener('click', redirectToCancel);
  document.getElementById('paymentProofForm')?.addEventListener('submit', submitPaymentProof);
  document.getElementById('feedbackForm')?.addEventListener('submit', submitFeedback);

  document.querySelectorAll('.feedback-star').forEach(star => {
    star.addEventListener('click', function () {
      const rating = this.getAttribute('data-rating');
      document.getElementById('feedbackRating').value = rating;
      updateStarDisplay(rating);
    });
  });
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
  renderFeedbackSection(booking);

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
  const paymentSection = document.querySelector('.payment-proof-section');
  const form = document.getElementById('paymentProofForm');
  const statusBox = document.getElementById('paymentStatus');
  if (!form || !statusBox) return;

  const status = booking.payment_status || 'pending';

  if (booking.status === 'checked_out') {
    paymentSection.style.display = 'none';
    return; 
  } else {
    paymentSection.style.display = '';
  }

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

function RenderFeedback(){
  
}

/* ===============================
   FEEDBACK SECTION
================================ */
function renderFeedbackSection(booking) {
  const feedbackSection = document.getElementById('feedbackSection');
  const form = document.getElementById('feedbackForm');
  const statusBox = document.getElementById('feedbackStatus');

  if (!feedbackSection || !form) return;

  // Show feedback section only if booking is checked out
  if (booking.status === 'checked_out') {
    feedbackSection.style.display = '';
    
    // Check if feedback already exists
    if (booking.feedback) {
      // Hide form and show that feedback was already submitted
      form.style.display = 'none';
      statusBox.className = 'alert alert-info';
      statusBox.innerHTML = `
        <i class="fas fa-info-circle me-2"></i>
        <strong>Thank you for your feedback!</strong><br>
        Your feedback was submitted on ${new Date(booking.feedback.created_at).toLocaleDateString()}
      `;
      statusBox.classList.remove('d-none');
    } else {
      // Show form for new feedback
      form.style.display = '';
      statusBox.classList.add('d-none');
      populateRoomOptions(booking.rooms || []);
    }
  } else {
    feedbackSection.style.display = 'none';
  }
}

function populateRoomOptions(rooms) {
  const roomSelect = document.getElementById('feedbackRoom');
  if (!roomSelect) return;

  const options = roomSelect.querySelectorAll('option');
  options.forEach((opt, idx) => {
    if (idx > 0) opt.remove();
  });

  rooms.forEach(room => {
    const option = document.createElement('option');
    option.value = room.room_id || '';
    option.textContent = `${room.type} (Room ${room.room_number})`;
    roomSelect.appendChild(option);
  });
}

function updateStarDisplay(rating) {
  document.querySelectorAll('.feedback-star').forEach(star => {
    const starRating = parseInt(star.getAttribute('data-rating'));
    if (starRating <= rating) {
      star.style.color = '#FFD700'; 
    } else {
      star.style.color = '#ddd'; 
    }
  });
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
        headers: {
          'Accept': 'application/json',
        },
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
  document.getElementById('feedbackForm')?.reset();
  document.getElementById('feedbackStatus')?.classList.add('d-none');
  document.getElementById('feedbackRating').value = '';
  updateStarDisplay(0);
}

/* ===============================
   SUBMIT FEEDBACK
================================ */
async function submitFeedback(e) {
  e.preventDefault();

  if (!foundBooking?.reference) {
    alert('Booking reference not found');
    return;
  }

  const rating = document.getElementById('feedbackRating').value;
  const roomId = document.getElementById('feedbackRoom').value;
  const comments = document.getElementById('feedbackComments').value;

  if (!rating) {
    alert('Please select a rating');
    return;
  }

  if (!comments.trim()) {
    alert('Please enter your feedback');
    return;
  }

  const feedbackData = {
    rating: parseInt(rating),
    comments: comments.trim(),
  };

  if (roomId) {
    feedbackData.room_id = parseInt(roomId);
  }

  try {
    const res = await fetch(`/api/guest/bookings/${foundBooking.reference}/submitFeedback`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });

    const data = await res.json();
    if (!res.ok) throw data;

    // Show success message
    const statusBox = document.getElementById('feedbackStatus');
    statusBox.className = 'alert alert-success';
    statusBox.innerHTML = '<i class="fas fa-check-circle me-2"></i>' + (data.message || 'Thank you for your feedback!');
    statusBox.classList.remove('d-none');

    document.getElementById('feedbackForm').style.display = 'none';

  } catch (err) {
    const statusBox = document.getElementById('feedbackStatus');
    statusBox.className = 'alert alert-danger';
    statusBox.innerHTML = '<i class="fas fa-times-circle me-2"></i>' + (err.message || 'Failed to submit feedback');
    statusBox.classList.remove('d-none');
  }
}
