document.addEventListener("DOMContentLoaded", () => {

    // 1. Local State & References
    let staffMembers = [];
    let currentRoleFilter = "all";
    let searchQuery = "";

    const staffTableBody = document.getElementById("staffTableBody");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("staffSearchInput");
    const exportCsvBtn = document.getElementById("exportStaffCsvBtn");

    // Modal References
    const staffModal = document.getElementById("staffModal");
    const modalOverlay = document.getElementById("staffModalOverlay");
    const openStaffModalBtn = document.getElementById("openStaffModalBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const staffForm = document.getElementById("staffForm");
    const modalTitle = document.getElementById("modalTitle");

    // KPI References
    const statTotalStaff = document.getElementById("statTotalStaff");
    const statOnDuty = document.getElementById("statOnDuty");
    const statTrainers = document.getElementById("statTrainers");
    const statAdmins = document.getElementById("statAdmins");

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();

    // 2. Fetch Initial Staff Data
    fetchStaffData();

    async function fetchStaffData() {
        showLoading(true);
        try {
            const response = await api("staff", "GET");
            if (response && response.success) {
                staffMembers = response.data;
            } else {
                staffMembers = getMockStaffData();
            }
        } catch (error) {
            console.warn("API request failed, loading local mock staff data:", error);
            staffMembers = getMockStaffData();
        } finally {
            showLoading(false);
            updateKPIs();
            renderStaffTable();
        }
    }

    // 3. Compute KPI Summary Values
    function updateKPIs() {
        const onDutyCount = staffMembers.filter(s => s.dutyStatus === "onduty").length;
        const trainersCount = staffMembers.filter(s => s.role.toLowerCase().includes("trainer")).length;
        const adminsCount = staffMembers.filter(s => s.access.toLowerCase().includes("admin")).length;

        statTotalStaff.textContent = staffMembers.length;
        statOnDuty.textContent = onDutyCount;
        statTrainers.textContent = trainersCount;
        statAdmins.textContent = adminsCount;
    }

    // 4. Render Staff Table Roster
    function renderStaffTable() {
        staffTableBody.innerHTML = "";

        const filtered = staffMembers.filter(item => {
            const matchesSearch = 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.role.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesRole = true;
            if (currentRoleFilter === "trainer") matchesRole = item.role.toLowerCase().includes("trainer");
            else if (currentRoleFilter === "receptionist") matchesRole = item.role.toLowerCase().includes("front desk");
            else if (currentRoleFilter === "admin") matchesRole = item.access.toLowerCase().includes("admin");

            return matchesSearch && matchesRole;
        });

        if (filtered.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        filtered.forEach(item => {
            const row = document.createElement("tr");

            let badgeClass = "badge-success";
            let statusText = "On Duty";

            if (item.dutyStatus === "offduty") {
                badgeClass = "badge-neutral";
                statusText = "Off Duty";
            } else if (item.dutyStatus === "leave") {
                badgeClass = "badge-warning";
                statusText = "On Leave";
            }

            row.innerHTML = `
                <td>
                    <div class="table-user-cell">
                        <div class="table-avatar">${getInitials(item.name)}</div>
                        <div>
                            <div class="user-name">${item.name}</div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary-gray);">${item.id} • ${item.email}</div>
                        </div>
                    </div>
                </td>
                <td><span style="font-weight: 500; font-size: 0.85rem; color: var(--text-white);">${item.role}</span></td>
                <td>
                    <span style="font-size: 0.8rem; color: var(--text-secondary-gray); display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="shield" style="width:12px; height:12px; color: var(--primary-rapid-red);"></i> ${item.access}
                    </span>
                </td>
                <td style="font-size: 0.8rem;">${item.shift}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td style="text-align: right;">
                    <button class="table-action-btn edit-btn" data-id="${item.id}" title="Edit Staff Profile">
                        <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
                    </button>
                </td>
            `;

            staffTableBody.appendChild(row);
        });

        // Bind Edit Buttons
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const targetId = btn.dataset.id;
                const member = staffMembers.find(s => s.id === targetId);
                if (member) openModal(member);
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
                renderStaffTable();
            }, 300);
        });
    }

    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("primary", "active"));
            btn.classList.add("primary", "active");
            currentRoleFilter = btn.dataset.role;
            renderStaffTable();
        });
    });

    // 6. Modal Controls
    if (openStaffModalBtn) {
        openStaffModalBtn.addEventListener("click", () => openModal());
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function openModal(staffData = null) {
        staffForm.reset();
        if (staffData) {
            modalTitle.textContent = "Edit Staff Profile";
            document.getElementById("staff-id").value = staffData.id;
            document.getElementById("staff-name").value = staffData.name;
            document.getElementById("staff-email").value = staffData.email;
            document.getElementById("staff-phone").value = staffData.phone;
            document.getElementById("staff-role").value = staffData.role;
            document.getElementById("staff-access").value = staffData.access;
            document.getElementById("staff-shift").value = staffData.shift;
            document.getElementById("staff-duty").value = staffData.dutyStatus;
        } else {
            modalTitle.textContent = "Add Staff Member";
            document.getElementById("staff-id").value = "";
        }

        modalOverlay.classList.add("active");
        staffModal.style.display = "block";
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        staffModal.style.display = "none";
    }

    // 7. Form Submission Handler
    if (staffForm) {
        staffForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const existingId = document.getElementById("staff-id").value;

            const payload = {
                id: existingId || "STF-" + Math.floor(100 + Math.random() * 900),
                name: document.getElementById("staff-name").value,
                email: document.getElementById("staff-email").value,
                phone: document.getElementById("staff-phone").value,
                role: document.getElementById("staff-role").value,
                access: document.getElementById("staff-access").value,
                shift: document.getElementById("staff-shift").value,
                dutyStatus: document.getElementById("staff-duty").value
            };

            const saveBtn = document.getElementById("saveStaffBtn");
            saveBtn.textContent = "Saving Personnel...";
            saveBtn.disabled = true;

            try {
                const method = existingId ? "PUT" : "POST";
                const response = await api("staff", method, payload);

                if (response && response.success) {
                    closeModal();
                    fetchStaffData();
                } else {
                    optimisticSave(payload, existingId);
                    closeModal();
                }
            } catch (err) {
                console.warn("API request failed, performing local optimistic save:", err);
                optimisticSave(payload, existingId);
                closeModal();
            } finally {
                saveBtn.textContent = "Save Staff Member";
                saveBtn.disabled = false;
            }
        });
    }

    // Export CSV Helper
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            let csvContent = "data:text/csv;charset=utf-8,Staff ID,Full Name,Email,Phone,Role,Access Level,Shift,Duty Status\n";
            staffMembers.forEach(s => {
                csvContent += `${s.id},"${s.name}",${s.email},"${s.phone}","${s.role}","${s.access}","${s.shift}",${s.dutyStatus}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `RapidFit_Staff_Directory_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Utilities
    function showLoading(isLoading) {
        if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
    }

    function getInitials(name) {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??";
    }

    function optimisticSave(payload, existingId) {
        if (existingId) {
            const index = staffMembers.findIndex(s => s.id === existingId);
            if (index !== -1) staffMembers[index] = payload;
        } else {
            staffMembers.unshift(payload);
        }
        updateKPIs();
        renderStaffTable();
    }

    function getMockStaffData() {
        return [
            { id: "STF-201", name: "Marcus Vance", email: "marcus.v@rapidfit.com", phone: "+1 (555) 019-2834", role: "Personal Trainer", access: "Trainer View Only", shift: "Morning (06:00 - 14:00)", dutyStatus: "onduty" },
            { id: "STF-202", name: "Elena Rostova", email: "elena.r@rapidfit.com", phone: "+1 (555) 438-9102", role: "Front Desk Manager", access: "Front Desk / Check-In", shift: "Morning (06:00 - 14:00)", dutyStatus: "onduty" },
            { id: "STF-203", name: "David Sterling", email: "sterling@rapidfit.com", phone: "+1 (555) 782-3311", role: "General Administrator", access: "Full Administrator", shift: "Full-Time Day", dutyStatus: "onduty" },
            { id: "STF-204", name: "Sophia Chen", email: "sophia.c@rapidfit.com", phone: "+1 (555) 901-4422", role: "Nutrition Specialist", access: "Trainer View Only", shift: "Evening (14:00 - 22:00)", dutyStatus: "offduty" }
        ];
    }
});