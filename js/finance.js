document.addEventListener("DOMContentLoaded", () => {

    // 1. Local State & DOM References
    let transactionsData = [];
    let currentFilter = "all";
    let searchQuery = "";

    const financeTableBody = document.getElementById("financeTableBody");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("transactionSearchInput");
    const exportCsvBtn = document.getElementById("exportCsvBtn");

    // Modal References
    const paymentModal = document.getElementById("paymentModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const openPaymentModalBtn = document.getElementById("openPaymentModalBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const paymentForm = document.getElementById("paymentForm");

    // KPI Elements
    const statGrossRevenue = document.getElementById("statGrossRevenue");
    const statTodayRevenue = document.getElementById("statTodayRevenue");
    const statPendingRevenue = document.getElementById("statPendingRevenue");
    const statActiveSubs = document.getElementById("statActiveSubs");

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();

    // 2. Handle URL Query Parameters (e.g., redirect from members.html?action=renew&memberId=FIT-1024)
    checkUrlQueryParams();

    // 3. Initial Fetch
    fetchFinanceData();

    async function fetchFinanceData() {
        showLoading(true);
        try {
            const response = await api("finance", "GET");
            if (response && response.success) {
                transactionsData = response.data;
            } else {
                transactionsData = getMockTransactions();
            }
        } catch (error) {
            console.warn("API request failed, loading local mock finance data:", error);
            transactionsData = getMockTransactions();
        } finally {
            showLoading(false);
            updateKPIs();
            renderTransactions();
        }
    }

    // 4. Update Header KPI Metric Summary
    function updateKPIs() {
        const gross = transactionsData
            .filter(t => t.status === "paid")
            .reduce((sum, t) => sum + t.amount, 0);

        const pending = transactionsData
            .filter(t => t.status === "pending")
            .reduce((sum, t) => sum + t.amount, 0);

        statGrossRevenue.textContent = `$${gross.toFixed(2)}`;
        statTodayRevenue.textContent = `$${(gross * 0.18).toFixed(2)}`; // Representative calculation
        statPendingRevenue.textContent = `$${pending.toFixed(2)}`;
        statActiveSubs.textContent = "525";
    }

    // 5. Render Transactions Table
    function renderTransactions() {
        financeTableBody.innerHTML = "";

        const filtered = transactionsData.filter(t => {
            const matchesSearch = 
                t.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.memberCode.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = 
                currentFilter === "all" ? true : t.status === currentFilter;

            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        filtered.forEach(item => {
            const row = document.createElement("tr");

            let badgeClass = "badge-success";
            let statusText = "Paid";

            if (item.status === "pending") {
                badgeClass = "badge-warning";
                statusText = "Pending";
            } else if (item.status === "refunded") {
                badgeClass = "badge-danger";
                statusText = "Refunded";
            }

            row.innerHTML = `
                <td><strong style="color: var(--primary-rapid-red); font-size: 0.85rem;">${item.ref}</strong></td>
                <td>
                    <div class="table-user-cell">
                        <div class="table-avatar">${getInitials(item.memberName)}</div>
                        <div>
                            <div class="user-name">${item.memberName}</div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary-gray);">${item.memberCode}</div>
                        </div>
                    </div>
                </td>
                <td>${item.description}</td>
                <td><strong style="color: var(--text-white);">$${item.amount.toFixed(2)}</strong></td>
                <td><span style="font-size: 0.8rem; color: var(--text-secondary-gray);">${item.method}</span></td>
                <td style="font-size: 0.8rem;">${item.date}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td style="text-align: right;">
                    <button class="table-action-btn print-btn" data-id="${item.ref}" title="Print Receipt">
                        <i data-lucide="printer" style="width:14px; height:14px;"></i>
                    </button>
                </td>
            `;

            financeTableBody.appendChild(row);
        });

        if (window.lucide) lucide.createIcons();
    }

    // 6. Search & Filter Listeners
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = e.target.value;
                renderTransactions();
            }, 300);
        });
    }

    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("primary", "active"));
            btn.classList.add("primary", "active");
            currentFilter = btn.dataset.status;
            renderTransactions();
        });
    });

    // 7. Modal Handlers
    if (openPaymentModalBtn) {
        openPaymentModalBtn.addEventListener("click", () => openModal());
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function openModal(prefillCode = "") {
        paymentForm.reset();
        if (prefillCode) {
            document.getElementById("payment-member-code").value = prefillCode;
        }
        modalOverlay.classList.add("active");
        paymentModal.style.display = "block";
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        paymentModal.style.display = "none";
    }

    // Auto update amount on plan selector change
    const descriptionSelect = document.getElementById("payment-description");
    const amountInput = document.getElementById("payment-amount");

    if (descriptionSelect && amountInput) {
        descriptionSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            if (val.includes("449.99")) amountInput.value = "449.99";
            else if (val.includes("129.99")) amountInput.value = "129.99";
            else if (val.includes("49.99")) amountInput.value = "49.99";
            else if (val.includes("35.00")) amountInput.value = "35.00";
            else if (val.includes("15.00")) amountInput.value = "15.00";
        });
    }

    // 8. Submit Payment
    if (paymentForm) {
        paymentForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const payload = {
                ref: "INV-" + Math.floor(100000 + Math.random() * 900000),
                memberCode: document.getElementById("payment-member-code").value.toUpperCase(),
                memberName: "Member (" + document.getElementById("payment-member-code").value.toUpperCase() + ")",
                description: document.getElementById("payment-description").value,
                amount: parseFloat(document.getElementById("payment-amount").value),
                method: document.getElementById("payment-method").value,
                status: document.getElementById("payment-status").value,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };

            const submitBtn = document.getElementById("savePaymentBtn");
            submitBtn.textContent = "Processing...";
            submitBtn.disabled = true;

            try {
                const response = await api("finance", "POST", payload);
                if (response && response.success) {
                    closeModal();
                    fetchFinanceData();
                } else {
                    optimisticSave(payload);
                    closeModal();
                }
            } catch (err) {
                console.warn("API payment submission error, applying local optimistic save:", err);
                optimisticSave(payload);
                closeModal();
            } finally {
                submitBtn.textContent = "Process Payment";
                submitBtn.disabled = false;
            }
        });
    }

    // Export CSV Helper
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            let csvContent = "data:text/csv;charset=utf-8,Invoice Ref,Member ID,Member Name,Description,Amount,Method,Date,Status\n";
            transactionsData.forEach(t => {
                csvContent += `${t.ref},${t.memberCode},${t.memberName},"${t.description}",${t.amount},${t.method},${t.date},${t.status}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `RapidFit_Finance_Report_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Utilities
    function checkUrlQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get("action");
        const memberId = urlParams.get("memberId");

        if (action === "renew" && memberId) {
            setTimeout(() => {
                openModal(`FIT-${memberId}`);
            }, 300);
        }
    }

    function showLoading(isLoading) {
        if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
    }

    function getInitials(name) {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??";
    }

    function optimisticSave(payload) {
        transactionsData.unshift(payload);
        updateKPIs();
        renderTransactions();
    }

    function getMockTransactions() {
        return [
            { ref: "INV-892104", memberCode: "FIT-1024", memberName: "John Doe", description: "Platinum Annual Renewal", amount: 449.99, method: "Credit/Debit Card", date: "Jul 21, 2026", status: "paid" },
            { ref: "INV-892103", memberCode: "FIT-2048", memberName: "Alice Smith", description: "Monthly Pass Renewal", amount: 49.99, method: "POS Terminal", date: "Jul 20, 2026", status: "paid" },
            { ref: "INV-892102", memberCode: "FIT-3091", memberName: "Michael Knight", description: "Gold Quarterly Renewal", amount: 129.99, method: "Bank Transfer", date: "Jul 18, 2026", status: "pending" },
            { ref: "INV-892101", memberCode: "FIT-4012", memberName: "Emma Watson", description: "Personal Trainer Add-on", amount: 35.00, method: "Cash", date: "Jul 15, 2026", status: "paid" }
        ];
    }
});