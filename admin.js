// Configuración
const ADMIN_PASSWORD = "admin123"; // Contraseña para acceder al panel (cámbiala por una segura)
const STORAGE_KEY = "catalogProducts"; // Clave para localStorage

// Variables globales
let products = [];
let isEditing = false;
let currentProductId = null;

// Elementos DOM
const loginContainer = document.getElementById('login-container');
const adminPanel = document.getElementById('admin-panel');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const productsTableBody = document.getElementById('products-table-body');
const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const productIdInput = document.getElementById('product-id');
const productTitleInput = document.getElementById('product-title');
const productCategoryInput = document.getElementById('product-category');
const productDescriptionInput = document.getElementById('product-description');
const productPriceInput = document.getElementById('product-price');
const productImageInput = document.getElementById('product-image');
const saveButton = document.getElementById('save-btn');
const cancelButton = document.getElementById('cancel-btn');
const productSearch = document.getElementById('product-search');
const searchProductBtn = document.getElementById('search-product-btn');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');

// Inicialización
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Verificar si ya hay una sesión activa
    checkSession();
    
    // Cargar productos
    loadProducts();
    
    // Event listeners
    loginButton.addEventListener('click', login);
    logoutButton.addEventListener('click', logout);
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    productForm.addEventListener('submit', saveProduct);
    cancelButton.addEventListener('click', resetForm);
    searchProductBtn.addEventListener('click', searchProducts);
    productSearch.addEventListener('keyup', e => {
        if (e.key === 'Enter') searchProducts();
    });
    
    // Inicializar formulario
    resetForm();
}

// Funciones de autenticación
function login() {
    const password = passwordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        // Guardar sesión
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Mostrar panel de administración
        loginContainer.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        
        // Limpiar error y contraseña
        loginError.textContent = '';
        passwordInput.value = '';
    } else {
        loginError.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
    }
}

function logout() {
    // Eliminar sesión
    sessionStorage.removeItem('adminLoggedIn');
    
    // Mostrar login
    adminPanel.classList.add('hidden');
    loginContainer.classList.remove('hidden');
}

function checkSession() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    
    if (isLoggedIn) {
        loginContainer.classList.add('hidden');
        adminPanel.classList.remove('hidden');
    } else {
        loginContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
    }
}

// Funciones de navegación
function switchTab(tabId) {
    // Actualizar botones
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Actualizar contenido
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Si cambiamos a la pestaña de añadir y estábamos editando, resetear el formulario
    if (tabId === 'add-product' && !isEditing) {
        resetForm();
    }
}

// Funciones de gestión de productos
function loadProducts() {
    try {
        // Intentar cargar desde localStorage primero
        const storedProducts = localStorage.getItem(STORAGE_KEY);
        
        if (storedProducts) {
            products = JSON.parse(storedProducts);
            renderProductsTable();
            return;
        }
        
        // Si no hay productos en localStorage, cargar desde el archivo JSON
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                products = data;
                saveProductsToStorage();
                renderProductsTable();
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                showNotification('Error al cargar productos', true);
            });
    } catch (error) {
        console.error('Error al inicializar productos:', error);
        showNotification('Error al inicializar productos', true);
    }
}

function renderProductsTable(productsToRender = products) {
    productsTableBody.innerHTML = '';
    
    if (productsToRender.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">No hay productos para mostrar</td>`;
        productsTableBody.appendChild(emptyRow);
        return;
    }
    
    productsToRender.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.title}" class="product-image-cell"></td>
            <td>${product.title}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.price}</td>
            <td class="actions-cell">
                <button class="edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i> Editar</button>
                <button class="delete-btn" data-id="${product.id}"><i class="fas fa-trash"></i> Eliminar</button>
            </td>
        `;
        
        // Agregar event listeners a los botones
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => editProduct(product.id));
        deleteBtn.addEventListener('click', () => deleteProduct(product.id));
        
        productsTableBody.appendChild(row);
    });
}

function getCategoryName(categoryId) {
    switch(categoryId) {
        case 'categoria1':
            return 'Categoría 1';
        case 'categoria2':
            return 'Categoría 2';
        case 'categoria3':
            return 'Categoría 3';
        default:
            return 'Sin categoría';
    }
}

function saveProduct(e) {
    e.preventDefault();
    
    // Validar formulario
    if (!productForm.checkValidity()) {
        return;
    }
    
    // Obtener valores del formulario
    const productData = {
        title: productTitleInput.value,
        category: productCategoryInput.value,
        description: productDescriptionInput.value,
        price: productPriceInput.value,
        image: productImageInput.value
    };
    
    if (isEditing) {
        // Actualizar producto existente
        const index = products.findIndex(p => p.id === currentProductId);
        
        if (index !== -1) {
            productData.id = currentProductId;
            products[index] = productData;
            showNotification('Producto actualizado correctamente');
        }
    } else {
        // Añadir nuevo producto
        productData.id = generateProductId();
        products.push(productData);
        showNotification('Producto añadido correctamente');
    }
    
    // Guardar cambios y actualizar UI
    saveProductsToStorage();
    renderProductsTable();
    resetForm();
    switchTab('products-list');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Producto no encontrado', true);
        return;
    }
    
    // Cambiar a modo edición
    isEditing = true;
    currentProductId = productId;
    formTitle.textContent = 'Editar Producto';
    saveButton.textContent = 'Actualizar Producto';
    
    // Llenar formulario con datos del producto
    productIdInput.value = product.id;
    productTitleInput.value = product.title;
    productCategoryInput.value = product.category;
    productDescriptionInput.value = product.description;
    productPriceInput.value = product.price;
    productImageInput.value = product.image;
    
    // Cambiar a la pestaña de formulario
    switchTab('add-product');
}

function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }
    
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products.splice(index, 1);
        saveProductsToStorage();
        renderProductsTable();
        showNotification('Producto eliminado correctamente');
    } else {
        showNotification('Producto no encontrado', true);
    }
}

function resetForm() {
    // Resetear estado
    isEditing = false;
    currentProductId = null;
    formTitle.textContent = 'Añadir Nuevo Producto';
    saveButton.textContent = 'Guardar Producto';
    
    // Limpiar formulario
    productForm.reset();
    productIdInput.value = '';
    
    // Sugerir una imagen de placeholder
    productImageInput.value = 'https://via.placeholder.com/300x300?text=Nuevo+Producto';
}

function searchProducts() {
    const searchTerm = productSearch.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        renderProductsTable();
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        product.price.toLowerCase().includes(searchTerm) ||
        getCategoryName(product.category).toLowerCase().includes(searchTerm)
    );
    
    renderProductsTable(filteredProducts);
}

// Funciones de utilidad
function generateProductId() {
    // Encontrar el ID más alto y sumar 1
    if (products.length === 0) {
        return 1;
    }
    
    const maxId = Math.max(...products.map(p => p.id));
    return maxId + 1;
}

function saveProductsToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
        console.error('Error al guardar productos en localStorage:', error);
        showNotification('Error al guardar productos', true);
    }
}

function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    notification.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}