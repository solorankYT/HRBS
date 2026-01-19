// select-room.js — Rewritten and fixed to match select-room.html
(() => {
  // --- State & Persistence ---
  const STORAGE_ROOMS = 'selectedRooms';
  const STORAGE_ADDONS = 'selectedAddons';
  const STORAGE_BOOKING = 'bookingData';

  let selectedRooms = JSON.parse(localStorage.getItem(STORAGE_ROOMS)) || [];
  let selectedAddons = JSON.parse(localStorage.getItem(STORAGE_ADDONS)) || [];
  let bookingData = JSON.parse(localStorage.getItem(STORAGE_BOOKING)) || {};

  let bookingCheckIn = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
  let bookingCheckOut = bookingData.checkOut ? new Date(bookingData.checkOut) : null;
  let bookingGuests = bookingData.guests ? parseInt(bookingData.guests, 10) : 1;
  let bookingChildren = bookingData.children ? parseInt(bookingData.children, 10) : 0;
  let bookingNights = 1;
  let maxRoomsAllowed = Infinity;

  // ==========================
  // Global Variables
  // ==========================
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedCheckIn = null;
  let selectedCheckOut = null;
  let currentEditIndex = null;
  let isEditing = false;
  
document.addEventListener("DOMContentLoaded", () => {
  const returnMode = localStorage.getItem("returnMode");

  // 🟢 If coming from Add Room → clear all Keep Room states
  if (returnMode === "add") {
    console.log("🟢 Add Room mode detected — clearing Keep Room state");
    localStorage.removeItem("returnMode");
    sessionStorage.removeItem("editingRoomIndex");
    sessionStorage.removeItem("highlightedRoomIndex");
    sessionStorage.removeItem("keepRoomActivated");

    // reset buttons visually
    document.querySelectorAll(".btn-show-rates.keep-room-active").forEach(btn => {
      btn.textContent = "BOOK NOW";
      btn.classList.remove("keep-room-active");
    });

    currentEditIndex = null;
    isEditing = false;
    return; // stop here so it won't show KEEP ROOM
  }

  // 🟣 Edit mode — show Keep Room
  if (returnMode === "edit") {
    localStorage.removeItem("returnMode");
    const lastHighlighted = localStorage.getItem("lastHighlightedRoomIndex");
    if (lastHighlighted !== null) {
      const idx = parseInt(lastHighlighted, 10);
      sessionStorage.setItem("editingRoomIndex", idx);
      sessionStorage.setItem("highlightedRoomIndex", idx);
      sessionStorage.setItem("keepRoomActivated", "true");

      setTimeout(() => {
        const selectedRooms = JSON.parse(localStorage.getItem("selectedRooms")) || [];
        const room = selectedRooms[idx];
        if (room && room.roomId) {
          const btn = document.querySelector(
            `.room-card[data-room-type="${room.roomId}"] .btn-show-rates`
          );
          if (btn) {
            btn.textContent = "KEEP ROOM";
            btn.classList.add("keep-room-active");
            moveKeepRoomToTop();
            updateActionButtons();
            currentEditIndex = idx;
            isEditing = true;
            console.log("🟣 Edit mode reactivated for replacement:", idx);
          }
        }
      }, 500);
    }
  }
});



 


  
  if (bookingCheckIn && bookingCheckOut) {
    bookingNights = Math.ceil((bookingCheckOut - bookingCheckIn) / (1000 * 60 * 60 * 24));
    if (bookingNights < 1) bookingNights = 1;
  }

  // --- Addon pricing (source of truth) ---
  const addonDetails = {
    "extra-bed": { name: "Extra bed/Rollaway bed", price: 550, specs: "Per Night" },
    "airport-transfer": { name: "Airport Transfer", price: 1500, specs: "Per Trip" },
    "spa-package": { name: "Spa Package", price: 3200, specs: "Per Session" },
    "breakfast": { name: "Breakfast", price: 150, specs: "Per Person" },
    "wine-bottle": { name: "Wine Bottle", price: 1200, specs: "Per Bottle" },
    "late-checkout": { name: "Late Checkout", price: 300, specs: "Per Hour" }
  };

  const TAX_RATE = 0.12;

  // --- Helpers ---
  function saveRooms() {
    localStorage.setItem(STORAGE_ROOMS, JSON.stringify(selectedRooms));
  }
  function saveAddons() {
    localStorage.setItem(STORAGE_ADDONS, JSON.stringify(selectedAddons));
  }
  function parsePriceFromText(text) {
    if (!text) return 0;
    const cleaned = String(text).replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }
  function fmtDate(d) {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtDateShort(d) {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

// 🟩 Detect if user is returning from guest-details to edit an existing room



  function dateRangeString() {
    if (!bookingCheckIn || !bookingCheckOut) return '';
    return `${fmtDate(bookingCheckIn)} - ${fmtDate(bookingCheckOut)}`;
  }

  function totalSelectedRoomsCount() {
    return selectedRooms.reduce((s, r) => s + (r.quantity || 1), 0);
  }
// ===============================
// Quantity Selectors
// ===============================
window.updateCounter = function (id, change) {
  const input = document.getElementById(id);
  if (!input) return;

  let value = parseInt(input.value, 10) || 0;

  // Set min/max limits
  const min = 0;
  let max = 10;
  if (id === 'guestCount') max = 10;
  if (id === 'childCount') max = 5; // halimbawa, limit 5 children

  value = Math.max(min, Math.min(max, value + change));
  input.value = value;

  // Sync to global vars if needed
  try {
    if (id === 'guestCount') bookingGuests = value;
    if (id === 'childCount') bookingChildren = value;
  } catch (err) {
    console.warn('updateCounter sync skipped:', err);
  }

  if (typeof validateBooking === 'function') validateBooking();
  if (typeof updateDateDisplay === 'function') updateDateDisplay();
};






  // ==========================
  // Modal functions (Edit mode)
  // ==========================
window.openBookingModal = function () {
  const modal = document.getElementById('editModal');
  if (!modal) return;

  // Always open modal first (so even if preload fails, it still shows)
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  try {
    // Safely parse booking data
    const savedData = JSON.parse(localStorage.getItem('editModal') || '{}');

    // Load saved check-in/out
    if (savedData.checkIn) {
      selectedCheckIn = new Date(savedData.checkIn);
      document.getElementById('checkInDate').textContent =
        selectedCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (savedData.checkOut) {
      selectedCheckOut = new Date(savedData.checkOut);
      document.getElementById('checkOutDate').textContent =
        selectedCheckOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Guests / Rooms
    if (savedData.guests)
      document.getElementById('guestCount').value = savedData.guests;
    if (savedData.rooms)
      document.getElementById('roomCount').value = savedData.rooms;

    // Sync globals
    bookingCheckIn = selectedCheckIn;
    bookingCheckOut = selectedCheckOut;
    bookingGuests = savedData.guests || 1;
    maxRoomsAllowed = savedData.rooms || 1;

    // Rebuild calendars
    generateCalendar();
    updateDateDisplay?.();
    validateBooking?.();
  } catch (err) {
    console.error('Failed to preload booking data:', err);
  }
};


window.closeBookingModal = function () {
  const modal = document.getElementById('editModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
};

document.addEventListener('click', (e) => {
  const modal = document.getElementById('editModal');
  if (modal && e.target === modal) closeBookingModal();
});

 // 🔧 Universal click handler for dynamically added Edit buttons
  document.addEventListener('click', function (e) {
  console.log('Clicked:', e.target); // 🔍 log every click
  const btn = e.target.closest('.btn-edit');
  if (btn) {
    console.log('Edit button clicked!');
    e.preventDefault();
    e.stopPropagation();
    openBookingModal();
  }

});


document.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn-edit');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    const idx = btn.getAttribute("data-index"); // ilagay mo ito sa button markup
    currentEditIndex = idx ? parseInt(idx, 10) : null;
    openBookingModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('editModal');
  if (modalEl) {
    modalEl.addEventListener('click', function (e) {
      if (e.target === this) closeBookingModal();
    });
  } else {
    console.warn(' bookingModal not found after DOM load');
  }
});




  // ==========================
  // Calendar Functions (single version)
  // ==========================
  function generateCalendar() {
    // ensure calendar elements exist before building
    if (!document.getElementById('checkInTitle') || !document.getElementById('checkInDays') ||
        !document.getElementById('checkOutTitle') || !document.getElementById('checkOutDays')) {
      // don't throw — caller may open modal when DOM is ready
      console.debug('generateCalendar: calendar DOM not present yet');
      return;
    }

    buildCalendar('checkIn', currentMonth, currentYear);

    let nextMonthIndex = currentMonth + 1;
    let nextMonthYear = currentYear;
    if (nextMonthIndex > 11) {
      nextMonthIndex = 0;
      nextMonthYear++;
    }
    buildCalendar('checkOut', nextMonthIndex, nextMonthYear);
  }


  function buildCalendar(type, month, year) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const title = document.getElementById(type + 'Title');
  const daysContainer = document.getElementById(type + 'Days');
  if (!title || !daysContainer) return;

  title.textContent = `${monthNames[month]} ${year}`;
  daysContainer.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); 
  today.setHours(0, 0, 0, 0);

  // Add blank slots before day 1
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day disabled';
    daysContainer.appendChild(emptyDay);
  }

  // Loop through all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    const currentDate = new Date(year, month, day);

    // 🔴 Highlight today's date 
    if (currentDate.toDateString() === new Date().toDateString()){ 
        dayElement.classList.add('today');
    }
      // dayElement.addEventListener('click', () => selectDate(currentDate, dayElement, type));

    // Disable past days
    if (currentDate < today) {
      dayElement.classList.add('disabled');
    } else {
      // Mark selected check-in/out
      if (selectedCheckIn && currentDate.toDateString() === selectedCheckIn.toDateString()) {
        dayElement.classList.add('selected');
      }
      if (selectedCheckOut && currentDate.toDateString() === selectedCheckOut.toDateString()) {
        dayElement.classList.add('selected');
      }

      dayElement.addEventListener('click', () => selectDate(currentDate, dayElement, type));
    }

    daysContainer.appendChild(dayElement);
  }
}


  function selectDate(date, element, type) {
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      clearSelectedDates();
      selectedCheckIn = date;
      selectedCheckOut = null;
      element?.classList.add('selected');
    } 

    else if (selectedCheckIn && !selectedCheckOut) {
      if (date > selectedCheckIn) {
        selectedCheckOut = date;
        markDateRange(selectedCheckIn, selectedCheckOut);        
      } else {

        clearSelectedDates();
        selectedCheckIn = date;
        selectedCheckOut = null;
        element?.classList.add('selected'); 
      }
    }
    bookingCheckIn = selectedCheckIn;
    bookingCheckOut = selectedCheckOut;
    updateDateDisplay();
    validateBooking();
  }
  function markDateRange(start, end) {
  const days = document.querySelectorAll('.calendar-day');
  days.forEach(dayEl => {
    const dayNum = parseInt(dayEl.textContent);
    if (!dayNum) return;
    const calendarTitle = dayEl.closest('.calendar')?.querySelector('.calendar-title')?.textContent;
    if (!calendarTitle) return;
    const [monthName, year] = calendarTitle.split(' ');
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const date = new Date(year, monthIndex, dayNum);

    if (date >= start && date <= end) {
      dayEl.classList.add('selected');
    }
  });
}


    function clearSelectedDates() {
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
  }

  function updateDateDisplay() {
    const checkInDisplay = document.getElementById('checkInDate');
    const checkOutDisplay = document.getElementById('checkOutDate');
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    if (checkInDisplay)
      checkInDisplay.textContent = selectedCheckIn ? selectedCheckIn.toLocaleDateString('en-US', options) : 'Select date';
    if (checkOutDisplay)
      checkOutDisplay.textContent = selectedCheckOut ? selectedCheckOut.toLocaleDateString('en-US', options) : 'Select date';
  }


  function validateBooking() {
    const checkRatesBtn = document.getElementById('checkRatesBtn');
    if (!checkRatesBtn) return;
    checkRatesBtn.disabled = !(selectedCheckIn && selectedCheckOut);
    checkRatesBtn.style.opacity = checkRatesBtn.disabled ? '0.5' : '1';
  }

  function previousMonth(type) {
    // Move the calendar reference month (we keep a single pointer)
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    generateCalendar();
  }

  function nextMonth(type) {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    generateCalendar();
  }

  window.previousMonth = previousMonth;
  window.nextMonth = nextMonth;
    window.openBookingModal = function () {
    const modal = document.getElementById('editModal');
    if (!modal) {
      console.warn('⚠️ openBookingModal: bookingModal not found in HTML.');
      return;
    }
    if (modal.classList.contains('show')) return; // already open
    modal.classList.add('show');
    // generate calendar only when modal exists and is about to show
    generateCalendar();
    // restore any booking selections from storage if available
    const stored = JSON.parse(localStorage.getItem(STORAGE_BOOKING) || '{}');
    if (stored.checkIn) selectedCheckIn = new Date(stored.checkIn);
    if (stored.checkOut) selectedCheckOut = new Date(stored.checkOut);
    updateDateDisplay();
    validateBooking();
    document.body.style.overflow = 'hidden';
    console.debug('openBookingModal: opened');
  };





