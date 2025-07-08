// User data structure in localStorage
const USER_EMAIL_KEY = 'userEmail';
const USER_NAME_KEY = 'userName';
const USER_PASSWORD_KEY = 'userPassword';

// Initialize default user if none exists
if (!localStorage.getItem(USER_EMAIL_KEY)) {
    // Add the initial user
    localStorage.setItem(USER_EMAIL_KEY, 'lyasmaliki@gmail.com');
    localStorage.setItem(USER_NAME_KEY, 'a');
    localStorage.setItem(USER_PASSWORD_KEY, '123456789Aa');
}

// Helper function to show messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

// Helper function to validate password
function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return {
        isValid: minLength && hasUpper && hasLower && hasNumber,
        checks: {
            lengthCheck: minLength,
            upperCheck: hasUpper,
            lowerCheck: hasLower,
            numberCheck: hasNumber
        }
    };
}

// Helper function to update password requirement visual checks
function updatePasswordChecks(checks) {
    for (const [checkId, isValid] of Object.entries(checks)) {
        const element = document.getElementById(checkId);
        if (element) {
            element.className = isValid ? 'valid' : 'invalid';
        }
    }
}

// Handle signup form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    const signupPassword = document.getElementById('signupPassword');

    // Real-time password validation
    if (signupPassword) {
        signupPassword.addEventListener('input', (e) => {
            const { checks } = validatePassword(e.target.value);
            updatePasswordChecks(checks);
        });
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageBox = document.getElementById('messageBox');

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirm').value;

        // Validate password
        const { isValid, checks } = validatePassword(password);
        updatePasswordChecks(checks);

        if (!isValid) {
            showMessage(messageBox, 'Please meet all password requirements', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage(messageBox, 'Passwords do not match', 'error');
            return;
        }

        try {
            // Check if email already exists
            if (localStorage.getItem(USER_EMAIL_KEY) === email) {
                showMessage(messageBox, 'Email already registered', 'error');
                return;
            }

            // Store user info
            localStorage.setItem(USER_EMAIL_KEY, email);
            localStorage.setItem(USER_NAME_KEY, name);
            localStorage.setItem(USER_PASSWORD_KEY, password);
            localStorage.setItem('isLoggedIn', 'true');

            // Show success message
            showMessage(messageBox, 'Account created successfully! Redirecting to dashboard...', 'success');

            // Redirect to dashboard after a delay
            setTimeout(() => {
                window.location.href = './dashboard.html';
            }, 2000);

        } catch (error) {
            showMessage(messageBox, 'An error occurred. Please try again.', 'error');
            console.error('Signup error:', error);
        }
    });
}

// Handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    // Check if user is already logged in
    if (isLoggedIn()) {
        window.location.href = './dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageBox = document.getElementById('messageBox');

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Get stored credentials
            const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
            const storedPassword = localStorage.getItem(USER_PASSWORD_KEY);

            if (email === storedEmail && password === storedPassword) {
                // Set login status
                localStorage.setItem('isLoggedIn', 'true');

                // Show success message
                showMessage(messageBox, 'Login successful! Redirecting to dashboard...', 'success');

                // Redirect to dashboard after a delay
                setTimeout(() => {
                    window.location.href = './dashboard.html';
                }, 1500);
            } else {
                showMessage(messageBox, 'Invalid email or password', 'error');
            }

        } catch (error) {
            showMessage(messageBox, 'An error occurred. Please try again.', 'error');
            console.error('Login error:', error);
        }
    });
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user info
function getCurrentUser() {
    return {
        name: localStorage.getItem(USER_NAME_KEY),
        email: localStorage.getItem(USER_EMAIL_KEY)
    };
}

// Logout function
function logout() {
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_PASSWORD_KEY);
    localStorage.removeItem('isLoggedIn');
    window.location.href = './login.html';
}

// Protect routes that require authentication
function protectRoute() {
    const publicPages = ['login.html', 'signup.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (!publicPages.includes(currentPage) && !isLoggedIn()) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

// Call protectRoute on page load
protectRoute(); 