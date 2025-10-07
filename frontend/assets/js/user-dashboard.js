/**
 * User Dashboard JavaScript for EDURA Online Book Store
 * Handles user-specific functionality, authentication, and UI management
 */

// Global variables
let currentUser = null;

/**
 * Faculty to thumbnail mapping
 */

const FACULTY_THUMBNAILS = {
    'agriculture': 'foagri.png',
    'allied health': 'foahs.png',
    'architecture': 'foarch.png',
    'arts': 'foa.png',
    'dental': 'fods.png',
    'engineering': 'foe.png',
    'graduate studies': 'fogs.png',
    'humanities': 'fohss.png',
    'social': 'fohs.png',
    'it': 'foit.png',
    'information': 'foit.png',
    'veterinary': 'fovmas.png',
    'animal': 'fovmas.png',
    'medicine': 'fom.png',
    'management': 'fomfc.png',
    'science': 'fos.png',
    'technology': 'fot.png',
    'computing': 'fot.png',
    'default': 'default.png'
};

// Initialize user dashboard
document.addEventListener('DOMContentLoaded', function () {
    validateUserAccess();
    initializeUserDashboard();
    setupUserEventListeners();
});

/**
 * Initialize user dashboard functionality
 */
function initializeUserDashboard() {
    initializeUserMenu();    
    loadUserLibrary();
    loadBrowseMaterials();
    populateSelectOptions();

    console.log('User dashboard initialized');
}

/**
 * Validate user access and redirect if necessary
 */
function validateUserAccess() {
    const userData = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('authToken');

    if (!userData || !token) {
        // No authentication data, redirect to login
        alert('Please log in to access your dashboard.');
        window.location.href = '../login.html';
        return;
    }

    try {
        const user = JSON.parse(userData);

        // Validate token is still valid
        if (!isTokenValid(token)) {
            alert('Your session has expired. Please log in again.');
            clearAuthData();
            window.location.href = '../login.html';
            return;
        }

        // Check if user has user role
        if (user.role !== 'ROLE_USER') {
            alert('Access denied. This page is for regular users only.');
            window.location.href = user.role === 'ROLE_ADMIN' ? './admin.html' : '../../index.html';
            return;
        }

        currentUser = user;
        console.log('User access validated for:', user.fullName);

    } catch (error) {
        console.error('Error validating user access:', error);
        alert('Authentication error. Please log in again.');
        clearAuthData();
        window.location.href = '../login.html';
    }
}

/**
 * Load user's library and stats
 */
async function loadUserLibrary() {
    console.log("Loading user library...")
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/purchases');

        if (response && response.ok) {
            // console.log("Response:", response);               // Debug log
            const purchases = await response.json();
            console.log("User library purchases:", purchases);   // Debug log
            const recentElements = purchases.slice(-4);          // Get the last 4 purchases
            console.log("Recent purchases:", recentElements);    // Debug log
            displayUserLibrary(recentElements);
        } else {
            console.error('Failed to load user library');
        }
    } catch (error) {
        console.error('Error loading user library:', error);
    }
}

/**
 * Display user's purchased materials
 * @param {Array} purchases - Array of purchase objects
 */