// ==========================
// Save modal changes to localStorage
// ==========================
window.saveBookingChanges = function () {
  if (!selectedCheckIn || !selectedCheckOut) {
    alert('Please select both check-in and check-out dates.');
    return;
  }

  const guests = parseInt(document.getElementById('guestCount').value, 10) || 1;
  const children = parseInt(document.getElementById('childCount')?.value, 10) || 0;

  const nights = Math.max(
    1,
    Math.ceil((new Date(selectedCheckOut) - new Date(selectedCheckIn)) / (1000 * 60 * 60 * 24))
  );

  // ✅ Update the specific room being edited
  if (currentEditIndex !== null && selectedRooms[currentEditIndex]) {
    const room = selectedRooms[currentEditIndex];
    room.checkIn = selectedCheckIn.toISOString();
    room.checkOut = selectedCheckOut.toISOString();
    room.guests = guests;
    room.children = children;
    room.nights = nights;
    room.updatedAt = new Date().toISOString();
    saveRooms();

    // 🟢 Keep track that we are still in edit/replace mode
    sessionStorage.setItem('editingRoomIndex', currentEditIndex);
    sessionStorage.setItem('keepRoomActivated', 'true');
    sessionStorage.setItem('highlightedRoomIndex', String(currentEditIndex));
    console.log('🟢 Edit mode retained for replacement:', currentEditIndex);
  }

  // ✅ After saving, mark the corresponding button as “Keep Room”
  const editedRoom =
    currentEditIndex !== null ? selectedRooms[currentEditIndex] : null;
  if (editedRoom && editedRoom.roomId) {
    const btn = document.querySelector(
      `.room-card[data-room-type="${editedRoom.roomId}"] .btn-show-rates`
    );
    if (btn) {
      btn.textContent = 'KEEP ROOM';
      btn.classList.add('keep-room-active');
      moveKeepRoomToTop();
    }
  }

  // ✅ Persist summary info to bookingData
  const bookingDataToStore = {
    checkIn: selectedCheckIn.toISOString(),
    checkOut: selectedCheckOut.toISOString(),
    guests,
    children,
    rooms: totalSelectedRoomsCount(),
    nights,
  };
  localStorage.setItem('bookingData', JSON.stringify(bookingDataToStore));

  // ✅ Refresh cart/summary
  if (typeof updateCartUI === 'function') updateCartUI();
  if (typeof updateBookingSummary === 'function') updateBookingSummary();

  // ✅ Close modal but DO NOT clear edit index yet (for replacement)
  if (typeof closeBookingModal === 'function') closeBookingModal();

  console.log('✅ Booking changes saved and room marked as Keep Room');
};





