async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("loginError");

  errorEl.style.display = "none";

  try {
    await fetch("http://localhost:8000/sanctum/csrf-cookie", {
      credentials: "include"
    });

    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }
    const csrfToken = getCookie("XSRF-TOKEN");

    const res = await fetch("http://localhost:8000/api/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-XSRF-TOKEN": csrfToken
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error("Invalid credentials");

    const data = await res.json();

    if (data.user.role === "receptionist") {
      window.location.href = "admin-side/receptionist/receptionistdashboard.html";
    } else {
      window.location.href = "admin-side/admin/index.html";
    }

  } catch (err) {
    console.error("Login failed:", err);
    errorEl.style.display = "block";
  }
}



async function logout() {
  try {

    
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    const res = await fetch("http://localhost:8000/api/logout", {
      method: "GET",
       credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-XSRF-TOKEN": csrfToken
      },
    });

    if (!res.ok) throw new Error("Logout failed");
    window.location.href = "/login.html";

  } catch (err) {
    console.error("Logout failed:", err);
    alert("Error logging out");
  }
}




document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing dashboard...');
    
    initDashboard();
    
    drawTrendCharts();
    
    initNavigation();
    
    initSearch();
    
    initNotifications();
    
    console.log('Calling initSidebarToggle...');
    initSidebarToggle();
    
    console.log('Dashboard initialization complete');
});

function initDashboard() {
    console.log('Victoria Mansions Admin Dashboard initialized');
    
    // Disable entrance animation on pages that should have static cards
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('roommanagement.html') || path.includes('index.html')) {
        const kpiCardsNoAnim = document.querySelectorAll('.kpi-card');
        kpiCardsNoAnim.forEach(card => {
            card.style.transition = 'none';
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
        return;
    }
    
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

function drawTrendCharts() {
    const trendCharts = document.querySelectorAll('.trend-chart');
    
    trendCharts.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(2, height - 4);
        ctx.lineTo(width / 3, height - 6);
        ctx.lineTo(width * 2 / 3, height - 8);
        ctx.lineTo(width - 2, height - 10);
        ctx.stroke();
        
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(2, height - 4, 0.8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(width / 3, height - 6, 0.8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(width * 2 / 3, height - 8, 0.8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(width - 2, height - 10, 0.8, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                
                navLinks.forEach(l => l.classList.remove('active'));
                
                this.classList.add('active');
                
                const target = href.substring(1);
                console.log(`Navigating to internal section: ${target}`);
                showPageContent(target);
            } else {
                console.log(`Navigating to: ${href}`);
            }
        });
    });
}

function showPageContent(page) {
    const mainContent = document.querySelector('main');
    
    console.log(`Showing content for: ${page}`);
}

function initSearch() {
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length > 0) {
                console.log(`Searching for: ${searchTerm}`);
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value;
                console.log(`Search submitted: ${searchTerm}`);
            }
        });
    }
}

function initNotifications() {
    const notificationIcon = document.querySelector('.notification-icon');
    
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            showNotificationPanel();
        });
    }
}

