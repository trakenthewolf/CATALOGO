// Variables globales
const productContainer = document.getElementById('product-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const categoryFilters = document.querySelectorAll('.category-filter');
const modal = document.getElementById('product-modal');
const closeModal = document.querySelector('.close-modal');
const whatsappNumber = '2616012677';
const STORAGE_KEY = 'catalogProducts';

// Cargar productos desde el archivo JSON
let products = [];

// Función para cargar los productos
async function loadProducts() {
    try {
        // 1) Intentar cargar desde localStorage (para reflejar cambios del panel admin)
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                products = parsed;
                renderProducts(products);
                return;
            }
        }

        // 2) Si no hay datos en localStorage, intentar cargar desde products.json
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Respuesta no OK al cargar products.json');
        products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        // 3) Cargar productos de ejemplo si hay error
        loadSampleProducts();
    }
}

// Función para cargar productos de ejemplo en caso de error
function loadSampleProducts() {
    products = [
        {
            id: 1,
            title: "Producto 1",
            category: "categoria1",
            description: "Este es un producto de ejemplo con una descripción detallada. Incluye características y beneficios del producto.",
            price: "$1,500",
            image: "https://via.placeholder.com/300x300?text=Producto+1"
        },
        {
            id: 2,
            title: "Producto 2",
            category: "categoria1",
            description: "Descripción detallada del producto 2. Este producto tiene características únicas que lo hacen especial.",
            price: "$2,200",
            image: "https://via.placeholder.com/300x300?text=Producto+2"
        },
        {
            id: 3,
            title: "Producto 3",
            category: "categoria2",
            description: "El producto 3 es ideal para quienes buscan calidad y durabilidad. Fabricado con los mejores materiales.",
            price: "$1,800",
            image: "https://via.placeholder.com/300x300?text=Producto+3"
        },
        {
            id: 4,
            title: "Producto 4",
            category: "categoria2",
            description: "Un producto versátil que se adapta a diferentes necesidades. Perfecto para uso diario.",
            price: "$3,500",
            image: "https://via.placeholder.com/300x300?text=Producto+4"
        },
        {
            id: 5,
            title: "Producto 5",
            category: "categoria3",
            description: "Producto premium con acabados de lujo. Diseñado para quienes aprecian la exclusividad.",
            price: "$4,200",
            image: "https://via.placeholder.com/300x300?text=Producto+5"
        },
        {
            id: 6,
            title: "Producto 6",
            category: "categoria3",
            description: "La mejor relación calidad-precio del mercado. No encontrarás nada igual a este precio.",
            price: "$1,950",
            image: "https://via.placeholder.com/300x300?text=Producto+6"
        }
    ];
    renderProducts(products);
}

