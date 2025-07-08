document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch active listings from the database
        const response = await fetch('http://localhost:3000/api/listings');
        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }
        const listings = await response.json();

        // Add database listings to respective sections
        listings.forEach(listing => {
            const section = document.getElementById(`${listing.pet_type.toLowerCase()}s-section`);
            if (section) {
                const cardContainer = section.querySelector('.card-container');
                const card = createListingCard(listing);
                cardContainer.insertBefore(card, cardContainer.firstChild); // Add at the beginning
            }
        });

        // Initialize category switching
        initializeCategories();

    } catch (error) {
        console.error('Error fetching listings:', error);
    }
});

function createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'card';

    // Convert price to PKR format
    const price = parseFloat(listing.price).toLocaleString('en-PK', {
        style: 'currency',
        currency: 'PKR'
    });

    card.innerHTML = `
        <div class="image-container">
            <img src="${listing.photos[0]}" alt="${listing.breed}">
        </div>
        <h3>${listing.breed}</h3>
        <p>Age: ${listing.age}</p>
        <p>Gender: ${listing.pet_gender}</p>
        <p>${listing.description}</p>
        <p class="price">Price: ${price}</p>
        <button class="btn view-details" data-id="${listing.id}">View Details</button>
    `;

    // Add click handler for view details button
    const viewButton = card.querySelector('.view-details');
    viewButton.addEventListener('click', () => {
        // For now, just show details in console
        console.log('Listing details:', listing);
        // TODO: Implement proper details view
    });

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

            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show selected section
            const selectedSection = document.getElementById(`${selectedCategory}-section`);
            if (selectedSection) {
                selectedSection.style.display = 'block';
            }

            // Update category title
            const categoryTitle = document.getElementById('categ');
            categoryTitle.textContent = `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Category`;
        });
    });
} 