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

    /* ---------- Booking ---------- */
    document.getElementById('reservationId').value = data.reference_number;
    document.getElementById('reservationStatus').value = normalizeStatus(data.status);
    document.getElementById('checkIn').value = data.check_in;
    document.getElementById('checkOut').value = data.check_out;
    document.getElementById('dateBooked').value = data.date_booked;
    document.getElementById('numberGuest').value = data.number_of_guests;
    /* ---------- Guest ---------- */
    if (data.guest) {
        const names = (data.guest.name || '').split(' ');
        document.getElementById('guestFirstName').value = names[0] ?? '';
        document.getElementById('guestLastName').value = names.slice(1).join(' ') ?? '';
        document.getElementById('guestEmail').value = data.guest.email ?? '';
        document.getElementById('guestPhone').value = data.guest.phone ?? '';
        document.getElementById('specialRequest').value = data.guest.special_requests ?? '';
    }

    /* ---------- Rooms ---------- */
    const roomText = data.rooms
        .map(r => `${r.room_type} (${r.room_number})`)
        .join(', ');

    document.querySelector('input[placeholder], input[value="Premium Room"]').value = roomText;
    document.getElementById('roomType').value = roomText;

    /* ---------- Payment ---------- */
    if (data.payment?.proof_image) {
        const url = `/storage/${data.payment.proof_image}`;
        const proofInput = document.getElementById('paymentProofInput');
        const hiddenImg = document.getElementById('proofImage');
        const modalImg = document.getElementById('modalRoomImage');
        if (proofInput) proofInput.value = data.payment.proof_image;
        if (hiddenImg) hiddenImg.src = url;
        if (modalImg) modalImg.src = url;
    }

   renderCheckInButton(data.status);
}

/* ---------- helpers ---------- */

function normalizeStatus(status) {
    const select = document.getElementById('reservationStatus');
    if (!select) return status;

    [...select.options].forEach(opt => {
        opt.selected = opt.text.toLowerCase().includes(status.replace('_', ' '));
    });

    return status;
}


async function checkIn() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        const res = await fetch(`/api/reservation/checkin/${id}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Check-in failed');
        }

        alert(data.message);
        window.location.reload();

    } catch (error) {
        alert(error.message);
    }
}

function renderCheckInButton(status) {
    const container = document.getElementById('checkInContainer');
    container.innerHTML = '';

    if (status === 'checked_in') {
        container.innerHTML = `
            <div class="text-success fw-semibold">
                Guest is already checked in
            </div>
        `;
    }
    else if(status === 'checked_out'){
         container.innerHTML = `
              <div class="text-danger fw-semibold">
                Guest is checked out
            </div>
             `;
    }
    else {
        container.innerHTML = `
            <button onclick="checkIn()" class="btn checkin-btn btn-sm">
                <i class="fas fa-check me-1"></i>Check-in Guest
            </button>
        `;
    }
}
