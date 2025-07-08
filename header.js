// Load header content
document.addEventListener('DOMContentLoaded', function () {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;

            // Initialize header functionality after loading
            initializeHeader();
        })
        .catch(error => console.error('Error loading header:', error));
});

// Initialize header functionality
function initializeHeader() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeLogin = document.getElementById('closeLogin');
    const closeSignup = document.getElementById('closeSignup');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Open modals
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Close modals
    closeLogin.addEventListener('click', () => {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    closeSignup.addEventListener('click', () => {
        signupModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Switch between modals
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'flex';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle form submissions
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Here you would typically make an API call to your backend
            // For now, we'll simulate a successful login
            console.log('Login attempt:', { email });

            // Show success message
            showMessage('Login successful!', 'success');

            // Close modal and update UI
            setTimeout(() => {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                updateAuthUI(email);
            }, 1500);

        } catch (error) {
            showMessage('Login failed. Please try again.', 'error');
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirm').value;

        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        try {
            // Here you would typically make an API call to your backend
            // For now, we'll simulate a successful signup
            console.log('Signup attempt:', { name, email });

            // Show success message
            showMessage('Account created successfully!', 'success');

            // Close modal and update UI
            setTimeout(() => {
                signupModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                updateAuthUI(email);
            }, 1500);

        } catch (error) {
            showMessage('Signup failed. Please try again.', 'error');
        }
    });
}

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