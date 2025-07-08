class ProductModal {
    constructor() {
        this.modal = null;
        this.currentProduct = null;
        this.init();
    }

    init() {
        // Create toast container
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);

        // Create modal container
        const modalHTML = `
            <div id="product-modal" class="product-modal">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <div class="modal-body">
                        <div class="product-images">
                            <div class="main-image">
                                <img id="modal-main-image" src="" alt="Product">
                            </div>
                            <div class="thumbnail-container">
                                <!-- Thumbnails will be added dynamically -->
                            </div>
                        </div>
                        <div class="product-info">
                            <h2 id="modal-title"></h2>
                            <div class="product-meta">
                                <p id="modal-age"></p>
                                <p id="modal-gender"></p>
                                <p id="modal-price"></p>
                            </div>
                            <div class="product-description">
                                <p id="modal-description"></p>
                            </div>
                            <div class="additional-info">
                                <h3>Additional Information</h3>
                                <ul id="modal-features">
                                    <!-- Features will be added dynamically -->
                                </ul>
                            </div>
                            <div class="action-buttons">
                                <button class="contact-seller">Contact Seller</button>
                                <button class="add-to-cart">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        // Add modal HTML to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal element
        this.modal = document.getElementById('product-modal');

        // Add close button functionality
        const closeButton = this.modal.querySelector('.close-button');
        closeButton.onclick = () => this.closeModal();

        // Add to cart button functionality
        const addToCartButton = this.modal.querySelector('.add-to-cart');
        addToCartButton.onclick = () => this.handlePurchase();

        // Close modal when clicking outside
        window.onclick = (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        };
    }

    showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    handlePurchase() {
        if (this.currentProduct) {
            const userId = sessionStorage.getItem('userId');
            if (!userId) {
                this.showToast('Please log in to add items to cart', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            }

            // Add to cart animation
            const addToCartBtn = this.modal.querySelector('.add-to-cart');
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

            // Add to cart API call
            fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId
                },
                body: JSON.stringify({
                    listingId: this.currentProduct.id.replace('listing-', '')
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add to cart');
                    }
                    return response.json();
                })
                .then(() => {
                    // Show success message
                    this.showToast('Added to cart successfully!');

                    // Update cart count in header if it exists
                    const cartCount = document.querySelector('.cart-count');
                    if (cartCount) {
                        const currentCount = parseInt(cartCount.textContent) || 0;
                        cartCount.textContent = currentCount + 1;
                    }

                    // Close modal after a short delay
                    setTimeout(() => {
                        this.closeModal();
                    }, 1000);
                })
                .catch(error => {
                    console.error('Add to cart error:', error);
                    this.showToast('Failed to add to cart. Please try again.', 'error');
                })
                .finally(() => {
                    // Reset button state
                    addToCartBtn.disabled = false;
                    addToCartBtn.innerHTML = 'Add to Cart';
                });
        }
    }

    updateDashboardStats() {
        // Get current stats from localStorage or initialize
        const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
            totalSales: 0,
            activeListings: 0,
            totalEarnings: 0
        };

        // Update stats
        stats.totalSales += 1;
        stats.activeListings = document.querySelectorAll('.card').length - 1; // Subtract 1 for the card being removed
        stats.totalEarnings += parseInt(this.currentProduct.price.replace(/[^0-9]/g, ''));

        // Save updated stats
        localStorage.setItem('dashboardStats', JSON.stringify(stats));

        // Update dashboard if it's open
        if (window.updateDashboardStats) {
            window.updateDashboardStats();
        }
    }

    showModal(productData) {
        this.currentProduct = {
            ...productData,
            id: productData.id || `product-${Date.now()}` // Generate ID if not provided
        };

        // Update modal content with product data
        document.getElementById('modal-main-image').src = productData.image;
        document.getElementById('modal-title').textContent = productData.name;
        document.getElementById('modal-age').textContent = productData.age;
        document.getElementById('modal-gender').textContent = productData.gender;
        document.getElementById('modal-price').textContent = productData.price;
        document.getElementById('modal-description').textContent = productData.description;

        // Add features if available
        const featuresList = document.getElementById('modal-features');
        featuresList.innerHTML = '';
        if (productData.features) {
            productData.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresList.appendChild(li);
            });
        }

        // Show modal
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        this.currentProduct = null;
    }
}

// Initialize modal
const productModal = new ProductModal();

// Export for use in other files
window.productModal = productModal; 