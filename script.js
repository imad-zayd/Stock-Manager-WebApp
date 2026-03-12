// State Management
let currentPage = 'dashboard';
let products = [];
let clients = [];
let deleteProductId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadPage('dashboard');
    setupEventListeners();
});

function loadData() {
    // Load products from localStorage
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        products = [];
    }

    // Load clients from localStorage
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
        clients = JSON.parse(savedClients);
    } else {
        clients = [];
    }
}

function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('clients', JSON.stringify(clients));
}

function setupEventListeners() {
    // Menu navigation
    document.querySelectorAll('.menu ul li a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            setActiveLink(link);
            loadPage(page);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Product form submit
    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });

    // Client form submit
    document.getElementById('clientForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveClient();
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Confirm delete button
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (deleteProductId) {
            deleteProduct(deleteProductId);
            closeDeleteModal();
        }
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function setActiveLink(activeLink) {
    document.querySelectorAll('.menu ul li a').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function loadPage(page) {
    currentPage = page;
    
    switch(page) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'products':
            renderProducts();
            break;
        case 'clients':
            renderClients();
            break;
        case 'orders':
            renderOrders();
            break;
        case 'analytics':
            renderAnalytics();
            break;
        case 'settings':
            renderSettings();
            break;
        default:
            renderDashboard();
    }
}

function renderDashboard() {
    const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.count), 0);
    const totalProducts = products.length;
    const totalClients = clients.length;
    const lowStock = products.filter(p => p.count < 10).length;

    const html = `
        <div class="section-header">
            <p>dashboard overview</p>
            <i class="fas fa-chart-bar"></i>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="stat-info">
                    <h3>Total Products</h3>
                    <span>${totalProducts}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3>Total Clients</h3>
                    <span>${totalClients}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-info">
                    <h3>Revenue</h3>
                    <span>$${totalRevenue.toFixed(2)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-info">
                    <h3>Low Stock</h3>
                    <span>${lowStock}</span>
                </div>
            </div>
        </div>

        <div class="section-header" style="margin-top: 30px;">
            <p>recent products</p>
            <button class="add-btn" onclick="openProductModal()">
                <i class="fas fa-plus"></i> Add Product
            </button>
        </div>

        ${products.length === 0 ? `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No Products Yet</h3>
                <p>Click the "Add Product" button to create your first product</p>
                <button class="add-btn" onclick="openProductModal()" style="margin: 0 auto;">
                    <i class="fas fa-plus"></i> Add Your First Product
                </button>
            </div>
        ` : `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Total Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.slice(0, 5).map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td><span class="category-badge">${product.category}</span></td>
                                <td><span class="price-badge">$${product.price.toFixed(2)}</span></td>
                                <td><span class="count-badge">${product.count}</span></td>
                                <td>$${(product.price * product.count).toFixed(2)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="action-btn delete-btn" onclick="openDeleteModal(${product.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${products.length > 5 ? `
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="#" onclick="loadPage('products'); return false;" style="color: var(--primary);">
                            View all ${products.length} products <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                ` : ''}
            </div>
        `}
    `;
    
    document.getElementById('mainContent').innerHTML = html;
}

function renderProducts() {
    const html = `
        <div class="section-header">
            <p>products management</p>
            <i class="fas fa-box"></i>
        </div>

        <div class="action-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Search products by name or category..." onkeyup="searchProducts()">
            </div>
            <button class="add-btn" onclick="openProductModal()">
                <i class="fas fa-plus"></i> Add New Product
            </button>
        </div>

        ${products.length === 0 ? `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No Products Added Yet</h3>
                <p>Start by adding your first product to the inventory</p>
                <button class="add-btn" onclick="openProductModal()" style="margin: 0 auto;">
                    <i class="fas fa-plus"></i> Add Your First Product
                </button>
            </div>
        ` : `
            <div class="table-container">
                <table id="productsTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Total Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>#${product.id}</td>
                                <td>${product.name}</td>
                                <td><span class="category-badge">${product.category}</span></td>
                                <td><span class="price-badge">$${product.price.toFixed(2)}</span></td>
                                <td><span class="count-badge">${product.count}</span></td>
                                <td>$${(product.price * product.count).toFixed(2)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="action-btn delete-btn" onclick="openDeleteModal(${product.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `}
    `;
    
    document.getElementById('mainContent').innerHTML = html;
}

function renderClients() {
    const html = `
        <div class="section-header">
            <p>clients management</p>
            <i class="fas fa-user-group"></i>
        </div>

        <div class="action-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="clientSearchInput" placeholder="Search clients..." onkeyup="searchClients()">
            </div>
            <button class="add-btn" onclick="openClientModal()">
                <i class="fas fa-plus"></i> Add New Client
            </button>
        </div>

        ${clients.length === 0 ? `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No Clients Added Yet</h3>
                <p>Start by adding your first client</p>
                <button class="add-btn" onclick="openClientModal()" style="margin: 0 auto;">
                    <i class="fas fa-plus"></i> Add Your First Client
                </button>
            </div>
        ` : `
            <div class="table-container">
                <table id="clientsTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.map(client => `
                            <tr>
                                <td>#${client.id}</td>
                                <td>${client.name}</td>
                                <td>${client.email}</td>
                                <td>${client.phone}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn delete-btn" onclick="deleteClient(${client.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `}
    `;
    
    document.getElementById('mainContent').innerHTML = html;
}

function renderOrders() {
    const html = `
        <div class="section-header">
            <p>orders management</p>
            <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="empty-state">
            <i class="fas fa-shopping-cart"></i>
            <h3>No Orders Yet</h3>
            <p>Orders will appear here once clients make purchases</p>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
}

function renderAnalytics() {
    const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.count), 0);
    
    const html = `
        <div class="section-header">
            <p>analytics</p>
            <i class="fas fa-chart-pie"></i>
        </div>
        
        ${products.length === 0 ? `
            <div class="empty-state">
                <i class="fas fa-chart-line"></i>
                <h3>No Data to Analyze</h3>
                <p>Add some products to see analytics</p>
                <button class="add-btn" onclick="openProductModal()" style="margin: 0 auto;">
                    <i class="fas fa-plus"></i> Add Products
                </button>
            </div>
        ` : `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Total Revenue</h3>
                        <span>$${totalRevenue.toFixed(2)}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Average Product Price</h3>
                        <span>$${(totalRevenue / products.length).toFixed(2)}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Total Items in Stock</h3>
                        <span>${products.reduce((sum, p) => sum + p.count, 0)}</span>
                    </div>
                </div>
            </div>
        `}
    `;
    document.getElementById('mainContent').innerHTML = html;
}

function renderSettings() {
    const html = `
        <div class="section-header">
            <p>settings</p>
            <i class="fas fa-cog"></i>
        </div>
        <div class="table-container">
            <h3 style="margin-bottom: 20px;">Profile Settings</h3>
            <form onsubmit="saveSettings(event)">
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Username</label>
                    <input type="text" value="imad zayd" placeholder="Enter username">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <input type="email" value="imad@example.com" placeholder="Enter email">
                </div>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
            
            <div style="margin-top: 40px;">
                <h3 style="margin-bottom: 20px;">Data Management</h3>
                <button class="btn btn-danger" onclick="clearAllData()">
                    <i class="fas fa-trash"></i> Clear All Data
                </button>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
}

// Product CRUD Operations
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            modalTitle.textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCount').value = product.count;
            document.getElementById('productCategory').value = product.category;
        }
    } else {
        modalTitle.textContent = 'Add New Product';
        form.reset();
        document.getElementById('productId').value = '';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function saveProduct() {
    const id = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        count: parseInt(document.getElementById('productCount').value),
        category: document.getElementById('productCategory').value
    };

    if (id) {
        // Update existing product
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
            showToast('Product updated successfully!');
        }
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, ...productData });
        showToast('Product added successfully!');
    }

    saveData();
    closeModal();
    loadPage(currentPage);
}

