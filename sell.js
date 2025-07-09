// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('sellPetForm');
    const messageBox = document.createElement('div');
    messageBox.className = 'message';
    form.insertBefore(messageBox, form.firstChild);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            // Show loading message
            messageBox.textContent = 'Uploading images...';
            messageBox.className = 'message info';
            messageBox.style.display = 'block';

            // Get form data
            const listingData = {
                pet_type: document.getElementById('pet-type').value.toLowerCase(),
                pet_gender: document.getElementById('pet-gender').value.toLowerCase(),
                breed: document.getElementById('pet-breed').value,
                age: document.getElementById('pet-age').value,
                price: parseFloat(document.getElementById('pet-price').value),
                description: document.getElementById('pet-description').value,
                photos: []
            };

            // Validate price
            if (isNaN(listingData.price) || listingData.price <= 0) {
                throw new Error('Please enter a valid price');
            }

            // Handle file upload
            const photoInput = document.getElementById('pet-photos');
            const files = photoInput.files;

            if (!files || files.length === 0) {
                throw new Error('Please select at least one photo');
            }

            if (files.length > 5) {
                throw new Error('Maximum 5 photos allowed');
            }

            // Create FormData for file upload
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('photos', files[i]);
            }

            // Upload photos
            const uploadResponse = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                throw new Error(error.message || 'Failed to upload images');
            }

            const uploadResult = await uploadResponse.json();
            listingData.photos = uploadResult.paths;

            // Show listing creation message
            messageBox.textContent = 'Creating listing...';

            // Create listing
            const response = await fetch('http://localhost:3000/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId
                },
                body: JSON.stringify(listingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create listing');
            }

            const result = await response.json();

            // Show success message
            messageBox.textContent = 'Pet listing created successfully!';
            messageBox.className = 'message success';
            messageBox.style.display = 'block';

            // Reset form
            form.reset();

            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            // Show error message
            messageBox.textContent = error.message || 'Failed to create listing';
            messageBox.className = 'message error';
            messageBox.style.display = 'block';
        }
    });
}); 