function displayUserLibrary(purchases) {
    const libraryContainer = document.getElementById('userLibrary');

    if (purchases.length === 0) {
        libraryContainer.style.display = 'flex';
        libraryContainer.innerHTML = `
            <div class="materials-placeholder">
                <div class="placeholder-text" id="empty-user-library">You haven't purchased any materials yet.</div>
            </div>
        `;
        return;
    }

    purchases.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)); // Sort by purchase date descending

    // Display purchased materials
    libraryContainer.innerHTML = purchases.map(purchase => `
        <div class="material-card">
            <div class="material-info">
                <h4>${purchase.material.title || 'Material'}</h4>
                <p class="purchase-date">Purchased: ${new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                <p class="material-price">Rs.${purchase.purchasePrice || '0.00'}</p>
            </div>
            <div class="material-actions">
                <button class="btn btn-download" onclick="downloadMaterial(${purchase.material.id})">
                    Download
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Load materials for browsing
 */
async function loadBrowseMaterials() {
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/user/materials');

        if (response && response.ok) {
            const materials = await response.json();
            console.log("Browse materials:", materials); // Debug log
            // materials.sort((a, b) => b.id - a.id); // Sort materials by ID in descending order
            displayBrowseMaterials(materials);
            // populateSelectOptions();
        } else {
            console.error('Failed to load browse materials');
        }
    } catch (error) {
        console.error('Error loading browse materials:', error);
        displayBrowseError();
    }
}

/**
 * Display materials for browsing
 * @param {Array} materials - Array of material objects
 */
function displayBrowseMaterials(materials) {
    const browseContainer = document.getElementById('browseMaterials');

    if (materials.length === 0) {
        browseContainer.style.display = 'flex';
        browseContainer.innerHTML = `
            <div class="materials-placeholder">
                <div class="placeholder-text" id="empty-browse-materials">No Materials Available.</div>
            </div>
        `;
        return;
    }

    browseContainer.innerHTML = materials.map(material => {
        const thumbnailPath = getFacultyThumbnail(material.faculty);

        return `
        <div class="material-card">
            <div class="material-preview">
                <img src="${thumbnailPath}" alt="${material.faculty || 'Material'} thumbnail" class="material-thumbnail" onerror="this.src='/frontend/assets/images/Thumbnails/default.png'">
            </div>
            <div class="material-info">
                <h4>${material.title}</h4>
                <p class="material-university">${material.university || 'N/A'}</p>
                <p class="material-faculty">${material.faculty || 'N/A'}</p>
                <p class="material-courseModule">${material.courseModule || 'N/A'}</p>
                <p class="material-price">Rs.${material.price || '0.00'}</p>
            </div>
            <div class="material-actions">${material.purchased ?
                `<button class="btn btn-download" onclick="downloadMaterial(${material.id})">Download</button>` :
                `<button class="btn btn-primary btn-purchase" onclick="purchaseMaterial(${material.id})">Buy Now</button>`}
            </div>
        </div>
    `;
    }).join('');
}

/**
 * Get thumbnail image path based on faculty
 * @param {string} faculty - Faculty name
 * @returns {string} - Path to thumbnail image
 */
function getFacultyThumbnail(faculty) {
    if (!faculty) {
        return '/frontend/assets/images/Thumbnails/default.png';
    }

    // Convert faculty to lowercase for case-insensitive matching
    const facultyLower = faculty.toLowerCase();

    // Check for keyword matches
    for (const [keyword, thumbnail] of Object.entries(FACULTY_THUMBNAILS)) {
        if (keyword === 'default') continue;

        if (facultyLower.includes(keyword)) {
            return `/frontend/assets/images/Thumbnails/${thumbnail}`;
        }
    }

    // Return default if no match found
    return '/frontend/assets/images/Thumbnails/default.png';
}

/**
 * Display browse error
 */
function displayBrowseError() {
    const browseContainer = document.getElementById('browseMaterials');
    browseContainer.innerHTML = `
        <div class="materials-placeholder">
            <div class="placeholder-text" id="display-browse-error">Unable to load materials.</div>
        </div>
    `;
}

/**
 * Load purchase history
 */
async function loadPurchaseHistory() {
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/purchases');

        if (response && response.ok) {
            const purchases = await response.json();
            console.log("Purchase history:", purchases); // Debug log
            displayPurchaseHistory(purchases);
        } else {
            console.error('Failed to load purchase history');
            const historyContainer = document.getElementById('purchaseHistory');
            historyContainer.innerHTML = `
                <div class="content-placeholder">
                    <div class="placeholder-text">Error loading purchase history. Please try again.</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading purchase history:', error);
        const historyContainer = document.getElementById('purchaseHistory');
        historyContainer.innerHTML = `
            <div class="content-placeholder">
                <div class="placeholder-text">Error loading purchase history. Please try again.</div>
            </div>
        `;
    }
}