function updateBookingSummary() {
  const data = JSON.parse(localStorage.getItem('bookingData') || '{}');
  if (!data.checkIn || !data.checkOut) return;

  const options = { month: 'short', day: 'numeric', year: 'numeric' }; // ✅ removed weekday
  const checkInDate = new Date(data.checkIn).toLocaleDateString('en-US', options);
  const checkOutDate = new Date(data.checkOut).toLocaleDateString('en-US', options);

  const summaryCheckIn = document.getElementById('summaryCheckIn');
  const summaryCheckOut = document.getElementById('summaryCheckOut');
  const summaryGuests = document.getElementById('summaryGuests');
  const summaryNights = document.getElementById('summaryNights');

  if (summaryCheckIn) summaryCheckIn.textContent = checkInDate;
  if (summaryCheckOut) summaryCheckOut.textContent = checkOutDate;

  const adults = parseInt(data.guests ?? 1, 10);
  const children = parseInt(data.children ?? 0, 10);

  let guestText = `${adults} ${adults > 1 ? 'Adults' : 'Adult'}`;
  if (children > 0) {
    guestText += `, ${children} ${children > 1 ? 'Children' : 'Child'}`;
  }

  if (summaryGuests) summaryGuests.textContent = guestText || '--';

  const nights = Math.ceil(
    (new Date(data.checkOut) - new Date(data.checkIn)) / (1000 * 60 * 60 * 24)
  );
  if (summaryNights) summaryNights.textContent = nights || '--';
}



// Reapply persistent "KEEP ROOM" and highlight after page load.
// Do NOT clear the highlighted index here — we want it to persist until a new room is added.
window.addEventListener('DOMContentLoaded', () => {
  const savedIndex = sessionStorage.getItem('highlightedRoomIndex');
  if (savedIndex !== null && savedIndex !== undefined) {
    const idx = parseInt(savedIndex, 10);
    const room = selectedRooms[idx];

    // Re-apply Keep Room button if room still exists
    if (room && room.roomId) {
      const btn = document.querySelector(
        `.room-card[data-room-type="${room.roomId}"] .btn-show-rates`
      );
      if (btn) {
        btn.textContent = 'KEEP ROOM';
        btn.classList.add('keep-room-active');
      }
    }

    // Reapply cart highlight if cart items are rendered
    applyPersistentHighlight(idx);
  } else {
    // No highlighted index stored — ensure UI is default
    resetSelectButtons();
    applyPersistentHighlight(null);
  }

  // wire confirm modal buttons etc. (if you had this here before)
  try { wireModalButtons(); } catch(e) { /* ignore if not present */ }
});







  // --- UI utility ---
  function goBack() {
    window.history.back();
  }
  window.goBack = goBack; // referenced by HTML

  // --- Room selection ---
