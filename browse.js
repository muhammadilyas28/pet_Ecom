document.addEventListener('DOMContentLoaded', async () => {
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');

    try {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';

        // Get user token from localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('Please login to view listings');
        }

        // Check if server is running
        const serverCheck = await fetch('http://localhost:3000/api/listings', {
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(() => {
            throw new Error('Cannot connect to server. Please make sure the backend server is running.');
        });

        if (!serverCheck.ok) {
            throw new Error('Server is not responding properly. Please try again later.');
        }

        // Fetch all listings from the database
        const response = await fetch('http://localhost:3000/api/listings', {
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(() => {
            throw new Error('Cannot connect to server. Please make sure the backend server is running.');
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch listings');
        }
        const listings = await response.json();

        if (listings.length === 0) {
            errorMessage.textContent = 'No pets available for sale yet!';
            errorMessage.style.display = 'block';
            return;
        }

        // Add database listings to respective sections
        listings.forEach(listing => {
            try {
                const petType = listing.pet_type.toLowerCase();
                const section = document.getElementById(`${petType}s-section`);
                if (section) {
                    const cardContainer = section.querySelector('.card-container');
                    const card = createListingCard(listing);
                    cardContainer.insertBefore(card, cardContainer.firstChild);
                } else {
                    console.warn(`Section not found for pet type: ${petType}`);
                }
            } catch (cardError) {
                console.error('Error creating card for listing:', cardError);
            }
        });

        // Initialize category switching
        initializeCategories();

    } catch (error) {
        console.error('Error fetching listings:', error);
        errorMessage.textContent = error.message || 'Failed to load listings. Please try again later.';
        errorMessage.style.display = 'block';

        // If not logged in, redirect to login page
        // if (error.message === 'Please login to view listings') {
        //     setTimeout(() => {
        //         window.location.href = 'login.html';
        //     }, 1500);
        // }
    } finally {
        loadingIndicator.style.display = 'none';
    }
});

function createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `listing-${listing.id}`;

    try {
        // Convert price to PKR format
        const price = parseFloat(listing.price).toLocaleString('en-PK', {
            style: 'currency',
            currency: 'PKR'
        });

        // Ensure photos array exists and has at least one item
        const photoUrl = Array.isArray(listing.photos) && listing.photos.length > 0
            ? `http://localhost:3000${listing.photos[0]}`
            : 'images/placeholder.png';

        card.innerHTML = `
            <div class="image-container">
                <img src="${photoUrl}" alt="${listing.breed || 'Pet'}" 
                     onerror="this.src='images/placeholder.png'"
                     loading="lazy">
            </div>
            <h3>${listing.breed || 'Unknown Breed'}</h3>
            <p>Age: ${listing.age || 'Not specified'}</p>
            <p>Gender: ${listing.pet_gender || 'Not specified'}</p>
            <p>${listing.description || 'No description available'}</p>
            <p class="price">Price: ${price}</p>
            <button class="btn view-details" data-id="${listing.id}">View Details</button>
        `;

        // Add click handler for view details button
        const viewButton = card.querySelector('.view-details');
        viewButton.addEventListener('click', (e) => {
            e.preventDefault();
            const productData = {
                id: `listing-${listing.id}`,
                name: listing.breed,
                image: photoUrl,
                age: listing.age,
                gender: listing.pet_gender,
                description: listing.description,
                price: price,
                features: [
                    'Health checked and vaccinated',
                    'Comes with initial food supply',
                    'Free first vet consultation',
                    'Training guidelines included'
                ]
            };
            window.productModal.showModal(productData);
        });

    } catch (error) {
        console.error('Error creating card HTML:', error);
        card.innerHTML = `
            <div class="error-card">
                <p>Error displaying this listing</p>
            </div>
        `;
    }

    return card;
}

function initializeCategories() {
    const categories = document.querySelectorAll('.further');
    const sections = document.querySelectorAll('.section');

    // Show dogs section by default
    document.getElementById('dogs-section').style.display = 'block';

    categories.forEach(category => {
        category.addEventListener('click', () => {
            const selectedCategory = category.dataset.category;

            // Remove active class from all categories
            categories.forEach(cat => cat.classList.remove('active'));
            // Add active class to selected category
            category.classList.add('active');

            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show selected section
            const selectedSection = document.getElementById(`${selectedCategory}-section`);
            if (selectedSection) {
                selectedSection.style.display = 'block';
                // Update category title
                const categoryTitle = document.getElementById('categ');
                categoryTitle.textContent = `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Category`;
            }
        });
    });
}

// Function to initialize product buttons and handle product ownership
function initializeProductButtons() {
    // Get all view details buttons
    const viewButtons = document.querySelectorAll('.btn');
    const currentUserId = localStorage.getItem('userId');

    viewButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const card = button.closest('.card');

            try {
                // Fetch product details from API
                const response = await fetch(`http://localhost:3000/api/listings/${card.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const productDetails = await response.json();

                // Check if the current user is the owner of the product
                const isOwnProduct = currentUserId && productDetails.user_id === currentUserId;

                const productData = {
                    id: card.id,
                    name: card.querySelector('h3').textContent,
                    image: card.querySelector('img').src,
                    age: card.querySelector('p:nth-of-type(1)').textContent,
                    gender: card.querySelector('p:nth-of-type(2)').textContent,
                    description: card.querySelector('p:nth-of-type(3)').textContent,
                    price: card.querySelector('.price').textContent,
                    isOwnProduct: isOwnProduct,
                    features: [
                        'Health checked and vaccinated',
                        'Comes with initial food supply',
                        'Free first vet consultation',
                        'Training guidelines included'
                    ]
                };

                // Show modal with product data
                showProductModal(productData);

            } catch (error) {
                console.error('Error fetching product details:', error);
                showToast('Error loading product details', 'error');
            }
        });
    });
}

// Function to show product modal
function showProductModal(productData) {
    const modalHtml = `
        <div class="product-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="product-details">
                    <div class="product-image">
                        <img src="${productData.image}" alt="${productData.name}">
                    </div>
                    <div class="product-info">
                        <h2>${productData.name}</h2>
                        ${productData.age}
                        ${productData.gender}
                        <p class="description">${productData.description}</p>
                        <div class="price-section">
                            <p class="price">${productData.price}</p>
                            ${productData.isOwnProduct ?
            `<div class="own-product-notice">
                                    <i class="fas fa-info-circle"></i>
                                    This is your listing. You cannot purchase your own pet.
                                </div>` :
            `<button class="add-to-cart-button" onclick="handlePurchase('${productData.id}')">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>`
        }
                        </div>
                        <div class="features">
                            <h3>Features:</h3>
                            <ul>
                                ${productData.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to the page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Add styles for the modal and buttons
    const style = document.createElement('style');
    style.textContent = `
        .add-to-cart-button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }

        .add-to-cart-button:hover {
            background-color: #45a049;
            transform: translateY(-2px);
        }

        .add-to-cart-button i {
            font-size: 18px;
        }

        ${style.textContent}
    `;
    document.head.appendChild(style);

    // Handle modal close
    const modal = document.querySelector('.product-modal');
    const closeBtn = document.querySelector('.close-modal');

    closeBtn.onclick = () => {
        modal.remove();
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    };
}

// Function to handle purchase
async function handlePurchase(productId) {
    const userId = localStorage.getItem('userId');
    // if (!userId) {
    //     showToast('Please log in to make a purchase', 'error');
    //     window.location.href = 'login.html';
    //     return;
    // }

    try {
        // Add to cart instead of direct purchase
        const response = await fetch('http://localhost:3000/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            body: JSON.stringify({
                productId: productId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }

        // Show success message
        showToast('Added to cart successfully!', 'success');

        // Update cart count in header if it exists
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const currentCount = parseInt(cartCount.textContent || '0');
            cartCount.textContent = currentCount + 1;
            cartCount.style.display = 'block';
        }

        // Close the modal if it exists
        const modal = document.querySelector('.product-modal');
        if (modal) {
            modal.remove();
        }

    } catch (error) {
        console.error('Add to cart error:', error);
        showToast('Error adding item to cart', 'error');
    }
}

// Function to show toast messages
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Add styles for the toast
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        }
        
        .toast.success {
            background-color: #4CAF50;
        }
        
        .toast.error {
            background-color: #f44336;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeProductButtons();
}); 