/**
 * Display purchase history
 * @param {Array} purchases - Array of purchase objects
 */
function displayPurchaseHistory(purchases) {
    const historyContainer = document.getElementById('purchaseHistory');

    if (purchases.length === 0) {
        historyContainer.innerHTML = `
            <div class="content-placeholder">
                <div class="placeholder-text" id="empty-purchase-history">No Purchase History.</div>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = `
        <div class="purchases-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Material</th>
                        <th>University</th>
                        <th>Date</th>
                        <th>Amount (Rs.)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${purchases.map(purchase => `
                        <tr>
                            <td>${purchase.id || 'N/A'}</td>
                            <td>${purchase.material.title || 'Material'}</td>
                            <td>${purchase.material.university || 'N/A'}</td>
                            <td>${new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                            <td>${purchase.purchasePrice || '0.00'}</td>
                            <td>
                                <button class="btn btn-small btn-download" onclick="downloadMaterial(${purchase.material.id})">
                                    Download
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Load user profile
 */
async function loadUserProfile() {
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/user/profile');

        if (response && response.ok) {
            const profileData = await response.json();
            console.log("Profile data: ", profileData); // Debug log
            displayUserProfile(profileData);
        } else {
            console.error('Failed to load user profile');
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

/**
 * Display user profile
 * @param {Object} profileData - User profile data
 */
function displayUserProfile(profileData) {
    const profileContainer = document.getElementById('profileInfo');

    profileContainer.innerHTML = `
        <div class="profile-section">
            <h4>Personal Information</h4>
            <div class="profile-field">
                <label><strong>Full Name:</strong></label>
                <span>${profileData.fullName}</span>
            </div>
            <div class="profile-field">
                <label><strong>Email:</strong></label>
                <span>${profileData.email}</span>
            </div>
            <div class="profile-field">
                <label><strong>Role:</strong></label>
                <span>${profileData.role === 'ROLE_USER' ? 'User' : 'Admin'}</span>
            </div>
        </div>
    `;
}

/**
 * Initialize user menu in header
 */
function initializeUserMenu() {
    const userMenuContainer = document.getElementById('userUserMenu');

    if (currentUser && userMenuContainer) {
        // Create menu items for user
        const menuItems = [
            '<a href="#profile" class="dropdown-item" id="userProfileLink">Profile</a>',    // This should link to the user profile page
            '<a href="#purchases" class="dropdown-item" id="userPurchasesLink">My Purchases</a>',   // This should link to the purchases page
            '<a href="#" class="dropdown-item" id="userLogoutLink">Logout</a>'
        ];

        userMenuContainer.innerHTML = `
            <div class="user-info">
                <span class="user-name">👋 ${currentUser.fullName}</span>
                <div class="user-dropdown">
                    <button class="btn btn-outline" id="userMenuBtn">
                        <span class="user-role">User ▼</span>
                    </button>
                    <div class="dropdown-menu" id="userDropdown">
                        ${menuItems.join('')}
                    </div>
                </div>
            </div>
        `;

        console.log("User menu initialized")
        // Setup dropdown functionality
        setupUserMenuEvents();
    }
}

/**
 * Setup user menu event listeners
 */
function setupUserMenuEvents() {
    const menuBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    const profileLink = document.getElementById('userProfileLink');
    const purchasesLink = document.getElementById('userPurchasesLink');
    const logoutLink = document.getElementById('userLogoutLink');

    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            dropdown.classList.remove('show');
        });
    }

    // Profile View
    if (profileLink) {
        profileLink.addEventListener('click', function (e) {
            e.preventDefault();
            navigateToProfileView();
        });
    }

    // Purchases View
    if (purchasesLink) {
        purchasesLink.addEventListener('click', function (e) {
            e.preventDefault();
            navigateToPurchaseHistory();
        });
    }

    // Logout
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            handleUserLogout();
        });
    }
    console.log("User menu events set up");
}

/**
 * Setup additional event listeners
 */
function setupUserEventListeners() {
    // View History functionality
    const viewAllBtn = document.getElementById('viewAllPurchasesBtn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', navigateToPurchaseHistory);
    }

    // Search functionality
    const searchBtn = document.getElementById('searchMaterialsBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    const searchInput = document.getElementById('search-bar');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput && clearSearchBtn) {
        // Show/hide clear button based on input
        searchInput.addEventListener('input', function () {
            if (searchInput.value.trim()) {
                clearSearchBtn.style.visibility = 'visible';
            } else {
                clearSearchBtn.style.visibility = 'hidden';
            }
        });

        // Clear search input field
        clearSearchBtn.addEventListener('click', function () {
            searchInput.value = '';
            clearSearchBtn.style.visibility = 'hidden';
            loadBrowseMaterials();
        });

        // Search on Enter key
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Filter functionality
    const filters = ['universityFilter', 'facultyFilter', 'purchasedFilter'];
    filters.forEach(filterId => {
        const filterElement = document.getElementById(filterId);
        if (filterElement) {
            filterElement.addEventListener('change', applyFilters);
        }
    });

    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    console.log("Event listeners setup completed");
}

/**
 * Handle user logout
 */
async function handleUserLogout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }

    try {
        // Call logout API using the shared auth utilities
        if (window.AuthUtils && typeof window.AuthUtils.logout === 'function') {
            await window.AuthUtils.logout();
        } else {
            // Fallback logout logic
            const token = sessionStorage.getItem('authToken');
            await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            clearAuthData();
            window.location.href = '../login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Clear data and redirect anyway
        clearAuthData();
        window.location.href = '../login.html';
    }
}

/**
 * Action functions
 */
let stripe = null;
let elements = null;
let currentMaterial = null;

// Initialize Stripe when the page loads
async function initializeStripe() {
    try {
        const config = await getStripeConfig();
        stripe = Stripe(config.publishableKey);
    } catch (error) {
        console.error('Failed to initialize Stripe:', error);
    }
}

async function purchaseMaterial(materialId) {
    console.log('Purchase material called with ID:', materialId);
    
    try {
        // Get material details first
        console.log('Fetching material details...');
        const materialsResponse = await authenticatedFetch(`http://localhost:8080/api/user/materials`);
        if (!materialsResponse || !materialsResponse.ok) {
            throw new Error('Failed to load material details');
        }
        
        const materials = await materialsResponse.json();
        console.log('Materials loaded:', materials);
        currentMaterial = materials.find(m => m.id === materialId);
        
        if (!currentMaterial) {
            throw new Error('Material not found');
        }

        console.log('Current material:', currentMaterial);

        // Show payment modal
        showPaymentModal(currentMaterial);
        
        // Create payment intent
        console.log('Creating payment intent...');
        const paymentIntentResponse = await createPaymentIntent(materialId);
        console.log('Payment intent response:', paymentIntentResponse);
        
        // Initialize Stripe Elements
        if (!stripe) {
            await initializeStripe();
        }
        
        const appearance = {
            theme: 'stripe',
            variables: {
                colorPrimary: '#0ea5e9',
            }
        };
        
        elements = stripe.elements({
            clientSecret: paymentIntentResponse.clientSecret,
            appearance
        });
        
        const paymentElement = elements.create('payment');
        paymentElement.mount('#paymentElement');
        
        // Store payment intent details
        window.currentPaymentIntent = paymentIntentResponse;
        
    } catch (error) {
        console.error('Error initiating purchase:', error);
        alert('Error starting purchase process. Please try again.');
    }
}

function showPaymentModal(material) {
    const modal = document.getElementById('paymentModal');
    const materialTitle = document.getElementById('materialTitle');
    const materialPrice = document.getElementById('materialPrice');
    
    materialTitle.textContent = material.title;
    materialPrice.textContent = `$${material.price.toFixed(2)}`;
    
    modal.style.display = 'flex';
    
    // Setup modal event listeners
    setupPaymentModalListeners();
}

function hidePaymentModal() {
    const modal = document.getElementById('paymentModal');
    // Hide modal
    modal.style.display = 'none';
    
    // Clean up Stripe elements safely
    if (elements) {
        try {
            // Check if elements still has the destroy method before calling it
            if (typeof elements.destroy === 'function') {
                elements.destroy();
            }
        } catch (error) {
            // Elements already cleaned up, ignore error
            console.log('Payment modal cleaned up');
        }
        elements = null;
    }
    
    // Clear payment intent
    window.currentPaymentIntent = null;
    currentMaterial = null;
}

function setupPaymentModalListeners() {
    const closeBtn = document.getElementById('closePaymentModal');
    const cancelBtn = document.getElementById('cancelPayment');
    const submitBtn = document.getElementById('submitPayment');
    
    // Remove existing listeners to prevent duplicates
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    submitBtn.replaceWith(submitBtn.cloneNode(true));
    
    // Add new listeners
    document.getElementById('closePaymentModal').addEventListener('click', hidePaymentModal);
    document.getElementById('cancelPayment').addEventListener('click', hidePaymentModal);
    document.getElementById('submitPayment').addEventListener('click', handlePaymentSubmit);
    
    // Close modal when clicking outside
    document.getElementById('paymentModal').addEventListener('click', (e) => {
        if (e.target.id === 'paymentModal') {
            hidePaymentModal();
        }
    });
}

async function handlePaymentSubmit() {
    if (!stripe || !elements || !window.currentPaymentIntent) {
        return;
    }
    
    const submitButton = document.getElementById('submitPayment');
    const buttonText = document.getElementById('buttonText');
    const spinner = document.getElementById('spinner');
    const messagesDiv = document.getElementById('paymentMessages');
    
    // Disable submit button and show loading
    setPaymentLoading(true);
    
    try {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        });
        
        if (error) {
            showPaymentError(error.message);
            setPaymentLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment succeeded, confirm with backend
            try {
                await confirmPayment(paymentIntent.id);
                
                // Success! Clean up modal properly
                hidePaymentModal();

                // Show success message
                alert('Payment successful! Material purchased.');

                // Reload data to show updated purchase status
                loadUserLibrary();
                loadBrowseMaterials();
                
            } catch (confirmError) {
                console.error('Error confirming payment:', confirmError);
                showPaymentError('Payment processed but confirmation failed. Please contact support.');
                setPaymentLoading(false);
            }
        } else {
            showPaymentError('Payment was not completed. Please try again.');
            setPaymentLoading(false);
        }
    } catch (error) {
        console.error('Payment error:', error);
        showPaymentError('An unexpected error occurred. Please try again.');
        setPaymentLoading(false);
    }
}

