/**
 * =========================================
 * MENÚ DIGITAL INTERACTIVO - LOGIC
 * =========================================
 */

// Datos de prueba (PoC: 2 Platos Ficticios)
const dishesData = [
    {
        id: 'dish-1',
        name: "DESAYUNO CUSQUEÑO",
        thumbnail: "desayuno.jpg",
        image: "desayuno.jpg",
        description: "Caliente desayuno popular Cusqueño de quinua, manzana, canela y especias",
        price: "S/ 12.00",
        ingredients: [
            { name: "Quinua", isAllergen: false },
            { name: "Manzana", isAllergen: false, isFruit: true },
            { name: "Canela", isAllergen: false },
            { name: "Especias", isAllergen: false }
        ]
    },
    {
        id: 'dish-2',
        name: "PIE DE FRESA",
        thumbnail: "pie-fresa.jpg",
        image: "pie-fresa.jpg",
        description: "¡Fresas frescas y nuestra tarta casera con crema y pétalos de flores!",
        price: "S/ 10.00",
        ingredients: [
            { name: "Fresas frescas", isAllergen: false, isFruit: true },
            { name: "Masa de tarta", isAllergen: true }, // Gluten
            { name: "Crema", isAllergen: true }, // Lácteo
            { name: "Flores comestibles", isAllergen: false }
        ]
    }
];

// Referencias al DOM
const menuGrid = document.getElementById('menu-grid');
const modal = document.getElementById('dish-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalDescription = document.getElementById('modal-description');
const modalIngredientsList = document.getElementById('modal-ingredients-list');
const closeTriggers = document.querySelectorAll('[data-close="true"]');

// Variable para recordar qué elemento tenía el foco antes de abrir el modal
let focusedElementBeforeModal = null;

/**
 * Inicializa y renderiza el menú en el DOM
 */
function renderMenu() {
    dishesData.forEach(dish => {
        // Crear elemento de tarjeta
        const card = document.createElement('article');
        card.className = 'card';
        card.tabIndex = 0; // Hace la tarjeta enfocable por teclado
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Ver detalles de ${dish.name}`);
        card.dataset.id = dish.id;

        // Estructura HTML de la tarjeta
        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${dish.thumbnail}" alt="Fotografía de ${dish.name}" class="card-image" loading="lazy">
            </div>
            <div class="card-content">
                <h2 class="card-title">${dish.name}</h2>
                <div class="card-action">
                    <span>Ver detalles</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        `;

        // Eventos para abrir el modal (Click y Teclado)
        card.addEventListener('click', () => openModal(dish));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(dish);
            }
        });

        menuGrid.appendChild(card);
    });
}

/**
 * Abre el modal y lo puebla con los datos del plato seleccionado
 * @param {Object} dish - Datos del plato
 */
function openModal(dish) {
    // Guardar el elemento que tenía el foco para restaurarlo al cerrar
    focusedElementBeforeModal = document.activeElement;
    
    // Poblar información básica
    modalImage.src = dish.image;
    modalImage.alt = `Fotografía en detalle de ${dish.name}`;
    modalTitle.textContent = dish.name;
    modalPrice.textContent = dish.price;
    modalDescription.textContent = dish.description;
    
    // Limpiar y poblar lista de ingredientes
    modalIngredientsList.innerHTML = '';
    dish.ingredients.forEach(ing => {
        const li = document.createElement('li');
        li.textContent = ing.name;
        
        // Destacar visualmente y añadir semántica si es alérgeno
        if (ing.isAllergen) {
            li.classList.add('allergen');
            li.setAttribute('title', 'Contiene alérgenos');
            li.setAttribute('aria-label', `${ing.name} (Atención: Es un alérgeno)`);
        }
        
        // Destacar visualmente si es fruta
        if (ing.isFruit) {
            li.classList.add('fruit');
        }
        
        modalIngredientsList.appendChild(li);
    });

    // Mostrar el modal
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    
    // Bloquear el scroll de la página principal
    document.body.style.overflow = 'hidden';
    
    // Atrapar el foco dentro del modal (Accesibilidad)
    trapFocus(modal);
}

/**
 * Cierra el modal y restaura el estado previo
 */
function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    
    // Restaurar el scroll de la página principal
    document.body.style.overflow = ''; 
    
    // Restaurar el foco al elemento que lo abrió
    if (focusedElementBeforeModal) {
        focusedElementBeforeModal.focus();
    }
}

/**
 * Mantiene el foco (Tab / Shift+Tab) dentro del contenedor del modal
 * @param {HTMLElement} element - El contenedor del modal
 */
function trapFocus(element) {
    // Seleccionar todos los elementos enfocables dentro del modal
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let focusableElements = element.querySelectorAll(focusableElementsString);
    
    // Filtrar elementos que realmente son visibles y enfocables (como la 'X')
    focusableElements = Array.from(focusableElements).filter(el => el.offsetParent !== null && !el.disabled && el.tabIndex >= 0);
    
    if (focusableElements.length === 0) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Limpiar event listeners previos si los hubiera (para evitar duplicados)
    const handleKeyDown = function(e) {
        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

        if (!isTabPressed) return;

        if (e.shiftKey) { 
            // Shift + Tab
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { 
            // Tab
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    };
    
    // Remover listener previo para evitar múltiples traps si se abre/cierra rápido
    element.removeEventListener('keydown', element._trapFocusHandler);
    element.addEventListener('keydown', handleKeyDown);
    element._trapFocusHandler = handleKeyDown; // Guardar referencia para poder removerlo
    
    // Enfocar el primer elemento interactivo (el botón de cerrar 'X') al abrir
    // Pequeño retraso para asegurar que el elemento ya es visible
    setTimeout(() => {
        firstFocusableElement.focus();
    }, 100);
}

/**
 * Inicialización y Configuración de Event Listeners Globales
 */
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar el menú al cargar
    renderMenu();
    
    // Asignar eventos de cierre (Botón 'X' y Overlay oscuro)
    closeTriggers.forEach(trigger => {
        trigger.addEventListener('click', closeModal);
    });

    // Permitir cierre con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
});
