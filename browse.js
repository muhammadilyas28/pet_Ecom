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

        // Check if server is running with authentication
        const serverCheck = await fetch('http://localhost:3000/api/listings/user', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        }).catch(() => {
            throw new Error('Cannot connect to server. Please make sure the backend server is running.');
        });

        if (!serverCheck.ok) {
            throw new Error('Server is not responding properly. Please try again later.');
        }

        // Fetch active listings from the database
        const response = await fetch('http://localhost:3000/api/listings/user', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
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
            errorMessage.textContent = 'No pets added for sale yet!';
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
        if (error.message === 'Please login to view listings') {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
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