// confirmation.js — generates Confirmation Invoice page
const TAX_RATE = 0.12;
const DOWNPAYMENT_RATE = 0.5;

// --- Helpers ---
function safeGet(id) {
  return document.getElementById(id) || null;
}
function formatPHP(amount) {
  return `₱${Number(amount).toLocaleString('en-PH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}
function parseDate(dateStr) {
  return dateStr ? new Date(dateStr) : null;
}
function formatDate(date) {
  if (!date) return "N/A";
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function round2(n) {
  return Math.round(n * 100) / 100;
}
function goBack() {
  window.location.href = "guest-details.html";
}

let storedData = JSON.parse(localStorage.getItem("guestBookingData")) || {};
let bookingData = storedData.booking || JSON.parse(localStorage.getItem("bookingData")) || {};
let selectedRooms = storedData.rooms || JSON.parse(localStorage.getItem("selectedRooms")) || [];
let guests = storedData.guests || [];
let guestDetails = guests[0] || {};


// --- Compute booking values ---
let checkInDate = parseDate(bookingData.checkIn);
let checkOutDate = parseDate(bookingData.checkOut);

// compute nights
let nights = 1;
if (checkInDate && checkOutDate) {
  const msDiff = checkOutDate - checkInDate;
  nights = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
}


// --- Compute billing ---
let subtotal = 0;
selectedRooms.forEach(room => {
  const price = Number(room.price) || 0;
  const quantity = Number(room.quantity) || 1;
  subtotal += price * quantity * nights;
});

let taxes = round2(subtotal * TAX_RATE);
let totalAmount = round2(subtotal + taxes);
let downPayment = round2(totalAmount * DOWNPAYMENT_RATE);
let remaining = round2(totalAmount - downPayment);

// --- Generate booking reference ---
function generateBookingRef() {
  return "RES-" + Math.floor(Math.random() * 90000 + 10000);
}
const bookingRef = bookingData.bookingId || generateBookingRef();

// --- Save back aggregated invoice ---
const invoice = {
  bookingId: bookingRef,
  bookingDate: new Date().toISOString(),
  checkIn: checkInDate,
  checkOut: checkOutDate,
  nights,
  guests,
  rooms: selectedRooms,
  subtotal,
  taxes,
  total: totalAmount,
  downPayment,
  remaining
};
localStorage.setItem("finalInvoice", JSON.stringify(invoice));

// --- Fill HTML on load ---
// --- Fill HTML on load ---
document.addEventListener("DOMContentLoaded", () => {

  // 🧾 Basic booking details
  if (safeGet("bookingReference")) safeGet("bookingReference").textContent = bookingRef;
  if (safeGet("invoiceDate")) safeGet("invoiceDate").textContent = new Date().toLocaleDateString();
  if (safeGet("confirmedCheckIn")) safeGet("confirmedCheckIn").textContent = formatDate(checkInDate);
  if (safeGet("confirmedCheckOut")) safeGet("confirmedCheckOut").textContent = formatDate(checkOutDate);

  // 🧍 Guest Info
  if (safeGet("confirmedGuestName")) safeGet("confirmedGuestName").textContent = guestDetails.fullName || "N/A";
  if (safeGet("confirmedGuestEmail")) safeGet("confirmedGuestEmail").textContent = guestDetails.email || "N/A";
  if (safeGet("confirmedGuestPhone")) safeGet("confirmedGuestPhone").textContent = guestDetails.phone || "N/A";

  // 👨‍👩‍👧 Guest Count display ("2 Adults, 1 Child")
  const adults = bookingData.adults || 0;
  const children = bookingData.children || 0;
  let guestText = "";

  if (adults > 0 && children > 0) {
    guestText = `${adults} Adult${adults > 1 ? "s" : ""}, ${children} Child${children > 1 ? "ren" : ""}`;
  } else if (adults > 0) {
    guestText = `${adults} Adult${adults > 1 ? "s" : ""}`;
  } else if (children > 0) {
    guestText = `${children} Child${children > 1 ? "ren" : ""}`;
  } else {
    guestText = "No Guests";
  }

  if (safeGet("confirmedGuests")) safeGet("confirmedGuests").textContent = guestText;

const totalPaid = round2(totalAmount * DOWNPAYMENT_RATE);   // 50% of total
const remainingBalance = round2(totalAmount - totalPaid);   // other 50%

if (safeGet("confirmedTotalAmount"))
  safeGet("confirmedTotalAmount").textContent = formatPHP(totalAmount);

if (safeGet("totalPaid"))
  safeGet("totalPaid").textContent = formatPHP(totalPaid);

if (safeGet("confirmedTaxes"))
  safeGet("confirmedTaxes").textContent = formatPHP(taxes);

if (safeGet("confirmedRemainingBalance"))
  safeGet("confirmedRemainingBalance").textContent = formatPHP(remainingBalance);


  // 🏨 ROOM + ADD-ONS TABLE
  const tableBody = document.querySelector(".table-invoice tbody");
  if (tableBody && selectedRooms.length > 0) {
    let tableHTML = "";

    selectedRooms.forEach((room, index) => {
      const roomTotal = room.price * nights;
      tableHTML += `
        <tr>
          <td><strong>${room.roomName}</strong></td>
          <td>${nights} night${nights > 1 ? "s" : ""}</td>
          <td>${formatPHP(room.price)}</td>
          <td>${formatPHP(roomTotal)}</td>
        </tr>
      `;

      // If the room has add-ons, list them right below
      if (room.addOns && room.addOns.length > 0) {
        room.addOns.forEach(addon => {
          const addonPrice = Number(addon.price) || 0;
          const addonQty = Number(addon.quantity) || 1;
          const addonTotal = addonPrice * addonQty;
          tableHTML += `
            <tr class="addon-row">
              <td style="padding-left: 40px;">↳ ${addon.name}</td>
              <td>${addonQty}</td>
              <td>${formatPHP(addonPrice)}</td>
              <td>${formatPHP(addonTotal)}</td>
            </tr>
          `;
        });
      }
    });

    tableBody.innerHTML = tableHTML;
  }

  // 💳 PAYMENT SUMMARY SECTION
  const paymentSummary = document.querySelector(".payment-summary");
  if (paymentSummary && selectedRooms.length > 0 && guests.length > 0) {
    let paymentHTML = `
      <div class="section-title" style="margin-top:0; font-size: 1rem;">Payment Summary</div>
    `;

    selectedRooms.forEach((room, i) => {
      const paymentMethod = guests[i]?.paymentMethod || "N/A";
      paymentHTML += `
        <div class="payment-method" style="font-size: 0.80rem; font-family: 'poppins',sans-serif;">
          <strong>${room.roomName}</strong> — Paid via <strong>${paymentMethod}</strong>
        </div>
      `;
    });

    paymentSummary.innerHTML = paymentHTML;
  }

});
