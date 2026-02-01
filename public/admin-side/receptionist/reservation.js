async function loadReservations() {
    try {
        const res = await fetch('http://localhost:8000/api/reservation', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        const tbody = document.getElementById('reservationTable');
        tbody.innerHTML = '';

        data.forEach(r => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td class="reservation-id">${r.reference_number ?? r.id}</td>
                <td>${r.guest_name}</td>
                <td>${r.rooms}</td>
                <td>${formatDate(r.check_in)}</td>
                <td>${formatDate(r.check_out)}</td>
                <td>
                    <span class="status-badge ${statusClass(r.status)}">
                        ${formatStatus(r.status)}
                    </span>
                </td>
                <td>₱${Number(r.amount).toLocaleString()}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error('Failed to load reservations', err);
    }
}

function formatDate(date) {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
}

function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function statusClass(status) {
    switch (status) {
        case 'booked': return 'status-booked';
        case 'checked_in': return 'status-checkedin';
        case 'checked_out': return 'status-checkedout';
        case 'cancelled': return 'status-cancelled';
        case 'pending' : return 'pending';
        default: return '';
    }
}

document.addEventListener('DOMContentLoaded', loadReservations);