function setPaymentLoading(loading) {
    const submitButton = document.getElementById('submitPayment');
    const buttonText = document.getElementById('buttonText');
    const spinner = document.getElementById('spinner');
    
    if (loading) {
        submitButton.disabled = true;
        buttonText.textContent = 'Processing...';
        spinner.style.display = 'inline-block';
    } else {
        submitButton.disabled = false;
        buttonText.textContent = 'Pay Now';
        spinner.style.display = 'none';
    }
}

function showPaymentError(message) {
    const messagesDiv = document.getElementById('paymentMessages');
    messagesDiv.textContent = message;
    messagesDiv.classList.add('show');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        messagesDiv.classList.remove('show');
    }, 5000);
}

/**
 * Stripe Payment Functions (Local copies to ensure availability)
 */

/**
 * Get Stripe configuration
 * @returns {Promise<Object>} - Stripe config with publishable key
 */
async function getStripeConfig() {
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/payment/config');
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
        console.log('Sending payment intent request for material ID:', materialId);
        const response = await authenticatedFetch('http://localhost:8080/api/payment/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ materialId: materialId })
        });
        
        console.log('Payment intent response status:', response.status);
        console.log('Payment intent response headers:', response.headers);
        
        if (response && response.ok) {
            return await response.json();
        }
        
        // Handle error response - check if response has content
        let errorMessage = 'Failed to create payment intent';
        try {
            const responseText = await response.text();
            console.log('Error response text:', responseText);
            
            if (responseText) {
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (parseError) {
                    // Response is not JSON, use as plain text
                    errorMessage = responseText || errorMessage;
                }
            }
        } catch (textError) {
            console.log('Could not read error response:', textError);
        }
        
        throw new Error(errorMessage);
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
        const response = await authenticatedFetch('http://localhost:8080/api/payment/confirm-payment', {
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

// Initialize Stripe when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeStripe();
});

