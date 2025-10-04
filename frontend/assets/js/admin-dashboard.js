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
    initializeAddMaterialModal();
    loadMaterials();
    console.log('Admin dashboard initialized');
}

/**
 * Initialize add material modal functionality
 */
function initializeAddMaterialModal() {
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const addMaterialModal = document.getElementById('addMaterialModal');
    const addModalClose = document.getElementById('addModalClose');
    const clearBtn = document.getElementById('clearBtn');
    const addMaterialFormBtn = document.getElementById('addMaterialFormBtn');
    
    if (addMaterialBtn && addMaterialModal) {
        addMaterialBtn.addEventListener('click', showAddMaterialModal);
    }
    
    if (addModalClose) {
        addModalClose.addEventListener('click', closeAddMaterialModal);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAddMaterialForm);
    }
    
    if (addMaterialFormBtn) {
        addMaterialFormBtn.addEventListener('click', submitAddMaterial);
    }
    
    // Close modal when clicking overlay
    if (addMaterialModal) {
        addMaterialModal.addEventListener('click', (e) => {
            if (e.target === addMaterialModal) {
                closeAddMaterialModal();
            }
        });
    }
    
    console.log('Add material modal initialized');
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
        console.log('Admin access validated for:', currentAdminUser.fullName);

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
    // currentAdminUser is a global variable set during validation
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
        '<a href="#" class="dropdown-item" id="adminProfileLink">Profile</a>', // This should link to the admin profile page
        '<a href="#" class="dropdown-item" id="usersLink">Users</a>', // This should link to the users page
        '<a href="#" class="dropdown-item" id="adminPurchasesLink">Purchases</a>', // This should link to the purchases page
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
    console.log("User menu events set up");
}

/**
 * Setup additional event listeners
 */
function setupAdminEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('searchMaterialsBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    const searchInput = document.getElementById('materialSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Modal close listeners
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('materialModal');

    if (modalClose) {
        modalClose.addEventListener('click', closeMaterialModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                closeMaterialModal();
            }
        });
    }

    // ESC key to close modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeMaterialModal();
        }
    });

    console.log('Admin event listeners set up');
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
 * Perform search action 
 */
function performSearch() {
    console.log('Performing search...');
    alert('💩');
    // Implement search functionality
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
            <div>Price (Rs.)</div>
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
            <div class="material-price">${(material.price || 0).toFixed(2)}</div>
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

    console.log("Materials list updated");
}

/**
 * Show material info in modal
 * @param {number} materialId - ID of the material
 */
async function showMaterialInfo(materialId) {
    try {
        // Fetch material details
        const response = await authenticatedFetch(`http://localhost:8080/api/materials/${materialId}`);

        if (!response || !response.ok) {
            throw new Error('Failed to fetch material details');
        }

        const material = await response.json();
        // console.log(JSON.stringify(material));
        openMaterialModal(material, 'view');

    } catch (error) {
        console.error('Error fetching material info:', error);
        alert('Failed to load material information. Please try again.');
    }
}

/**
 * Edit material - opens modal in edit mode
 * @param {number} materialId - ID of the material
 */
async function editMaterial(materialId) {
    try {
        // Fetch material details
        const response = await authenticatedFetch(`http://localhost:8080/api/materials/${materialId}`);

        if (!response || !response.ok) {
            throw new Error('Failed to fetch material details');
        }

        const material = await response.json();
        openMaterialModal(material, 'edit');

    } catch (error) {
        console.error('Error fetching material for editing:', error);
        alert('Failed to load material for editing. Please try again.');
    }
}

/**
 * Open material modal
 * @param {Object} material - Material object
 * @param {string} mode - 'view' or 'edit'
 */
