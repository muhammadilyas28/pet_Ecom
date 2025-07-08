document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize variables for statistics
    let activeListingsCount = 0;
    let totalSales = 0;
    let totalPurchases = 0;
    let totalEarnings = 0;

    try {
        // Fetch user's listings
        const response = await fetch('http://localhost:3000/api/listings/user', {
            headers: {
                'user-id': userId
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        const listings = await response.json();

        // Update statistics
        activeListingsCount = listings.filter(listing => listing.status === 'active').length;
        // Calculate total earnings from sold listings
        totalEarnings = listings
            .filter(listing => listing.status === 'sold')
            .reduce((sum, listing) => sum + parseFloat(listing.price), 0);

        // Update dashboard statistics
        document.getElementById('activeListings').textContent = activeListingsCount;
        document.getElementById('totalSales').textContent = listings.filter(listing => listing.status === 'sold').length;
        document.getElementById('totalPurchases').textContent = totalPurchases; // Will be implemented with orders system
        document.getElementById('totalEarnings').textContent = `₹${totalEarnings.toLocaleString()}`;

        // Populate latest listings table
        const tableBody = document.querySelector('#latestListings tbody');
        tableBody.innerHTML = ''; // Clear existing content

        listings.forEach(listing => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${listing.pet_type} - ${listing.breed}</td>
                <td>₹${parseFloat(listing.price).toLocaleString()}</td>
                <td><span class="status ${listing.status.toLowerCase()}">${listing.status}</span></td>
                <td>
                    <button class="action-btn" onclick="editListing(${listing.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Create monthly activity chart
        const monthlyData = getMonthlyData(listings);
        createMonthlyChart(monthlyData);

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Show error message to user
        alert('Failed to load dashboard data. Please try again later.');
    }

    // Handle sidebar navigation
    const sidebarItems = document.querySelectorAll('.dashboard-sidebar li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Handle navigation (to be implemented)
            const section = item.textContent.trim().toLowerCase();
            switch (section) {
                case 'my listings':
                    // Implement listings view
                    break;
                case 'my orders':
                    // Implement orders view
                    break;
                case 'settings':
                    // Implement settings view
                    break;
                default:
                    // Overview is already shown
                    break;
            }
        });
    });
});

// Helper function to get monthly data for chart
function getMonthlyData(listings) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    // Initialize data arrays
    const activeData = new Array(12).fill(0);
    const soldData = new Array(12).fill(0);

    listings.forEach(listing => {
        const listingDate = new Date(listing.created_at);
        if (listingDate.getFullYear() === currentYear) {
            const month = listingDate.getMonth();
            if (listing.status === 'active') {
                activeData[month]++;
            } else if (listing.status === 'sold') {
                soldData[month]++;
            }
        }
    });

    return {
        labels: months,
        active: activeData,
        sold: soldData
    };
}

// Create monthly activity chart
function createMonthlyChart(data) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Active Listings',
                    data: data.active,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Sold',
                    data: data.sold,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Function to handle listing edit
function editListing(listingId) {
    // Redirect to edit page or show edit modal
    // To be implemented
    console.log('Edit listing:', listingId);
} 