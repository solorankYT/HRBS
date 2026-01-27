// Calendar functionality
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedCheckIn = null;
let selectedCheckOut = null;

// ==========================
// Counter functionality (Guests & Rooms)
// ==========================
function updateCounter(id, change) {
  const input = document.getElementById(id);
  let value = parseInt(input.value) || 0;

  let min =(id ==="childCount") ? 0: 1;
  let max = (id === "guestCount") ? 10 : (id === "childCount" ? 5: 5 );

  value = Math.max(min, Math.min(max, value + change));
  input.value = value;

}


// ==========================
// Modal functionality
// ==========================
function openBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.add('active');
    generateCalendar();
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.getElementById('bookingModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeBookingModal();
    }
});

// ==========================
// Calendar generation
// ==========================
function generateCalendar() {
    // Build Check-in calendar (current month)
    buildCalendar('checkIn', currentMonth, currentYear);

    // Build Check-out calendar (always next month)
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

    title.textContent = `${monthNames[month]} ${year}`;
    daysContainer.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Add empty cells
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day disabled';
        daysContainer.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        const currentDate = new Date(year, month, day);

        if (currentDate < today.setHours(0, 0, 0, 0)) {
            dayElement.classList.add('disabled');
        } else {
            if (currentDate.toDateString() === new Date().toDateString()) {
                dayElement.classList.add('today');
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
    element.classList.add('selected');
    updateDateDisplay();
  } else if (selectedCheckIn && !selectedCheckOut) {
    if (date > selectedCheckIn) {
      selectedCheckOut = date;
      highlightDateRange();
      updateDateDisplay();
      validateBooking();
    } else {
      clearSelectedDates();
      selectedCheckIn = date;
      element.classList.add('selected');
      updateDateDisplay();
    }
  }
}

function highlightDateRange() {
  const allDays = document.querySelectorAll('.calendar-day:not(.disabled)');
  allDays.forEach(dayEl => {
    const dayText = parseInt(dayEl.textContent);
    const monthYear = dayEl.closest('.calendar-days').id.includes('checkIn')
      ? new Date(currentYear, currentMonth)
      : new Date(currentYear, currentMonth + 1);

    const currentDate = new Date(monthYear.getFullYear(), monthYear.getMonth(), dayText);

    if (selectedCheckIn && selectedCheckOut && currentDate >= selectedCheckIn && currentDate <= selectedCheckOut) {
      dayEl.classList.add('selected');
    }
  });
}

function clearSelectedDates() {
    document.querySelectorAll('.calendar-day.selected')
      .forEach(el => el.classList.remove('selected'));
}

function updateDateDisplay() {
    const checkInDisplay = document.getElementById('checkInDate');
    const checkOutDisplay = document.getElementById('checkOutDate');

    const options = { month: 'short', day: 'numeric', year: 'numeric' };

    if (selectedCheckIn) {
        checkInDisplay.textContent = selectedCheckIn.toLocaleDateString('en-US', options);
        checkInDisplay.dataset.value = selectedCheckIn.toISOString().split('T')[0];
    }

    if (selectedCheckOut) {
        checkOutDisplay.textContent = selectedCheckOut.toLocaleDateString('en-US', options);
        checkOutDisplay.dataset.value = selectedCheckOut.toISOString().split('T')[0];
    } else {
        checkOutDisplay.textContent = 'Select date';
        delete checkOutDisplay.dataset.value;
    }
}

function validateBooking() {
    const checkRatesBtn = document.getElementById('checkRatesBtn');

    if (selectedCheckIn && selectedCheckOut) {
        checkRatesBtn.disabled = false;
        checkRatesBtn.style.opacity = '1';
    } else {
        checkRatesBtn.disabled = true;
        checkRatesBtn.style.opacity = '0.5';
    }
}

function previousMonth(type) {
    if (type === 'checkIn') {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    } else {
        currentMonth--; // checkOut always tied to checkIn's currentMonth
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    }
    generateCalendar();
}

function nextMonth(type) {
    if (type === 'checkIn') {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    } else {
        currentMonth++; // checkOut always tied to checkIn's currentMonth
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }
    generateCalendar();
}

function proceedToRoomSelection() {
  const checkIn = document.getElementById('checkInDate').dataset.value;
  const checkOut = document.getElementById('checkOutDate').dataset.value;
  const adults = document.getElementById('guestCount').value;
  const children = document.getElementById('childCount').value;

  if (!checkIn || !checkOut) {
    alert('Please select dates');
    return;
  }

  const totalGuests = parseInt(adults) + parseInt(children);

  const params = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    number_of_guests: totalGuests
  });

  window.location.href = `select-room.html?${params.toString()}`;
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    generateCalendar();
    validateBooking();
});
