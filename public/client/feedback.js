const VALID_REF = "RES-001";

let ratings = {
  cleanliness: 0,
  staff: 0,
  facilities: 0,
  food: 0,
  value: 0,
  overall: 0
};

function findBooking() {
  const ref = document.getElementById("bookingRef").value.trim().toUpperCase();
  if (ref === VALID_REF) {
    document.getElementById("booking-section").style.display = "none";
    document.getElementById("feedback-form").style.display = "block";
    document.getElementById("error-msg").style.display = "none";
  } else {
    document.getElementById("error-msg").style.display = "block";
  }
}

function leaveAnonymous() {
  document.getElementById("booking-section").style.display = "none";
  document.getElementById("feedback-form").style.display = "block";
}

function toggleButton() {
  const ref = document.getElementById("bookingRef").value.trim();
  const btn = document.getElementById("findBtn");
  btn.disabled = ref === "";
}

function handleRatingChange(category, rating) {
  ratings[category] = rating;

  if (category !== "overall") {
    const categories = ["cleanliness", "staff", "facilities", "food", "value"];
    const total = categories.reduce((sum, cat) => sum + ratings[cat], 0);
    const count = categories.filter(cat => ratings[cat] > 0).length;
    ratings.overall = count > 0 ? Math.round(total / count) : 0;
  }

  renderRatings();
}

function renderRatings() {
  document.querySelectorAll(".star-rating").forEach(container => {
    const category = container.getAttribute("data-category");
    const currentRating = ratings[category];

    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn, index) => {
      if (index < currentRating) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".star-rating").forEach(container => {
    const category = container.getAttribute("data-category");
    container.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = `<i class="fa-solid fa-star"></i>`;
      btn.addEventListener("click", () => handleRatingChange(category, i));
      container.appendChild(btn);
    }
  });

  renderRatings();
});
