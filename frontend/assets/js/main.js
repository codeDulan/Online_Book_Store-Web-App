/**
 * Main JavaScript for EDURA Educational Materials Platform
 * Handles homepage functionality, navigation, and user session management
 */

// Global variables
let currentUser = null;

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const API_ENDPOINTS = {
    // Authentication
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/user/profile`,
    
    // Materials (User endpoints)
    USER_MATERIALS: `${API_BASE_URL}/user/materials`,
    USER_MATERIAL: (id) => `${API_BASE_URL}/user/materials/${id}`,
    SEARCH_BY_UNIVERSITY: (university) => `${API_BASE_URL}/user/materials/search/university/${university}`,
    SEARCH_BY_FACULTY: (faculty) => `${API_BASE_URL}/user/materials/search/faculty/${faculty}`,
    
    // Materials (General endpoints)
    MATERIALS: `${API_BASE_URL}/materials`,
    MATERIAL: (id) => `${API_BASE_URL}/materials/${id}`,
    MATERIAL_DOWNLOAD: (id) => `${API_BASE_URL}/materials/${id}/download`,
    
    // Purchase endpoints
    CHECK_PURCHASED: (id) => `${API_BASE_URL}/materials/${id}/purchased`,
    USER_PURCHASES: `${API_BASE_URL}/purchases`,
    
    // Payment endpoints (Stripe)
    PAYMENT_CONFIG: `${API_BASE_URL}/payment/config`,
    CREATE_PAYMENT_INTENT: `${API_BASE_URL}/payment/create-payment-intent`,
    CONFIRM_PAYMENT: `${API_BASE_URL}/payment/confirm-payment`,
    
    // Admin endpoints
    ADMIN_MATERIALS: `${API_BASE_URL}/admin/materials`,
    ADMIN_MATERIAL: (id) => `${API_BASE_URL}/admin/materials/${id}`,
    ADMIN_PURCHASES: `${API_BASE_URL}/admin/purchases`
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkUserSession();
});

/**
 * Initialize the main application
 */
function initializeApp() {
    // Setup smooth scrolling for navigation links
    setupSmoothScrolling();
    
    // Initialize contact form
    initializeContactForm();
    
    // Add scroll effects
    setupScrollEffects();
    
    // Initialize book interactions
    initializeBookInteractions();
    
    console.log('EDURA application initialized');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Hero action buttons
    const heroButtons = document.querySelectorAll('.hero-actions .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', handleHeroButtonClick);
    });

    // Category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', handleCategoryClick);
    });

    // Book cards
    const bookButtons = document.querySelectorAll('.book-btn');
    bookButtons.forEach(button => {
        button.addEventListener('click', handleBookAction);
    });

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Login button in header
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLoginButtonClick);
    }
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                event.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Setup scroll effects and animations
 */
function setupScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.card, .hero-content, .section-title');
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

/**
 * Initialize contact form functionality
 */
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Add real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateContactField);
        input.addEventListener('input', clearContactError);
    });
}

/**
 * Initialize book interaction functionality
 */
function initializeBookInteractions() {
    // Add hover effects to book cards
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
        });
    });
}

/**
 * Check user session and update UI accordingly
 */
function checkUserSession() {
    const userData = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('authToken');

    if (userData && token) {
        try {
            // Validate JWT token
            if (isTokenValid(token)) {
                currentUser = JSON.parse(userData);
                
                // Check if user should be redirected to their dashboard
                if (shouldRedirectToDashboard()) {
                    redirectBasedOnRole(currentUser.role);
                    return;
                }
                
                updateUIForLoggedInUser();
            } else {
                // Token expired, clear session data
                console.log('Token expired, clearing session data');
                clearAuthData();
                currentUser = null;
            }
        } catch (error) {
            console.error('Error parsing user data or validating token:', error);
            clearAuthData();
            currentUser = null;
        }
    }
}

/**
 * Check if user should be redirected to their dashboard
 * @returns {boolean} - Whether to redirect to dashboard
 */
function shouldRedirectToDashboard() {
    // Check if we're on the homepage and user is logged in
    const currentPath = window.location.pathname;
    const isHomepage = currentPath.endsWith('index.html') || currentPath.endsWith('/');
    
    // Only redirect from homepage, not from login page or other pages
    return isHomepage && currentUser && currentUser.role;
}

/**
 * Redirect user based on their role
 * @param {string} role - User role (ROLE_ADMIN or ROLE_USER)
 */
function redirectBasedOnRole(role) {
    if (role === 'ROLE_ADMIN') {
        window.location.href = 'pages/dashboards/admin.html';
    } else if (role === 'ROLE_USER') {
        window.location.href = 'pages/dashboards/user.html';
    }
    // If role is unknown, stay on current page
}

/**
 * Utility function to validate JWT token (client-side check)
 * @param {string} token - JWT token to validate
 * @returns {boolean} - Whether token appears valid
 */
function isTokenValid(token) {
    if (!token) return false;
    
    try {
        // Basic JWT structure check (header.payload.signature)
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // Decode payload to check expiration
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Check if token is expired (with 5 minute buffer)
        return payload.exp && payload.exp > (currentTime + 300);
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

/**
 * Clear authentication data
 */
function clearAuthData() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
}

/**
 * Get authorization headers for API calls
 * @returns {Object} - Headers object with Authorization header
 */
function getAuthHeaders() {
    const token = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
async function authenticatedFetch(url, options = {}) {
    const headers = getAuthHeaders();
    
    const config = {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {})
        }
    };
    
    const response = await fetch(url, config);
    
    // Handle token expiration
    if (response.status === 401) {
        console.log('Authentication failed, redirecting to login');
        clearAuthData();
        currentUser = null;
        window.location.href = 'pages/login.html';
        return;
    }
    
    return response;
}

/**
 * API Service Functions
 */

/**
 * Fetch user materials (requires authentication)
 * @returns {Promise<Array>} - Array of material objects
 */
async function fetchUserMaterials() {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.USER_MATERIALS);
        if (response && response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch materials');
    } catch (error) {
        console.error('Error fetching user materials:', error);
        throw error;
    }
}



/**
 * Check if user has purchased a material (requires authentication)
 * @param {number} materialId - ID of the material to check
 * @returns {Promise<boolean>} - Whether the material is purchased
 */
async function checkMaterialPurchased(materialId) {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.CHECK_PURCHASED(materialId));
        if (response && response.ok) {
            const data = await response.json();
            return data.purchased;
        }
        return false;
    } catch (error) {
        console.error('Error checking purchase status:', error);
        return false;
    }
}

/**
 * Fetch user's purchase history (requires authentication)
 * @returns {Promise<Array>} - Array of purchase objects
 */
async function fetchUserPurchases() {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.USER_PURCHASES);
        if (response && response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch purchases');
    } catch (error) {
        console.error('Error fetching user purchases:', error);
        throw error;
    }
}

/**
 * Download a material (requires authentication and purchase)
 * @param {number} materialId - ID of the material to download
 * @returns {Promise<Blob>} - Material file blob
 */
async function downloadMaterial(materialId) {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.MATERIAL_DOWNLOAD(materialId));
        if (response && response.ok) {
            return await response.blob();
        }
        throw new Error('Failed to download material');
    } catch (error) {
        console.error('Error downloading material:', error);
        throw error;
    }
}

/**
 * Stripe Payment Functions
 */

/**
 * Get Stripe configuration
 * @returns {Promise<Object>} - Stripe config with publishable key
 */
async function getStripeConfig() {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.PAYMENT_CONFIG);
        if (response && response.ok) {
            return await response.json();
        }
        throw new Error('Failed to get payment configuration');
    } catch (error) {
        console.error('Error getting Stripe config:', error);
        throw error;
    }
}

/**
 * Create payment intent for material purchase
 * @param {number} materialId - ID of the material to purchase
 * @returns {Promise<Object>} - Payment intent response
 */
async function createPaymentIntent(materialId) {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ materialId: materialId })
        });
        
        if (response && response.ok) {
            return await response.json();
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

/**
 * Confirm payment completion
 * @param {string} paymentIntentId - Payment intent ID from Stripe
 * @returns {Promise<Object>} - Purchase confirmation response
 */
async function confirmPayment(paymentIntentId) {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.CONFIRM_PAYMENT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentIntentId: paymentIntentId })
        });
        
        if (response && response.ok) {
            return await response.json();
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm payment');
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
}

/**
 * Update UI for logged-in user
 */
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginBtn && currentUser) {
        // Replace login button with simple user info
        loginBtn.textContent = `Welcome, ${currentUser.fullName}`;
        loginBtn.style.cursor = 'default';
        loginBtn.style.textDecoration = 'none';
        
        console.log(`Welcome back, ${currentUser.fullName}!`);
    }
}



/**
 * Handle user menu actions
 */

/**
 * Handle profile link click
 */
async function handleProfileClick() {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.PROFILE);
        if (response && response.ok) {
            const profileData = await response.json();
            alert(`Profile Info:\nName: ${profileData.fullName}\nEmail: ${profileData.email}\nRole: ${profileData.role}`);
        } else {
            alert('Failed to load profile data');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error loading profile. Please try again.');
    }
}

/**
 * Handle purchases link click
 */
async function handlePurchasesClick() {
    try {
        const purchases = await fetchUserPurchases();
        if (purchases.length > 0) {
            let purchasesList = 'Your Purchases:\n\n';
            purchases.forEach((purchase, index) => {
                purchasesList += `${index + 1}. ${purchase.materialTitle || 'Material'} - Purchased on ${new Date(purchase.purchaseDate).toLocaleDateString()}\n`;
            });
            alert(purchasesList);
        } else {
            alert('You have no purchases yet.');
        }
    } catch (error) {
        console.error('Error fetching purchases:', error);
        alert('Error loading purchases. Please try again.');
    }
}

/**
 * Handle admin materials link click
 */
async function handleAdminMaterialsClick() {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.MATERIALS);
        if (response && response.ok) {
            const materials = await response.json();
            alert(`Admin Materials Management\n\nTotal Materials: ${materials.length}\n\n(Full admin interface coming in future updates)`);
        } else {
            alert('Failed to load materials data');
        }
    } catch (error) {
        console.error('Error fetching admin materials:', error);
        alert('Error loading materials. Please try again.');
    }
}

/**
 * Handle admin purchases link click
 */
async function handleAdminPurchasesClick() {
    try {
        const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_PURCHASES);
        if (response && response.ok) {
            const allPurchases = await response.json();
            alert(`Admin Purchases Overview\n\nTotal Purchases: ${allPurchases.length}\n\n(Full admin interface coming in future updates)`);
        } else {
            alert('Failed to load purchases data');
        }
    } catch (error) {
        console.error('Error fetching admin purchases:', error);
        alert('Error loading admin data. Please try again.');
    }
}

/**
 * Handle navigation link clicks
 * @param {Event} event - Click event
 */
function handleNavigation(event) {
    const link = event.currentTarget;
    const href = link.getAttribute('href');
    
    // If it's an anchor link, smooth scroll is already handled
    if (href.startsWith('#')) {
        return;
    }
    
    // Handle other navigation
    console.log(`Navigating to: ${href}`);
}

/**
 * Handle hero button clicks
 * @param {Event} event - Click event
 */
function handleHeroButtonClick(event) {
    const button = event.currentTarget;
    const href = button.getAttribute('href');
    
    if (href === '#featured') {
        // Scroll to featured books section
        return; // Smooth scrolling will handle this
    }
    
    if (href === '#categories') {
        // Scroll to categories section
        return; // Smooth scrolling will handle this
    }
    
    console.log(`Hero button clicked: ${href}`);
}

/**
 * Handle material view buttons
 * @param {Event} event - Click event
 */
function handleBookAction(event) {
    event.preventDefault();
    
    if (!currentUser) {
        // User not logged in
        if (confirm('Please login to access educational materials. Go to login page?')) {
            window.location.href = 'pages/login.html';
        }
        return;
    }
    
    const materialCard = event.currentTarget.closest('.book-card');
    const materialTitle = materialCard.querySelector('.book-title').textContent;
    
    // Redirect to dashboard to view materials
    showNotification(`Please login to access "${materialTitle}"`, 'info');
    
    console.log(`Material requested: ${materialTitle}`);
}

/**
 * Handle contact form submission
 * @param {Event} event - Form submission event
 */
async function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Validate form
    if (!validateContactForm(formData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call (replace with actual endpoint in later phases)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        
        // Reset form
        form.reset();
        
    } catch (error) {
        console.error('Contact form error:', error);
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Validate contact form
 * @param {FormData} formData - Form data to validate
 * @returns {boolean} Whether form is valid
 */
function validateContactForm(formData) {
    let isValid = true;
    
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    if (!name || name.trim().length < 2) {
        showFieldError('name', 'Please enter your name (at least 2 characters).');
        isValid = false;
    }
    
    if (!email || !isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address.');
        isValid = false;
    }
    
    if (!message || message.trim().length < 10) {
        showFieldError('message', 'Please enter a message (at least 10 characters).');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate contact form field
 * @param {Event} event - Blur event
 */
function validateContactField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearContactError(event);
    
    switch (field.name) {
        case 'name':
            if (value && value.length < 2) {
                showFieldError('name', 'Name must be at least 2 characters.');
            }
            break;
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError('email', 'Please enter a valid email address.');
            }
            break;
        case 'message':
            if (value && value.length < 10) {
                showFieldError('message', 'Message must be at least 10 characters.');
            }
            break;
    }
}

/**
 * Clear contact form field error
 * @param {Event} event - Input event
 */
function clearContactError(event) {
    const field = event.target;
    field.classList.remove('error');
    
    // Remove any existing error message
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Show field error
 * @param {string} fieldName - Name of the field
 * @param {string} message - Error message
 */
function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    field.classList.add('error');
    
    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error form-error';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

/**
 * Handle login button click
 * @param {Event} event - Click event
 */
function handleLoginButtonClick(event) {
    // Default behavior will navigate to login page
    console.log('Navigating to login page');
}

/**
 * Handle user logout
 */
async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    try {
        // Get JWT token from session storage
        const token = sessionStorage.getItem('authToken');
        
        // Call logout API with JWT token
        await fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear session data and reload page
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('authToken');
        currentUser = null;
        location.reload();
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show notification message
 * @param {string} message - Message to show
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--white);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-lg);
                padding: var(--spacing-md);
                z-index: 10000;
                max-width: 300px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--spacing-sm);
                animation: slideInRight 0.3s ease;
            }
            
            .notification-success {
                border-left: 4px solid var(--success);
            }
            
            .notification-error {
                border-left: 4px solid var(--error);
            }
            
            .notification-info {
                border-left: 4px solid var(--primary);
            }
            
            .notification-message {
                font-size: var(--font-size-small);
                color: var(--text);
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: var(--gray);
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                color: var(--text);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Utility function to format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Utility function to debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleLogout,
        showNotification,
        formatCurrency,
        debounce
    };
}