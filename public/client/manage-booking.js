let foundBooking = null;


document.getElementById('retrieveBtn').addEventListener('click', async () => {
  const reference = document.getElementById('bookingRefInput').value.trim();
  const contact = document.getElementById('contactInput').value.trim();
   const isEmail = document.getElementById('contactLabel').textContent.includes('Email')


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

    renderBooking(data);

  } catch (err) {
    alert(err.message || 'Booking not found');
  }
});


function renderBooking(booking) {
  foundBooking = booking;

  const mainGuest = booking.rooms[0];

  document.getElementById('retrieveBookingCard').classList.add('d-none');
  document.getElementById('bookingDetails').classList.remove('d-none');

  document.getElementById('bookingRef').textContent = booking.reference;
  document.getElementById('bookingStatus').textContent = booking.status;
  document.getElementById('checkIn').textContent = booking.check_in;
  document.getElementById('checkOut').textContent = booking.check_out;
  document.getElementById('guestCount').textContent = booking.guests;
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

  booking.rooms.forEach(room => {
    tbody.innerHTML += `
      <tr>
        <td>${room.type} (Room ${room.room_number})</td>
        <td>1</td>
        <td>₱${Number(room.price).toLocaleString()}</td>
        <td>₱${Number(room.price).toLocaleString()}</td>
      </tr>
    `;
  });
}



document.getElementById('confirmCancelBtn').addEventListener('click', async () => {
  await fetch(`/api/guest/bookings/${foundBooking.reference}/cancel`, {
    method: 'POST'
  })
  alert('Booking cancelled')
  location.reload()
})

