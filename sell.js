// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const sellPetForm = document.getElementById('sellPetForm');

    if (sellPetForm) {
        sellPetForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Create pet listing object
            const petListing = {
                type: document.getElementById('pet-type').value,
                gender: document.getElementById('pet-gender').value,
                breed: document.getElementById('pet-breed').value,
                age: document.getElementById('pet-age').value,
                price: document.getElementById('pet-price').value,
                description: document.getElementById('pet-description').value,
                listingDate: new Date().toISOString(),
                id: 'PET_' + Date.now()
            };

            try {
                // Handle photo files
                const photoInput = document.getElementById('pet-photos');
                const photoFiles = Array.from(photoInput.files);

                // Convert photos to base64
                const photoPromises = photoFiles.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = e => resolve(e.target.result);
                        reader.onerror = e => reject(e);
                        reader.readAsDataURL(file);
                    });
                });

                // Wait for all photos to be converted
                const photos = await Promise.all(photoPromises);
                petListing.photos = photos;

                // Get existing listings from localStorage or initialize empty array
                const existingListings = JSON.parse(localStorage.getItem('petListings') || '[]');

                // Add new listing
                existingListings.push(petListing);

                // Save updated listings back to localStorage
                localStorage.setItem('petListings', JSON.stringify(existingListings));

                // Show success message
                alert('Your pet has been listed successfully!');

                // Clear form
                sellPetForm.reset();

                // Redirect to browse page
                window.location.href = 'browse.html';

            } catch (error) {
                console.error('Error saving pet listing:', error);
                alert('There was an error saving your listing. Please try again.');
            }
        });
    }
}); 