async function downloadMaterial(materialId) {
    try {
        const response = await authenticatedFetch(`http://localhost:8080/api/materials/${materialId}/download`);

        if (response && response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `material_${materialId}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Download failed. Please check if you have purchased this material.');
        }
    } catch (error) {
        console.error('Error downloading material:', error);
        alert('Error downloading material. Please try again.');
    }
}

/**
 * Perform search
 */
async function performSearch() {
    const searchInput = document.getElementById('search-bar');
    const searchTerm = searchInput.value.trim();

    console.log('Performing search for:', searchTerm);

    if (!searchTerm) {
        // If search is empty, reload all materials
        loadBrowseMaterials();
        return;
    }

    try {
        // Fetch all materials
        const response = await authenticatedFetch('http://localhost:8080/api/user/materials');

        if (response && response.ok) {
            const materials = await response.json();
            
            // Filter materials based on search term
            const filteredMaterials = materials.filter(material => {
                const searchLower = searchTerm.toLowerCase();
                
                // Search in multiple fields
                const titleMatch = material.title?.toLowerCase().includes(searchLower);
                const courseModuleMatch = material.courseModule?.toLowerCase().includes(searchLower);
                const universityMatch = material.university?.toLowerCase().includes(searchLower);
                const facultyMatch = material.faculty?.toLowerCase().includes(searchLower);
                
                // Return true if any field matches
                return titleMatch || courseModuleMatch || universityMatch || facultyMatch;
            });

            console.log(`Found ${filteredMaterials.length} materials matching "${searchTerm}"`);
            
            // Display filtered results
            displayBrowseMaterials(filteredMaterials);
            
            // Show message if no results found
            if (filteredMaterials.length === 0) {
                const browseContainer = document.getElementById('browseMaterials');
                browseContainer.innerHTML = `
                    <div class="materials-placeholder">
                        <div class="placeholder-text">No materials found for "${searchTerm}"</div>
                    </div>
                `;
            }
        } else {
            console.error('Failed to load materials for search');
        }
    } catch (error) {
        console.error('Error performing search:', error);
        alert('Error searching materials. Please try again.');
    }
}

/**
 * Filter materials
 */
async function applyFilters() {
    console.log('Applying filters...');
    const university = document.getElementById('universityFilter').value;
    const faculty = document.getElementById('facultyFilter').value;
    const purchased = document.getElementById('purchasedFilter').checked;

    // Implement filter functionality
    if (university) {
        try {
            const response = await authenticatedFetch(`http://localhost:8080/api/user/materials/search/university/${university}`);

            if (response && response.ok) {
                const materials = await response.json();
                console.log("Filtered materials by university:", materials); // Debug log
                displayBrowseMaterials(materials);
            } else {
                console.error('Failed to load filtered materials');
            }
        } catch (error) {
            console.error('Error loading filtered materials:', error);
        }
    }

    if (faculty) {
        try {
            const response = await authenticatedFetch(`http://localhost:8080/api/user/materials/search/faculty/${faculty}`);

            if (response && response.ok) {
                const materials = await response.json();
                console.log("Filtered materials by faculty:", materials); // Debug log
                displayBrowseMaterials(materials);
            } else {
                console.error('Failed to load filtered materials');
            }
        } catch (error) {
            console.error('Error loading filtered materials:', error);
        }
    }

    if (purchased) {
        try {
            const response = await authenticatedFetch('http://localhost:8080/api/purchases');

            if (response && response.ok) {
                const materials = await response.json();
                console.log("Filtered material by purchase status:", materials); // Debug log
                const purchasedMaterials = materials.map(purchase => purchase.material);
                console.log("Purchased material:", purchasedMaterials);
                displayBrowseMaterials(purchasedMaterials);
            } else {
                console.error('Failed to load filtered materials');
            }
        } catch (error) {
            console.error('Error loading filtered materials:', error);
        }
    }
}

