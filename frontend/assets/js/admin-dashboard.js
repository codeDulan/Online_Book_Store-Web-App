/**
 * Admin Dashboard JavaScript for EDURA Online Book Store
 * Handles admin-specific functionality, authentication, and UI management
 */

// Global variables
let currentAdminUser = null;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function () {
    validateAdminAccess();
    initializeAdminDashboard();
    setupAdminEventListeners();
});

/**
 * Initialize admin dashboard functionality
 */
function initializeAdminDashboard() {
    initializeUserMenu();
    loadMaterials();
    console.log('Admin dashboard initialized');
}

/**
 * Validate admin access and redirect if necessary
 */
function validateAdminAccess() {
    const userData = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('authToken');

    if (!userData || !token) {
        // No authentication data, redirect to login
        alert('Please log in to access the admin dashboard.');
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

        // Check if user has admin role
        if (user.role !== 'ROLE_ADMIN') {
            alert('Access denied. Admin privileges required.');
            window.location.href = user.role === 'ROLE_USER' ? './user.html' : '../../index.html';
            return;
        }

        currentAdminUser = user;
        console.log('Admin access validated for:', user.fullName);

    } catch (error) {
        console.error('Error validating admin access:', error);
        alert('Authentication error. Please log in again.');
        clearAuthData();
        window.location.href = '../login.html';
    }
}



/**
 * Initialize user menu in header
 */
function initializeUserMenu() {
    const userMenuContainer = document.getElementById('adminUserMenu');
    if (currentAdminUser && userMenuContainer) {
        pupulateAdminUserMenu(userMenuContainer);
    }
}

/**
 * Populate admin user menu directly in the existing container
 * @param {HTMLElement} container - The adminUserMenu container element
 */
function pupulateAdminUserMenu(container) {
    // Create menu items for admin
    const menuItems = [
        '<a href="#" class="dropdown-item" id="adminProfileLink">Profile</a>',
        '<a href="#" class="dropdown-item" id="adminPurchasesLink">Purchases</a>', // This should be implemented
        '<a href="#" class="dropdown-item" id="adminLogoutLink">Logout</a>'
    ];

    container.innerHTML = `
        <div class="user-info">
            <div class="user-dropdown">
                <button class="btn btn-outline" id="adminMenuBtn">
                    <span class="user-role">Administrator ▼</span>
                </button>
                <div class="dropdown-menu" id="adminDropdown">
                    ${menuItems.join('')}
                </div>
            </div>
        </div>
    `;

    // Add event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
        setupUserMenuEvents();
    }, 0);
}

/**
 * Setup user menu event listeners
 */
function setupUserMenuEvents() {
    const menuBtn = document.getElementById('adminMenuBtn');
    const dropdown = document.getElementById('adminDropdown');
    const logoutLink = document.getElementById('adminLogoutLink');

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

    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            handleAdminLogout();
        });
    }
}

/**
 * Setup additional event listeners
 */
function setupAdminEventListeners() {
    // Add Material button
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', function () {
            alert('Add Material functionality will be implemented here.');
        });
    }
}

/**
 * Handle admin logout
 */
async function handleAdminLogout() {
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
            window.location.href = '../../login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Clear data and redirect anyway
        clearAuthData();
        window.location.href = '../../login.html';
    }
}



/**
 * Load and display materials
 */
async function loadMaterials() {
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const materialsList = document.getElementById('materialsList');

    try {
        // Show loading state
        loadingMessage.style.display = 'block';
        errorMessage.classList.add('hidden');
        materialsList.classList.add('hidden');

        // Fetch materials from API
        const response = await authenticatedFetch('http://localhost:8080/api/materials');

        if (!response || !response.ok) {
            throw new Error('Failed to fetch materials');
        }
        const materials = await response.json();
        console.log('Fetched materials:', materials);

        // Sort materials by ID in descending order
        materials.sort((a, b) => b.id - a.id);

        // Display materials
        displayMaterials(materials);

        // Hide loading, show materials
        loadingMessage.style.display = 'none';
        materialsList.classList.remove('hidden');

    } catch (error) {
        console.error('Error loading materials:', error);

        // Show error state
        loadingMessage.style.display = 'none';
        errorMessage.classList.remove('hidden');
    }
}

/**
 * Display materials in the list
 * @param {Array} materials - Array of material objects
 */
function displayMaterials(materials) {
    const materialsList = document.getElementById('materialsList');

    if (materials.length === 0) {
        materialsList.innerHTML = `
            <div class="empty-state">
                <p>No materials found. Add your first material using the "Add Material" button.</p>
            </div>
        `;
        return;
    }

    // Create header
    const headerHTML = `
        <div class="materials-header">
            <div>ID</div>
            <div>Title</div>
            <div>University</div>
            <div>Course Module</div>
            <div>Price</div>
            <div>Uploaded Date</div>
            <div>Actions</div>
        </div>
    `;

    // Create material items
    const materialsHTML = materials.map(material => `
        <div class="material-item" data-material-id="${material.id}">
            <div class="material-id">#${material.id}</div>
            <div class="material-title">${escapeHtml(material.title || 'Untitled')}</div>
            <div class="material-university">${escapeHtml(material.university || 'N/A')}</div>
            <div class="material-course">${escapeHtml(material.courseModule || 'N/A')}</div>
            <div class="material-price">$${(material.price || 0).toFixed(2)}</div>
            <div class="material-date">${new Date(material.uploadedAt).toLocaleDateString()}</div>
            <div style="display: flex; gap: 5px;">
                <div class="material-actions">
                    <button class="btn btn-small btn-info" onclick="showMaterialInfo(${material.id})">
                    More Info
                    </button>
                </div>
            <div class="material-actions">
            <button class="btn btn-small btn-edit" onclick="editMaterial(${material.id})">
            Edit
            </button>
            </div>
            </div>
        </div>
    `).join('');

    materialsList.innerHTML = headerHTML + materialsHTML;
}

/**
 * Show material info (placeholder for now)
 * @param {number} materialId - ID of the material
 */
function showMaterialInfo(materialId) {
    alert(`Material Info functionality will be implemented soon.\nMaterial ID: ${materialId}`);
}

/**
 * Edit material (placeholder for now)
 * @param {number} materialId - ID of the material
 */
function editMaterial(materialId) {
    alert(`Edit Material functionality will be implemented soon.\nMaterial ID: ${materialId}`);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
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
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers || {})
    };

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