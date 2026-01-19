// guest-details.js — Bootstrap version (accordion + cart + payment)

const TAX_RATE = 0.12;

// --- Load data from localStorage ---
let bookingData = JSON.parse(localStorage.getItem('bookingData')) || {};
let selectedRooms = JSON.parse(localStorage.getItem('selectedRooms')) || [];
let selectedAddons = JSON.parse(localStorage.getItem('selectedAddons')) || [];

// --- Compute nights ---
let bookingCheckIn = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
let bookingCheckOut = bookingData.checkOut ? new Date(bookingData.checkOut) : null;
let bookingNights = 1;
if (bookingCheckIn && bookingCheckOut) {
  bookingNights = Math.ceil((bookingCheckOut - bookingCheckIn) / (1000 * 60 * 60 * 24));
  if (bookingNights < 1) bookingNights = 1;
}

function safeGet(id) {
  return document.getElementById(id) || null;
}
function formatPHP(amount) {
  return `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

// --- Navigation ---
function goBack() {
  localStorage.setItem("returnMode", "edit");
  localStorage.setItem("lastHighlightedRoomIndex", String(selectedRooms.length - 1));
  window.location.href = "select-room.html";
}

function addRoom() {
  localStorage.removeItem("returnMode");
  localStorage.removeItem("lastHighlightedRoomIndex");
  sessionStorage.clear();
  window.location.href = "select-room.html";
}

// --- Dynamic Accordion Generation ---
function renderGuestAccordions() {
  const accordionContainer = safeGet("roomsAccordion");
  if (!accordionContainer) return;

  accordionContainer.innerHTML = "";

  if (!selectedRooms.length) {
    accordionContainer.innerHTML = `<p class="text-muted">No rooms selected yet.</p>`;
    return;
  }

  const allAddons = JSON.parse(localStorage.getItem("selectedAddons")) || [];

  selectedRooms.forEach((room, index) => {
    const collapseId = `collapse${index}`;
    const headingId = `heading${index}`;
    const isFirst = index === 0 ? "show" : "";

    // ✅ Compute nights properly
    let nights = 1;
    if (room.checkIn && room.checkOut) {
      const inDate = new Date(room.checkIn);
      const outDate = new Date(room.checkOut);
      nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
      if (nights < 1) nights = 1;
    } else if (bookingCheckIn && bookingCheckOut) {
      nights = Math.ceil((bookingCheckOut - bookingCheckIn) / (1000 * 60 * 60 * 24));
      if (nights < 1) nights = 1;
    }

    // 🧮 Compute total room + add-ons + nights
    const basePrice = Number(room.price) || 0;
    const addonsForThisRoom = allAddons.filter(a => {
      const roomKey = room.instanceId || room.roomId || room.id;
      return a.linkedRoomInstanceId === roomKey;
    });

    const addonsTotal = addonsForThisRoom.reduce((sum, addon) => {
      const addonPrice = Number(addon.unitPrice || addon.price || 0) * (addon.quantity || 1);
      return sum + addonPrice;
    }, 0);

    // ✅ Multiply base price by nights
    const roomTotal = (basePrice * nights) + addonsTotal;
    const tax = roomTotal * TAX_RATE;
    const totalWithTax = roomTotal + tax;
    const downpayment = totalWithTax * 0.5;

    // 🎨 Accordion structure
    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";
    accordionItem.innerHTML = `
      <h2 class="accordion-header" id="${headingId}">
        <button class="accordion-button ${isFirst ? "" : "collapsed"}" type="button"
          data-bs-toggle="collapse" data-bs-target="#${collapseId}">
          Room ${index + 1} — ${room.roomName}
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse ${isFirst}" data-bs-parent="#roomsAccordion">
        <div class="accordion-body">

          <!-- Guest Info -->
          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" placeholder="Enter full name">
          </div>
          <div class="mb-3">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" placeholder="Enter email address">
          </div>
          <div class="mb-3">
            <label class="form-label">Phone Number</label>
            <input type="tel" class="form-control" placeholder="Enter phone number">
          </div>
          <div class="mb-3">
            <label class="form-label">Special Requests</label>
            <textarea class="form-control" rows="3" placeholder="Any special requests (optional)"></textarea>
          </div>

          <!-- Payment Section -->
          <div class="mt-4">
            <h6 class="mb-3" style="font-size; 1.1rem; color: #8B5A3C;">
              <i class="fa-solid fa-lock me-2"></i>Payment
            </h6>
            <h2 class="mb-3" style="font-size: 0.70rem; font-weight:600; letter-spacing:0.8px; color: black;">
              ${formatPHP(downpayment)} downpayment due now.
            </h2>
            <div class="card card-body">
              <p class="text-muted small mb-3">
                We use secure transmission and encrypted storage to protect your information.
              </p>

              <div class="payment-options" id="paymentMethodRoom${index + 1}">
                <label class="payment-option">
                  <input type="radio" name="paymentMethodRoom${index + 1}" value="paypal" />
                  <img src="paypal.png" alt="PayPal" width="30" /> PayPal
                </label>
                <label class="payment-option">
                  <input type="radio" name="paymentMethodRoom${index + 1}" value="gcash" />
                  <img src="gcash.webp" alt="GCash" width="30" /> GCash
                </label>
              </div>

              <div class="mb-4">
                <label class="form-label">Upload Proof of Payment</label>
                <input type="file" class="form-control" accept="image/*,.pdf">
              </div>
              
              <div class="mb-2">
                <button class="autoFill" style="background:none; font-weight:400 ;font-size:0.75rem; border:none; color:#8B0000;"
                onmouseover="this.style.textDecoration='underline'";
                onmouseout="this.style.textDecoration='none'";
                >Use this contact and payment information for all items</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    accordionContainer.appendChild(accordionItem);
  });
}


