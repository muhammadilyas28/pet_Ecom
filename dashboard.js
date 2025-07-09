// Function to update dashboard stats
function updateDashboardStats() {
    // Get stats from localStorage
    const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
        totalSales: 0,
        activeListings: 0,
        totalEarnings: 0
    };

    // Update UI elements
    document.getElementById('totalSales').textContent = stats.totalSales;
    document.getElementById('activeListings').textContent = stats.activeListings;
    document.getElementById('totalEarnings').textContent = `${stats.totalEarnings.toLocaleString()} PKR`;

    // Update the monthly chart
    updateMonthlyChart(stats);
}

// Function to update the monthly activity chart
function updateMonthlyChart(stats) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');

    // Get current month data or initialize
    const currentMonth = new Date().getMonth();
    const monthlyData = JSON.parse(localStorage.getItem('monthlyStats')) || Array(12).fill(0);
    monthlyData[currentMonth] = stats.totalSales;

    // Save monthly data
    localStorage.setItem('monthlyStats', JSON.stringify(monthlyData));

    // Create or update chart
    if (window.monthlyChart) {
        window.monthlyChart.destroy();
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    window.monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Sales',
                data: monthlyData,
                borderColor: 'rgba(46, 204, 113, 0.8)',
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize dashboard sections
    const sections = {
        overview: document.querySelector('.dashboard-main'),
        listings: document.getElementById('myListingsGrid')
    };

    // Add click handlers for sidebar menu
    document.querySelectorAll('.dashboard-sidebar li').forEach(item => {
        item.addEventListener('click', async () => {
            // Remove active class from all items
            document.querySelectorAll('.dashboard-sidebar li').forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Show appropriate section
            if (item.textContent.includes('My Listings')) {
                sections.overview.style.display = 'none';
                sections.listings.style.display = 'block';
                await fetchUserListings(userId);
            } else if (item.textContent.includes('Overview')) {
                sections.overview.style.display = 'block';
                sections.listings.style.display = 'none';
                await loadDashboardStats(userId);
            }
        });
    });

    // Initialize dashboard stats
    loadDashboardStats(userId);
});

