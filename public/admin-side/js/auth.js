document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:8000/api/user", {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      window.location.href = "/login.html";
      return;
    }

    const user = await response.json();

    const nameEl = document.getElementById("name");
    if (nameEl) {
      nameEl.textContent = user.name;
    }

  } catch (err) {
    console.error("Auth check failed:", err);
    window.location.href = "/login.html";
  }
});
