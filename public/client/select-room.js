
//select-room.js

function renderRooms(rooms) {
  const container = document.getElementById('roomsContainer');
  container.innerHTML = '';

  if (!rooms.length) {
    container.innerHTML = `<p class="no-rooms">No rooms available for selected dates.</p>`;
    return;
  }

  rooms.forEach(room => {
    const card = document.createElement('div');
    const roomTypeSlug = room.type.toLowerCase().replace(/\s+/g, '-');

    card.className = 'room-card';
    card.dataset.roomType = roomTypeSlug;

let imageSrc = '/assets/images/room-placeholder.jpg'; // fallback

if (typeof room.image_urls === 'string' && room.image_urls.length > 0) {
    imageSrc = `http://localhost:8000/storage/${room.image_urls}`;
}


    card.innerHTML = `
      <div class="room-card-grid">
        <!-- Image -->
        <div class="room-image-container">
        <img 
            src="${imageSrc}" 
            alt="${room.type}" 
            class="room-image"
        />

          <div class="room-image-overlay"></div>
        </div>

        <!-- Details -->
        <div class="room-details">
          <div class="room-info">
            <div class="room-header">
              <h3 class="room-name">${room.type}</h3>

              <div class="room-specs">
                <div class="room-spec">•<span>${room.capacity} Guests</span></div>
              </div>
            </div>

            <p class="room-description">
              ${room.description ?? 'Comfortable and well-appointed room designed for a relaxing stay.'}
            </p>

          </div>

          <!-- Pricing -->
          <div class="room-pricing">
            <div class="pricing-info">
              <div>
                <div class="price-label">From</div>
                <div class="price-value">
                  ₱${room.price.toLocaleString()}
                  <span class="price-period">/ night</span>
                </div>
              </div>


            <button 
              class="btn-show-rates"
              ${room.available_count === 0 ? 'disabled' : ''}
              onclick="addRoomToCart(${room.id}, '${room.type}', ${room.price}, ${room.capacity})"
            >
              ${room.available_count === 0 ? 'Sold Out' : 'Select Room'}
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
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

    console.log('Rooms API response:', params);

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

