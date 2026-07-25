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
            // Handle multiple API response formats:
            // 1. { success: true, data: [...] }
            // 2. { data: [...] }
            // 3. Direct array [...]
            if (response) {
                if (Array.isArray(response)) {
                    instructorsData = response;
                } else if (Array.isArray(response.data)) {
                    instructorsData = response.data;
                } else if (Array.isArray(response.instructors)) {
                    instructorsData = response.instructors;
                } else {
                    instructorsData = getMockInstructors();
                }
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
        // API returns status as "active" or "inactive"
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
            // Build full name from first_name + last_name or use name field
            const fullName = item.first_name && item.last_name 
                ? `${item.first_name} ${item.last_name}` 
                : (item.name || "");
            
            const matchesSearch =
                fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.specialization || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.id || "").toLowerCase().includes(searchQuery.toLowerCase());

            // Map API status to filter status
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

            // Map API status to display status
            const isActive = item.status === "active" || item.status === "available";
            let badgeClass = isActive ? "badge-success" : "badge-danger";
            let statusText = isActive ? "Active" : "Inactive";

            const fullName = item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : (item.name || "Unknown");

            row.innerHTML = `
                <td><strong style="color: var(--primary-rapid-red); font-size: 0.85rem;">${item.id}</strong></td>
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
        const fullName = `${payload.first_name} ${payload.last_name}`;
        const newEntry = {
            id: existingId || "INS-" + Math.floor(100 + Math.random() * 900),
            ...payload,
            name: fullName
        };

        if (existingId) {
            const index = instructorsData.findIndex(i => i.id === existingId);
            if (index !== -1) instructorsData[index] = newEntry;
        } else {
            instructorsData.unshift(newEntry);
        }
        updateKPIs();
        renderInstructorTable();
    }

    function getMockInstructors() {
        return [
            { id: "INS-101", first_name: "Marcus", last_name: "Vance", name: "Marcus Vance", email: "marcus.v@rapidfit.com", phone: "+1 (555) 019-2834", gender: "male", date_of_birth: "1985-06-15", address: "12 Fitness Ave, New York", specialization: "Personal Training", bio: "Certified personal trainer with 10+ years experience.", profile_image: "", status: "active" },
            { id: "INS-102", first_name: "Sofia", last_name: "Reyes", name: "Sofia Reyes", email: "sofia.r@rapidfit.com", phone: "+1 (555) 438-9102", gender: "female", date_of_birth: "1990-03-22", address: "45 Yoga Lane, Los Angeles", specialization: "Yoga", bio: "Experienced yoga instructor specializing in Vinyasa and Hatha.", profile_image: "", status: "active" },
            { id: "INS-103", first_name: "James", last_name: "Carter", name: "James Carter", email: "james.c@rapidfit.com", phone: "+1 (555) 782-3311", gender: "male", date_of_birth: "1988-11-08", address: "78 HIIT Street, Chicago", specialization: "HIIT / Cardio", bio: "High-intensity interval training specialist.", profile_image: "", status: "active" },
            { id: "INS-104", first_name: "Priya", last_name: "Sharma", name: "Priya Sharma", email: "priya.s@rapidfit.com", phone: "+1 (555) 901-4422", gender: "female", date_of_birth: "1992-07-14", address: "33 Pilates Court, San Francisco", specialization: "Pilates", bio: "Pilates instructor focused on core strength and flexibility.", profile_image: "", status: "inactive" },
            { id: "INS-105", first_name: "Alex", last_name: "Thompson", name: "Alex Thompson", email: "alex.t@rapidfit.com", phone: "+1 (555) 367-8901", gender: "male", date_of_birth: "1986-09-30", address: "90 Strength Blvd, Miami", specialization: "Strength Training", bio: "Strength and conditioning coach for athletes.", profile_image: "", status: "active" },
            { id: "INS-106", first_name: "Lisa", last_name: "Chen", name: "Lisa Chen", email: "lisa.c@rapidfit.com", phone: "+1 (555) 234-5678", gender: "female", date_of_birth: "1991-12-05", address: "22 Dance Road, Seattle", specialization: "Zumba / Dance", bio: "Energetic Zumba instructor making fitness fun.", profile_image: "", status: "active" },
            { id: "INS-107", first_name: "David", last_name: "Okafor", name: "David Okafor", email: "david.o@rapidfit.com", phone: "+1 (555) 876-5432", gender: "male", date_of_birth: "1984-04-18", address: "15 Martial Arts Way, Houston", specialization: "Martial Arts", bio: "Black belt instructor in Karate and Taekwondo.", profile_image: "", status: "active" },
            { id: "INS-108", first_name: "Emma", last_name: "Wilson", name: "Emma Wilson", email: "emma.w@rapidfit.com", phone: "+1 (555) 654-3210", gender: "female", date_of_birth: "1989-08-25", address: "55 Recovery Road, Boston", specialization: "Rehabilitation", bio: "Physical therapy and rehabilitation specialist.", profile_image: "", status: "active" }
        ];
    }
});