function editProduct(id) {
    openProductModal(id);
}

function openDeleteModal(id) {
    deleteProductId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteProductId = null;
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    saveData();
    showToast('Product deleted successfully!');
    loadPage(currentPage);
}

// Client CRUD Operations
function openClientModal() {
    document.getElementById('clientModal').style.display = 'block';
}

function closeClientModal() {
    document.getElementById('clientModal').style.display = 'none';
    document.getElementById('clientForm').reset();
}

function saveClient() {
    const clientData = {
        id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value
    };

    clients.push(clientData);
    saveData();
    closeClientModal();
    showToast('Client added successfully!');
    loadPage('clients');
}

function deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        clients = clients.filter(c => c.id !== id);
        saveData();
        showToast('Client deleted successfully!');
        loadPage('clients');
    }
}

// Search functionality
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.category.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.querySelector('#productsTable tbody');
    if (tbody) {
        if (filteredProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        <i class="fas fa-search" style="font-size: 40px; color: var(--gray); margin-bottom: 10px;"></i>
                        <p>No products found matching "${searchTerm}"</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = filteredProducts.map(product => `
                <tr>
                    <td>#${product.id}</td>
                    <td>${product.name}</td>
                    <td><span class="category-badge">${product.category}</span></td>
                    <td><span class="price-badge">$${product.price.toFixed(2)}</span></td>
                    <td><span class="count-badge">${product.count}</span></td>
                    <td>$${(product.price * product.count).toFixed(2)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="openDeleteModal(${product.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
}

function searchClients() {
    const searchTerm = document.getElementById('clientSearchInput').value.toLowerCase();
    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm) || 
        c.email.toLowerCase().includes(searchTerm) ||
        c.phone.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.querySelector('#clientsTable tbody');
    if (tbody) {
        if (filteredClients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        <i class="fas fa-search" style="font-size: 40px; color: var(--gray); margin-bottom: 10px;"></i>
                        <p>No clients found matching "${searchTerm}"</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = filteredClients.map(client => `
                <tr>
                    <td>#${client.id}</td>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.phone}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn delete-btn" onclick="deleteClient(${client.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Logout handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        showToast('Logged out successfully!');
        setTimeout(() => {
            setActiveLink(document.querySelector('[data-page="dashboard"]'));
            loadPage('dashboard');
        }, 1500);
    }
}

// Settings save
function saveSettings(event) {
    event.preventDefault();
    showToast('Settings saved successfully!');
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
        products = [];
        clients = [];
        localStorage.removeItem('products');
        localStorage.removeItem('clients');
        showToast('All data cleared successfully!');
        loadPage('dashboard');
    }
}