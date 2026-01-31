let foundBooking = null

document.getElementById('retrieveBtn').addEventListener('click', async () => {
  const bookingRef = document.getElementById('bookingRefInput').value.trim()
  const contactValue = document.getElementById('contactInput').value.trim()
  const isEmail = document.getElementById('contactLabel').textContent.includes('Email')

  const params = new URLSearchParams(
    isEmail ? { email: contactValue } : { phone: contactValue }
  )

  try {
    const res = await fetch(`/api/guest/bookings/${bookingRef}?${params.toString()}`, {
      headers: { 'Accept': 'application/json' }
    })

    const data = await res.json()
    if (!res.ok) throw data

    foundBooking = data
    renderBooking(data)

  } catch (err) {
    alert(err.message || 'Booking not found')
  }
})

function renderBooking(booking) {
  document.getElementById('retrieveBookingCard').classList.add('d-none')
  document.getElementById('bookingDetails').classList.remove('d-none')

  document.querySelector('.badge').textContent = booking.status
  document.getElementById('totalAmount').textContent = `₱${booking.total.toLocaleString()}`
  document.getElementById('roomDisplay').textContent =
    booking.rooms.map(r => r.type).join(', ')
}

document.getElementById('confirmCancelBtn').addEventListener('click', async () => {
  await fetch(`/api/guest/bookings/${foundBooking.reference}/cancel`, {
    method: 'POST'
  })
  alert('Booking cancelled')
  location.reload()
})



document.getElementById('closeDetailsBtn').addEventListener('click', () => {
    document.getElementById('retrieveBookingCard').classList.remove('d-none')
    document.getElementById('bookingDetails').classList.add('d-none')
    document.getElementById('actionButtons').classList.add('d-none')
    document.getElementById('paymentHistory').classList.add('d-none')
})

document.getElementById('emailMethod').addEventListener('click', () => {
    document.getElementById('contactLabel').textContent = 'Email Address *'
})

document.getElementById('phoneMethod').addEventListener('click', () => {
    document.getElementById('contactLabel').textContent = 'Phone Number *'
})

document.getElementById('checkAvailabilityBtn').addEventListener('click', () => {
    const newCIValue = document.getElementById('newCheckIn').value
    const newCOValue = document.getElementById('newCheckOut').value
    if (!newCIValue || !newCOValue) return alert('Please select new dates')

    const newCI = new Date(newCIValue)
    const newCO = new Date(newCOValue)
    if (newCO <= newCI) return alert('Check-out must be after check-in')

    const originalCI = new Date(foundBooking.checkIn)
    const originalCO = new Date(foundBooking.checkOut)
    const originalNights = (originalCO - originalCI) / (1000 * 60 * 60 * 24)
    const newNights = (newCO - newCI) / (1000 * 60 * 60 * 24)
    const perNight = foundBooking.total / originalNights
    const newTotal = perNight * newNights
    const diff = newTotal - foundBooking.total

    document.getElementById('originalTotal').textContent = `₱${foundBooking.total.toLocaleString()}`
    document.getElementById('newTotal').textContent = `₱${newTotal.toLocaleString()}`

    if (diff > 0) {
        document.getElementById('diffLabel').textContent = 'Additional payment due'
        document.getElementById('diffAmount').textContent = `₱${diff.toLocaleString()}`
        document.getElementById('paymentLabel').textContent = 'Down payment due now'
        document.getElementById('paymentAmount').textContent = `₱${(diff / 2).toLocaleString()}`
        document.getElementById('refundRow').classList.add('d-none')
        document.getElementById('diffRow').classList.remove('d-none')
        document.getElementById('downPaymentRow').classList.remove('d-none')
    } else if (diff < 0) {
        document.getElementById('refundAmount').textContent = `₱${Math.abs(diff).toLocaleString()}`
        document.getElementById('refundRow').classList.remove('d-none')
        document.getElementById('diffRow').classList.add('d-none')
        document.getElementById('downPaymentRow').classList.add('d-none')
    } else {
        document.getElementById('refundAmount').textContent = `₱0`
        document.getElementById('refundRow').classList.remove('d-none')
        document.getElementById('diffRow').classList.add('d-none')
        document.getElementById('downPaymentRow').classList.add('d-none')
    }

    document.getElementById('priceComparison').classList.remove('d-none')
})

document.getElementById('confirmCancelBtn').addEventListener('click', () => {
    alert(`Booking ${foundBooking.reference} has been canceled.`)
    document.getElementById('retrieveBookingCard').classList.remove('d-none')
    document.getElementById('bookingDetails').classList.add('d-none')
    document.getElementById('actionButtons').classList.add('d-none')
    document.getElementById('paymentHistory').classList.add('d-none')
    foundBooking = null
})
