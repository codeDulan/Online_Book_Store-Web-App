/**
 * Authentication JavaScript for BookHaven Online Book Store
 * Handles login, registration, form validation, and backend integration
 */

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/user/profile`
};

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

// Initialize authentication page
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPage();
    setupEventListeners();
    checkAuthStatus();
});

/**
 * Initialize authentication page functionality
 */
function initializeAuthPage() {
    // Set up tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Real-time validation
    setupRealTimeValidation();
}

/**
 * Setup real-time form validation
 */
function setupRealTimeValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
        input.addEventListener('input', clearError);
    });

    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('blur', validatePassword);
        input.addEventListener('input', clearError);
    });

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', validatePasswordMatch);
        confirmPasswordInput.addEventListener('input', clearError);
    }

    // Name validation
    const nameInput = document.getElementById('registerName');
    if (nameInput) {
        nameInput.addEventListener('blur', validateName);
        nameInput.addEventListener('input', clearError);
    }
}

/**
 * Switch between login and register tabs
 * @param {string} tabName - Name of the tab to switch to
 */
function switchTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        }
    });

    // Update forms
    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === `${tabName}-form`) {
            form.classList.add('active');
        }
    });

    // Clear all error messages when switching tabs
    clearAllErrors();
}

/**
 * Handle login form submission
 * @param {Event} event - Form submission event
 */
async function handleLogin(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearAllErrors();
    
    // Get form data
    const formData = new FormData(loginForm);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    // Validate form
    if (!validateLoginForm(loginData)) {
        return;
    }

    // Show loading state
    setLoadingState('login', true);

    try {
        // Make API request
        const response = await fetch(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for session handling
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            // Login successful
            showSuccess('login', 'Login successful! Redirecting...');
            
            // Store user data in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data));
            
            // Redirect to homepage after short delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            
        } else {
            // Login failed
            showError('login', data.message || 'Login failed. Please check your credentials.');
        }

    } catch (error) {
        console.error('Login error:', error);
        showError('login', 'Network error. Please check your connection and try again.');
    } finally {
        setLoadingState('login', false);
    }
}

/**
 * Handle register form submission
 * @param {Event} event - Form submission event
 */
async function handleRegister(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearAllErrors();
    
    // Get form data
    const formData = new FormData(registerForm);
    const registerData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };

    // Validate form
    if (!validateRegisterForm(registerData)) {
        return;
    }

    // Show loading state
    setLoadingState('register', true);

    try {
        // Prepare data for backend (remove confirmPassword)
        const { confirmPassword, ...backendData } = registerData;

        // Make API request
        const response = await fetch(API_ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(backendData)
        });

        const data = await response.json();

        if (response.ok) {
            // Registration successful
            showSuccess('register', 'Account created successfully! You can now login.');
            
            // Clear form
            registerForm.reset();
            
            // Switch to login tab after delay
            setTimeout(() => {
                switchTab('login');
                // Pre-fill email in login form
                document.getElementById('loginEmail').value = registerData.email;
            }, 2000);
            
        } else {
            // Registration failed
            if (data.message && data.message.includes('email')) {
                showError('registerEmail', 'This email is already registered.');
            } else {
                showError('register', data.message || 'Registration failed. Please try again.');
            }
        }

    } catch (error) {
        console.error('Registration error:', error);
        showError('register', 'Network error. Please check your connection and try again.');
    } finally {
        setLoadingState('register', false);
    }
}

/**
 * Validate login form
 * @param {Object} data - Login form data
 * @returns {boolean} - Whether form is valid
 */
function validateLoginForm(data) {
    let isValid = true;

    if (!data.email || !isValidEmail(data.email)) {
        showError('loginEmail', 'Please enter a valid email address.');
        isValid = false;
    }

    if (!data.password || data.password.length < 6) {
        showError('loginPassword', 'Password must be at least 6 characters long.');
        isValid = false;
    }

    return isValid;
}

/**
 * Validate register form
 * @param {Object} data - Register form data
 * @returns {boolean} - Whether form is valid
 */
function validateRegisterForm(data) {
    let isValid = true;

    if (!data.fullName || data.fullName.trim().length < 2) {
        showError('registerName', 'Please enter your full name (at least 2 characters).');
        isValid = false;
    }

    if (!data.email || !isValidEmail(data.email)) {
        showError('registerEmail', 'Please enter a valid email address.');
        isValid = false;
    }

    if (!data.password || data.password.length < 6) {
        showError('registerPassword', 'Password must be at least 6 characters long.');
        isValid = false;
    }

    if (data.password !== data.confirmPassword) {
        showError('confirmPassword', 'Passwords do not match.');
        isValid = false;
    }

    // Check if terms are agreed
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        showError('register', 'Please agree to the Terms & Conditions.');
        isValid = false;
    }

    return isValid;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Individual field validation functions
 */
function validateEmail(event) {
    const email = event.target.value;
    const fieldId = event.target.id;
    
    if (email && !isValidEmail(email)) {
        showError(fieldId, 'Please enter a valid email address.');
    } else {
        clearError(event);
    }
}

function validatePassword(event) {
    const password = event.target.value;
    const fieldId = event.target.id;
    
    if (password && password.length < 6) {
        showError(fieldId, 'Password must be at least 6 characters long.');
    } else {
        clearError(event);
    }
}

function validatePasswordMatch(event) {
    const confirmPassword = event.target.value;
    const password = document.getElementById('registerPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match.');
    } else {
        clearError(event);
    }
}

function validateName(event) {
    const name = event.target.value.trim();
    
    if (name && name.length < 2) {
        showError('registerName', 'Please enter your full name (at least 2 characters).');
    } else {
        clearError(event);
    }
}

/**
 * Show error message for a specific field
 * @param {string} fieldId - ID of the field or error container
 * @param {string} message - Error message to display
 */
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}Error`) || document.getElementById(fieldId);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    }
    
    if (inputElement && inputElement.classList.contains('form-input')) {
        inputElement.classList.add('error');
    }
}

