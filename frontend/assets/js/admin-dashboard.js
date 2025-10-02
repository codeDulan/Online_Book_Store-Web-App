/**
 * Admin Dashboard JavaScript for EDURA Online Book Store
 * Handles admin-specific functionality, authentication, and UI management
 */

// Global variables
let currentAdminUser = null;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
    setupAdminEventListeners();
    validateAdminAccess();
});

/**
 * Initialize admin dashboard functionality
 */
function initializeAdminDashboard() {
    initializeUserMenu();
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
        const userMenu = createAdminUserMenu();
        userMenuContainer.innerHTML = '';
        userMenuContainer.appendChild(userMenu);
    }
}

/**
 * Create admin user menu for logged-in admin
 * @returns {HTMLElement} User menu element
 */
function createAdminUserMenu() {
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    
    // Create menu items for admin
    const menuItems = [
        '<a href="#" class="dropdown-item" id="adminProfileLink">Profile</a>',
        '<a href="#" class="dropdown-item" id="adminSettingsLink">Settings</a>',
        '<a href="../../index.html" class="dropdown-item">Back to Site</a>',
        '<a href="#" class="dropdown-item" id="adminLogoutLink">Logout</a>'
    ];
    
    userMenu.innerHTML = `
        <div class="user-info">
            <span class="user-name">Admin: ${currentAdminUser.fullName}</span>
            <span class="user-role">Administrator</span>
            <div class="user-dropdown">
                <button class="btn btn-outline" id="adminMenuBtn">
                    Account ▼
                </button>
                <div class="dropdown-menu" id="adminDropdown">
                    ${menuItems.join('')}
                </div>
            </div>
        </div>
    `;

    // Add styles for admin user menu
    const style = document.createElement('style');
    style.textContent = `
        .user-menu {
            position: relative;
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
        }
        
        .user-name {
            font-size: var(--font-size-small);
            color: var(--text);
            font-weight: var(--font-weight-medium);
            margin-right: var(--spacing-xs);
        }
        
        .user-role {
            font-size: var(--font-size-xs);
            color: var(--primary);
            background-color: var(--primary-light, #e3f2fd);
            padding: 2px 6px;
            border-radius: var(--radius-sm);
            font-weight: var(--font-weight-medium);
            margin-right: var(--spacing-sm);
        }
        
        .user-dropdown {
            position: relative;
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            min-width: 150px;
            display: none;
            z-index: 1000;
        }
        
        .dropdown-menu.show {
            display: block;
        }
        
        .dropdown-item {
            display: block;
            padding: var(--spacing-sm) var(--spacing-md);
            color: var(--text);
            text-decoration: none;
            transition: background-color var(--transition-fast);
        }
        
        .dropdown-item:hover {
            background-color: var(--light-gray);
        }
    `;
    
    if (!document.getElementById('adminUserMenuStyles')) {
        style.id = 'adminUserMenuStyles';
        document.head.appendChild(style);
    }

    // Add event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
        setupUserMenuEvents();
    }, 0);

    return userMenu;
}

/**
 * Setup user menu event listeners
 */
function setupUserMenuEvents() {
    const menuBtn = document.getElementById('adminMenuBtn');
    const dropdown = document.getElementById('adminDropdown');
    const logoutLink = document.getElementById('adminLogoutLink');

    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdown.classList.remove('show');
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
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
        addMaterialBtn.addEventListener('click', function() {
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