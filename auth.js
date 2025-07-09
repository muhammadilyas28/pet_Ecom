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
            // Make API call to backend
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Show success message
            showMessage(messageBox, 'Account created successfully! Redirecting to login...', 'success');

            // Redirect to login page after successful registration
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            showMessage(messageBox, error.message || 'Registration failed. Please try again.', 'error');
            console.error('Signup error:', error);
        }
    });
}

// Handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageBox = document.getElementById('messageBox');

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store user info in localStorage for session management
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);

            // Show success message
            showMessage(messageBox, 'Login successful! Redirecting to dashboard...', 'success');

            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = './dashboard.html';
            }, 1500);

        } catch (error) {
            showMessage(messageBox, error.message || 'Login failed. Please try again.', 'error');
            console.error('Login error:', error);
        }
    });
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