/**
 * Show success message
 * @param {string} fieldId - ID of the success container
 * @param {string} message - Success message to display
 */
function showSuccess(fieldId, message) {
    const successElement = document.getElementById(`${fieldId}Success`);
    
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.add('visible');
    }
}

/**
 * Clear error for a specific field
 * @param {Event} event - Input event
 */
function clearError(event) {
    const fieldId = event.target.id;
    const errorElement = document.getElementById(`${fieldId}Error`);
    const inputElement = event.target;
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

/**
 * Clear all error and success messages
 */
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error, .form-success');
    const inputElements = document.querySelectorAll('.form-input.error');
    
    errorElements.forEach(element => {
        element.textContent = '';
        element.classList.remove('visible');
    });
    
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

/**
 * Set loading state for forms
 * @param {string} formType - Type of form (login/register)
 * @param {boolean} isLoading - Whether to show loading state
 */
function setLoadingState(formType, isLoading) {
    const button = document.querySelector(`#${formType}-form .auth-btn`);
    const spinner = document.getElementById(`${formType}Spinner`);
    const btnText = button.querySelector('.btn-text');
    
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        if (spinner) spinner.classList.remove('hidden');
        if (btnText) btnText.style.display = 'none';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (spinner) spinner.classList.add('hidden');
        if (btnText) btnText.style.display = 'inline';
    }
}

/**
 * Check if user is already authenticated
 */
function checkAuthStatus() {
    const user = sessionStorage.getItem('user');
    if (user) {
        // User is already logged in, redirect to homepage
        window.location.href = '../index.html';
    }
}

/**
 * Logout function (can be called from other pages)
 */
async function logout() {
    try {
        await fetch(API_ENDPOINTS.LOGOUT, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear session data regardless of API response
        sessionStorage.removeItem('user');
        window.location.href = '../index.html';
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        logout,
        checkAuthStatus,
        API_ENDPOINTS
    };
}