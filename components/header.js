// Function to load and insert the header
async function loadHeader() {
    try {
        const response = await fetch('./components/header.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const headerHtml = await response.text();

        // Find the header placeholder or insert at the start of body
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = headerHtml;
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerHtml);
        }

        // Set active nav item based on current page
        setActiveNavItem();

        // Initialize header functionality
        initializeHeader();
    } catch (error) {
        console.error('Error loading header:', error);
        // Add a fallback header if loading fails
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = `
                <header>
                    <div class="container header-container">
                        <h1>Pet Connect</h1>
                        <nav>
                            <ul>
                                <li><a href="index.html">Home</a></li>
                                <li><a href="browse.html">Browse Pets</a></li>
                                <li><a href="sell.html">Sell a Pet</a></li>
                                <li><a href="about.html">About Us</a></li>
                                <li><a href="contact.html">Contact</a></li>
                                <li><a href="pettales.html">Pet tales</a></li>
                                <li><a href="vetadvice.html">Vet Advice</a></li>
                            </ul>
                        </nav>
                        <div class="auth-buttons">
                            <a href="login.html" class="auth-btn login-btn" id="loginBtn">Login</a>
                            <a href="signup.html" class="auth-btn signup-btn" id="signupBtn">Sign Up</a>
                        </div>
                    </div>
                </header>
            `;
        }
    }
}

// Function to set the active navigation item
function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('nav a');

    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Initialize header functionality
function initializeHeader() {
    const userIcon = document.querySelector('.user-icon');
    const userMenu = document.querySelector('.user-menu');
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');

    // Update user menu based on authentication status
    const authLinks = document.querySelectorAll('.auth-link');
    const userLinks = document.querySelectorAll('.user-link');
    const userNameDisplay = document.querySelector('.user-name');

    if (userId && userName) {
        // User is logged in
        authLinks.forEach(link => link.style.display = 'none');
        userLinks.forEach(link => link.style.display = 'block');
        if (userNameDisplay) {
            userNameDisplay.textContent = userName;
        }
    } else {
        // User is not logged in
        authLinks.forEach(link => link.style.display = 'block');
        userLinks.forEach(link => link.style.display = 'none');
    }

    // Mobile menu toggle
    if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // User menu toggle
    if (userIcon && userMenu) {
        userIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target) && !userIcon.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }

    // Handle logout
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear session storage
            sessionStorage.clear();
            // Redirect to home page
            window.location.href = '/';
        });
    }
}

// Export the initialization function
window.initializeHeader = initializeHeader;

// Helper function to show messages
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Add styles to the message
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '15px 25px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.color = 'white';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.animation = 'slideIn 0.3s ease-out';

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4CAF50';
    } else {
        messageDiv.style.backgroundColor = '#f44336';
    }

    document.body.appendChild(messageDiv);

    // Remove the message after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Helper function to update UI after successful auth
function updateAuthUI(email) {
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <div class="user-menu">
            <span class="user-email">${email}</span>
            <button class="logout-btn" onclick="handleLogout()">Logout</button>
        </div>
    `;
}

// Handle logout
function handleLogout() {
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <a href="#" class="auth-btn login-btn" id="loginBtn">Login</a>
        <a href="#" class="auth-btn signup-btn" id="signupBtn">Sign Up</a>
    `;

    // Reinitialize event listeners
    document.getElementById('loginBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    document.getElementById('signupBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signupModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

// Load header when the document is ready
document.addEventListener('DOMContentLoaded', loadHeader);

// Create and insert the header HTML
document.getElementById('header-placeholder').innerHTML = `
<div class="header">
    <div class="container">
        <div class="navbar">
            <div class="logo">
                <a href="index.html"><img src="images/unnamed (1).jpg" alt="logo" width="125px"></a>
            </div>
            <nav>
                <ul id="MenuItems">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="browse.html">Browse</a></li>
                    <li><a href="about.html">About</a></li>
                    <li><a href="contact.html">Contact</a></li>
                    <li><a href="pettales.html">Pet Tales</a></li>
                    <li><a href="vetadvice.html">Vet Advice</a></li>
                </ul>
            </nav>
            <div class="auth-buttons">
                <div id="userSection" style="display: none;">
                    <span id="userName" class="user-name"></span>
                    <a href="dashboard.html" class="btn">Dashboard</a>
                    <button onclick="logout()" class="btn">Logout</button>
                </div>
                <div id="guestSection">
                    <a href="login.html" class="btn">Login</a>
                    <a href="signup.html" class="btn">Sign Up</a>
                </div>
            </div>
            <img src="images/menu.png" class="menu-icon" onclick="menutoggle()">
        </div>
    </div>
</div>
`;

// Function to update the auth UI based on login status
function updateAuthUI() {
    const userSection = document.getElementById('userSection');
    const guestSection = document.getElementById('guestSection');
    const userNameSpan = document.getElementById('userName');

    const currentUser = getCurrentUser();

    if (currentUser) {
        userSection.style.display = 'flex';
        guestSection.style.display = 'none';
        userNameSpan.textContent = `Welcome, ${currentUser.name}`;
    } else {
        userSection.style.display = 'none';
        guestSection.style.display = 'flex';
    }
}

// Update auth UI when the component loads
document.addEventListener('DOMContentLoaded', updateAuthUI);

// Add some styles for the auth buttons
const style = document.createElement('style');
style.textContent = `
    .auth-buttons {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-left: auto;
        margin-right: 1rem;
    }

    .user-name {
        color: #333;
        font-weight: 500;
        margin-right: 1rem;
    }

    #userSection {
        display: flex;
        align-items: center;
    }

    #guestSection {
        display: flex;
        gap: 1rem;
    }

    .auth-buttons .btn {
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-block;
        cursor: pointer;
        border: none;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
    }

    .auth-buttons a.btn {
        background-color: #4CAF50;
        color: white;
    }

    .auth-buttons button.btn {
        background-color: #f44336;
        color: white;
    }

    .auth-buttons .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    @media only screen and (max-width: 800px) {
        .auth-buttons {
            margin-right: 50px;
        }
        
        .user-name {
            display: none;
        }
    }

    @media only screen and (max-width: 600px) {
        .auth-buttons {
            margin-right: 40px;
        }

        .auth-buttons .btn {
            padding: 6px 12px;
            font-size: 12px;
        }
    }
`;

document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    const userLinks = document.querySelectorAll('.user-link');
    const authLinks = document.querySelectorAll('.auth-link');
    const userNameSpan = document.querySelector('.user-name');
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');

    // Toggle mobile menu
    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Check authentication status
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');

    if (userId) {
        // User is logged in
        userLinks.forEach(link => link.style.display = 'block');
        authLinks.forEach(link => link.style.display = 'none');
        if (userNameSpan) {
            userNameSpan.textContent = userName || 'User';
        }

        // Update cart count
        updateCartCount(userId);
    } else {
        // User is logged out
        userLinks.forEach(link => link.style.display = 'none');
        authLinks.forEach(link => link.style.display = 'inline-block');
    }

    // Handle logout
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('userName');
            window.location.href = 'index.html';
        });
    }

    // Toggle user menu
    const userIcon = document.querySelector('.user-icon');
    const userMenu = document.querySelector('.user-menu');
    if (userIcon && userMenu) {
        userIcon.addEventListener('click', () => {
            userMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!userIcon.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }
});

// Function to update cart count
async function updateCartCount(userId) {
    try {
        const response = await fetch('http://localhost:3000/api/cart', {
            headers: {
                'user-id': userId
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart items');
        }

        const cartItems = await response.json();
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cartItems.length;
            cartCount.style.display = cartItems.length > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
} 