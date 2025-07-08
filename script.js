// Modal functionality
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLogin = document.getElementById('closeLogin');
const closeSignup = document.getElementById('closeSignup');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');

function openModal(modal) {
    modal.style.display = 'flex';
    // Trigger reflow to enable animation
    modal.offsetHeight;
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Match the CSS transition duration
}

// Open login modal
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(loginModal);
});

// Open signup modal
signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(signupModal);
});

// Close modals
closeLogin.addEventListener('click', () => {
    closeModal(loginModal);
});

closeSignup.addEventListener('click', () => {
    closeModal(signupModal);
});

// Switch between login and signup
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    setTimeout(() => {
        openModal(signupModal);
    }, 300);
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    setTimeout(() => {
        openModal(loginModal);
    }, 300);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModal(loginModal);
    }
    if (e.target === signupModal) {
        closeModal(signupModal);
    }
});

// Form validation and submission
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Here you would typically make an API call to authenticate
    alert('Login successful!');
    closeModal(loginModal);
});

document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (!name || !email || !password || !confirm) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Here you would typically make an API call to create the account
    alert('Account created successfully!');
    closeModal(signupModal);
});

// Browse page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize menu functionality
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Initialize user menu functionality
    const userIcon = document.querySelector('.user-icon');
    const userMenu = document.querySelector('.user-menu');

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

    // Check authentication status
    const userId = sessionStorage.getItem('userId');
    const authLinks = document.querySelectorAll('.auth-link');
    const userLinks = document.querySelectorAll('.user-link');

    if (userId) {
        // User is logged in
        authLinks.forEach(link => link.style.display = 'none');
        userLinks.forEach(link => link.style.display = 'block');
    } else {
        // User is not logged in
        authLinks.forEach(link => link.style.display = 'block');
        userLinks.forEach(link => link.style.display = 'none');
    }
});

// Mobile Menu Toggle
const nav = document.querySelector('nav');
const hamburger = document.createElement('div');
hamburger.className = 'hamburger';
hamburger.innerHTML = `
  <span></span>
  <span></span>
  <span></span>
`;

nav.insertBefore(hamburger, nav.firstChild);

hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('active')) {
        nav.classList.remove('active');
    }
});

// Close menu when clicking a link
nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
    });
});

