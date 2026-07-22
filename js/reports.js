document.addEventListener("DOMContentLoaded", () => {

    // 1. Local State & References
    let currentPeriod = "30d";
    let reportData = null;

    const loadingState = document.getElementById("loadingState");
    const reportsTableBody = document.getElementById("reportsTableBody");
    const revenueBarChart = document.getElementById("revenueBarChart");
    const peakHoursContainer = document.getElementById("peakHoursContainer");
    const exportFullReportBtn = document.getElementById("exportFullReportBtn");
    const reportRangeText = document.getElementById("reportRangeText");

    // KPI References
    const statMRR = document.getElementById("statMRR");
    const statDailyCheckins = document.getElementById("statDailyCheckins");
    const statRetentionRate = document.getElementById("statRetentionRate");
    const statNewSignups = document.getElementById("statNewSignups");

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();

    // 2. Initial Data Fetch
    fetchReportAnalytics(currentPeriod);

    async function fetchReportAnalytics(period) {
        showLoading(true);
        try {
            const response = await api(`reports?period=${period}`, "GET");
            if (response && response.success) {
                reportData = response.data;
            } else {
                reportData = getMockReportData(period);
            }
        } catch (error) {
            console.warn("API request failed, loading local mock reports data:", error);
            reportData = getMockReportData(period);
        } finally {
            showLoading(false);
            renderAnalytics();
        }
    }

    // 3. Render Dashboard Metrics & Charts
    function renderAnalytics() {
        if (!reportData) return;

        // Render KPIs
        statMRR.textContent = `$${reportData.kpis.mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        statDailyCheckins.textContent = reportData.kpis.dailyCheckins;
        statRetentionRate.textContent = `${reportData.kpis.retentionRate}%`;
        statNewSignups.textContent = reportData.kpis.newSignups;

        // Render Bar Chart
        revenueBarChart.innerHTML = "";
        const maxVal = Math.max(...reportData.revenueChart.map(item => item.value));

        reportData.revenueChart.forEach(item => {
            const heightPercent = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
            const barWrapper = document.createElement("div");
            barWrapper.className = "bar-wrapper";
            barWrapper.innerHTML = `
                <div class="bar-fill" style="height: ${heightPercent}%;">
                    <span class="bar-value">$${item.value >= 1000 ? (item.value / 1000).toFixed(1) + "k" : item.value}</span>
                </div>
                <span class="bar-label">${item.label}</span>
            `;
            revenueBarChart.appendChild(barWrapper);
        });

        // Render Peak Hours Progress
        peakHoursContainer.innerHTML = "";
        const maxTraffic = Math.max(...reportData.peakHours.map(h => h.count));

        reportData.peakHours.forEach(hour => {
            const widthPercent = maxTraffic > 0 ? (hour.count / maxTraffic) * 100 : 0;
            const hourRow = document.createElement("div");
            hourRow.className = "peak-hour-row";
            hourRow.innerHTML = `
                <span class="peak-hour-label">${hour.time}</span>
                <div class="peak-hour-bar-bg">
                    <div class="peak-hour-bar-fill" style="width: ${widthPercent}%;"></div>
                </div>
                <span class="peak-hour-count">${hour.count} visits</span>
            `;
            peakHoursContainer.appendChild(hourRow);
        });

        // Render Breakdown Table
        reportsTableBody.innerHTML = "";
        reportData.planBreakdown.forEach(rowItem => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong style="color: var(--text-white);">${rowItem.tier}</strong></td>
                <td>${rowItem.activeAccounts}</td>
                <td>${rowItem.avgUsage} sessions</td>
                <td><strong style="color: var(--text-white);">$${rowItem.monthlyGross.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
                <td>${rowItem.renewalRate}%</td>
                <td><span class="badge badge-success">${rowItem.trend}</span></td>
            `;
            reportsTableBody.appendChild(tr);
        });

        if (window.lucide) lucide.createIcons();
    }

    // 4. Time Period Filter Handlers
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("primary", "active"));
            btn.classList.add("primary", "active");

            currentPeriod = btn.dataset.period;
            
            // Update Range Text dynamically
            if (currentPeriod === "7d") reportRangeText.textContent = "Jul 15, 2026 – Jul 21, 2026";
            else if (currentPeriod === "30d") reportRangeText.textContent = "Jul 1, 2026 – Jul 21, 2026";
            else if (currentPeriod === "quarter") reportRangeText.textContent = "Q3 2026 (Jul – Sep)";
            else if (currentPeriod === "year") reportRangeText.textContent = "Jan 1, 2026 – Jul 21, 2026";

            fetchReportAnalytics(currentPeriod);
        });
    });

    // 5. CSV Export Handler
    if (exportFullReportBtn) {
        exportFullReportBtn.addEventListener("click", () => {
            if (!reportData) return;

            let csvContent = "data:text/csv;charset=utf-8,Membership Tier,Active Accounts,Avg Weekly Usage,Monthly Gross ($),Renewal Rate (%)\n";
            reportData.planBreakdown.forEach(item => {
                csvContent += `"${item.tier}",${item.activeAccounts},${item.avgUsage},${item.monthlyGross},${item.renewalRate}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `RapidFit_Analytics_Report_${currentPeriod}_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Utility Helpers
    function showLoading(isLoading) {
        if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
    }

    function getMockReportData(period) {
        return {
            kpis: {
                mrr: period === "7d" ? 12450.00 : 28490.00,
                dailyCheckins: period === "7d" ? 184 : 210,
                retentionRate: 94.2,
                newSignups: period === "7d" ? 12 : 48
            },
            revenueChart: [
                { label: "Feb", value: 18500 },
                { label: "Mar", value: 21200 },
                { label: "Apr", value: 23800 },
                { label: "May", value: 24500 },
                { label: "Jun", value: 26900 },
                { label: "Jul", value: 28490 }
            ],
            peakHours: [
                { time: "06:00 AM - 09:00 AM", count: 142 },
                { time: "12:00 PM - 02:00 PM", count: 85 },
                { time: "05:00 PM - 08:00 PM", count: 210 },
                { time: "08:00 PM - 10:00 PM", count: 64 }
            ],
            planBreakdown: [
                { tier: "Platinum VIP Tier", activeAccounts: 180, avgUsage: 4.8, monthlyGross: 14400.00, renewalRate: 96.5, trend: "+4.2%" },
                { tier: "Gold Standard Tier", activeAccounts: 210, avgUsage: 3.5, monthlyGross: 9450.00, renewalRate: 92.0, trend: "+2.8%" },
                { tier: "Silver Flex Tier", activeAccounts: 135, avgUsage: 2.2, monthlyGross: 4050.00, renewalRate: 88.4, trend: "+1.5%" },
                { tier: "Corporate Group Tier", activeAccounts: 70, avgUsage: 3.9, monthlyGross: 4200.00, renewalRate: 98.0, trend: "+5.0%" }
            ]
        };
    }
});