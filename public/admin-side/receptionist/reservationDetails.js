document.addEventListener('DOMContentLoaded', loadReservationDetails);

async function loadReservationDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('Reservation ID missing');
        return;
    }

    const res = await fetch(`/api/reservation/${id}`);
    const data = await res.json();

    // Booking
    document.getElementById('reservationId').value = data.reference_number;
    document.getElementById('reservationStatus').value = data.status;
    document.getElementById('checkIn').value = data.check_in;
    document.getElementById('checkOut').value = data.check_out;

    // Guest (first guest only)
    const guest = data.guests[0];
    if (guest) {
        const names = guest.name.split(' ');
        document.getElementById('guestFirstName').value = names[0];
        document.getElementById('guestLastName').value = names.slice(1).join(' ');
        document.getElementById('guestEmail').value = guest.email;
        document.getElementById('guestPhone').value = guest.phone;
        document.getElementById('specialRequest').value = guest.special_requests ?? '';
    }

    // Rooms
    const roomNames = data.rooms
        .map(r => r.room.room_number)
        .join(', ');

    document.getElementById('roomType').value = roomNames;

    // Payment image
    if (data.payment?.proof_image) {
        document.getElementById('modalRoomImage').src =
            `/storage/${data.payment.proof_image}`;
    }
}


/* ---------- helpers ---------- */

function setInputByLabel(label, value) {
    document.querySelectorAll('.form-label').forEach(l => {
        if (l.textContent.trim() === label) {
            l.nextElementSibling.value = value ?? '';
        }
    });
}

function setValue(label, value) {
    document.querySelectorAll('.form-label').forEach(l => {
        if (l.textContent.trim() === label) {
            l.nextElementSibling.value = value ?? '';
        }
    });
}

function setDateInput(index, value) {
    const inputs = document.querySelectorAll('input[type="date"]');
    if (inputs[index]) inputs[index].value = value;
}

function setSelectValue(value) {
    const select = document.querySelector('select.form-select');
    if (!select) return;
    [...select.options].forEach(opt => {
        opt.selected = opt.text.toLowerCase().includes(value.replace('_',' '));
    });
}

function setTextarea(value) {
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.value = value ?? '';
}