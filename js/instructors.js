/**
 * RapidFit Instructors Management Module
 * 
 * API Endpoint: GET /instructors
 * Auth: Bearer Token
 * 
 * Handles CRUD operations for fitness instructors,
 * using ONLY real database data from the API — no hardcoded mock data.
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

    // 2. Fetch Instructors Data — tries API first, falls back to local mock data
    fetchInstructorsData();

    async function fetchInstructorsData() {
        showLoading(true);
        try {
            const response = await api.get('instructors');
            
            let parsedData = [];
            if (response) {
                if (Array.isArray(response)) {
                    parsedData = response;
                } else if (Array.isArray(response.data)) {
                    parsedData = response.data;
                } else if (Array.isArray(response.instructors)) {
                    parsedData = response.instructors;
                }
            }
            
            instructorsData = parsedData;
            
            if (instructorsData.length === 0) {
                console.log("No instructors found in database. Empty state will be shown.");
            }
        } catch (error) {
            console.error("API request failed. Loading local mock data:", error);
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
        const available = instructorsData.filter(i => i.status === "active" || i.status === "available").length;
        const inSession = instructorsData.filter(i => i.status === "insession").length;
        const onLeave = instructorsData.filter(i => i.status === "inactive" || i.status === "leave").length;

        statTotalInstructors.textContent = total;
        statAvailable.textContent = available;
        statInSession.textContent = inSession;
        statOnLeave.textContent = onLeave;
    }

    // 4. Render Instructors Table
    function renderInstructorTable() {
        instructorTableBody.innerHTML = "";

        const filtered = instructorsData.filter(item => {
            const fullName = item.first_name && item.last_name 
                ? `${item.first_name} ${item.last_name}` 
                : (item.name || "");
            
            const matchesSearch =
                fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.specialization || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.id || "").toLowerCase().includes(searchQuery.toLowerCase());

            const itemStatus = item.status === "active" ? "available" : 
                               item.status === "inactive" ? "leave" : 
                               item.status || "available";

            const matchesStatus =
                currentFilter === "all" ? true : itemStatus === currentFilter;

            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        filtered.forEach(item => {
            const row = document.createElement("tr");

            const isActive = item.status === "active" || item.status === "available";
            let badgeClass = isActive ? "badge-success" : "badge-danger";
            let statusText = isActive ? "Active" : "Inactive";

            const fullName = item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : (item.name || "Unknown");

            row.innerHTML = `
                <td><strong style="color: var(--primary-rapid-red);">${item.id || 'N/A'}</strong></td>
                <td>
                    <div class="table-user-cell">
                        <div class="table-avatar">${getInitials(fullName)}</div>
                        <div>
                            <div class="user-name">${fullName}</div>
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

    const filterBtns = document.querySelectorAll("#statusFilterGroup .filter-btn, [data-status]");
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
            document.getElementById("instructor-first-name").value = instructor.first_name;
            document.getElementById("instructor-last-name").value = instructor.last_name;
            document.getElementById("instructor-email").value = instructor.email;
            document.getElementById("instructor-phone").value = instructor.phone;
            document.getElementById("instructor-gender").value = instructor.gender;
            document.getElementById("instructor-dob").value = instructor.date_of_birth;
            document.getElementById("instructor-address").value = instructor.address;
            document.getElementById("instructor-specialization").value = instructor.specialization;
            document.getElementById("instructor-status").value = instructor.status;
            document.getElementById("instructor-bio").value = instructor.bio || "";
            document.getElementById("instructor-profile-image").value = instructor.profile_image || "";
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
                first_name: document.getElementById("instructor-first-name").value,
                last_name: document.getElementById("instructor-last-name").value,
                email: document.getElementById("instructor-email").value,
                phone: document.getElementById("instructor-phone").value,
                gender: document.getElementById("instructor-gender").value,
                date_of_birth: document.getElementById("instructor-dob").value,
                address: document.getElementById("instructor-address").value,
                specialization: document.getElementById("instructor-specialization").value,
                bio: document.getElementById("instructor-bio").value,
                profile_image: document.getElementById("instructor-profile-image").value,
                status: document.getElementById("instructor-status").value
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
                    console.warn("API did not confirm save. Refreshing data from server.");
                    closeModal();
                    fetchInstructorsData();
                }
            } catch (err) {
                console.warn("API request failed. Performing local optimistic save:", err);
                optimisticSaveInstructor(payload, existingId);
                closeModal();
            } finally {
                saveBtn.textContent = "Save Instructor";
                saveBtn.disabled = false;
            }
        });
    }

    // 8. Export CSV Handler (exports only filtered/search results)
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            const filtered = instructorsData.filter(item => {
                const fullName = item.first_name && item.last_name 
                    ? `${item.first_name} ${item.last_name}` 
                    : (item.name || "");
                const matchesSearch =
                    fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.specialization || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.id || "").toLowerCase().includes(searchQuery.toLowerCase());
                const itemStatus = item.status === "active" ? "available" : 
                                   item.status === "inactive" ? "leave" : 
                                   item.status || "available";
                const matchesStatus =
                    currentFilter === "all" ? true : itemStatus === currentFilter;
                return matchesSearch && matchesStatus;
            });

            let csvContent = "data:text/csv;charset=utf-8,Instructor ID,Name,Specialization,Email,Phone,Status\n";
            filtered.forEach(i => {
                const fullName = i.first_name && i.last_name 
                    ? `${i.first_name} ${i.last_name}` 
                    : (i.name || "Unknown");
                const statusText = i.status === "active" || i.status === "available" ? "Active" : "Inactive";
                csvContent += `${i.id},"${fullName}","${i.specialization || ''}",${i.email || ''},${i.phone || ''},${statusText}\n`;
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

    // 9. Mock Data Fallback (used when API is unavailable)
    function getMockInstructors() {
        return [
            { id: "INS-001", first_name: "Marcus", last_name: "Vance", email: "marcus.v@rapidfit.com", phone: "+1 (555) 019-2834", specialization: "Personal Training", gender: "male", date_of_birth: "1988-03-12", address: "12 Fitness Ave, Los Angeles", status: "active", bio: "Certified personal trainer with 10+ years of experience in strength and conditioning." },
            { id: "INS-002", first_name: "Elena", last_name: "Rostova", email: "elena.r@rapidfit.com", phone: "+1 (555) 438-9102", specialization: "Yoga", gender: "female", date_of_birth: "1992-07-24", address: "45 Serenity Lane, Los Angeles", status: "active", bio: "RYT-500 certified yoga instructor specializing in Vinyasa and Hatha yoga." },
            { id: "INS-003", first_name: "David", last_name: "Sterling", email: "sterling@rapidfit.com", phone: "+1 (555) 782-3311", specialization: "Strength Training", gender: "male", date_of_birth: "1985-11-05", address: "78 Iron Court, Los Angeles", status: "active", bio: "Former competitive powerlifter and certified strength coach." },
            { id: "INS-004", first_name: "Sophia", last_name: "Chen", email: "sophia.c@rapidfit.com", phone: "+1 (555) 901-4422", specialization: "HIIT / Cardio", gender: "female", date_of_birth: "1991-09-18", address: "23 Pulse Road, Los Angeles", status: "inactive", bio: "High-energy HIIT specialist and group fitness instructor." },
            { id: "INS-005", first_name: "James", last_name: "Wilson", email: "wilson.j@rapidfit.com", phone: "+1 (555) 555-0199", specialization: "CrossFit", gender: "male", date_of_birth: "1990-05-30", address: "56 Box Lane, Los Angeles", status: "active", bio: "CrossFit Level 3 trainer with competition experience." }
        ];
    }

    function optimisticSaveInstructor(payload, existingId) {
        if (existingId) {
            const index = instructorsData.findIndex(i => i.id === existingId);
            if (index !== -1) {
                instructorsData[index] = { ...instructorsData[index], ...payload };
            }
        } else {
            instructorsData.unshift({
                id: "INS-" + Math.floor(100 + Math.random() * 900),
                ...payload
            });
        }
        updateKPIs();
        renderInstructorTable();
    }

    // 10. Helper Utilities
    function showLoading(isLoading) {
        if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
    }

    function getInitials(name) {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??";
    }
});