function clearFilters() {
    const filters = ['universityFilter', 'facultyFilter', 'purchasedFilter'];
    const searchInput = document.getElementById('search-bar');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    filters.forEach(filterId => {
        const filterElement = document.getElementById(filterId);
        if (filterElement) {
            filterElement.value = '';
        }

        if (filterElement.type === 'checkbox') {
            filterElement.checked = false;
        }

    });
    searchInput.value = '';
    clearSearchBtn.style.visibility = 'hidden';

    loadBrowseMaterials();
}

/**
 * Populate select options for filters
*/
async function populateSelectOptions() {
    const universitySelect = document.getElementById('universityFilter');
    const facultySelect = document.getElementById('facultyFilter');

    const universities = new Set();
    const faculties = new Set();

    // Fetch unique universities and faculties from materials
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/user/materials');

        if (response && response.ok) {
            const materials = await response.json();

            // Append distinct universities and faculties to sets
            materials.forEach(material => {
                const university = material.university;
                universities.add(university);
            });
            materials.forEach(material => {
                const faculty = material.faculty;
                faculties.add(faculty);
            });

            // Convert sets to sorted arrays
            const universitiesArray = Array.from(universities).sort();
            const facultiesArray = Array.from(faculties).sort();

            console.log("Distinct universities sorted: ", universitiesArray);
            console.log("Distinct faculties sorted: ", facultiesArray);

            // Populate select options
            if (universitiesArray) {
                universitiesArray.forEach(university => {
                    const option = document.createElement('option');
                    option.value = university;
                    option.textContent = university;
                    universitySelect.appendChild(option);
                });
            }

            if (facultiesArray) {
                facultiesArray.forEach(faculty => {
                    const option = document.createElement('option');
                    option.value = faculty;
                    option.textContent = faculty;
                    facultySelect.appendChild(option);
                });
            }
        } else {
            console.error('Failed to load browse materials');
        }
    } catch (error) {
        console.error('Error loading browse materials:', error);
        displayBrowseError();
    }    
}

