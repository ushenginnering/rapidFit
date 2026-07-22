document.addEventListener("DOMContentLoaded", () => {

    // 1. Local State & References
    let corporateAccounts = [];
    let currentFilter = "all";
    let searchQuery = "";

    const corporateTableBody = document.getElementById("corporateTableBody");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("corporateSearchInput");
    const exportCsvBtn = document.getElementById("exportCorporateCsvBtn");

    // Modal References
    const corporateModal = document.getElementById("corporateModal");
    const modalOverlay = document.getElementById("corporateModalOverlay");
    const openCorporateModalBtn = document.getElementById("openCorporateModalBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const corporateForm = document.getElementById("corporateForm");
    const modalTitle = document.getElementById("modalTitle");

    // KPI Summary Ref
    const statCorporateCount = document.getElementById("statCorporateCount");
    const statAllocatedSeats = document.getElementById("statAllocatedSeats");
    const statCorporateRevenue = document.getElementById("statCorporateRevenue");
    const statAvgUtilization = document.getElementById("statAvgUtilization");

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();

    // 2. Fetch Corporate Data
    fetchCorporateData();

    async function fetchCorporateData() {
        showLoading(true);
        try {
            const response = await api("corporate", "GET");
            if (response && response.success) {
                corporateAccounts = response.data;
            } else {
                corporateAccounts = getMockCorporateAccounts();
            }
        } catch (error) {
            console.warn("API request failed, loading local mock corporate data:", error);
            corporateAccounts = getMockCorporateAccounts();
        } finally {
            showLoading(false);
            updateKPIs();
            renderCorporateTable();
        }
    }

    // 3. Compute KPI Summary Values
    function updateKPIs() {
        const activeAccounts = corporateAccounts.filter(c => c.status === "active");
        
        const totalSeats = corporateAccounts.reduce((acc, c) => acc + c.totalSeats, 0);
        const usedSeats = corporateAccounts.reduce((acc, c) => acc + c.usedSeats, 0);
        const totalRevenue = activeAccounts.reduce((acc, c) => acc + c.monthlyFee, 0);

        const utilization = totalSeats > 0 ? Math.round((usedSeats / totalSeats) * 100) : 0;

        statCorporateCount.textContent = activeAccounts.length;
        statAllocatedSeats.textContent = `${usedSeats} / ${totalSeats}`;
        statCorporateRevenue.textContent = `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        statAvgUtilization.textContent = `${utilization}%`;
    }

    // 4. Render Table Roster
    function renderCorporateTable() {
        corporateTableBody.innerHTML = "";

        const filtered = corporateAccounts.filter(item => {
            const matchesSearch = 
                item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = currentFilter === "all" ? true : item.status === currentFilter;

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
            let statusText = "Active";

            if (item.status === "pending") {
                badgeClass = "badge-warning";
                statusText = "Renewal Due";
            } else if (item.status === "inactive") {
                badgeClass = "badge-danger";
                statusText = "Inactive";
            }

            const usagePercent = Math.round((item.usedSeats / item.totalSeats) * 100);

            row.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: var(--text-white);">${item.companyName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary-gray);">${item.id}</div>
                </td>
                <td>
                    <div style="font-size: 0.85rem; color: var(--text-white);">${item.contactName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary-gray);">${item.contactEmail}</div>
                </td>
                <td><span style="font-weight: 500; font-size: 0.85rem;">${item.tier}</span></td>
                <td>
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-white);">
                        ${item.usedSeats} / ${item.totalSeats} <span style="font-weight:400; font-size:0.75rem; color: var(--text-secondary-gray);">(${usagePercent}%)</span>
                    </div>
                    <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 4px; overflow: hidden;">
                        <div style="width: ${usagePercent}%; height: 100%; background: var(--primary-rapid-red); border-radius: 2px;"></div>
                    </div>
                </td>
                <td><strong style="color: var(--text-white);">$${item.monthlyFee.toFixed(2)}</strong>/mo</td>
                <td style="font-size: 0.8rem;">${item.contractEnd}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td style="text-align: right;">
                    <button class="table-action-btn edit-btn" data-id="${item.id}" title="Edit Contract">
                        <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
                    </button>
                </td>
            `;

            corporateTableBody.appendChild(row);
        });

        // Re-bind click events for dynamic edit buttons
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const targetId = btn.dataset.id;
                const client = corporateAccounts.find(c => c.id === targetId);
                if (client) openModal(client);
            });
        });

        if (window.lucide) lucide.createIcons();
    }

    // 5. Search & Filter Handlers
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = e.target.value;
                renderCorporateTable();
            }, 300);
        });
    }

    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("primary", "active"));
            btn.classList.add("primary", "active");
            currentFilter = btn.dataset.status;
            renderCorporateTable();
        });
    });

    // 6. Modal Controls
    if (openCorporateModalBtn) {
        openCorporateModalBtn.addEventListener("click", () => openModal());
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function openModal(clientData = null) {
        corporateForm.reset();
        if (clientData) {
            modalTitle.textContent = "Edit Corporate Account";
            document.getElementById("corporate-id").value = clientData.id;
            document.getElementById("corporate-name").value = clientData.companyName;
            document.getElementById("corporate-contact-name").value = clientData.contactName;
            document.getElementById("corporate-contact-email").value = clientData.contactEmail;
            document.getElementById("corporate-tier").value = clientData.tier;
            document.getElementById("corporate-seats").value = clientData.totalSeats;
            document.getElementById("corporate-monthly-fee").value = clientData.monthlyFee;
            document.getElementById("corporate-status").value = clientData.status;
        } else {
            modalTitle.textContent = "Add Corporate Client";
            document.getElementById("corporate-id").value = "";
        }

        modalOverlay.classList.add("active");
        corporateModal.style.display = "block";
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        corporateModal.style.display = "none";
    }

    // 7. Form Submission Handler
    if (corporateForm) {
        corporateForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const existingId = document.getElementById("corporate-id").value;

            const payload = {
                id: existingId || "CORP-" + Math.floor(100 + Math.random() * 900),
                companyName: document.getElementById("corporate-name").value,
                contactName: document.getElementById("corporate-contact-name").value,
                contactEmail: document.getElementById("corporate-contact-email").value,
                tier: document.getElementById("corporate-tier").value,
                totalSeats: parseInt(document.getElementById("corporate-seats").value, 10),
                usedSeats: existingId ? (corporateAccounts.find(c => c.id === existingId)?.usedSeats || 0) : 0,
                monthlyFee: parseFloat(document.getElementById("corporate-monthly-fee").value),
                contractEnd: "Dec 31, 2026",
                status: document.getElementById("corporate-status").value
            };

            const saveBtn = document.getElementById("saveCorporateBtn");
            saveBtn.textContent = "Saving Contract...";
            saveBtn.disabled = true;

            try {
                const method = existingId ? "PUT" : "POST";
                const response = await api("corporate", method, payload);

                if (response && response.success) {
                    closeModal();
                    fetchCorporateData();
                } else {
                    optimisticSave(payload, existingId);
                    closeModal();
                }
            } catch (err) {
                console.warn("API request failed, performing local optimistic save:", err);
                optimisticSave(payload, existingId);
                closeModal();
            } finally {
                saveBtn.textContent = "Save Corporate Contract";
                saveBtn.disabled = false;
            }
        });
    }

    // Export CSV Helper
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            let csvContent = "data:text/csv;charset=utf-8,Corp ID,Company Name,Contact Person,Email,Tier,Used Seats,Total Seats,Monthly Fee,Contract End,Status\n";
            corporateAccounts.forEach(c => {
                csvContent += `${c.id},"${c.companyName}","${c.contactName}",${c.contactEmail},${c.tier},${c.usedSeats},${c.totalSeats},${c.monthlyFee},${c.contractEnd},${c.status}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `RapidFit_Corporate_Directory_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Helper Utilities
    function showLoading(isLoading) {
        if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
    }

    function optimisticSave(payload, existingId) {
        if (existingId) {
            const index = corporateAccounts.findIndex(c => c.id === existingId);
            if (index !== -1) corporateAccounts[index] = payload;
        } else {
            corporateAccounts.unshift(payload);
        }
        updateKPIs();
        renderCorporateTable();
    }

    function getMockCorporateAccounts() {
        return [
            { id: "CORP-101", companyName: "Ush Engineering Technology", contactName: "Uchenna Ukeh", contactEmail: "uchenna@ushengineering.com", tier: "Enterprise Tier", usedSeats: 42, totalSeats: 50, monthlyFee: 2100.00, contractEnd: "Nov 15, 2026", status: "active" },
            { id: "CORP-102", companyName: "Apex Global Dynamics", contactName: "Sarah Jenkins", contactEmail: "s.jenkins@apex.io", tier: "Corporate Gold", usedSeats: 18, totalSeats: 25, monthlyFee: 950.00, contractEnd: "Aug 30, 2026", status: "active" },
            { id: "CORP-103", companyName: "Vanguard Tech Labs", contactName: "David Miller", contactEmail: "hr@vanguardlabs.com", tier: "Business Flex", usedSeats: 10, totalSeats: 10, monthlyFee: 499.00, contractEnd: "Jul 28, 2026", status: "pending" },
            { id: "CORP-104", companyName: "Nexus Creative Media", contactName: "Chloe Bennett", contactEmail: "chloe@nexusmedia.co", tier: "Corporate Gold", usedSeats: 0, totalSeats: 15, monthlyFee: 650.00, contractEnd: "Jan 10, 2027", status: "inactive" }
        ];
    }
});