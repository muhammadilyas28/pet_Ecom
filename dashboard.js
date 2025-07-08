// Check if user is logged in, if not redirect to login page
if (!isLoggedIn()) {
    window.location.href = 'login.html';
}

// Get user data
const currentUser = getCurrentUser();

// Initialize dashboard data in localStorage if it doesn't exist
const DASHBOARD_KEY = 'pet_connect_dashboard';
if (!localStorage.getItem(DASHBOARD_KEY)) {
    localStorage.setItem(DASHBOARD_KEY, JSON.stringify({
        users: {},
    }));
}

// Get or initialize user's dashboard data
function getUserDashboard(userId) {
    const dashboardData = JSON.parse(localStorage.getItem(DASHBOARD_KEY));
    if (!dashboardData.users[userId]) {
        dashboardData.users[userId] = {
            listings: [],
            sales: [],
            purchases: [],
            monthlyActivity: Array(12).fill(0), // Monthly activity for the year
        };
        localStorage.setItem(DASHBOARD_KEY, JSON.stringify(dashboardData));
    }
    return dashboardData.users[userId];
}

// Get user's dashboard data
const userDashboard = getUserDashboard(currentUser.email);

// Update statistics
document.getElementById('activeListings').textContent = userDashboard.listings.filter(l => l.status === 'active').length;
document.getElementById('totalSales').textContent = userDashboard.sales.length;
document.getElementById('totalPurchases').textContent = userDashboard.purchases.length;

// Calculate total earnings
const totalEarnings = userDashboard.sales.reduce((sum, sale) => sum + sale.price, 0);
document.getElementById('totalEarnings').textContent = `₹${totalEarnings.toFixed(2)}`;

// Initialize monthly activity chart
const ctx = document.getElementById('monthlyChart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Activity',
            data: userDashboard.monthlyActivity,
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

// Sample data for latest listings (in a real app, this would come from your backend)
const sampleListings = [
    { name: 'Golden Retriever Puppy', price: 8000, status: 'active' },
    { name: 'Persian Cat', price: 12000, status: 'pending' },
    { name: 'Rabbit with Cage', price: 4500, status: 'sold' },
    { name: 'Siamese Kitten', price: 6000, status: 'active' }
];

// Populate latest listings table
const listingsTableBody = document.querySelector('#latestListings tbody');
sampleListings.forEach(listing => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${listing.name}</td>
        <td>₹${listing.price}</td>
        <td><span class="status ${listing.status}">${listing.status}</span></td>
        <td><button class="action-btn">View</button></td>
    `;
    listingsTableBody.appendChild(row);
});

// Handle sidebar navigation
document.querySelectorAll('.dashboard-sidebar li').forEach(item => {
    item.addEventListener('click', function () {
        // Remove active class from all items
        document.querySelectorAll('.dashboard-sidebar li').forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        this.classList.add('active');

        // In a real app, you would handle navigation here
        // For now, we'll just log the action
        console.log('Navigating to:', this.textContent.trim());
    });
});

// Add sample data function (for testing purposes)
function addSampleData() {
    const dashboardData = JSON.parse(localStorage.getItem(DASHBOARD_KEY));
    const userId = currentUser.email;

    // Add sample listings
    dashboardData.users[userId].listings = [
        { id: 1, name: 'Golden Retriever', price: 8000, status: 'active', date: '2024-01-15' },
        { id: 2, name: 'Persian Cat', price: 12000, status: 'pending', date: '2024-02-01' },
        { id: 3, name: 'Rabbit', price: 4500, status: 'sold', date: '2024-02-15' }
    ];

    // Add sample sales
    dashboardData.users[userId].sales = [
        { id: 1, petName: 'Rabbit', price: 4500, date: '2024-02-15' }
    ];

    // Add sample purchases
    dashboardData.users[userId].purchases = [
        { id: 1, petName: 'Siamese Cat', price: 6000, date: '2024-01-20' }
    ];

    // Add sample monthly activity
    dashboardData.users[userId].monthlyActivity = [2, 3, 4, 3, 5, 4, 3, 4, 5, 4, 3, 6];

    localStorage.setItem(DASHBOARD_KEY, JSON.stringify(dashboardData));
    location.reload(); // Refresh to show new data
}

// Uncomment the line below to add sample data when testing
// addSampleData(); 