// --- Cart Display ---
function updateCartUI() {
  const bookingData = JSON.parse(localStorage.getItem('bookingData')) || {};
  const selectedRooms = JSON.parse(localStorage.getItem('selectedRooms')) || [];
  const selectedAddons = JSON.parse(localStorage.getItem('selectedAddons')) || [];

  bookingCheckIn = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
  bookingCheckOut = bookingData.checkOut ? new Date(bookingData.checkOut) : null;

  const roomsContainer = safeGet('roomsContainer');
  const itemCount = safeGet('itemCount');
  const totalAmountHeader = safeGet('totalAmount');
  const finalTotalEl = safeGet('finalTotal');
  const downPaymentEl = safeGet('downpayment');

  if (!roomsContainer) return;
  roomsContainer.innerHTML = '';

  if (!Array.isArray(selectedRooms) || selectedRooms.length === 0) {
    roomsContainer.innerHTML = '<p>No rooms selected yet.</p>';
    if (itemCount) itemCount.textContent = '0';
    if (totalAmountHeader) totalAmountHeader.textContent = formatPHP(0);
    if (finalTotalEl) finalTotalEl.textContent = formatPHP(0);
    renderGuestAccordions();
    return;
  }

let grandTotal = 0;
let totalQty = 0; // total item count (rooms + addons)

// Loop through each selected room
selectedRooms.forEach((room) => {
  const qty = room.quantity || 1;
  totalQty += qty; // count the room itself

  // 🧮 Nights computation (same logic)
  let nights = 1;
  if (room.checkIn && room.checkOut) {
    const inDate = new Date(room.checkIn);
    const outDate = new Date(room.checkOut);
    nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    if (nights < 1) nights = 1;
  } else if (bookingCheckIn && bookingCheckOut) {
    nights = Math.ceil((bookingCheckOut - bookingCheckIn) / (1000 * 60 * 60 * 24));
    if (nights < 1) nights = 1;
  }

  const unit = Number(room.price) || 0;
  const subtotal = unit * nights * qty;
  grandTotal += subtotal;

  const adults = room.guests ?? bookingData.guests ?? 2;
  const children = room.children ?? bookingData.children ?? 0;

  let guestText = `${adults} Adult${adults > 1 ? 's' : ''}`;
  if (children > 0) guestText += `, ${children} Child${children > 1 ? 'ren' : ''}`;

  const div = document.createElement('div');
  div.className = 'room-item';
  div.innerHTML = `
    <div class="room-header">
      <div>
        <div class="room-name fw-semibold">${room.roomName}</div>
        <div class="room-type text-muted small">
          ${guestText} • ${nights} night${nights > 1 ? 's' : ''}
        </div>
        <div class="room-dates small text-secondary mt-1">
          ${room.checkIn && room.checkOut
            ? `${new Date(room.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} -
               ${new Date(room.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : ''}
        </div>
      </div>
      <div class="text-end">
        <div>${formatPHP(unit)} <span class="small text-muted">/ night</span></div>
        <div class="fw-bold mt-1">${formatPHP(subtotal)}</div>
      </div>
    </div>
  `;

  // --- Add-ons per room ---
// --- Add-ons per room (match select-room layout) ---
const addonsForThisRoom = selectedAddons.filter(a => {
  const roomKey = room.instanceId || room.roomId || room.id;
  return a.linkedRoomInstanceId === roomKey;
});

let addonTotalForRoom = 0;

addonsForThisRoom.forEach((addon, aIdx) => {
  const addonQty = addon.quantity || 1;
  const addonSubtotal = (Number(addon.unitPrice || addon.price) || 0) * addonQty;
  addonTotalForRoom += addonSubtotal;

  // ✅ Add-on item structure (identical to select-room.js)
  const addonDiv = document.createElement('div');
  addonDiv.style.marginTop = '10px';
  addonDiv.style.borderTop = '1px solid #ddd';
  addonDiv.style.paddingTop = '8px';
  addonDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:600;">${addon.addonName}</div>
        <div style="font-size:0.85rem; color:#666;">${addon.specs || ''} • Qty: ${addonQty}</div>
      </div>
      <div style="font-weight:700;">₱${addonSubtotal.toLocaleString()}</div>
    </div>
  `;
  div.appendChild(addonDiv);

  totalQty += addonQty;
});


  grandTotal += addonTotalForRoom;
  roomsContainer.appendChild(div);
});


  // --- Totals ---
  const taxAmount = round2(grandTotal * TAX_RATE);
  const grandTotalWithTax = round2(grandTotal + taxAmount);

  if (itemCount) itemCount.textContent = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;
  if (totalAmountHeader) totalAmountHeader.textContent = formatPHP(grandTotalWithTax);
  if (finalTotalEl) finalTotalEl.textContent = formatPHP(grandTotalWithTax);
  if (downPaymentEl) downPaymentEl.textContent = formatPHP(round2(grandTotalWithTax * 0.5));

  renderGuestAccordions();
}

