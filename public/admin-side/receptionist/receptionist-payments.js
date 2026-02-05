document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('.payment-table tbody');
  const viewModalEl = document.getElementById('viewPaymentModal');
  const viewModal = new bootstrap.Modal(viewModalEl);

  async function loadPayments() {
    try {
      const res = await fetch('/api/receptionist/payments');
      const json = await res.json();
      tbody.innerHTML = '';
      json.data.forEach(p => {
        const tr = document.createElement('tr');
        tr.dataset.paymentId = p.id;
        tr.innerHTML = `
          <td><span class="reservation-id">${p.reference ?? p.booking_id}</span></td>
          <td><span class="guest-name">${p.guest_name ?? 'N/A'}</span></td>
          <td><span class="payment-method method-${p.method}">${p.method?.toUpperCase() ?? ''}</span></td>
          <td><span class="payment-status">${p.status?.toUpperCase() ?? 'PENDING'}</span></td>
          <td class="amount">₱${Number(p.amount).toLocaleString()}</td>
          <td class="amount">₱${Number(p.amount).toLocaleString()}</td>
          <td>${new Date(p.created_at).toLocaleDateString()}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-action view-payment" title="View" aria-label="View Payment"><i class="fas fa-eye"></i></button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Could not load payments', err);
    }
  }

  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.view-payment');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row.dataset.paymentId;
    try {
      const res = await fetch(`/api/receptionist/payments/${id}`);
      const json = await res.json();
      // populate modal fields
      document.getElementById('viewPayReservationId').value = json.reference ?? json.booking_id;
      document.getElementById('viewPayGuestName').value = json.guest?.name ?? '';
      document.getElementById('viewPayMethod').value = json.method;
      document.getElementById('viewPayAmountPaid').value = `₱${Number(json.amount).toLocaleString()}`;
      document.getElementById('viewPayBalance').value = `₱${Number(json.booking?.total - json.amount || 0).toLocaleString()}`;
      document.getElementById('viewPayDate').value = json.created_at;

      // reservation details
      document.getElementById('viewResRoom').value = (json.booking.rooms[0]?.type ?? '') + ' ' + (json.booking.rooms[0]?.room_number ?? '');
      document.getElementById('viewResNights').value = json.booking.rooms[0]?.nights ?? '';
      document.getElementById('viewResGuests').value = json.guest?.phone ?? '';

      document.getElementById('viewBillRoomRate').value = json.booking.rooms[0]?.subtotal ?? '';
      document.getElementById('viewBillTaxes').value = '';
      document.getElementById('viewBillFees').value = '';
      document.getElementById('viewBillSubtotal').value = json.booking.rooms[0]?.subtotal ?? '';
      document.getElementById('viewBillTotal').value = json.booking?.total ?? '';

      // show proof image if present
      const proofImageContainer = document.getElementById('proofImageContainer');
      proofImageContainer.innerHTML = '';
      if (json.proof_image) {
        const img = document.createElement('img');
        img.src = `/storage/${json.proof_image}`;
        img.alt = 'Proof of payment';
        img.style.maxWidth = '100%';
        proofImageContainer.appendChild(img);
      }

      // actions
      const approveBtn = document.getElementById('approvePaymentBtn');
      const rejectBtn = document.getElementById('rejectPaymentBtn');
      // show status in modal
      const statusField = document.getElementById('viewPayStatus');
      if (statusField) statusField.value = (json.status || '').toUpperCase();

      approveBtn.onclick = async () => await updatePaymentStatus(id, 'paid');
      rejectBtn.onclick = async () => await updatePaymentStatus(id, 'failed');

      viewModal.show();
    } catch (err) {
      console.error('Error loading payment details', err);
    }
  });

  async function updatePaymentStatus(id, status) {
    try {
      const res = await fetch(`/api/receptionist/payments/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (res.ok) {
        await loadPayments();
        bootstrap.Modal.getInstance(document.getElementById('viewPaymentModal')).hide();
        showToast(json.message || 'Payment updated', 'success');
      } else {
        showToast(json.message || 'Failed to update status', 'danger');
      }
    } catch (err) {
      console.error('Update status error', err);
      showToast('Server error while updating payment', 'danger');
    }
  }

  function showToast(message, type = 'success') {
    const toastEl = document.getElementById('receptionistToast');
    const toastBody = document.getElementById('receptionistToastBody');
    if (!toastEl || !toastBody) return;
    toastBody.textContent = message;
    // adjust color classes
    toastEl.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-primary');
    if (type === 'success') toastEl.classList.add('text-bg-success');
    else if (type === 'danger') toastEl.classList.add('text-bg-danger');
    else if (type === 'warning') toastEl.classList.add('text-bg-warning');
    else toastEl.classList.add('text-bg-primary');
    toastEl.classList.remove('d-none');
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
  }

  loadPayments();
});