/**
 * Utility functions (fallbacks if auth.js utilities are not available)
 */
function isTokenValid(token) {
    if (!token) return false;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        return payload.exp && payload.exp > currentTime;
    } catch (error) {
        return false;
    }
}

function clearAuthData() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
}

async function authenticatedFetch(url, options = {}) {
    const token = sessionStorage.getItem('authToken');

    // Browser will set Content-Type automatically to multipart/form-data with boundary when using FormData
    // So we only set Content-Type for non-FormData requests
    const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers || {})
    };

    // Only add Content-Type if body is not FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
        alert('Session expired. Please log in again.');
        clearAuthData();
        window.location.href = '../login.html';
        return null;
    }

    return response;
}



/**
 * Navigate to profile details view
 */

function navigateToProfileView() {
    const mainWindow = document.getElementById('mainWindow');

    mainWindow.innerHTML = `
    <!-- Profile Section -->
    <section id="profile" class="dashboard-section">
        <div class="section-header profile-header-section">
            <div>
                <h3>Profile Settings</h3>
                <p>Manage your account information</p>
            </div>
            <button type="button" class="btn btn-back" id="backBtn">&lAarr; Back to Dashboard</button>
        </div>

        <div class="profile-content">
            <div class="profile-info" id="profileInfo">
                <!-- Profile information will be populated by JavaScript -->
                <div class="content-placeholder">
                    <div class="placeholder-text" id="empty-profile-info">No Profile Information Available.</div>
                </div>
            </div>
        </div>
    </section>
    `;

    // Add to browser history
    window.history.pushState({ view: 'profile' }, '', '#profile');

    // Setup back button event listener
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', navigateBack);
    }

    loadUserProfile();
}

