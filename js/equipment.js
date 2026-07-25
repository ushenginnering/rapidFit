/**
 * RapidFit Equipment Management Module
 * 
 * Handles CRUD operations for gym equipment inventory,
 * including status tracking, maintenance scheduling, and CSV export.
 */
document.addEventListener("DOMContentLoaded", () => {

    // 1. Local State & DOM References
    let equipmentData = [];
    let currentFilter = "all";
    let searchQuery = "";

    const equipmentTableBody = document.getElementById("equipmentTableBody");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("equipmentSearchInput");
    const exportCsvBtn = document.getElementById("exportEquipmentCsvBtn");

    // Modal References
    const equipmentModal = document.getElementById("equipmentModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const openAddEquipmentBtn = document.getElementById("openAddEquipmentBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const equipmentForm = document.getElementById("equipmentForm");
    const modalTitle = document.getElementById("modalTitle");

    // KPI References
    const statTotalEquipment = document.getElementById("statTotalEquipment");
    const statAvailable = document.getElementById("statAvailable");
    const statInUse = document.getElementById("statInUse");
    const statMaintenance = document.getElementById("statMaintenance");

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();

    // 2. Fetch Equipment Data
    fetchEquipmentData();

    async function fetchEquipmentData() {
        showLoading(true);
        try {
            const response = await api.get('equipment');
            if (response && response.success) {
                equipmentData = response.data;
            } else {
                equipmentData = getMockEquipment();
            }
        } catch (error) {
            console.warn("API request failed, loading local mock equipment data:", error);
            equipmentData = getMockEquipment();
        } finally {
            showLoading(false);
            updateKPIs();
            renderEquipmentTable();
        }
    }

    // 3. Compute KPI Summary Values
    function updateKPIs() {
        const total = equipmentData.length;
        const available = equipmentData.filter(e => e.status === "available").length;
        const inUse = equipmentData.filter(e => e.status === "inuse").length;
        const maintenance = equipmentData.filter(e => e.status === "maintenance").length;

        statTotalEquipment.textContent = total;
        statAvailable.textContent = available;
        statInUse.textContent = inUse;
        statMaintenance.textContent = maintenance;
    }

    // 4. Render Equipment Table
    function renderEquipmentTable() {
        equipmentTableBody.innerHTML = "";

        const filtered = equipmentData.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                currentFilter === "all" ? true : item.status === currentFilter;

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
            let statusText = "Available";

            if (item.status === "inuse") {
                badgeClass = "badge-warning";
                statusText = "In Use";
            } else if (item.status === "maintenance") {
                badgeClass = "badge-danger";
                statusText = "Maintenance";
            }

            row.innerHTML = `
                <td><strong style="color: var(--primary-rapid-red); font-size: 0.85rem;">${item.id}</strong></td>
                <td>
                    <div style="font-weight: 500; color: var(--text-white);">${item.name}</div>
                </td>
                <td><span style="font-size: 0.85rem; color: var(--text-secondary-gray);">${item.category}</span></td>
                <td style="font-size: 0.8rem;">${item.location}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td style="font-size: 0.8rem;">${item.lastMaintenance}</td>
                <td style="font-size: 0.8rem;">${item.nextMaintenance}</td>
                <td style="text-align: right;">
                    <button class="table-action-btn edit-btn" data-id="${item.id}" title="Edit Equipment">
                        <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
                    </button>
                </td>
            `;

            equipmentTableBody.appendChild(row);
        });

        // Re-bind click events for dynamic edit buttons
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const targetId = btn.dataset.id;
                const equipment = equipmentData.find(e => e.id === targetId);
                if (equipment) openModal(equipment);
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
                renderEquipmentTable();
            }, 300);
        });
    }

    const filterBtns = document.querySelectorAll("#statusFilterGroup .filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("primary", "active"));
            btn.classList.add("primary", "active");
            currentFilter = btn.dataset.status;
            renderEquipmentTable();
        });
    });

    // 6. Modal Controls
    if (openAddEquipmentBtn) {
        openAddEquipmentBtn.addEventListener("click", () => openModal());
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function openModal(equipment = null) {
        equipmentForm.reset();
        if (equipment) {
            modalTitle.textContent = "Edit Equipment";
            document.getElementById("equipment-id").value = equipment.id;
            document.getElementById("equipment-name").value = equipment.name;
            document.getElementById("equipment-category").value = equipment.category;
            document.getElementById("equipment-location").value = equipment.location;
            document.getElementById("equipment-status").value = equipment.status;
            document.getElementById("equipment-last-maintenance").value = equipment.lastMaintenance;
        } else {
            modalTitle.textContent = "Add Equipment";
            document.getElementById("equipment-id").value = "";
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById("equipment-last-maintenance").value = today;
        }

        modalOverlay.classList.add("active");
        equipmentModal.style.display = "block";
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        equipmentModal.style.display = "none";
    }

    // 7. Form Submission Handler
    if (equipmentForm) {
        equipmentForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const existingId = document.getElementById("equipment-id").value;
            const lastMaintenance = document.getElementById("equipment-last-maintenance").value;

            // Calculate next maintenance date (30 days after last maintenance)
            const lastDate = new Date(lastMaintenance);
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + 30);
            const nextMaintenance = nextDate.toISOString().split('T')[0];

            const payload = {
                id: existingId || "EQP-" + Math.floor(100 + Math.random() * 900),
                name: document.getElementById("equipment-name").value,
                category: document.getElementById("equipment-category").value,
                location: document.getElementById("equipment-location").value,
                status: document.getElementById("equipment-status").value,
                lastMaintenance: lastMaintenance,
                nextMaintenance: nextMaintenance
            };

            const saveBtn = document.getElementById("saveEquipmentBtn");
            saveBtn.textContent = "Saving...";
            saveBtn.disabled = true;

            try {
                const response = existingId
                    ? await api.put(`equipment/${existingId}`, payload)
                    : await api.post('equipment', payload);

                if (response && response.success) {
                    closeModal();
                    fetchEquipmentData();
                } else {
                    optimisticSave(payload, existingId);
                    closeModal();
                }
            } catch (err) {
                console.warn("API request failed, performing local optimistic save:", err);
                optimisticSave(payload, existingId);
                closeModal();
            } finally {
                saveBtn.textContent = "Save Equipment";
                saveBtn.disabled = false;
            }
        });
    }

    // 8. Export CSV Handler
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            let csvContent = "data:text/csv;charset=utf-8,Equipment ID,Name,Category,Location,Status,Last Maintenance,Next Maintenance\n";
            equipmentData.forEach(e => {
                csvContent += `${e.id},"${e.name}","${e.category}","${e.location}",${e.status},${e.lastMaintenance},${e.nextMaintenance}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `RapidFit_Equipment_Inventory_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // 9. Helper Utilities
    function showLoading(isLoading) {
        if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
    }

    function optimisticSave(payload, existingId) {
        if (existingId) {
            const index = equipmentData.findIndex(e => e.id === existingId);
            if (index !== -1) equipmentData[index] = payload;
        } else {
            equipmentData.unshift(payload);
        }
        updateKPIs();
        renderEquipmentTable();
    }

    function getMockEquipment() {
        return [
            { id: "EQP-101", name: "Treadmill XT-2000", category: "Cardio", location: "Floor 1, Zone A", status: "inuse", lastMaintenance: "2026-06-15", nextMaintenance: "2026-07-15" },
            { id: "EQP-102", name: "Leg Press Machine", category: "Strength", location: "Floor 1, Zone B", status: "available", lastMaintenance: "2026-06-10", nextMaintenance: "2026-07-10" },
            { id: "EQP-103", name: "Dumbbell Set (5-50 lbs)", category: "Free Weights", location: "Floor 2, Zone C", status: "available", lastMaintenance: "2026-06-01", nextMaintenance: "2026-07-01" },
            { id: "EQP-104", name: "Cable Crossover Machine", category: "Strength", location: "Floor 1, Zone B", status: "maintenance", lastMaintenance: "2026-05-20", nextMaintenance: "2026-06-20" },
            { id: "EQP-105", name: "Stationary Bike Pro", category: "Cardio", location: "Floor 2, Zone A", status: "inuse", lastMaintenance: "2026-06-18", nextMaintenance: "2026-07-18" },
            { id: "EQP-106", name: "Smith Machine", category: "Strength", location: "Floor 1, Zone B", status: "available", lastMaintenance: "2026-06-12", nextMaintenance: "2026-07-12" },
            { id: "EQP-107", name: "Yoga Mats (Set of 10)", category: "Functional Training", location: "Floor 2, Studio", status: "available", lastMaintenance: "2026-06-05", nextMaintenance: "2026-07-05" },
            { id: "EQP-108", name: "Foam Rollers", category: "Recovery & Mobility", location: "Floor 2, Recovery Zone", status: "available", lastMaintenance: "2026-06-08", nextMaintenance: "2026-07-08" }
        ];
    }
});

