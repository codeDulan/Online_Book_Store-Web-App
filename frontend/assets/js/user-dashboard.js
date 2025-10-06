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
    'humanities social': 'fohss.png',
    'information': 'foit.png',
    'medicine': 'fom.png',
    'management finance commerce': 'fomfc.png',
    'science': 'fos.png',
    'technology': 'fot.png',
    'veterinary animal': 'fovmas.png',
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
    // loadUserProfile();
    // loadPurchaseHistory();

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
        } else {
            console.error('Failed to load browse materials');
        }
    } catch (error) {
        console.error('Error loading browse materials:', error);
        displayBrowseError();
    }
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
 * Display materials for browsing
 * @param {Array} materials - Array of material objects
 */
function displayBrowseMaterials(materials) {
    const browseContainer = document.getElementById('browseMaterials');

    if (materials.length === 0) {
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
                `<button class="btn btn-primary btn-purchase" onclick="purchaseMaterial(${material.id})">Purchase</button>`}
            </div>
        </div>
    `;
    }).join('');
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
        }
    } catch (error) {
        console.error('Error loading purchase history:', error);
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
                <p>You haven't made any purchases yet.</p>
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
                <span>${profileData.role === 'ROLE_USER' ? 'User' : profileData.role}</span>
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
    if (searchInput) {
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
async function purchaseMaterial(materialId) {
    if (!confirm('Are you sure you want to purchase this material?')) {
        return;
    }

    try {
        const response = await authenticatedFetch(`http://localhost:8080/api/materials/${materialId}/purchase`, {
            method: 'POST'
        });

        if (response && response.ok) {
            alert('Material purchased successfully!');
            // Reload current section to update UI
            loadUserLibrary();
            loadBrowseMaterials();
            loadPurchaseHistory();
        } else {
            const errorData = await response.json();
            console.log("Purchase error data:", errorData); // Debug log
            alert(`Purchase failed: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error purchasing material:', error);
        alert('Error purchasing material. Please try again.');
    }
}

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

function performSearch() {
    console.log('Performing search...');
    alert('💩');
    // Implement search functionality
}

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
    filters.forEach(filterId => {
        const filterElement = document.getElementById(filterId);
        if (filterElement) {
            filterElement.value = '';
        }

        if (filterElement.type === 'checkbox') {
            filterElement.checked = false;
        }

        loadBrowseMaterials();
    });
}

function editProfile() {
    alert('Edit profile functionality will be implemented here.');
}

function changePassword() {
    alert('Change password functionality will be implemented here.');
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

    // Re-initialize after rendering
    initializeUserDashboard();
    setupUserEventListeners();

}

/**
 * Navigate back to main dashboard
 */

function navigateBack() {
    // Go back in browser history
    window.history.back();
}

/**
 * Handle browser back/forward buttons
 */
window.addEventListener('popstate', function (event) {
    if (event.state && event.state.view === 'purchase-history') {
        // User went forward to purchase history
        navigateToPurchaseHistory();
    } else {
        // User went back to main dashboard
        renderMainDashboard();
    }
});