// Función para renderizar los productos en la página
function renderProducts(productsToRender) {
    productContainer.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productContainer.innerHTML = '<p class="no-products">No se encontraron productos que coincidan con tu búsqueda.</p>';
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-id', product.id);
        
        // Obtener el icono según la categoría
        let categoryIcon = '';
        switch(product.category) {
            case 'categoria1':
                categoryIcon = 'fas fa-tshirt';
                break;
            case 'categoria2':
                categoryIcon = 'fas fa-mobile-alt';
                break;
            case 'categoria3':
                categoryIcon = 'fas fa-home';
                break;
            default:
                categoryIcon = 'fas fa-tag';
        }
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-category"><i class="${categoryIcon}"></i> ${getCategoryName(product.category)}</p>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${product.price}</p>
            </div>
        `;
        
        // Agregar evento para abrir el modal al hacer clic
        productCard.addEventListener('click', () => openProductModal(product));
        
        productContainer.appendChild(productCard);
    });
}

// Función para obtener el nombre de la categoría
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

// Función para abrir el modal con los detalles del producto
function openProductModal(product) {
    // Llenar el modal con los datos del producto
    document.getElementById('modal-title').textContent = product.title;
    
    // Obtener el icono según la categoría
    let categoryIcon = '';
    switch(product.category) {
        case 'categoria1':
            categoryIcon = 'fas fa-tshirt';
            break;
        case 'categoria2':
            categoryIcon = 'fas fa-mobile-alt';
            break;
        case 'categoria3':
            categoryIcon = 'fas fa-home';
            break;
        default:
            categoryIcon = 'fas fa-tag';
    }
    
    document.getElementById('modal-category').innerHTML = `<i class="${categoryIcon}"></i> ${getCategoryName(product.category)}`;
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('modal-price').textContent = product.price;
    document.getElementById('modal-image').src = product.image;
    
    // Configurar el botón de WhatsApp
    const whatsappButton = document.getElementById('whatsapp-button');
    const message = `Hola, estoy interesado en el producto: ${product.title} (${product.price})`;
    whatsappButton.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Mostrar el modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Evitar scroll en el fondo
}

// Función para cerrar el modal
function closeProductModal() {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restaurar scroll
}

// Función para filtrar productos por categoría
function filterProductsByCategory() {
    const selectedCategories = [];
    let allSelected = false;
    
    // Verificar qué categorías están seleccionadas
    categoryFilters.forEach(filter => {
        if (filter.checked) {
            if (filter.value === 'todos') {
                allSelected = true;
            } else {
                selectedCategories.push(filter.value);
            }
        }
    });
    
    // Si "Todos" está seleccionado o no hay categorías seleccionadas, mostrar todos los productos
    if (allSelected || selectedCategories.length === 0) {
        renderProducts(products);
        return;
    }
    
    // Filtrar productos por las categorías seleccionadas
    const filteredProducts = products.filter(product => 
        selectedCategories.includes(product.category)
    );
    
    renderProducts(filteredProducts);
}

// Función para buscar productos
function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filterProductsByCategory(); // Si no hay término de búsqueda, solo aplicar filtros de categoría
        return;
    }
    
    // Filtrar por término de búsqueda y categorías seleccionadas
    let filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
    );
    
    // Aplicar filtro de categorías si hay alguna seleccionada
    const selectedCategories = [];
    let allSelected = false;
    
    categoryFilters.forEach(filter => {
        if (filter.checked) {
            if (filter.value === 'todos') {
                allSelected = true;
            } else {
                selectedCategories.push(filter.value);
            }
        }
    });
    
    if (!allSelected && selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            selectedCategories.includes(product.category)
        );
    }
    
    renderProducts(filteredProducts);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadProducts);

searchButton.addEventListener('click', searchProducts);

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

categoryFilters.forEach(filter => {
    filter.addEventListener('change', () => {
        // Si se selecciona "Todos", desmarcar las demás categorías
        if (filter.value === 'todos' && filter.checked) {
            categoryFilters.forEach(f => {
                if (f.value !== 'todos') {
                    f.checked = false;
                }
            });
        } 
        // Si se selecciona otra categoría, desmarcar "Todos"
        else if (filter.value !== 'todos' && filter.checked) {
            const todosFilter = document.querySelector('.category-filter[value="todos"]');
            if (todosFilter) {
                todosFilter.checked = false;
            }
        }
        
        // Si no hay ninguna categoría seleccionada, seleccionar "Todos"
        let anyChecked = false;
        categoryFilters.forEach(f => {
            if (f.checked) {
                anyChecked = true;
            }
        });
        
        if (!anyChecked) {
            const todosFilter = document.querySelector('.category-filter[value="todos"]');
            if (todosFilter) {
                todosFilter.checked = true;
            }
        }
        
        // Aplicar filtros
        if (searchInput.value.trim() !== '') {
            searchProducts();
        } else {
            filterProductsByCategory();
        }
    });
});

closeModal.addEventListener('click', closeProductModal);

// Cerrar el modal al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeProductModal();
    }
});

// Cerrar el modal con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeProductModal();
    }
});
