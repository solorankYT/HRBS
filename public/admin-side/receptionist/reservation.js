let currentPage = 1;
let lastPage = 1;

async function loadReservations(page = 1) {
    const res = await fetch(`/api/reservation?page=${page}`);
    const json = await res.json();

    const tbody = document.getElementById('reservationTable');
    tbody.innerHTML = '';

json.data.forEach(r => {
    tbody.innerHTML += `
        <tr>
            <td>${r.reference_number}</td>
            <td>${r.guest_name}</td>
            <td>${r.rooms}</td>
            <td>${formatDate(r.check_in)}</td>
            <td>${formatDate(r.check_out)}</td>
            <td>
                <span class=" ${statusClass(r.status)}">
                    ${r.status}
                </span>
            </td>

            <td>
                <span class="payment-badge payment-${r.payment_status.toLowerCase()}">
                    ${r.payment_status}
                </span>
            </td>

            <td>₱${Number(r.amount).toLocaleString()}</td>
            <td>
                <a href="reservationdetails.html?id=${r.id}"
                   class="btn btn-sm btn-outline-primary">
                   <i class="fas fa-edit"></i>
                </a>
            </td>
        </tr>
    `;
});


    currentPage = json.current_page;
    lastPage = json.last_page;

    updatePaginationUI();
}

function updatePaginationUI() {
    document.getElementById('pageInfo').textContent =
        `Page ${currentPage} of ${lastPage}`;

    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === lastPage;
}

document.getElementById('prevBtn').onclick = () => {
    if (currentPage > 1) loadReservations(currentPage - 1);
};

document.getElementById('nextBtn').onclick = () => {
    if (currentPage < lastPage) loadReservations(currentPage + 1);
};

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function statusClass(status) {
    return `status-${status}`;
}

document.addEventListener('DOMContentLoaded', () => loadReservations());