async function fetchDashboardStats(userId) {
    try {
        showLoadingState();
        const response = await fetch(`http://localhost:3000/api/users/${userId}/stats`, {
            headers: {
                'user-id': userId
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        updateDashboardDisplay(data);
        await fetchPurchaseHistory(userId);
    } catch (error) {
        console.error('Error fetching stats:', error);
        showErrorState();
    }
}

async function fetchPurchaseHistory(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}/purchases`, {
            headers: {
                'user-id': userId
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch purchase history');
        }

        const purchases = await response.json();
        updatePurchaseHistory(purchases);
    } catch (error) {
        console.error('Error fetching purchase history:', error);
    }
}

function updateDashboardDisplay(stats) {
    document.getElementById('activeListings').textContent = stats.active_listings || 0;
    document.getElementById('totalSales').textContent = stats.total_sales || 0;
    document.getElementById('totalPurchases').textContent = stats.total_purchases || 0;
    document.getElementById('totalEarnings').textContent =
        `₹${parseFloat(stats.total_earnings || 0).toLocaleString('en-IN')}`;
}

function updatePurchaseHistory(purchases) {
    const tbody = document.querySelector('#latestListings tbody');
    tbody.innerHTML = '';

    if (purchases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="no-data">
                    <i class="fas fa-inbox"></i>
                    <p>No purchase history available</p>
                </td>
            </tr>
        `;
        return;
    }

    purchases.forEach(purchase => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="pet-info">
                    <img src="http://localhost:3000${purchase.photos[0]}" 
                         alt="${purchase.breed}"
                         onerror="this.src='images/placeholder.png'"
                         class="pet-thumbnail">
                    <span>${purchase.breed}</span>
                </div>
            </td>
            <td>₹${parseFloat(purchase.price).toLocaleString('en-IN')}</td>
            <td>
                <span class="status-badge ${purchase.status.toLowerCase()}">
                    ${purchase.status}
                </span>
            </td>
            <td>
                <button class="action-btn" onclick="viewPurchaseDetails('${purchase.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showLoadingState() {
    const statsCards = document.querySelectorAll('.stat-card p');
    statsCards.forEach(card => {
        card.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
}

function showErrorState() {
    const statsCards = document.querySelectorAll('.stat-card p');
    statsCards.forEach(card => {
        card.innerHTML = '<span class="error">Error loading data</span>';
    });
}

async function fetchUserListings(userId) {
    if (!userId) return;
    
    const grid = document.getElementById('myListingsGrid');
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading your listings...</p></div>';

    try {
        const response = await fetch('http://localhost:3000/api/listings/user', {
            headers: {
                'user-id': userId
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        const listings = await response.json();
        displayListings(listings);
        updateDashboardStats(listings);

    } catch (error) {
        console.error('Error fetching listings:', error);
        grid.innerHTML = '<div class="error">Error loading listings. Please try again later.</div>';
    }
}

function displayListings(listings) {
    const grid = document.getElementById('myListingsGrid');
    
    if (!listings || listings.length === 0) {
        grid.innerHTML = '<div class="no-listings">No listings found. Start selling by adding your first pet!</div>';
        return;
    }

    grid.innerHTML = '';
    listings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
            <img src="${listing.photos ? listing.photos[0] : 'default-pet.jpg'}" alt="${listing.pet_type}">
            <div class="listing-info">
                <h3>${listing.pet_type} - ${listing.breed}</h3>
                <p class="price">₹${parseFloat(listing.price).toFixed(2)}</p>
                <p class="status ${listing.status}">${listing.status}</p>
                <div class="actions">
                    <button onclick="editListing(${listing.id})" class="edit-btn">Edit</button>
                    <button onclick="deleteListing(${listing.id})" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Function to load dashboard statistics
async function loadDashboardStats(userId) {
    if (!userId) return;

    try {
        const response = await fetch('http://localhost:3000/api/listings/user', {
            headers: {
                'user-id': userId
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        const listings = await response.json();
        updateDashboardStats(listings);
        initializeMonthlyChart(listings);

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        document.querySelector('.dashboard-main').innerHTML = '<div class="error">Error loading dashboard stats. Please try again later.</div>';
    }
}

// Function to update dashboard statistics
function updateDashboardStats(listings) {
    if (!listings) return;

    const activeListings = listings.filter(l => l.status === 'active').length;
    const soldListings = listings.filter(l => l.status === 'sold');
    const totalEarnings = soldListings.reduce((sum, l) => sum + parseFloat(l.price), 0);

    document.getElementById('activeListings').textContent = activeListings;
    document.getElementById('totalSales').textContent = soldListings.length;
    document.getElementById('totalEarnings').textContent = `₹${totalEarnings.toFixed(2)}`;
}

// Function to initialize monthly activity chart
function initializeMonthlyChart(listings) {
    if (!listings) return;

    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    // Group listings by month
    const monthlyData = new Array(12).fill(0);
    listings.forEach(listing => {
        const month = new Date(listing.created_at).getMonth();
        monthlyData[month]++;
    });

    // Destroy existing chart if it exists
    if (window.activityChart) {
        window.activityChart.destroy();
    }
    
    window.activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Listings',
                data: monthlyData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
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

// Function to edit a listing
function editListing(listingId) {
    window.location.href = `sell.html?edit=${listingId}`;
}

// Function to delete a listing
async function deleteListing(listingId) {
    const userId = localStorage.getItem('userId');
    if (!userId || !listingId) return;

    if (confirm('Are you sure you want to delete this listing?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/listings/${listingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            // Refresh the listings
            await fetchUserListings(userId);
            
        } catch (error) {
            console.error('Error deleting listing:', error);
            alert('Error deleting listing. Please try again.');
        }
    }
}

// Add styles for the My Listings section
const style = document.createElement('style');
style.textContent = `
    .my-listings {
        padding: 20px;
    }

    .listings-controls {
        margin-bottom: 20px;
        text-align: right;
    }

    .add-listing-btn {
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1em;
        transition: background-color 0.3s ease;
    }

    .add-listing-btn:hover {
        background-color: #45a049;
    }

    .listings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }

    .listing-card {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .listing-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .listing-image {
        position: relative;
        height: 200px;
    }

    .listing-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .status-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.8em;
        text-transform: capitalize;
        background: white;
    }

    .status-badge.active {
        background-color: #e8f5e9;
        color: #4caf50;
    }

    .status-badge.sold {
        background-color: #fce4ec;
        color: #e91e63;
    }

    .listing-info {
        padding: 15px;
    }

    .listing-info h3 {
        margin: 0 0 10px 0;
        color: #333;
    }

    .pet-type {
        color: #666;
        margin: 5px 0;
    }

    .age {
        color: #666;
        margin: 5px 0;
    }

    .price {
        font-size: 1.2em;
        font-weight: bold;
        color: #4CAF50;
        margin: 10px 0;
    }

    .listing-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }

    .listing-actions button {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .edit-btn {
        background-color: #e3f2fd;
        color: #2196f3;
    }

    .edit-btn:hover {
        background-color: #2196f3;
        color: white;
    }

    .delete-btn {
        background-color: #ffebee;
        color: #f44336;
    }

    .delete-btn:hover {
        background-color: #f44336;
        color: white;
    }

    .loading {
        text-align: center;
        padding: 40px;
        grid-column: 1 / -1;
    }

    .loading i {
        font-size: 2em;
        color: #4CAF50;
        margin-bottom: 10px;
    }

    .error-message {
        text-align: center;
        padding: 40px;
        color: #f44336;
        grid-column: 1 / -1;
    }

    .error-message i {
        font-size: 2em;
        margin-bottom: 10px;
    }

    .no-listings {
        text-align: center;
        padding: 40px;
        color: #666;
        grid-column: 1 / -1;
    }

    .no-listings i {
        font-size: 3em;
        color: #ccc;
        margin-bottom: 20px;
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
`;
document.head.appendChild(style); 