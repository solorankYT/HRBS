// ---------------- Booking State ----------------
let booking = {
  check_in: '',
  check_out: '',
  number_of_guests: 1,
  rooms: [] // {id, type, name, price, nights, available_count, description}
};

let selectedRoomIndex = null;

// ---------------- Utility ----------------
function calculateNights() {
  const start = new Date(booking.check_in);
  const end = new Date(booking.check_out);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

// ---------------- Render Cart ----------------
function renderCart() {
  const container = document.getElementById('roomsContainer');
  container.innerHTML = '';
  let total = 0;
  const nights = calculateNights();

  booking.rooms.forEach(room => {
    const roomTotal = room.price * nights;
    total += roomTotal;

    const div = document.createElement('div');
    div.className = 'cart-item p-3 mb-2 rounded shadow-sm';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    div.style.background = '#fafafa';
    div.style.border = '1px solid #e0e0e0';
    
    div.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name" style="font-weight:600; font-size:0.95rem;">${room.type}</div>
        <div class="cart-item-specs" style="font-size:0.8rem; color:#555;">
          ${room.capacity} Guests • ${nights} night${nights > 1 ? 's' : ''}
        </div>
      </div>
      <div class="cart-item-price" style="font-weight:700; font-size:0.95rem; color:#d32f2f;">
        ₱${roomTotal.toLocaleString()}
      </div>
    `;
    container.appendChild(div);
  });

  document.getElementById('itemCount').textContent = `${booking.rooms.length} Room${booking.rooms.length > 1 ? 's' : ''}`;
  document.getElementById('finalTotal').textContent = `₱${total.toLocaleString()}`;
}



function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidPhone(phone) {
  const regex = /^09\d{9}$/;
  return regex.test(phone);
}

function liveValidation() {

   document.querySelectorAll('.guest-phone').forEach(input => {
    let msg = document.createElement('div');
    msg.className = 'invalid-feedback';
    msg.textContent = 'Phone number must start with 09 and be 11 digits.';
    input.parentNode.appendChild(msg);

    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');

      if (!input.value) {
        input.classList.remove('is-invalid');
      } else if (!isValidPhone(input.value)) {
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }
    });
  });

  document.querySelectorAll('.guest-email').forEach(input => {
    let msg = document.createElement('div');
    msg.className = 'invalid-feedback';
    msg.style.display = 'none';
    msg.textContent = 'Please enter a valid email.';
    input.parentNode.appendChild(msg);

    input.addEventListener('input', () => {
      if (!input.value.trim()) {
        input.classList.remove('is-invalid');
        msg.style.display = 'none';
      } else if (!isValidEmail(input.value.trim())) {
        input.classList.add('is-invalid');
        msg.style.display = 'block';
      } else {
        input.classList.remove('is-invalid');
        msg.style.display = 'none';
      }
    });
  });
}


// ---------------- Render Guest Accordion ----------------
function renderGuestAccordion() {
  const accordion = document.getElementById('roomsAccordion');
  accordion.innerHTML = '';

  booking.rooms.forEach((room, index) => {
    const nights = calculateNights();

    const div = document.createElement('div');
    div.className = 'accordion-item';
    div.innerHTML = `
      <h2 class="accordion-header" id="heading${index}">
        <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
          <div style="display:flex; justify-content:space-between; width:100%;">
            <span>Room ${index + 1} — ${room.type}</span>
            <span style="font-weight:600; color:#d32f2f;">₱${room.price} x ${nights} night${nights>1?'s':''}</span>
          </div>
        </button>
      </h2>
      <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#roomsAccordion">
        <div class="accordion-body">
          <div class="guest-info mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control guest-name" placeholder="Enter full name">
          </div>
          <div class="guest-info mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control guest-email" placeholder="example@gmail.com">
          </div>
          <div class="guest-info mb-3">
            <label class="form-label">Phone</label>
            <input type="tel" class="form-control guest-phone" placeholder="09XXXXXXXXX">
          </div>
          <div class="guest-info mb-3">
            <label class="form-label">Special Requests</label>
            <textarea class="form-control guest-requests" rows="2" placeholder="Optional"></textarea>
          </div>

          <div class="payment-section mb-3">
            <h6 class="mb-2">Payment Method</h6>
            <div style="display:flex; gap:1rem;">
              <label class="payment-option card p-2 flex-grow-1 text-center cursor-pointer">
                <input type="radio" name="paymentMethodRoom${index}" value="bank-transfer">
                Bank Transfer
              </label>
              <label class="payment-option card p-2 flex-grow-1 text-center cursor-pointer">
                <input type="radio" name="paymentMethodRoom${index}" value="gcash">
                GCash
              </label>
            </div>
          </div>

          <button type="button" class="btn btn-outline-secondary btn-sm autoFill">Use this info for all rooms</button>
        </div>
      </div>
    `;
    accordion.appendChild(div);
  });

  setupPaymentSelection();
  setupAutoFill();
  liveValidation();
}


// ---------------- Payment Selection Highlight ----------------
function setupPaymentSelection() {
  document.querySelectorAll('.payment-option input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function () {
      this.closest('.accordion-body').querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      this.closest('.payment-option').classList.add('selected');
    });
  });
}

// ---------------- Autofill Guest Info ----------------
function setupAutoFill() {
  document.querySelectorAll('.autoFill').forEach(btn => {
    btn.addEventListener('click', () => {
      const firstBody = btn.closest('.accordion-body');
      const fullName = firstBody.querySelector('.guest-name').value;
      const email = firstBody.querySelector('.guest-email').value;
      const phone = firstBody.querySelector('.guest-phone').value;
      const requests = firstBody.querySelector('.guest-requests').value;
      const selectedPayment = firstBody.querySelector('input[type="radio"]:checked')?.value;

      if (!selectedPayment) return alert('Please select a payment method first.');

      if (!selectedPayment) return alert('Please select a payment method first.');
      if (!fullName) return alert('Full Name cannot be empty.');
      if (!email) return alert('Email cannot be empty.');
      if (!isValidEmail(email)) return alert('Please enter a valid email address.');

      document.querySelectorAll('#roomsAccordion .accordion-item').forEach(acc => {
        const body = acc.querySelector('.accordion-body');
        body.querySelector('.guest-name').value = fullName;
        body.querySelector('.guest-email').value = email;
        body.querySelector('.guest-phone').value = phone;
        body.querySelector('.guest-requests').value = requests;

        const radios = body.querySelectorAll('input[type="radio"]');
        radios.forEach(r => r.checked = r.value === selectedPayment);
      });
    });
  });
}

// ---------------- Confirm Booking ----------------
async function confirmBooking() {
  if (!document.getElementById('privacyTerms').checked || !document.getElementById('bookingConditions').checked) {
    return alert("Please agree to Privacy Terms and Booking Conditions.");
  }

  const accordions = document.querySelectorAll('#roomsAccordion .accordion-item');

  const roomsPayload = booking.rooms.map((room, index) => {
    const acc = accordions[index];
    return {
      id: room.id,
      guest: {
        name: acc.querySelector('.guest-name').value.trim(),
        email: acc.querySelector('.guest-email').value.trim(),
        phone: acc.querySelector('.guest-phone').value.trim(),
        special_requests: acc.querySelector('.guest-requests')?.value.trim() || ''
      },
      payment_method: acc.querySelector('input[type="radio"]:checked')?.value || null
    };
  });

  for (let room of roomsPayload) {
    const g = room.guest;
    if (!g.name || !g.email || !g.phone || !room.payment_method) {
      return alert('Please complete all guest details and payment method for each room.');
    }
  }

  const payload = {
    check_in: booking.check_in,
    check_out: booking.check_out,
    number_of_guests: booking.number_of_guests,
    rooms: roomsPayload
  };

  try {
    const res = await fetch("http://localhost:8000/api/guest/bookings", {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw data;

    alert(`Booking confirmed! Reference: ${data.reference_number}`);
    window.location.href = `/booking-success/${data.reference_number}`;
  } catch (err) {
    console.error(err);
    alert('Booking failed. Check console for details.');
  }
}

// ---------------- Load Booking from URL ----------------
function loadBooking() {
  const params = new URLSearchParams(window.location.search);
  booking.check_in = params.get('check_in') || '';
  booking.check_out = params.get('check_out') || '';
  booking.number_of_guests = parseInt(params.get('number_of_guests') || '1');
  booking.rooms = JSON.parse(params.get('rooms') || '[]');

  renderCart();
  renderGuestAccordion();
}

// ---------------- Room Selection Modal ----------------
async function getAvailableRooms() {
  const params = new URLSearchParams({
    check_in: booking.check_in,
    check_out: booking.check_out,
    number_of_guests: booking.number_of_guests
  });

  const res = await fetch(`/api/guest/rooms/availability?${params.toString()}`, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return await res.json();
}

async function openRoomModal() {
  const container = document.getElementById('roomOptionsContainer');
  container.innerHTML = '';

  const rooms = await getAvailableRooms();

  rooms.forEach((room, i) => {
    const div = document.createElement('div');
    div.className = 'list-group-item list-group-item-action';
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${room.type} ${room.available === 0 ? '(Full)' : ''}</h6>
          <small class="text-muted">${room.description}</small>
        </div>
        <div><strong>₱${room.price.toLocaleString()}</strong></div>
      </div>
    `;
    if (room.available === 0) div.classList.add('disabled');
    else div.onclick = () => selectRoom(i);
    container.appendChild(div);
  });

  selectedRoomIndex = null;
  document.getElementById('confirmRoomBtn').disabled = true;
  new bootstrap.Modal(document.getElementById('roomSelectModal')).show();
}

function selectRoom(index) {
  selectedRoomIndex = index;
  document.getElementById('confirmRoomBtn').disabled = false;

  const options = document.querySelectorAll('#roomOptionsContainer .list-group-item');
  options.forEach((o, i) => o.classList.toggle('active', i === index));
}

function addRoomToBooking(room) {
  const exists = booking.rooms.find(r => r.id === room.id);
  if (exists) return alert('This room is already added.');
  
  booking.rooms.push({
    id: room.id,
    type: room.type,
    price: room.price,
    capacity: room.capacity,
    description: room.description,
    available_count: room.available_count
  });

  renderCart();
  renderGuestAccordion();
}

function proceedToConfirmation() {
  if (!document.getElementById('privacyTerms').checked ||
      !document.getElementById('bookingConditions').checked) {
    return alert("Please agree to Privacy Terms and Booking Conditions.");
  }

  const accordions = document.querySelectorAll('#roomsAccordion .accordion-item');

  const roomsPayload = booking.rooms.map((room, index) => {
    const acc = accordions[index];

    return {
      id: room.id,
      type: room.type,
      price: room.price,
      nights: calculateNights(),
      guest: {
        name: acc.querySelector('.guest-name').value.trim(),
        email: acc.querySelector('.guest-email').value.trim(),
        phone: acc.querySelector('.guest-phone').value.trim(),
        special_requests: acc.querySelector('.guest-requests')?.value.trim() || ''
      },
      payment_method: acc.querySelector('input[type="radio"]:checked')?.value || null
    };
  });

  for (let room of roomsPayload) {
    if (!room.guest.name || !room.guest.email || !room.guest.phone || !room.payment_method) {
      return alert('Please complete all guest details and payment method.');
    }
  }

  const confirmationPayload = {
    check_in: booking.check_in,
    check_out: booking.check_out,
    number_of_guests: booking.number_of_guests,
    rooms: roomsPayload,
    created_at: new Date().toISOString()
  };

  // 🔐 TEMP STORAGE (safe for 1 session)
  sessionStorage.setItem(
    'pendingBooking',
    JSON.stringify(confirmationPayload)
  );

  window.location.href = 'confirmation.html';
}



// ---------------- Initialize ----------------
window.addEventListener('DOMContentLoaded', loadBooking);
