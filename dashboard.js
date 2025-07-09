// Initialize dashboard stats
function initializeDashboardStats() {
    // Get stats from localStorage or use defaults
    const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
        totalSales: 0,
        activeListings: 0,
        totalEarnings: 0,
        totalPurchases: 0
    };

    // Update dashboard elements
    document.getElementById('totalSales').textContent = stats.totalSales;
    document.getElementById('activeListings').textContent = stats.activeListings;
    document.getElementById('totalPurchases').textContent = stats.totalPurchases;
    document.getElementById('totalEarnings').textContent = `₹${stats.totalEarnings.toLocaleString()}`;

    // Initialize charts
    initializeMonthlyChart();
    initializeCategoryChart();
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
                data: [0, 0, 0, 0, 0, 0], // Initialize with zeros
                borderColor: 'rgba(46, 204, 113, 1)',
                tension: 0.4
            }, {
                label: 'Purchases',
                data: [0, 0, 0, 0, 0, 0], // Initialize with zeros
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
                data: [4, 3, 2, 1], // Sample data
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
function updateDashboardStats() {
    const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
        totalSales: 0,
        activeListings: 0,
        totalEarnings: 0,
        totalPurchases: 0
    };

    // Update display elements
    document.getElementById('totalSales').textContent = stats.totalSales;
    document.getElementById('activeListings').textContent = stats.activeListings;
    document.getElementById('totalPurchases').textContent = stats.totalPurchases;
    document.getElementById('totalEarnings').textContent = `₹${stats.totalEarnings.toLocaleString()}`;
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
});

// Export updateDashboardStats for use in other files
window.updateDashboardStats = updateDashboardStats; 