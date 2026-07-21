document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Protection Check - Redirect if Token is Missing
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
        // Fallback for development testing; uncomment line below for production
        // location.href = "login.html";
    }

    // 2. Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 3. Mobile Sidebar Drawer Logic
    const menuToggleBtn = document.getElementById("menuToggleBtn");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    function openSidebar() {
        sidebar.classList.add("open");
        sidebarOverlay.classList.add("active");
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    }

    if (menuToggleBtn) menuToggleBtn.addEventListener("click", openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

    // 4. Logout Action Handler
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            sessionStorage.clear();
            location.href = "login.html";
        });
    }

    // 5. Initialize Financial Revenue Chart (Chart.js)
    initRevenueChart();

    // 6. Fetch Initial Dashboard API Metrics
    loadDashboardMetrics();
});

// Financial Revenue Chart Initialization
function initRevenueChart() {
    const ctx = document.getElementById("revenueChart");
    if (!ctx) return;

    const chartGradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 280);
    chartGradient.addColorStop(0, "rgba(230, 57, 70, 0.4)");
    chartGradient.addColorStop(1, "rgba(230, 57, 70, 0.0)");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            datasets: [{
                label: "Revenue ($)",
                data: [14200, 18500, 16800, 21000, 22400, 24850],
                borderColor: "#E63946",
                borderWidth: 3,
                backgroundColor: chartGradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#E63946",
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#A1A1AA" }
                },
                y: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#A1A1AA" }
                }
            }
        }
    });
}

// Asynchronous API Loader for Dashboard KPIs
async function loadDashboardMetrics() {
    try {
        // Sample integration with api.js helper
        if (typeof api === "function") {
            const response = await api("dashboard/summary", "GET");
            if (response && response.success) {
                document.getElementById("kpi-total-members").textContent = response.data.totalMembers;
                document.getElementById("kpi-active-members").textContent = response.data.activeMembers;
                document.getElementById("kpi-expiring-members").textContent = response.data.expiringSoon;
                document.getElementById("kpi-total-revenue").textContent = "$" + response.data.revenue;
            }
        }
    } catch (error) {
        console.warn("Using placeholder metrics until API connection is active:", error);
    }
}