function showNotificationPanel() {
    const notificationPanel = document.createElement('div');
    notificationPanel.className = 'notification-panel';
    notificationPanel.innerHTML = `
        <div class="notification-header">
            <h6>Notifications</h6>
            <button class="close-notifications">&times;</button>
        </div>
        <div class="notification-list">
            <div class="notification-item">
                <i class="fas fa-info-circle text-info"></i>
                <div class="notification-content">
                    <p>New reservation received for Room 101</p>
                    <small>2 minutes ago</small>
                </div>
            </div>
            <div class="notification-item">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <div class="notification-content">
                    <p>Room 205 needs maintenance</p>
                    <small>1 hour ago</small>
                </div>
            </div>
            <div class="notification-item">
                <i class="fas fa-check-circle text-success"></i>
                <div class="notification-content">
                    <p>Payment received for Room 302</p>
                    <small>3 hours ago</small>
                </div>
            </div>
        </div>
    `;
    
    notificationPanel.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        width: 350px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        margin-top: 10px;
        border: 1px solid #e9ecef;
    `;
    
    const notificationContainer = document.querySelector('.notification-icon');
    notificationContainer.style.position = 'relative';
    notificationContainer.appendChild(notificationPanel);
    
    const closeBtn = notificationPanel.querySelector('.close-notifications');
    closeBtn.addEventListener('click', function() {
        notificationPanel.remove();
    });
    
    document.addEventListener('click', function(e) {
        if (!notificationPanel.contains(e.target) && !notificationIcon.contains(e.target)) {
            notificationPanel.remove();
        }
    });
}

function updateKPIData() {
    const kpiNumbers = document.querySelectorAll('.kpi-number');
    
    kpiNumbers.forEach((number, index) => {
        const currentValue = parseInt(number.textContent.replace(/[^\d]/g, ''));
        let randomChange = Math.floor(Math.random() * 5) - 2;
        
        if (index === 0 || index === 1) {
            randomChange = Math.max(-currentValue + 1, randomChange);
        }
        
        const newValue = Math.max(1, currentValue + randomChange);
        
        animateNumber(number, currentValue, newValue);
    });
}

function animateNumber(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        
        const originalText = element.textContent;
        if (originalText.includes('₱')) {
            element.textContent = `₱${current.toLocaleString()}`;
        } else if (originalText.includes('%')) {
            element.textContent = `${Math.min(100, current)}%`;
        } else {
            element.textContent = current;
        }
        
        const trendElement = element.closest('.kpi-card').querySelector('.kpi-trend');
        if (trendElement && index === 0) {
            trendElement.textContent = `+${Math.abs(randomChange)} from yesterday`;
        } else if (trendElement && index === 1) {
            trendElement.textContent = `-${Math.abs(randomChange)} from yesterday`;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

setInterval(updateKPIData, 30000);

document.addEventListener('click', function(e) {
    if (e.target.closest('.kpi-card')) {
        const card = e.target.closest('.kpi-card');
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
    }
    
    if (e.target.closest('.user-dropdown')) {
        showUserDropdown();
    }
});

function showUserDropdown() {
    const userDropdown = document.querySelector('.user-dropdown');
    
    const existingDropdown = document.querySelector('.user-dropdown-menu');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }
    
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'user-dropdown-menu';
    dropdownMenu.innerHTML = `
        <div class="dropdown-item">
            <i class="fas fa-user me-2"></i>
            Profile
        </div>
        <div class="dropdown-item">
            <i class="fas fa-cog me-2"></i>
            Settings
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item text-danger">
            <i class="fas fa-sign-out-alt me-2"></i>
            Logout
        </div>
    `;
    
    dropdownMenu.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        width: 200px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        margin-top: 10px;
        border: 1px solid #e9ecef;
        padding: 0.5rem 0;
    `;
    
    userDropdown.style.position = 'relative';
    userDropdown.appendChild(dropdownMenu);
    
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdownMenu.contains(e.target) && !userDropdown.contains(e.target)) {
            dropdownMenu.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
    
    dropdownMenu.addEventListener('click', function(e) {
        const item = e.target.closest('.dropdown-item');
        if (item) {
            const text = item.textContent.trim();
            console.log(`User selected: ${text}`);
            dropdownMenu.remove();
        }
    });
}

function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('main');
    
    console.log('Sidebar toggle elements found:', { sidebarToggle, sidebar, main });
    
    if (sidebarToggle && sidebar && main) {
        console.log('Adding click event listener to sidebar toggle');
        
        sidebarToggle.addEventListener('click', function(e) {
            console.log('Sidebar toggle clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('sidebar-collapsed');
            
            const icon = this.querySelector('.toggle-icon');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-right toggle-icon';
                console.log('Sidebar collapsed');
                // Ensure root carries precollapsed to keep static, no-jump layout
                document.documentElement.classList.add('precollapsed');
            } else {
                icon.className = 'fas fa-bars toggle-icon';
                console.log('Sidebar expanded');
                // Remove precollapsed so expanded width is restored
                document.documentElement.classList.remove('precollapsed');
            }
            
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            main.classList.add('sidebar-collapsed');
            const icon = sidebarToggle.querySelector('.toggle-icon');
            if (icon) {
                icon.className = 'fas fa-chevron-right toggle-icon';
            }
            // Keep root in precollapsed state on load if previously collapsed
            document.documentElement.classList.add('precollapsed');
        } else {
            // Ensure no precollapsed class when expanded on load
            document.documentElement.classList.remove('precollapsed');
        }
    } else {
        console.error('Some sidebar elements not found:', { sidebarToggle, sidebar, main });
    }
}

const dropdownStyles = document.createElement('style');
dropdownStyles.textContent = `
    .dropdown-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
    }
    
    .dropdown-item:hover {
        background-color: #f8f9fa;
    }
    
    .dropdown-divider {
        height: 1px;
        background-color: #e9ecef;
        margin: 0.5rem 0;
    }
    
    .user-dropdown-menu {
        font-size: 0.9rem;
    }
`;
document.head.appendChild(dropdownStyles);

const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
    }
    
    .notification-header h6 {
        margin: 0;
        font-weight: 600;
    }
    
    .close-notifications {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6c757d;
    }
    
    .notification-list {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .notification-item {
        display: flex;
        align-items: flex-start;
        padding: 1rem;
        border-bottom: 1px solid #f8f9fa;
        gap: 0.75rem;
    }
    
    .notification-item:last-child {
        border-bottom: none;
    }
    
    .notification-item i {
        margin-top: 0.25rem;
        font-size: 1.1rem;
    }
    
    .notification-content p {
        margin: 0 0 0.25rem 0;
        font-size: 0.9rem;
    }
    
    .notification-content small {
        color: #6c757d;
        font-size: 0.8rem;
    }
`;
document.head.appendChild(notificationStyles);
