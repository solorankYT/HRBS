
//select-room.js

function renderRooms(rooms) {
  const container = document.getElementById('roomsContainer');
  container.innerHTML = '';

  if (rooms.length === 0) {
    container.innerHTML = '<p class="no-rooms">No rooms available for selected dates.</p>';
    return;
  }

  rooms.forEach(room => {
    const div = document.createElement('div');
    div.className = 'room-card';
    div.dataset.type = room.type.toLowerCase().replace(/\s/g, '-');

    div.innerHTML = `
      <div class="room-image">
        <img src="https://via.placeholder.com/320x180?text=${encodeURIComponent(room.type)}" alt="${room.type}">
      </div>
      <div class="room-info">
        <div class="room-header">
          <h3>${room.type}</h3>
          <span class="room-price">₱${room.price}</span>
        </div>
        <div class="room-details">
          <p>Capacity: <strong>${room.capacity} guests</strong></p>
          <p>Available: <strong>${room.available_count}</strong></p>
        </div>
        <button class="select-room-btn" onclick="addRoomToCart(${room.id}, '${room.type}', ${room.price}, ${room.capacity})">
          Select Room
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}


document.addEventListener('DOMContentLoaded', fetchAvailability);

function fetchAvailability() {
  const params = new URLSearchParams(window.location.search);

  if (
    !params.get('check_in') ||
    !params.get('check_out') ||
    !params.get('number_of_guests')
  ) {
    alert('Missing booking details.');
    return;
  }

  fetch(`/api/guest/rooms/availability?${params.toString()}`, {
    headers: { 'Accept': 'application/json' }
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch availability');
      return res.json();
    })
    .then(rooms => {
      renderSearchSummary(params);
      renderRooms(rooms);
    })
    .catch(err => {
      console.error(err);
      alert('Error loading room availability');
    });
}


function renderSearchSummary(params) {
  const summary = document.getElementById('searchSummary');

  summary.innerHTML = `
    <p>
      <strong>Check-in:</strong> ${params.get('check_in')} |
      <strong>Check-out:</strong> ${params.get('check_out')} |
      <strong>Guests:</strong> ${params.get('number_of_guests')}
    </p>
    <hr>
  `;
}

//add room to cart

let cart = [];

function addRoomToCart(id, type, price, capacity) {
  if (cart.find(r => r.id === id)) return alert('Room already selected.');

  const room = { id, type, price, capacity };
  cart.push(room);

  updateCartUI();
  enableCheckout();
}


function updateCartUI() {
  const cartContainer = document.getElementById('cartRoomsContainer');
  cartContainer.innerHTML = '';

  let total = 0;
  cart.forEach(room => {
    total += room.price;

    const div = document.createElement('div');
    div.className = 'cart-room-item';
    div.innerHTML = `
      <span class="cart-room-name">${room.type}</span>
      <span class="cart-room-price">₱${room.price}</span>
      <button class="remove-room-btn" onclick="removeRoom(${room.id})">✖</button>
    `;
    cartContainer.appendChild(div);
  });

  document.getElementById('itemCount').textContent = cart.length;
  document.getElementById('totalAmount').textContent = `₱${total.toLocaleString()}`;
  document.getElementById('finalTotal').textContent = `₱${total.toLocaleString()}`;
}


function removeRoom(type) {
  cart = cart.filter(r => r.type !== type);
  updateCartUI();
}


function enableCheckout() {
  document.getElementById('btnCheckout').style.display = 'block';
}


function hideAddons() {
  document.querySelector('.addons-container').style.display = 'none';
}

function filterRooms(type, event) {
  document.querySelectorAll('.room-type-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  const cards = document.querySelectorAll('#roomsContainer .room-card');
  cards.forEach(card => {
    card.style.display = (type === 'all' || card.dataset.type === type) ? 'flex' : 'none';
  });
}


//guest summary 
function updateBookingSummary() {
  const params = new URLSearchParams(window.location.search);
  const checkIn = new Date(params.get('check_in'));
  const checkOut = new Date(params.get('check_out'));

  if (isNaN(checkIn) || isNaN(checkOut)) return;

  document.getElementById('summaryCheckIn').textContent = params.get('check_in');
  document.getElementById('summaryCheckOut').textContent = params.get('check_out');
  document.getElementById('summaryGuests').textContent = params.get('number_of_guests');

  const nights = Math.ceil((checkOut - checkIn) / (1000*60*60*24));
  document.getElementById('summaryNights').textContent = nights;
}


updateBookingSummary();




function selectRoom(type) {
  const params = new URLSearchParams(window.location.search);
  params.set('room_type', type);

  window.location.href = `guest-details.html?${params.toString()}`;
}


function goBack() {
  window.history.back();
}

function checkout() {
  if (cart.length === 0) return alert('Please select at least one room.');

  const params = new URLSearchParams(window.location.search);
  params.set('rooms', JSON.stringify(cart));

  window.location.href = `guest-details.html?${params.toString()}`;
}

