/**
 * RapidFit Instructors Management Module
 * 
 * API Endpoint: GET /instructors
 * Auth: Bearer Token
 * 
 * Handles CRUD operations for fitness instructors,
 * including status tracking, specialization filtering, and CSV export.
 */
document.addEventListener("DOMContentLoaded", () => {

    // 1. Local State & DOM References
    let instructorsData = [];
    let currentFilter = "all";
    let searchQuery = "";

    const instructorTableBody = document.getElementById("instructorTableBody");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("instructorSearchInput");
    const exportCsvBtn = document.getElementById("exportInstructorCsvBtn");

    // Modal References
    const instructorModal = document.getElementById("instructorModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const openAddInstructorBtn = document.getElementById("openAddInstructorBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const instructorForm = document.getElementById("instructorForm");
    const modalTitle = document.getElementById("modalTitle");

    // KPI References
    const statTotalInstructors = document.getElementById("statTotalInstructors");
    const statAvailable = document.getElementById("statAvailable");
    const statInSession = document.getElementById("statInSession");
    const statOnLeave = document.getElementById("statOnLeave");

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();

    // 2. Fetch Instructors Data
    fetchInstructorsData();

    async function fetchInstructorsData() {
        showLoading(true);
        try {
            // API: GET /instructors with Bearer token (handled by api.js automatically)
            const response = await api.get('instructors');
            if (response && response.success) {
                instructorsData = response.data;
            } else {
                instructorsData = getMockInstructors();
            }
        } catch (error) {
            console.warn("API request failed, loading local mock instructors data:", error);
            instructorsData = getMockInstructors();
        } finally {
            showLoading(false);
            updateKPIs();
            renderInstructorTable();
        }
    }

    // 3. Compute KPI Summary Values
    function updateKPIs() {
        const total = instructorsData.length;
        const available = instructorsData.filter(i => i.status === "available").length;
        const inSession = instructorsData.filter(i => i.status === "insession").length;
        const onLeave = instructorsData.filter(i => i.status === "leave").length;

        statTotalInstructors.textContent = total;
        statAvailable.textContent = available;
        statInSession.textContent = inSession;
        statOnLeave.textContent = onLeave;
    }

    // 4. Render Instructors Table
    function renderInstructorTable() {
        instructorTableBody.innerHTML = "";

        const filtered = instructorsData.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase());

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

            if (item.status === "insession") {
                badgeClass = "badge-warning";
                statusText = "In Session";
            } else if (item.status === "leave") {
                badgeClass = "badge-danger";
                statusText = "On Leave";
            }

            row.innerHTML = `
                <td><strong style="color: var(--primary-rapid-red); font-size: 0.85rem;">${item.id}</strong></td>
                <td>
                    <div class="table-user-cell">
                        <div class="table-avatar">${getInitials(item.name)}</div>
                        <div>
                            <div class="user-name">${item.name}</div>
                        </div>
                    </div>
                </td>
                <td><span style="font-size: 0.85rem; font-weight: 500; color: var(--text-white);">${item.specialization}</span></td>
                <td style="font-size: 0.8rem; color: var(--text-secondary-gray);">${item.email}</td>
                <td style="font-size: 0.8rem;">${item.phone}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td style="text-align: right;">
                    <button class="table-action-btn edit-btn" data-id="${item.id}" title="Edit Instructor">
                        <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
                    </button>
                </td>
            `;

            instructorTableBody.appendChild(row);
        });

        // Re-bind click events for dynamic edit buttons
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const targetId = btn.dataset.id;
                const instructor = instructorsData.find(i => i.id === targetId);
                if (instructor) openModal(instructor);
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
                renderInstructorTable();
            }, 300);
        });
    }

    const filterBtns = document.querySelectorAll("#statusFilterGroup .filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("primary", "active"));
            btn.classList.add("primary", "active");
            currentFilter = btn.dataset.status;
            renderInstructorTable();
        });
    });

    // 6. Modal Controls
    if (openAddInstructorBtn) {
        openAddInstructorBtn.addEventListener("click", () => openModal());
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function openModal(instructor = null) {
        instructorForm.reset();
        if (instructor) {
            modalTitle.textContent = "Edit Instructor";
            document.getElementById("instructor-id").value = instructor.id;
            document.getElementById("instructor-name").value = instructor.name;
            document.getElementById("instructor-specialization").value = instructor.specialization;
            document.getElementById("instructor-status").value = instructor.status;
            document.getElementById("instructor-email").value = instructor.email;
            document.getElementById("instructor-phone").value = instructor.phone;
        } else {
            modalTitle.textContent = "Add Instructor";
            document.getElementById("instructor-id").value = "";
        }

        modalOverlay.classList.add("active");
        instructorModal.style.display = "block";
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        instructorModal.style.display = "none";
    }

    // 7. Form Submission Handler
    if (instructorForm) {
        instructorForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const existingId = document.getElementById("instructor-id").value;

            const payload = {
                id: existingId || "INS-" + Math.floor(100 + Math.random() * 900),
                name: document.getElementById("instructor-name").value,
                specialization: document.getElementById("instructor-specialization").value,
                status: document.getElementById("instructor-status").value,
                email: document.getElementById("instructor-email").value,
                phone: document.getElementById("instructor-phone").value
            };

            const saveBtn = document.getElementById("saveInstructorBtn");
            saveBtn.textContent = "Saving...";
            saveBtn.disabled = true;

            try {
                const response = existingId
                    ? await api.put(`instructors/${existingId}`, payload)
                    : await api.post('instructors', payload);

                if (response && response.success) {
                    closeModal();
                    fetchInstructorsData();
                } else {
                    optimisticSave(payload, existingId);
                    closeModal();
                }
            } catch (err) {
                console.warn("API request failed, performing local optimistic save:", err);
                optimisticSave(payload, existingId);
                closeModal();
            } finally {
                saveBtn.textContent = "Save Instructor";
                saveBtn.disabled = false;
            }
        });
    }

    // 8. Export CSV Handler
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            let csvContent = "data:text/csv;charset=utf-8,Instructor ID,Name,Specialization,Email,Phone,Status\n";
            instructorsData.forEach(i => {
                csvContent += `${i.id},"${i.name}","${i.specialization}",${i.email},${i.phone},${i.status}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `RapidFit_Instructor_Roster_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // 9. Helper Utilities
    function showLoading(isLoading) {
        if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
    }

    function getInitials(name) {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??";
    }

    function optimisticSave(payload, existingId) {
        if (existingId) {
            const index = instructorsData.findIndex(i => i.id === existingId);
            if (index !== -1) instructorsData[index] = payload;
        } else {
            instructorsData.unshift(payload);
        }
        updateKPIs();
        renderInstructorTable();
    }

    function getMockInstructors() {
        return [
            { id: "INS-101", name: "Marcus Vance", specialization: "Personal Training", email: "marcus.v@rapidfit.com", phone: "+1 (555) 019-2834", status: "available" },
            { id: "INS-102", name: "Sofia Reyes", specialization: "Yoga", email: "sofia.r@rapidfit.com", phone: "+1 (555) 438-9102", status: "insession" },
            { id: "INS-103", name: "James Carter", specialization: "HIIT / Cardio", email: "james.c@rapidfit.com", phone: "+1 (555) 782-3311", status: "available" },
            { id: "INS-104", name: "Priya Sharma", specialization: "Pilates", email: "priya.s@rapidfit.com", phone: "+1 (555) 901-4422", status: "leave" },
            { id: "INS-105", name: "Alex Thompson", specialization: "Strength & Conditioning", email: "alex.t@rapidfit.com", phone: "+1 (555) 367-8901", status: "available" },
            { id: "INS-106", name: "Lisa Chen", specialization: "Zumba / Dance", email: "lisa.c@rapidfit.com", phone: "+1 (555) 234-5678", status: "insession" },
            { id: "INS-107", name: "David Okafor", specialization: "Martial Arts", email: "david.o@rapidfit.com", phone: "+1 (555) 876-5432", status: "available" },
            { id: "INS-108", name: "Emma Wilson", specialization: "Rehabilitation", email: "emma.w@rapidfit.com", phone: "+1 (555) 654-3210", status: "available" }
        ];
    }
});

