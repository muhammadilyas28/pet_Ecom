// Initialize dashboard stats
async function initializeDashboardStats() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found');
            return;
        }

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

        // Count active listings
        const activeListings = listings.filter(listing => listing.status === 'active').length;

        // Get other stats from localStorage
        const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
            totalSales: 0,
            totalEarnings: 0,
            totalPurchases: 0
        };

        // Update active listings count
        stats.activeListings = activeListings;
        localStorage.setItem('dashboardStats', JSON.stringify(stats));

        // Update UI
        document.getElementById('activeListings').textContent = activeListings;
        document.getElementById('totalSales').textContent = stats.totalSales;
        document.getElementById('totalPurchases').textContent = stats.totalPurchases;
        document.getElementById('totalEarnings').textContent = `₹${stats.totalEarnings.toLocaleString()}`;

        // Initialize charts
        initializeMonthlyChart();
        initializeCategoryChart();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        document.getElementById('activeListings').textContent = '0';
    }
}

// Initialize monthly activity chart
function initializeMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Get last 6 months
    const labels = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth - i + 12) % 12;
        return months[monthIndex];
    }).reverse();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: 'rgba(46, 204, 113, 1)',
                tension: 0.4
            }, {
                label: 'Purchases',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: 'rgba(52, 152, 219, 1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize category distribution chart
function initializeCategoryChart() {
    const ctx = document.getElementById('categoryPieChart').getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Dogs', 'Cats', 'Birds', 'Others'],
            datasets: [{
                data: [4, 3, 2, 1],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

// Update dashboard stats when new data is available
async function updateDashboardStats() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found');
            return;
        }

        // Fetch fresh listings
        const response = await fetch('http://localhost:3000/api/listings/user', {
            headers: {
                'user-id': userId
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        const listings = await response.json();

        // Count active listings
        const activeListings = listings.filter(listing => listing.status === 'active').length;

        // Get other stats
        const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
            totalSales: 0,
            totalEarnings: 0,
            totalPurchases: 0
        };

        // Update active listings count
        stats.activeListings = activeListings;
        localStorage.setItem('dashboardStats', JSON.stringify(stats));

        // Update UI
        document.getElementById('activeListings').textContent = activeListings;
        document.getElementById('totalSales').textContent = stats.totalSales;
        document.getElementById('totalPurchases').textContent = stats.totalPurchases;
        document.getElementById('totalEarnings').textContent = `₹${stats.totalEarnings.toLocaleString()}`;

    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboardStats();

    // Add click handlers for sidebar menu
    const menuItems = document.querySelectorAll('.dashboard-sidebar li');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Refresh stats every minute
    setInterval(updateDashboardStats, 60000);
});

// Export updateDashboardStats for use in other files
window.updateDashboardStats = updateDashboardStats; 