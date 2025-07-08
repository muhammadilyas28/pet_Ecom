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
document.addEventListener('DOMContentLoaded', function () {
    // Only run this code on the browse page
    if (!document.querySelector('.browse-section')) return;

    const featuredContainer = document.getElementById('featured-container');
    const categoryButtons = document.querySelectorAll('.further');
    const allSections = document.querySelectorAll('section[id$="-section"]');

    // Function to get random cards from each category
    function getRandomCards() {
        const cards = [];
        const categories = ['dogs', 'birds', 'cats', 'ducks'];

        categories.forEach(category => {
            const categorySection = document.getElementById(`${category}-section`);
            const categoryCards = categorySection.querySelectorAll('.card');
            const randomCard = categoryCards[Math.floor(Math.random() * categoryCards.length)];
            if (randomCard) {
                cards.push(randomCard.cloneNode(true));
            }
        });

        return cards;
    }

    // Initialize featured cards
    function initializeFeaturedCards() {
        const randomCards = getRandomCards();
        featuredContainer.innerHTML = '';
        randomCards.forEach(card => {
            featuredContainer.appendChild(card);
        });
    }

    // Handle category clicks
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            const category = this.dataset.category;

            // Hide all sections first
            allSections.forEach(section => {
                section.style.display = 'none';
            });

            // Show selected category section
            const selectedSection = document.getElementById(`${category}-section`);
            if (selectedSection) {
                selectedSection.style.display = 'block';

                // Smooth scroll to the section
                selectedSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Update active state of category buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update heading
            document.getElementById('categ').textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`;
        });
    });

    // Initialize the page with featured cards
    initializeFeaturedCards();
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