/**
 * Navigate to purchase history
 */

function navigateToPurchaseHistory() {
    const mainWindow = document.getElementById('mainWindow');

    mainWindow.innerHTML = `
    <!-- Purchase History Section -->
    <section id="purchases" class="dashboard-section">
        <div class="section-header purchase-history-section">
            <div>
                <h3>Purchase History</h3>
                <p>View your past purchases history</p>
            </div>
            <button type="button" class="btn btn-back" id="backBtn">&lAarr; Back to Dashboard</button>
        </div>
        <div class="purchases-list" id="purchaseHistory">
            <!-- Purchase history will be populated by JavaScript -->
        </div>
    </section>
    `;

    // Add to browser history
    window.history.pushState({ view: 'purchase-history' }, '', '#purchases');

    // Setup back button event listener
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', navigateBack);
    }

    loadPurchaseHistory();
}

/**
 * Render main dashboard view
 */
function renderMainDashboard() {
    const mainWindow = document.getElementById('mainWindow');

    mainWindow.innerHTML = `
            <!-- Profile section will be loaded here by JavaScript -->
            <!-- Purchase history section will be loaded here by JavaScript -->

            <!-- My Library Section -->
            <section id="library" class="dashboard-section">
                <div class="section-header library-section">
                    <div>
                        <h3>My Library</h3>
                        <p>Your purchased materials</p>
                    </div>
                    <button type="button" class="btn btn-viewAll" id="viewAllPurchasesBtn">View All &rAarr;</button>
                </div>

                <div class="materials-grid" id="userLibrary">
                    <!-- User's purchased materials will be populated by JavaScript -->
                </div>
            </section>

            <!-- Browse Materials Section -->
            <section id="browse" class="dashboard-section">
                <div class="section-header">
                    <h3>Browse Materials</h3>
                    <p>Discover and purchase new learning materials</p>
                </div>

                <!-- Search and Filter Controls -->
                <div class="browse-controls">
                    <div class="search-box">
                        <input type="text" id="search-bar" placeholder="Search materials..." class="search-input">
                        <button type="button" class="btn btn-clear-search" id="clearSearchBtn">&Cross;</button>
                        <button class="search-btn" id="searchMaterialsBtn">Search</button>
                    </div>

                    <div class="filter-controls">
                        <select id="universityFilter" class="filter-select" aria-label="Filter by university">
                            <option value="">All Universities</option>
                            <!-- Universities will be populated by JavaScript -->
                        </select>

                        <select id="facultyFilter" class="filter-select" aria-label="Filter by faculty">
                            <option value="">All Faculties</option>
                            <!-- Faculties will be populated by JavaScript -->
                        </select>
                        <div class="filter-group">
                            <label for="purchasedFilter" class="filter-label">Show Purchased Only</label>
                            <input type="checkbox" id="purchasedFilter" class="filter-checkbox"
                                aria-label="Show purchased materials only">
                        </div>
                        <button class="btn-clearFilters" id="clearFiltersBtn">Clear Filters</button>
                    </div>
                </div>

                <div class="materials-grid" id="browseMaterials">
                    <!-- Available materials will be populated by JavaScript -->
                </div>
            </section>
    `;

    // Re-initialize with proper sequencing
    // First, set up event listeners for static elements
    setupUserEventListeners();

    // Then load data (which is async)
    loadUserLibrary();
    loadBrowseMaterials();

    console.log('Main dashboard rendered and initialized');
}

/**
 * Navigate back to main dashboard
 */

function navigateBack() {
    // Go back in browser history
    // window.history.back();
    renderMainDashboard();
}

/**
 * Handle browser back/forward buttons
 */
window.addEventListener('popstate', function (event) {
    if (event.state && event.state.view === 'purchase-history') {
        // User went forward to purchase history
        navigateToPurchaseHistory();
    } else if (event.state && event.state.view === 'profile') {
        // User went forward to profile view
        navigateToProfileView();
    } else {
        // User went back to main dashboard
        renderMainDashboard();
    }
});