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
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
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
        if (!this.currentProduct) {
            this.showToast('Error: Product not found', 'error');
            return;
        }

        // Add to cart animation
        const addToCartBtn = this.modal.querySelector('.add-to-cart');
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        const userId = localStorage.getItem('userId');
        if (!userId) {
            this.showToast('Please login to add items to cart', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // First get the listing details to ensure we have the correct data
        fetch(`http://localhost:3000/api/listings/${this.currentProduct.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        })
            .then(response => response.json())
            .then(listing => {
                if (!listing || !listing.id) {
                    throw new Error('Listing not found');
                }

                // Create the purchase data
                const purchaseData = {
                    listing_id: listing.id,
                    seller_id: listing.user_id,
                    price: parseFloat(listing.price),
                    status: 'pending'
                };

                // Now make the purchase API call
                return fetch('http://localhost:3000/api/purchases', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': userId
                    },
                    body: JSON.stringify(purchaseData)
                });
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Failed to add to cart');
                    });
                }
                return response.json();
            })
            .then(data => {
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
                this.showToast(error.message || 'Failed to add to cart. Please try again.', 'error');
            })
            .finally(() => {
                // Reset button state
                addToCartBtn.disabled = false;
                addToCartBtn.innerHTML = 'Add to Cart';
            });
    }

    updateDashboardStats() {
        // Get current stats from localStorage or initialize
        const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
            totalSales: 0,
            activeListings: 0,
            totalEarnings: 0,
            totalPurchases: 0
        };

        // Extract numeric value from price string (remove currency and commas)
        const priceValue = parseInt(this.currentProduct.price.replace(/[^0-9]/g, '')) || 0;

        // Update stats
        stats.totalPurchases += 1;
        stats.totalEarnings += priceValue;

        // Save updated stats
        localStorage.setItem('dashboardStats', JSON.stringify(stats));

        // Update dashboard elements if they exist
        const dashboardElements = {
            'totalPurchases': stats.totalPurchases,
            'totalEarnings': `₹${stats.totalEarnings.toLocaleString()}`,
            'totalSales': stats.totalSales,
            'activeListings': stats.activeListings
        };

        // Update each dashboard element if it exists
        Object.entries(dashboardElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    showModal(productData) {
        // Ensure we have valid data
        if (!productData) {
            console.error('No product data provided');
            return;
        }

        // Format gender to be properly capitalized
        const formatGender = (gender) => {
            if (!gender) return 'Not specified';
            return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
        };

        // Format price to PKR
        const formatPrice = (price) => {
            if (!price) return 'Price not specified';
            return `₹${parseFloat(price).toLocaleString()}`;
        };

        // Handle image URL properly
        let imageUrl = 'images/placeholder.png';
        if (productData.photos && productData.photos.length > 0) {
            const photoPath = productData.photos[0];
            if (photoPath.startsWith('http')) {
                imageUrl = photoPath;
            } else if (photoPath.startsWith('/uploads/')) {
                imageUrl = `http://localhost:3000${photoPath}`;
            } else if (photoPath.startsWith('/images/')) {
                imageUrl = photoPath.substring(1); // Remove leading slash
            } else {
                imageUrl = `http://localhost:3000/uploads/${photoPath}`;
            }
        }

        this.currentProduct = {
            id: productData.id,
            user_id: productData.user_id,
            name: productData.breed || 'Unknown Breed',
            age: productData.age || 'Not specified',
            gender: formatGender(productData.pet_gender),
            price: productData.price,
            description: productData.description || 'No description available',
            image: imageUrl,
            pet_type: productData.pet_type || 'Not specified'
        };

        // Update modal content with product data
        const mainImage = document.getElementById('modal-main-image');
        mainImage.src = this.currentProduct.image;
        mainImage.onerror = () => {
            mainImage.src = 'images/placeholder.png';
            console.warn('Failed to load image, using placeholder');
        };

        document.getElementById('modal-title').textContent = this.currentProduct.name;
        document.getElementById('modal-age').textContent = `Age: ${this.currentProduct.age}`;
        document.getElementById('modal-gender').textContent = `Gender: ${this.currentProduct.gender}`;
        document.getElementById('modal-price').textContent = formatPrice(this.currentProduct.price);
        document.getElementById('modal-description').textContent = this.currentProduct.description;

        // Add features if available
        const featuresList = document.getElementById('modal-features');
        featuresList.innerHTML = '';
        const features = [
            `Pet Type: ${this.currentProduct.pet_type}`,
            `Breed: ${this.currentProduct.name}`,
            `Age: ${this.currentProduct.age}`,
            `Gender: ${this.currentProduct.gender}`
        ];

        features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });

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