// --- Payment Validation ---
function setupPaymentValidation() {
  const confirmBtn = document.querySelector('.btn-continue');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', function () {
    const accordions = document.querySelectorAll('#roomsAccordion .accordion-item');
    const proofInput = document.querySelector('input[type="file"]');

    // --- Validate guest inputs per room ---
    for (let acc of accordions) {
      const fullName = acc.querySelector('input[type="text"]').value.trim();
      const email = acc.querySelector('input[type="email"]').value.trim();
      const phone = acc.querySelector('input[type="tel"]').value.trim();

      if (!fullName || !email || !phone) {
        alert("Please complete all guest details for each room.");
        return;
      }
    }

    // --- Collect guest data ---
    const guestData = Array.from(accordions).map((acc, index) => {
      const fullName = acc.querySelector('input[type="text"]').value.trim();
      const email = acc.querySelector('input[type="email"]').value.trim();
      const phone = acc.querySelector('input[type="tel"]').value.trim();
      const specialRequests = acc.querySelector('textarea')?.value.trim() || "";
      const paymentMethod = document.querySelector(`input[name="paymentMethodRoom${index + 1}"]:checked`);

      return {
        fullName,
        email,
        phone,
        specialRequests,
        paymentMethod: paymentMethod ? paymentMethod.value : null
      };
    });

    // --- Validate payment per room ---
    const missingPayments = guestData.filter(g => !g.paymentMethod);
    if (missingPayments.length > 0) {
      alert("Please select a payment method (PayPal or GCash) for each room.");
      return;
    }

    // --- Validate proof of payment ---
    if (!proofInput || !proofInput.files.length) {
      alert("Please upload proof of payment.");
      return;
    }

    // --- Load or initialize booking data ---
    let bookingData = JSON.parse(localStorage.getItem("bookingData")) || {};

    // ✅ Save check-in / check-out directly from original localStorage (to ensure persistence)
    bookingData.checkIn =
      localStorage.getItem("checkInDate") ||
      bookingData.checkIn ||
      document.getElementById("checkIn")?.value ||
      null;

    bookingData.checkOut =
      localStorage.getItem("checkOutDate") ||
      bookingData.checkOut ||
      document.getElementById("checkOut")?.value ||
      null;

    // ✅ Store adults/children (fallbacks if not already stored)
    bookingData.adults = bookingData.adults || bookingData.totalAdults || 2;
    bookingData.children = bookingData.children || bookingData.totalChildren || 0;

    // --- Selected rooms ---
    const selectedRooms = JSON.parse(localStorage.getItem("selectedRooms")) || [];

    const payload = {
      booking: bookingData,
      rooms: selectedRooms,
      guests: guestData
    };

    localStorage.setItem("guestBookingData", JSON.stringify(payload));

    // ✅ Redirect to confirmation page
    window.location.href = "confirmation.html";
  });

  // --- Highlight selected payment method ---
  document.querySelectorAll('.payment-option input[type="radio"]').forEach(radio => {
    radio.addEventListener("change", function () {
      document.querySelectorAll(".payment-option").forEach(opt =>
        opt.classList.remove("selected")
      );
      this.closest(".payment-option").classList.add("selected");
    });
  });
}




// --- Init ---
document.addEventListener('DOMContentLoaded', function () {
  updateCartUI();
  setupPaymentValidation();
});