function openMaterialModal(material, mode = 'view') {
    const modal = document.getElementById('materialModal');

    // Populate modal content
    populateModalContent(material, mode);

    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Close material modal
 */
function closeMaterialModal() {
    const modal = document.getElementById('materialModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

/**
 * Populate modal content
 * @param {Object} material - Material object
 * @param {string} mode - 'view' or 'edit'
 */
function populateModalContent(material, mode) {
    // Populate header
    const titleElement = document.getElementById('modalMaterialTitle');
    const priceElement = document.getElementById('modalMaterialPrice');

    titleElement.textContent = `#${material.id} | ${material.title || 'Untitled'}`;
    priceElement.textContent = `Rs. ${(material.price || 0).toFixed(2)}`;

    // Populate PDF preview
    populatePDFPreview(material);

    // Populate details section
    populateDetailsSection(material, mode);

    // Populate actions
    populateModalActions(material, mode);
}

/**
 * Populate PDF preview section
 * @param {Object} material - Material object
 */
function populatePDFPreview(material) {
    const pdfPreview = document.getElementById('pdfPreview');
    const downloadBtn = document.getElementById('downloadBtn');

    if (material.filename) {
        // Create PDF iframe
        // encodeURIComponent() : Encodes all special characters to URL - safe format
        pdfPreview.innerHTML = `
            <iframe 
                class="pdf-iframe" 
                src="../../../backend/OnlineBookStore/uploads/${encodeURIComponent(material.filename)}"
                title="Material Preview">
            </iframe>
        `;

        // Setup download button
        downloadBtn.onclick = () => downloadMaterial(material.id, material.filename);
    } else {
        // Show placeholder
        pdfPreview.innerHTML = `
            <div class="pdf-placeholder">
                <div class="pdf-placeholder-icon">📄</div>
                <p>No file available for preview</p>
            </div>
        `;

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'No file to download';
    }
}

/**
 * Populate details section
 * @param {Object} material - Material object
 * @param {string} mode - 'view' or 'edit'
 */
function populateDetailsSection(material, mode) {
    const detailsContainer = document.getElementById('materialDetailsContainer');

    const fields = [
        { key: 'title', label: 'Title', value: material.title || '' },
        { key: 'price', label: 'Price (Rs.)', value: material.price || '' },
        { key: 'university', label: 'University', value: material.university || '' },
        { key: 'faculty', label: 'Faculty', value: material.faculty || '' },
        { key: 'courseModule', label: 'Course Module', value: material.courseModule || '' },
        { key: 'studentYear', label: 'Student Year', value: material.studentYear || '' },
        { key: 'filename', label: 'File Name', value: material.filename || 'No file' }
    ];

    let detailsHTML = '';

    // Add fields in view or edit mode
    fields.forEach(field => {
        if (mode === 'edit' && field.key !== 'filename') {
            const inputType = field.key === 'price' ? 'number' : 'text';
            const inputAttrs = field.key === 'price' ? 'step="0.01" min="0"' : '';
            detailsHTML += `
                <div class="detail-group">
                    <div class="detail-label">${field.label}</div>
                    <input type="${inputType}" class="detail-value editable" 
                           id="edit_${field.key}" 
                           value="${escapeHtml(field.value)}"
                           ${inputAttrs}
                           ${field.key === 'title' ? 'data-required="true"' : ''}>
                </div>
            `;
        } else {
            detailsHTML += `
                <div class="detail-group">
                    <div class="detail-label">${field.label}</div>
                    <div class="detail-value">${field.value}</div>
                    <!-- <div class="detail-value">${escapeHtml(field.value)}</div> -->
                </div>
            `;
        }
    });

    // Add file upload section for edit mode
    if (mode === 'edit') {
        detailsHTML += `
            <div class="detail-group">
                <div class="detail-label">Update File (Optional)</div>
                <div class="file-upload-section" id="fileUploadSection">
                    <input type="file" id="materialFile" class="file-input" accept=".pdf">
                    <button type="button" class="btn file-upload-btn" onclick="document.getElementById('materialFile').click()">
                        Choose File
                    </button>
                    <div class="file-info" id="fileInfo">
                        <div class="current-file">Current: ${material.filename || 'No file'}</div>
                    </div>
                </div>
            </div>
        `;
    }
    detailsContainer.innerHTML = detailsHTML;

    // Add file change listener for edit mode
    if (mode === 'edit') {
        const fileUploadSection = document.getElementById('fileUploadSection');
        const fileInput = document.getElementById('materialFile');
        const fileInfo = document.getElementById('fileInfo');

        fileInput.addEventListener('change', function () {
            if (this.files.length > 0) {
                const file = this.files[0];
                fileUploadSection.classList.add('has-file');
                fileInfo.innerHTML = `<div class="current-file">Selected: ${file.name}</div>`;
            } else {
                fileUploadSection.classList.remove('has-file');
                fileInfo.innerHTML = `<div class="current-file">Current: ${material.filename || 'No file'}</div>`;
            }
        });
    }
}

/**
 * Populate modal actions
 * @param {Object} material - Material object
 * @param {string} mode - 'view' or 'edit'
 */
function populateModalActions(material, mode) {
    const actionsContainer = document.getElementById('modalActions');

    if (mode === 'edit') {
        actionsContainer.innerHTML = `
            <button class="btn btn-cancel" onclick="openMaterialModal(${JSON.stringify(material).replace(/"/g, '&quot;')}, 'view')">
                Cancel
            </button>
            <button class="btn btn-save" onclick="saveMaterial(${material.id})">
                Save Changes
            </button>
        `;
    } else {
        actionsContainer.innerHTML = `
            <button class="btn btn-delete" onclick="deleteMaterial(${material.id})">
                Delete
            </button>
            <button class="btn btn-edit" onclick="openMaterialModal(${JSON.stringify(material).replace(/"/g, '&quot;')}, 'edit')">
                Edit
            </button>
        `;
    }
}

/**
 * Save material changes
 * @param {number} materialId - ID of the material to save
 */
async function saveMaterial(materialId) {
    try {
        // Collect form data
        const formData = new FormData();

        // Get file input
        const fileInput = document.getElementById('materialFile');
        if (fileInput && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        // Collect material metadata
        const metadata = {
            title: document.getElementById('edit_title')?.value || '',
            price: parseFloat(document.getElementById('edit_price')?.value) || 0,
            university: document.getElementById('edit_university')?.value || '',
            faculty: document.getElementById('edit_faculty')?.value || '',
            courseModule: document.getElementById('edit_courseModule')?.value || '',
            studentYear: document.getElementById('edit_studentYear')?.value || ''
        };

        // Validate required fields
        if (!metadata.title.trim()) {
            alert('Title is required');
            return;
        }

        // Add metadata as JSON string
        formData.append('metadata', JSON.stringify(metadata));

        // Send update request
        const response = await fetch(`http://localhost:8080/api/admin/materials/${materialId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`${errorData.error}. Please try again.`);
            return;
        }

        const updatedMaterial = await response.json();
        console.log(updatedMaterial);

        // Show success message
        alert('Material updated successfully!');

        // Close modal and refresh list
        closeMaterialModal();
        loadMaterials();

    } catch (error) {
        console.error('Error saving material:', error);
        alert('Failed to save material changes. Please try again.');
    }
}

/**
 * Delete material
 * @param {number} materialId - ID of the material to delete
 */
async function deleteMaterial(materialId) {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await authenticatedFetch(`http://localhost:8080/api/admin/materials/${materialId}`, {
            method: 'DELETE'
        });

        if (!response || !response.ok) {
            throw new Error('Failed to delete material');
        }

        // Show success message
        alert('Material deleted successfully!');

        // Close modal and refresh list
        closeMaterialModal();
        loadMaterials();

    } catch (error) {
        console.error('Error deleting material:', error);
        alert('Failed to delete material. Please try again.');
    }
}

/**
 * Download material file
 * @param {number} materialId - ID of the material
 * @param {string} filename - Name of the file
 */
async function downloadMaterial(materialId, filename) {
    try {
        const response = await authenticatedFetch(`http://localhost:8080/api/materials/${materialId}/download`);

        if (!response || !response.ok) {
            throw new Error('Failed to download material');
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `material-${materialId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Error downloading material:', error);
        alert('Failed to download material. Please try again.');
    }
}

/**
 * 'escapeHtml()' is a function that prevents Cross - Site Scripting(XSS) attacks by converting
 *   potentially dangerous HTML characters into safe HTML entities.
 *     -> Prevents attackers from injecting malicious scripts into web pages viewed by other users.
 *     -> Use it to sanitize any user - generated content before inserting it into the DOM.
 *     -> Use with innerHTML or template literals that render to DOM.
 * @param {any} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    // Handle null, undefined, or empty values
    if (text === null || text === undefined) return '';

    // Convert to string first (handles numbers, booleans, etc.)
    const str = String(text);

    // If it's an empty string, return it
    if (str === '') return '';

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function (m) { return map[m]; });
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
 * Show add material modal
 */
function showAddMaterialModal() {
    const addMaterialModal = document.getElementById('addMaterialModal');
    const addMaterialFormContent = document.getElementById('addMaterialFormContent');
    
    // Generate form HTML
    const formHTML = generateAddMaterialForm();
    addMaterialFormContent.innerHTML = formHTML;
    
    // Initialize file upload functionality
    initializeFileUpload();
    
    // Show modal
    addMaterialModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    console.log('Add material modal opened');
}

/**
 * Close add material modal
 */
function closeAddMaterialModal() {
    const addMaterialModal = document.getElementById('addMaterialModal');
    
    addMaterialModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    console.log('Add material modal closed');
}

/**
 * Generate add material form HTML
 * @returns {string} Form HTML
 */
function generateAddMaterialForm() {
    return `
        <div class="form-group">
            <label for="amfTitle">Title <span class="required-star">*</span></label>
            <input type="text" id="amfTitle" name="title" required placeholder="Enter material title">
            <div class="form-error-message" id="titleError">Title is required</div>
        </div>
        
        <div class="form-group">
            <label for="amfUniversity">University <span class="required-star">*</span></label>
            <input type="text" id="amfUniversity" name="university" required placeholder="Enter university name">
            <div class="form-error-message" id="universityError">University is required</div>
        </div>
        
        <div class="form-group">
            <label for="amfFaculty">Faculty <span class="required-star">*</span></label>
            <input type="text" id="amfFaculty" name="faculty" required placeholder="Enter faculty">
            <div class="form-error-message" id="facultyError">Faculty is required</div>
        </div>

        <div class="form-group">
            <label for="amfCourseModule">Course Module <span class="required-star">*</span></label>
            <input type="text" id="amfCourseModule" name="courseModule" required placeholder="Enter course module">
            <div class="form-error-message" id="courseModuleError">Course module is required</div>
        </div>

        <div class="form-group">
            <label for="amfStudentYear">Student Year <span class="required-star">*</span></label>
            <input type="number" id="amfStudentYear" name="studentYear" min="1" step="1" max="4" required placeholder="Enter student year">
            <div class="form-error-message" id="studentYearError">Student year is required</div>
        </div>
        
        <div class="form-group">
            <label for="amfPrice">Price <span class="required-star">*</span></label>
            <input type="number" id="amfPrice" name="price" step="0.01" min="0" required placeholder="Enter price">
            <div class="form-error-message" id="priceError">Valid price is required</div>
        </div>

        <div class="form-group">
            <label for="amfFile">PDF File <span class="required-star">*</span></label>
            <div class="add-file-upload" id="fileUploadArea">
                <input type="file" id="amfFile" name="file" accept=".pdf" style="display: none;" required>
                <div class="file-upload-area">
                    <div class="file-upload-icon">📄</div>
                    <div class="file-upload-text">
                        <strong>Click to upload PDF</strong> or drag and drop
                    </div>
                    <div class="file-selected-text" id="selectedFileName" style="display: none;"></div>
                </div>
            </div>
            <div class="form-error-message" id="fileError">PDF file is required</div>
        </div>

        <div class="form-group">
            <small><span class="required-star">* Required fields</span></small>
        </div>
    `;
}

/**
 * Initialize file upload functionality
 */
function initializeFileUpload() {
    const fileInput = document.getElementById('amfFile');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const selectedFileName = document.getElementById('selectedFileName');
    const fileUploadText = fileUploadArea.querySelector('.file-upload-text');
    
    // Click to upload
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });
    
    // Drag and drop functionality
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                fileInput.files = files;
                handleFileSelection(file);
            } else {
                alert('Please select a PDF file.');
            }
        }
    });
    
    function handleFileSelection(file) {
        fileUploadArea.classList.add('has-file');
        fileUploadText.style.display = 'none';
        selectedFileName.textContent = `Selected: ${file.name}`;
        selectedFileName.style.display = 'block';
        
        // Clear error if exists
        const fileError = document.getElementById('fileError');
        if (fileError) {
            fileError.style.display = 'none';
        }
    }
}

/**
 * Clear add material form
 */
function clearAddMaterialForm() {
    const form = document.getElementById('addMaterialFormContent');
    const inputs = form.querySelectorAll('input');
    
    inputs.forEach(input => {
        if (input.type === 'file') {
            input.value = '';
            // Reset file upload area
            const fileUploadArea = document.getElementById('fileUploadArea');
            const selectedFileName = document.getElementById('selectedFileName');
            const fileUploadText = fileUploadArea.querySelector('.file-upload-text');
            
            fileUploadArea.classList.remove('has-file');
            selectedFileName.style.display = 'none';
            fileUploadText.style.display = 'block';
        } else {
            input.value = '';
        }
    });
    
    // Clear all error messages
    const errorMessages = form.querySelectorAll('.form-error-message');
    errorMessages.forEach(error => {
        error.style.display = 'none';
    });
    
    console.log('Add material form cleared');
}

/**
 * Submit add material form
 */
async function submitAddMaterial() {
    const form = document.getElementById('addMaterialFormContent');
    
    // Validate form
    if (!validateAddMaterialForm()) {
        return;
    }

    // Create metadata object
    const metadata = {
        title: document.getElementById('amfTitle').value.trim(),
        university: document.getElementById('amfUniversity').value.trim(),
        faculty: document.getElementById('amfFaculty').value.trim(),
        courseModule: document.getElementById('amfCourseModule').value.trim(),
        studentYear: document.getElementById('amfStudentYear').value.trim(),
        price: document.getElementById('amfPrice').value
    };

    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    const fileInput = document.getElementById('amfFile');
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    try {
        // Show loading state
        const addBtn = document.getElementById('addMaterialFormBtn');
        const originalText = addBtn.textContent;
        addBtn.disabled = true;
        addBtn.textContent = 'Adding Material...';

        const response = await authenticatedFetch('http://localhost:8080/api/admin/materials', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            console.log(response)
            const errorData = await response.json();
            alert(`${errorData.error}. Please try again.`);
            return;
        }

        if (response && response.ok) {
            const result = await response.json();
            alert('Material added successfully!');
            closeAddMaterialModal();
            loadMaterials(); // Refresh the materials list
        } else {
            throw new Error('Failed to add material');
        }
        
    } catch (error) {
        console.error('Error adding material:', error);
        alert('Error adding material. Please try again.');
    } finally {
        // Reset button
        const addBtn = document.getElementById('addMaterialFormBtn');
        addBtn.disabled = false;
        addBtn.textContent = 'Add Material';
    }
}

/**
 * Validate add material form
 * @returns {boolean} True if valid, false otherwise
 */
function validateAddMaterialForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        { id: 'amfTitle', errorId: 'titleError', message: 'Title is required' },
        { id: 'amfUniversity', errorId: 'universityError', message: 'University is required' },
        { id: 'amfFaculty', errorId: 'facultyError', message: 'Faculty is required' },
        { id: 'amfCourseModule', errorId: 'courseModuleError', message: 'Course module is required' },
        { id: 'amfStudentYear', errorId: 'studentYearError', message: 'Student year is required' },
        { id: 'amfPrice', errorId: 'priceError', message: 'Valid price is required' },
        { id: 'amfFile', errorId: 'fileError', message: 'PDF file is required' }
    ];
    
    // Clear all errors first
    requiredFields.forEach(field => {
        const errorEl = document.getElementById(field.errorId);
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    });
    
    // Validate each field
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorEl = document.getElementById(field.errorId);
        
        if (input && errorEl) {
            let fieldValid = true;
            
            if (input.type === 'file') {
                fieldValid = input.files && input.files.length > 0;
            } else {
                fieldValid = input.value.trim() !== '';
            }
            
            // Additional validation for price
            if (field.id === 'amfPrice' && fieldValid) {
                const price = parseFloat(input.value);
                fieldValid = !isNaN(price) && price >= 0;
            }
            
            if (!fieldValid) {
                errorEl.textContent = field.message;
                errorEl.style.display = 'block';
                input.classList.add('required');
                isValid = false;
            } else {
                input.classList.remove('required');
            }
        }
    });
    
    return isValid;
}