window.selectRoom = function (roomId, event) {
  event.preventDefault();

  const roomCard = document.querySelector(`.room-card[data-room-type="${roomId}"]`);
  if (!roomCard) return;

  const roomName = roomCard.querySelector('.room-name')?.textContent.trim() || roomId;
  const priceText = roomCard.querySelector('.price-value')?.textContent || '';
  const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

  // 🟢 If user clicks “Keep Room” → go to add-ons view
  if (event.target.classList.contains('keep-room-active')) {
    showAddonsView();
    return;
  }

  // Recover edit mode from return
  if (localStorage.getItem("returnMode") === "edit") {
    localStorage.removeItem("returnMode");
    isEditing = true;
    const lastHighlighted = localStorage.getItem("lastHighlightedRoomIndex");
    if (lastHighlighted !== null) {
      currentEditIndex = parseInt(lastHighlighted, 10);
      sessionStorage.setItem("editingRoomIndex", currentEditIndex);
      sessionStorage.setItem("highlightedRoomIndex", currentEditIndex);
    }
  }

  // Recover stored edit index if available
  if (currentEditIndex === null && sessionStorage.getItem('editingRoomIndex')) {
    currentEditIndex = parseInt(sessionStorage.getItem('editingRoomIndex'), 10);
  }

  // 🟣 EDIT/REPLACE MODE
  if (currentEditIndex !== null && selectedRooms[currentEditIndex]) {
    selectedRooms[currentEditIndex] = {
      ...selectedRooms[currentEditIndex],
      roomId,
      roomName,
      price,
      checkIn: bookingCheckIn ? bookingCheckIn.toISOString() : null,
      checkOut: bookingCheckOut ? bookingCheckOut.toISOString() : null,
      guests: bookingGuests,
      children: bookingChildren,
      updatedAt: new Date().toISOString(),
    };

    saveRooms();
    updateCartUI();
    updateActionButtons();
    resetSelectButtons();

    // Only show KEEP ROOM in edit mode
    event.target.textContent = 'KEEP ROOM';
    event.target.classList.add('keep-room-active');

    // Clear edit mode after replacing
    sessionStorage.removeItem('editingRoomIndex');
    currentEditIndex = null;

    showAddonsView();
    console.log('✅ Room replaced successfully.');
    return;
  }

  // 🟤 ADD ROOM MODE
  const roomObj = {
    instanceId: `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    roomId,
    roomName,
    price,
    checkIn: bookingCheckIn ? bookingCheckIn.toISOString() : null,
    checkOut: bookingCheckOut ? bookingCheckOut.toISOString() : null,
    guests: bookingGuests,
    children: bookingChildren,
    quantity: 1,
    nights: bookingCheckIn && bookingCheckOut
      ? Math.max(1, Math.ceil((new Date(bookingCheckOut) - new Date(bookingCheckIn)) / (1000 * 60 * 60 * 24)))
      : 1,
    addedAt: new Date().toISOString(),
  };

  selectedRooms.push(roomObj);
  const newIndex = selectedRooms.length - 1;
  sessionStorage.setItem('highlightedRoomIndex', String(newIndex));
  applyPersistentHighlight(newIndex);

  saveRooms();
  updateCartUI();
  updateActionButtons();
  resetSelectButtons();

  // For new rooms, show BOOK NOW first, not KEEP ROOM
  event.target.textContent = 'BOOK NOW';
  event.target.classList.remove('keep-room-active');

  showAddonsView();
  console.log('🟤 Added new room and moved to Add-ons view.');

  // --- Helper: Show Add-ons View ---
  function showAddonsView() {
    const roomsEl = document.querySelector('.rooms-container');
    const addonsEl = document.querySelector('.addons-container');
    if (roomsEl) roomsEl.style.display = 'none';
    if (addonsEl) addonsEl.style.display = 'block';

    // Wait until visible, then refresh UI
    function refreshWhenVisible() {
      if (addonsEl?.style.display === 'block') {
        updateCartUI();
        updateActionButtons();
      } else {
        setTimeout(refreshWhenVisible, 50);
      }
    }
    refreshWhenVisible();
  }
};




  // --- Add-ons ---
  function toggleAddonDetails(btn) {
    const card = btn.closest('.addon-card');
    if (!card) return;
    const details = card.querySelector('.addon-details');
    if (!details) return;
    const isHidden = details.style.display === 'none' || details.style.display === '';
    details.style.display = isHidden ? 'block' : 'none';
    btn.textContent = isHidden ? 'Hide Details' : 'Add Details';
  }
  window.toggleAddonDetails = toggleAddonDetails;

function changeQty(btn, change) {
  const box = btn.closest('.quantity-box');
  if (!box) return;
  const input = box.querySelector('input');
  let value = parseInt(input.value, 10) || 1;
  value = Math.max(1, value + change);
  input.value = value;

  const addonCard = btn.closest('.addon-card');
  updateAddonTotal(addonCard);
}

window.changeQty = changeQty; // ✅ make it globally accessible



function updateAddonTotal(addonCard) {
  if (!addonCard) return;

  const priceText = addonCard.querySelector('.price-main')?.textContent || '';
  const base = parsePriceFromText(priceText); 
  const qtyInput = addonCard.querySelector('.quantity-box input');
  const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

  // compute subtotal and tax
  const subtotal = base * qty;
  const taxAmount = subtotal * TAX_RATE;
  const grandTotal = subtotal + taxAmount;

  // update total display
  const totalPriceEl = addonCard.querySelector('.total-price');
  if (totalPriceEl) {
    totalPriceEl.textContent = `Total ₱${grandTotal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  const totalNoteEl = addonCard.querySelector('.total-note');
  if (totalNoteEl) {
    totalNoteEl.textContent = 'Including Taxes and Fees';
  }

  // optional: store computed total for later (like when adding to cart)
  addonCard.dataset.totalWithTax = grandTotal;
}


function addAddon(addonId, event) {
  event = event || window.event;
  const addonKey = addonId;
  const addonDef = addonDetails[addonKey];
  if (!addonDef) return alert('Unknown add-on.');

  // Require at least one selected room
  if (selectedRooms.length === 0) {
    return alert('Please select a room first before adding add-ons.');
  }

// 🟢 Get the highlighted (selected) room instead of last one
  const highlightedIndex = parseInt(sessionStorage.getItem('highlightedRoomIndex') || '-1', 10);
  const linkedRoom = (highlightedIndex >= 0 && highlightedIndex < selectedRooms.length)
    ? selectedRooms[highlightedIndex]
    : selectedRooms[selectedRooms.length - 1]; // fallback to last if none highlighted

  // 🧠 Ensure the room has a unique instanceId
  if (!linkedRoom.instanceId) {
    linkedRoom.instanceId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    saveRooms();
  }

  const linkedInstance = linkedRoom.instanceId;

  // ✅ Get quantity from input (if available)
  let qty = 1;
  if (event && event.target) {
    const card = event.target.closest('.addon-card');
    if (card) {
      const input = card.querySelector('.quantity-box input');
      qty = input ? (parseInt(input.value, 10) || 1) : 1;
    }
  }

  // 💰 Apply tax and fees
  const unitPriceWithTax = addonDef.price * (1 + TAX_RATE);

  // 🔍 Check if this add-on already exists for this specific room instance
  const existing = selectedAddons.find(
    (a) => a.addonId === addonKey && a.linkedRoomInstanceId === linkedInstance
  );

  if (existing) {
    existing.quantity = (existing.quantity || 0) + qty;
    existing.updatedAt = new Date().toISOString();
  } else {
    selectedAddons.push({
      addonId: addonKey,
      addonName: addonDef.name,
      unitPrice: unitPriceWithTax,
      quantity: qty,
      specs: addonDef.specs,
      linkedRoomInstanceId: linkedInstance, // ✅ Proper linking
      addedAt: new Date().toISOString(),
    });
  }

  saveAddons();
  updateCartUI();
  updateActionButtons();

  // Collapse details panel (same as before)
  if (event && event.target) {
    const card = event.target.closest('.addon-card');
    if (card) {
      const details = card.querySelector('.addon-details');
      const addBtn = card.querySelector('.btn-add-detail');
      if (details) details.style.display = 'none';
      if (addBtn) addBtn.textContent = 'Add Details';
    }
  }

  // 🔄 Stay in Add-ons view after adding
  document.querySelector('.addons-container')?.style.setProperty('display', 'block');
  document.querySelector('.rooms-container')?.style.setProperty('display', 'none');

  requestAnimationFrame(updateActionButtons);
}
window.addAddon = addAddon;




  // --- Show / Skip addons ---
  function skipAddon() {
    showRooms();
  }
  window.skipAddon = skipAddon;

function showRooms() {
  // Remove 'keepRoomActivated' flag when returning from add-ons
  sessionStorage.removeItem('keepRoomActivated');

  const leftRooms = document.querySelector('.rooms-container');
  const addons = document.querySelector('.addons-container');

  // Show the rooms list
  if (addons) addons.style.display = 'none';
  if (leftRooms) leftRooms.style.display = 'block';
  requestAnimationFrame(updateActionButtons);


  // 🧠 Reset button states unless we are truly in edit mode
  const stillEditing = sessionStorage.getItem('editingRoomIndex');
  if (!stillEditing) {
    resetSelectButtons(); // <--- ensures all revert to "Select Room"
  }

  updateCartUI();
  updateActionButtons();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

  window.showRooms = showRooms;

  // --- Cart (rooms + addons) UI ---
function resetSelectButtons() {
  document.querySelectorAll('.btn-show-rates').forEach(btn => {
    btn.textContent = 'BOOK NOW';
    btn.classList.remove('keep-room-active');
  });
}
// 🟢 Move the active "Keep Room" card to the top of the list
function moveKeepRoomToTop() {
  const keepBtn = document.querySelector('.btn-show-rates.keep-room-active');
  if (!keepBtn) return;

  const roomCard = keepBtn.closest('.room-card');
  const roomGrid = roomCard?.parentElement; // usually .rooms-grid
  if (roomCard && roomGrid) {
    roomGrid.prepend(roomCard); // Move to top
    console.log('📦 Keep Room moved to top of room list');

    // 🟢 Scroll only slightly below summary (adjust offset as needed)
    const roomsContainer = document.querySelector('.rooms-container');
    if (roomsContainer) {
      const offsetTop = roomsContainer.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  }
}




function changeQuantity(index, delta) {
  if (index < 0 || index >= selectedRooms.length) return;
  selectedRooms[index].quantity = (selectedRooms[index].quantity || 1) + delta;
  if (selectedRooms[index].quantity <= 0) {
    // remove room and its linked addons using instanceId
    const roomInstanceToRemove = selectedRooms[index].instanceId;
    selectedAddons = selectedAddons.filter(a => a.linkedRoomInstanceId !== roomInstanceToRemove);
    selectedRooms.splice(index, 1);
    saveAddons();
  }
  saveRooms();
  updateCartUI();
  updateActionButtons();
  resetSelectButtons();
}
window.changeQuantity = changeQuantity;


  // confirm remove modal flow
  let pendingRemove = { type: null, index: null };

  function confirmRemove(type, index) {
    pendingRemove.type = type;
    pendingRemove.index = index;
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'flex';
  }
  window.confirmRemove = confirmRemove;

  function closeModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
    pendingRemove = { type: null, index: null };
  }

function performRemoveConfirmed() {
  if (pendingRemove.type === 'room') {
    const idx = pendingRemove.index;
    if (idx !== null && idx >= 0 && idx < selectedRooms.length) {
      const roomInstance = selectedRooms[idx].instanceId;

      // remove the room entry
      selectedRooms.splice(idx, 1);

      // remove linked addons for that instance
      selectedAddons = selectedAddons.filter(a => a.linkedRoomInstanceId !== roomInstance);

      saveAddons();
      saveRooms();

      // 🟢 Handle highlight persistence after removing a room
      let highlightedIndex = parseInt(sessionStorage.getItem('highlightedRoomIndex') || '-1', 10);

      if (highlightedIndex === idx) {
        // If we removed the highlighted room
        if (idx < selectedRooms.length) {
          // Move highlight to the next room (if exists)
          highlightedIndex = idx;
        } else if (selectedRooms.length > 0) {
          // Or move to the previous one if last
          highlightedIndex = selectedRooms.length - 1;
        } else {
          // No rooms left
          highlightedIndex = -1;
        }
      } else if (highlightedIndex > idx) {
        // If we removed a room before the highlighted one, shift index down by one
        highlightedIndex -= 1;
      }

      if (highlightedIndex >= 0 && highlightedIndex < selectedRooms.length) {
        sessionStorage.setItem('highlightedRoomIndex', highlightedIndex);
      } else {
        sessionStorage.removeItem('highlightedRoomIndex');
      }

      // Refresh highlight in UI
      applyPersistentHighlight(highlightedIndex);
    }
  } 
  
  else if (pendingRemove.type === 'addon') {
    const idx = pendingRemove.index;
    if (idx !== null && idx >= 0 && idx < selectedAddons.length) {
      selectedAddons.splice(idx, 1);
      saveAddons();
    }
  }

  updateCartUI();
  updateActionButtons();
  resetSelectButtons();
  closeModal();
}


  // wire modal buttons after DOM loaded (one-time)
  function wireModalButtons() {
    const yesBtn = document.querySelector('.btn-yes');
    const noBtn = document.querySelector('.btn-no');
    if (yesBtn) yesBtn.addEventListener('click', performRemoveConfirmed);
    if (noBtn) noBtn.addEventListener('click', closeModal);
  }


function formatGuests(adults, children) {
  let txt = '';
  if (adults && adults > 0) {
    txt += `${adults} ${adults > 1 ? 'Adults' : 'Adult'}`;
  }
  if (children && children > 0) {
    txt += txt
      ? `, ${children} ${children > 1 ? 'Children' : 'Child'}`
      : `${children} ${children > 1 ? 'Children' : 'Child'}`;
  }
  return txt || '--';
}
let inRoomListView = false; // global flag
window.setRoomListView = (val) => {
  inRoomListView = val;
  updateCartUI();
  updateActionButtons();
};


function updateCartUI() {
  const roomsContainer = document.getElementById('roomsContainer');
  const itemCountEl = document.getElementById('itemCount');
  const totalAmountEl = document.getElementById('totalAmount');
  const finalTotalEl = document.getElementById('finalTotal');
  const downpaymentEl = document.getElementById('downpayment');
  const taxesAndFeesEl = document.getElementById('taxesAndFees');
  const taxesFinalEl = document.getElementById('taxesFinal');
  const btnAddRoom = document.getElementById('btnAddRoom');
  const btnCheckout = document.getElementById('btnCheckout');

  if (!roomsContainer) return;
  roomsContainer.innerHTML = '';

  let totalQty = 0;
  let subtotalRooms = 0;
  let subtotalAddons = 0;

  // === Render Rooms ===
  selectedRooms.forEach((room, rIdx) => {
    const qty = room.quantity || 1;
    totalQty += qty;

    // per-room values (falls back to global booking if not set)
    const roomCheckIn = room.checkIn ? new Date(room.checkIn) : bookingCheckIn;
    const roomCheckOut = room.checkOut ? new Date(room.checkOut) : bookingCheckOut;
    const roomAdults = typeof room.guests !== 'undefined' ? room.guests : (bookingGuests || 1);
    const roomChildren = typeof room.children !== 'undefined' ? room.children : (bookingChildren || 0);
    const roomNights = room.nights || bookingNights || 1;
    const unit = Number(room.price) || 0;
    const roomSubtotal = unit * roomNights * qty;
    subtotalRooms += roomSubtotal;

    const roomDiv = document.createElement('div');
    roomDiv.className = 'room-item';

    const highlightedIndex = parseInt(sessionStorage.getItem('highlightedRoomIndex') || '-1', 10);
    const isHighlighted = rIdx === highlightedIndex;

    if (isHighlighted) {
      roomDiv.style.cssText = `
        border: 2px solid #000000ff;
        border-radius: 8px;
        background: #fff;
        padding: 14px;
        margin-bottom: 16px;
        box-shadow: 0 0 6px rgba(13,110,253,0.15);
        position: relative;
      `;
    } else {
      roomDiv.style.cssText = `
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #fff;
        padding: 12px;
        margin-bottom: 14px;
        position: relative;
      `;
    }


    // label if multiple rooms
    let labelHTML = '';
    if (selectedRooms.length > 1) {
      labelHTML = `
        <div style="
          font-size:0.8rem;
          font-weight:600;
          margin-bottom:4px;
        ">
          Room ${rIdx + 1}
        </div>`;
    }

    // date range string for this room
   const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
   const roomDateRange = (roomCheckIn && roomCheckOut)
      ? `${new Date(roomCheckIn).toLocaleDateString('en-US', options)} - ${new Date(roomCheckOut).toLocaleDateString('en-US', options)}`
      : '';



    roomDiv.innerHTML = `
      <div>
        ${labelHTML}
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-weight:700;">${room.roomName}</div>
            <div style="font-size:0.9rem; color:#666; margin-top:6px;">
              ${formatGuests(roomAdults, roomChildren)}
              • ${roomNights} night${roomNights > 1 ? 's' : ''}
            </div>
            <div style="font-size:0.85rem; color:#444; margin-top:6px;">${roomDateRange}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:600;">₱${unit.toLocaleString()} <span style="font-weight:400; font-size:0.8rem;">/ night</span></div>
            <div style="margin-top:6px; font-weight:700;">₱${roomSubtotal.toLocaleString()}</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; margin-top:8px; font-size:0.9rem; line-height:1;">
          <button class="btn-edit" data-index="${rIdx}" onclick="handleEditClick(event, ${rIdx})"
            style="background:none; border:none; color:#8B0000; padding:0; cursor:pointer; text-decoration:none; line-height:2; vertical-align:middle; margin-top:1px">
            Edit
          </button>

          <span style="color:#999; line-height:1; vertical-align:middle;">•</span>

          <button onclick="confirmRemove('room', ${rIdx})"
            style="background:none; border:none; color:#8B0000; padding:0; cursor:pointer; text-decoration:none; line-height:2; vertical-align:middle;">
            Remove
          </button>
        </div>
      </div>
    `;

    // === Render Add-ons for THIS INSTANCE ONLY ===
    selectedAddons.forEach((addon, aIdx) => {
      if (addon.linkedRoomInstanceId !== room.instanceId) return; // <-- match instanceId
      const addonQty = addon.quantity || 1;
      const addonSubtotal = (addon.unitPrice || 0) * addonQty;
      subtotalAddons += addonSubtotal;
      totalQty += addonQty;

      const addonDiv = document.createElement('div');
      addonDiv.style.marginTop = '10px';
      addonDiv.style.borderTop = '1px solid #ddd';
      addonDiv.style.paddingTop = '8px';
      addonDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600;">${addon.addonName}</div>
            <div style="font-size:0.85rem; color:#666;">${addon.specs} • Qty: ${addonQty}</div>
          </div>
          <div style="font-weight:700;">₱${addonSubtotal.toLocaleString()}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; margin-top:8px; font-size:0.9rem; line-height:1;">
          <button onclick="confirmRemove('addon', ${aIdx})" style="background:none; border:none; color:#8B0000; padding:0; cursor:pointer;">Remove</button>
        </div>
      `;
      roomDiv.appendChild(addonDiv);
    });

    roomsContainer.appendChild(roomDiv);
  });

  // === Compute Totals ===
  const grandSubtotal = subtotalRooms + subtotalAddons;
  const taxAmount = grandSubtotal * TAX_RATE;
  const grandTotal = grandSubtotal + taxAmount;
  const downpayment = grandTotal * 0.5;
  const hasItems = totalQty > 0;

  if (itemCountEl) {
    const label = totalQty === 1 ? 'Item' : 'Items';
    itemCountEl.textContent = `${totalQty} ${label}`;
  }
  if (totalAmountEl) totalAmountEl.textContent = `₱${grandTotal.toLocaleString()}`;
  if (finalTotalEl) finalTotalEl.textContent = `₱${grandTotal.toLocaleString()}`;
  if (downpaymentEl) downpaymentEl.textContent = `₱${downpayment.toLocaleString()}`;

  // === SHOW/HIDE BASED ON CART CONTENT ===
  if (!hasItems) {
    if (taxesAndFeesEl) taxesAndFeesEl.style.display = 'none';
    if (taxesFinalEl) taxesFinalEl.style.display = 'none';
    document.querySelectorAll('.total-section').forEach(el => el.style.display = 'none');
    if (btnAddRoom) btnAddRoom.style.display = 'none';
    if (btnCheckout) btnCheckout.style.display = 'none';
    document.querySelector('.rooms-container')?.style.setProperty('display', 'block');
    document.querySelector('.addons-container')?.style.setProperty('display', 'none');
  } else {
    if (taxesAndFeesEl) taxesAndFeesEl.style.display = 'block';
    if (taxesFinalEl) taxesFinalEl.style.display = 'block';
    document.querySelectorAll('.total-section').forEach(el => el.style.display = 'flex');
    if (btnAddRoom) btnAddRoom.style.display = 'block';
    if (btnCheckout) btnCheckout.style.display = 'block';
  }
    // 🟢 Improved logic for Add Room / Checkout visibility
  const keepRoomActive = document.querySelector('.btn-show-rates.keep-room-active');
  const inAddonsView = document.querySelector('.addons-container')?.style.display === 'block';

  if (keepRoomActive && !inAddonsView) {
    // In rooms view + Keep Room active → show Checkout only
    if (btnAddRoom) btnAddRoom.style.display = 'none';
    if (btnCheckout) btnCheckout.style.display = 'block';
  } else {
    // In add-ons view or no Keep Room → show both if there are items
    if (btnAddRoom) btnAddRoom.style.display = hasItems ? 'block' : 'none';
    if (btnCheckout) btnCheckout.style.display = hasItems ? 'block' : 'none';
  }
}

function updateActionButtons() {
  const btnAddRoom = document.getElementById('btnAddRoom');
  const btnCheckout = document.getElementById('btnCheckout');

  const inAddonsView = document.querySelector('.addons-container')?.style.display === 'block';
  const inRoomListView = document.querySelector('.rooms-container')?.style.display === 'block';
  const hasItems = document.querySelector('#roomsContainer .room-item') !== null;
  const anyKeepRoomActive = document.querySelectorAll('.btn-show-rates.keep-room-active').length > 0;

  // 🧠 New condition: permanently hide Add Room when in room card list view
  if (inRoomListView) {
    if (btnAddRoom) btnAddRoom.style.display = 'none'; // Hide Add Room
    if (btnCheckout) btnCheckout.style.display = hasItems ? 'block' : 'none'; // Only Checkout visible
    return; // stop here, no further logic
  }

  // ✅ If in Add-ons view → show both buttons (Add Room + Checkout)
  if (inAddonsView) {
    if (btnAddRoom) btnAddRoom.style.display = hasItems ? 'block' : 'none';
    if (btnCheckout) btnCheckout.style.display = hasItems ? 'block' : 'none';
  }
  // ✅ Else if a room is being kept (rooms view + Keep Room active)
  else if (anyKeepRoomActive) {
    if (btnAddRoom) btnAddRoom.style.display = 'none';
    if (btnCheckout) btnCheckout.style.display = 'block';
  }
  // ✅ Default case (fallback)
  else {
    if (btnAddRoom) btnAddRoom.style.display = hasItems ? 'block' : 'none';
    if (btnCheckout) btnCheckout.style.display = hasItems ? 'block' : 'none';
  }
}
window.updateActionButtons = updateActionButtons;




// 🛠️ Improved Edit handler — switches to Room List view before opening modal
// 🛠️ Improved Edit handler — switches to Room List view before opening modal
window.handleEditClick = function (e, idx) {
  e.preventDefault();
  currentEditIndex = idx;

  // Step 1: Always switch to Room List view first
  const addonsView = document.querySelector('.addons-container');
  const roomsView = document.querySelector('.rooms-container');
  if (addonsView && roomsView) {
    addonsView.style.display = 'none';
    roomsView.style.display = 'block';
  }

  // Step 2: Wait briefly for view transition, then open modal
  setTimeout(() => {
    const room = selectedRooms[idx];
    if (room) {
      selectedCheckIn = room.checkIn ? new Date(room.checkIn) : null;
      selectedCheckOut = room.checkOut ? new Date(room.checkOut) : null;

      document.getElementById('checkInDate').textContent =
        selectedCheckIn
          ? selectedCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Select date';
      document.getElementById('checkOutDate').textContent =
        selectedCheckOut
          ? selectedCheckOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Select date';
      document.getElementById('guestCount').value = room.guests || 1;
      if (document.getElementById('childCount')) {
        document.getElementById('childCount').value = room.children || 0;
      }
    }

    generateCalendar();
    updateDateDisplay();
    validateBooking();
    openBookingModal();
    updateActionButtons();

    // 🟢 Highlight but don't activate Keep Room yet
    sessionStorage.setItem('highlightedRoomIndex', idx);

    // Remove all Keep Room states — we’re only editing now
    document.querySelectorAll('.btn-show-rates.keep-room-active').forEach(btn => {
      btn.textContent = 'BOOK NOW';
      btn.classList.remove('keep-room-active');
    });

    // Apply highlight to cart only (visual cue)
    applyPersistentHighlight(idx);

    // 🧠 Mark editing mode so reload won't auto-show Keep Room
    sessionStorage.setItem('editingRoomIndex', idx);
  }, 200);
  localStorage.setItem("lastHighlightedRoomIndex", idx);

};


// 🟡 Helper: Reapply persistent highlight on page load or after cart updates
function applyPersistentHighlight(forcedIndex = null) {
  const savedIndex =
    forcedIndex !== null
      ? forcedIndex
      : parseInt(sessionStorage.getItem('highlightedRoomIndex') || '-1', 10);

  const roomItems = document.querySelectorAll('#roomsContainer .room-item');
  roomItems.forEach((item, i) => {
    if (i === savedIndex) {
      item.style.border = '2px solid #000';
      item.style.boxShadow = '0 0 6px rgba(13,110,253,0.25)';
    } else {
      item.style.border = '1px solid #e0e0e0';
      item.style.boxShadow = 'none';
    }
  });
}

// 🟣 Reapply highlight when UI refreshes (cart changes, etc.)
window.addEventListener('DOMContentLoaded', () => applyPersistentHighlight());



  // checkout
// --- Checkout Button Handler ---
function checkout() {
  if (!selectedRooms || selectedRooms.length === 0) {
    alert("Please select at least one room before checking out.");
    return;
  }

  // 🟢 Force fresh booking data before leaving the page
  const latestBooking = {
    checkIn: selectedRooms[0]?.checkIn || bookingData.checkIn,
    checkOut: selectedRooms[0]?.checkOut || bookingData.checkOut,
    guests: selectedRooms[0]?.guests || bookingData.guests || 1,
    children: selectedRooms[0]?.children || bookingData.children || 0,
    rooms: selectedRooms.length,
    nights: Math.max(
      1,
      Math.ceil(
        (new Date(selectedRooms[0]?.checkOut) - new Date(selectedRooms[0]?.checkIn)) /
          (1000 * 60 * 60 * 24)
      )
    ),
  };

  localStorage.setItem("selectedRooms", JSON.stringify(selectedRooms));
  localStorage.setItem("selectedAddons", JSON.stringify(selectedAddons));
  localStorage.setItem("bookingData", JSON.stringify(latestBooking));

  // 🟣 Give localStorage time to commit before redirect
  setTimeout(() => {
    window.location.href = "guest-details.html";
  }, 100);
}


document.addEventListener("DOMContentLoaded", () => {
  const btnCheckout = document.getElementById("btnCheckout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", checkout);
  }
});


  // addRoom (show rooms to add more)
function addRoom() {
  console.log("🟢 Add Room clicked — clearing edit mode");

  // 🧹 Clear ALL edit/replace flags to ensure we’re not replacing anything
  localStorage.removeItem('returnMode');
  sessionStorage.removeItem('editingRoomIndex');
  sessionStorage.removeItem('highlightedRoomIndex');
  sessionStorage.removeItem('keepRoomActivated');

  currentEditIndex = null;
  isEditing = false;

  // ✅ Show room list to add a fresh one
  showRooms();
  resetSelectButtons();

  // ✅ Make sure no Keep Room button remains visible
  document.querySelectorAll('.btn-show-rates.keep-room-active').forEach(btn => {
    btn.textContent = 'BOOK NOW';
    btn.classList.remove('keep-room-active');
  });

  updateCartUI();
  updateActionButtons();
}
window.addRoom = addRoom;


  // filters
  function filterRooms(type, event) {
    document.querySelectorAll('.room-type-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    document.querySelectorAll('.room-card').forEach(card => {
      const t = card.dataset.roomType || '';
      card.style.display = (type === 'all' || t === type) ? 'block' : 'none';
    });
  }
  window.filterRooms = filterRooms;

  // --- Initialization on DOMContentLoaded ---
  document.addEventListener('DOMContentLoaded', () => {
    // re-read booking data (fresh)
    updateBookingSummary();
    generateCalendar();
    validateBooking();
    bookingData = JSON.parse(localStorage.getItem(STORAGE_BOOKING)) || bookingData;
    bookingCheckIn = bookingData.checkIn ? new Date(bookingData.checkIn) : bookingCheckIn;
    bookingCheckOut = bookingData.checkOut ? new Date(bookingData.checkOut) : bookingCheckOut;
    bookingGuests = (typeof bookingData.guests !== 'undefined') ? bookingData.guests : bookingGuests;
    maxRoomsAllowed = bookingData.rooms ? parseInt(bookingData.rooms, 10) : maxRoomsAllowed;
    if (bookingCheckIn && bookingCheckOut) {
      bookingNights = Math.ceil((bookingCheckOut - bookingCheckIn) / (1000 * 60 * 60 * 24));
      if (bookingNights < 1) bookingNights = 1;
    }

    // show summary
    const summaryCheckIn = document.getElementById('summaryCheckIn');
    const summaryCheckOut = document.getElementById('summaryCheckOut');
    const summaryGuests = document.getElementById('summaryGuests');
    const summaryNights = document.getElementById('summaryNights');
    if (summaryCheckIn) summaryCheckIn.textContent = bookingCheckIn ? fmtDateShort(bookingCheckIn) : '--';
    if (summaryCheckOut) summaryCheckOut.textContent = bookingCheckOut ? fmtDateShort(bookingCheckOut) : '--';

    if (summaryGuests) {
      const adults = bookingGuests || 1;
      const children = bookingChildren || 0;
      let guestText = `${adults} ${adults > 1 ? 'Adults' : 'Adult'}`;
      if (children > 0) {
        guestText += `, ${children} ${children > 1 ? 'Children' : 'Child'}`;
      }
      summaryGuests.textContent = guestText;
    }
    if (summaryNights) summaryNights.textContent = bookingNights;

    // populate selected state from storage
    selectedRooms = JSON.parse(localStorage.getItem(STORAGE_ROOMS)) || selectedRooms;
    selectedAddons = JSON.parse(localStorage.getItem(STORAGE_ADDONS)) || selectedAddons;

    // initialize addon totals
    document.querySelectorAll('.addon-card').forEach(card => updateAddonTotal(card));

    wireModalButtons();
    updateCartUI();
    updateActionButtons();
    resetSelectButtons();

   
    setTimeout(() => {
      const savedIndex = parseInt(sessionStorage.getItem('highlightedRoomIndex') || '-1', 10);
      const isEditing = sessionStorage.getItem('editingRoomIndex') !== null;

      if (savedIndex >= 0 && selectedRooms[savedIndex] && !isEditing) {
        const room = selectedRooms[savedIndex];
        const btn = document.querySelector(
          `.room-card[data-room-type="${room.roomId}"] .btn-show-rates`
        );
        if (btn) {
          btn.textContent = 'KEEP ROOM';
          btn.classList.add('keep-room-active');
          moveKeepRoomToTop();
        }
      } else {
        // Remove Keep Room state if currently editing
        document.querySelectorAll('.btn-show-rates.keep-room-active').forEach(b => {
          b.textContent = 'BOOK NOW';
          b.classList.remove('keep-room-active');
        });
      }
    }, 300);


  });

  // expose a debug helper (optional)
  window.__bookingDebug = () => ({
    bookingData, selectedRooms, selectedAddons, bookingNights, maxRoomsAllowed
  });
 setTimeout(() => {
  const btn = document.querySelector('.btn-edit');
  if (btn) {
    btn.addEventListener('click', () => {
      console.log('🧪 Direct button listener triggered');
      openBookingModal();
    });
  } else {
    console.warn('⚠️ No .btn-edit found in DOM');
  }
}, 1000);

// 🛠️ Force Add Room to stay hidden when in room list view (even on page load or refresh)
window.addEventListener('DOMContentLoaded', () => {
  const inRoomListView =
    document.querySelector('.rooms-container')?.style.display === 'block' ||
    document.querySelector('.addons-container')?.style.display !== 'block';

  const btnAddRoom = document.getElementById('btnAddRoom');
  const btnCheckout = document.getElementById('btnCheckout');

  // Check if the cart actually has items
  const hasItems = (JSON.parse(localStorage.getItem('selectedRooms')) || []).length > 0 ||
                   (JSON.parse(localStorage.getItem('selectedAddons')) || []).length > 0;

  if (inRoomListView && btnAddRoom) {
    btnAddRoom.style.display = 'none'; // always hide in room list
    if (btnCheckout) btnCheckout.style.display = hasItems ? 'block' : 'none'; // only show if cart not empty
  }
});


function applyPersistentHighlight(forcedIndex = null) {
  const savedIndex = forcedIndex !== null
    ? forcedIndex
    : (sessionStorage.getItem('highlightedRoomIndex') !== null
        ? parseInt(sessionStorage.getItem('highlightedRoomIndex'), 10)
        : -1);

  const roomItems = document.querySelectorAll('#roomsContainer .room-item');
  roomItems.forEach((item, i) => {
    if (i === savedIndex) {
      item.style.border = '2px solid #000';
      item.style.boxShadow = '0 0 6px rgba(13,110,253,0.25)';
    } else {
      item.style.border = '1px solid #e0e0e0';
      item.style.boxShadow = 'none';
    }
  });
}
})();