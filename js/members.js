document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Initial State & Elements
    let membersData = [];
    let currentFilter = "all";
    let searchQuery = "";

    const membersTableBody = document.getElementById("membersTableBody");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("memberSearchInput");
    
    // Modal Elements
    const memberModal = document.getElementById("memberModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const openAddMemberBtn = document.getElementById("openAddMemberBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const memberForm = document.getElementById("memberForm");

    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. Fetch Members from API
    fetchMembers();

    async function fetchMembers() {
        showLoading(true);
        try {
            // Using central API helper
            const response = await api("members", "GET");
            if (response && response.success) {
                membersData = response.data;
            } else {
                // Fallback mock data for local testing
                membersData = getMockMembers();
            }
        } catch (error) {
            console.warn("API request failed, using local mock data:", error);
            membersData = getMockMembers();
        } finally {
            showLoading(false);
            renderMembers();
        }
    }

    // 3. Render Table Rows Dynamically
    function renderMembers() {
        membersTableBody.innerHTML = "";

        const filteredMembers = membersData.filter(member => {
            const matchesSearch = 
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.code.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = 
                currentFilter === "all" ? true : member.status === currentFilter;

            return matchesSearch && matchesStatus;
        });

        if (filteredMembers.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        filteredMembers.forEach(member => {
            const row = document.createElement("tr");
            
            // Map status colors according to project standard
            let badgeClass = "badge-success";
            let statusText = "Active";

            if (member.status === "expiring") {
                badgeClass = "badge-warning";
                statusText = "Expiring Soon";
            } else if (member.status === "expired") {
                badgeClass = "badge-danger";
                statusText = "Expired";
            }

            row.innerHTML = `
                <td><strong style="color: var(--primary-rapid-red);">${member.code}</strong></td>
                <td>
                    <div class="table-user-cell">
                        <div class="table-avatar">${getInitials(member.name)}</div>
                        <div>
                            <div class="user-name">${member.name}</div>
                        </div>
                    </div>
                </td>
                <td>${member.plan}</td>
                <td>
                    <div style="font-size: 0.8rem;">${member.phone}</div>
                    <div style="font-size: 0.72rem; color: var(--text-secondary-gray);">${member.email}</div>
                </td>
                <td>${member.expiryDate}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td style="text-align: right;">
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="table-action-btn edit-btn" data-id="${member.id}" title="Edit Profile">
                            <i data-lucide="edit-2" style="width:14px; height:14px;"></i>
                        </button>
                        <button class="table-action-btn primary renew-btn" data-id="${member.id}" title="Renew Membership">
                            Renew
                        </button>
                    </div>
                </td>
            `;

            membersTableBody.appendChild(row);
        });

        // Re-initialize Lucide icons for dynamically added rows
        if (window.lucide) lucide.createIcons();
        attachRowActionListeners();
    }

    // 4. Debounced Search Handler
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = e.target.value;
                renderMembers();
            }, 300); // 300ms debounce
        });
    }

    // 5. Filter Button Listeners
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("primary", "active"));
            btn.classList.add("primary", "active");
            currentFilter = btn.dataset.status;
            renderMembers();
        });
    });

    // 6. Modal Controls (Add / Edit)
    if (openAddMemberBtn) {
        openAddMemberBtn.addEventListener("click", () => openModal());
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function openModal(member = null) {
        if (member) {
            document.getElementById("modalTitle").textContent = "Edit Member Profile";
            document.getElementById("member-id").value = member.id;
            document.getElementById("member-fullname").value = member.name;
            document.getElementById("member-email").value = member.email;
            document.getElementById("member-phone").value = member.phone;
            document.getElementById("member-plan").value = member.plan;
        } else {
            document.getElementById("modalTitle").textContent = "Register New Member";
            memberForm.reset();
            document.getElementById("member-id").value = "";
        }
        
        modalOverlay.classList.add("active");
        memberModal.style.display = "block";
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        memberModal.style.display = "none";
    }

    // 7. Form Submission Handler
    if (memberForm) {
        memberForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const payload = {
                id: document.getElementById("member-id").value,
                name: document.getElementById("member-fullname").value,
                email: document.getElementById("member-email").value,
                phone: document.getElementById("member-phone").value,
                plan: document.getElementById("member-plan").value,
                startDate: document.getElementById("member-start-date").value
            };

            const submitBtn = document.getElementById("saveMemberBtn");
            submitBtn.textContent = "Saving...";
            submitBtn.disabled = true;

            try {
                const method = payload.id ? "PUT" : "POST";
                const response = await api("members", method, payload);
                
                if (response && response.success) {
                    closeModal();
                    fetchMembers();
                } else {
                    // Local state optimistic update for testing
                    optimisticSave(payload);
                    closeModal();
                }
            } catch (err) {
                console.warn("API save error, carrying out optimistic local update:", err);
                optimisticSave(payload);
                closeModal();
            } finally {
                submitBtn.textContent = "Save Member";
                submitBtn.disabled = false;
            }
        });
    }

    // Helper Action Listeners for Edit & Renew
    function attachRowActionListeners() {
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const member = membersData.find(m => m.id == btn.dataset.id);
                if (member) openModal(member);
            });
        });

        document.querySelectorAll(".renew-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                location.href = `finance.html?action=renew&memberId=${id}`;
            });
        });
    }

    // General Helper Functions
    function showLoading(isLoading) {
        loadingState.style.display = isLoading ? "block" : "none";
    }

    function getInitials(name) {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    }

    function optimisticSave(payload) {
        if (payload.id) {
            const index = membersData.findIndex(m => m.id == payload.id);
            if (index !== -1) membersData[index] = { ...membersData[index], ...payload };
        } else {
            membersData.unshift({
                id: Date.now(),
                code: "FIT-" + Math.floor(1000 + Math.random() * 9000),
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                plan: payload.plan,
                expiryDate: "Aug 24, 2026",
                status: "active"
            });
        }
        renderMembers();
    }

    // Local Mock Data Handler
    function getMockMembers() {
        return [
            { id: 1, code: "FIT-1024", name: "John Doe", email: "john@example.com", phone: "+1 234 567 890", plan: "Platinum Annual", expiryDate: "Dec 15, 2026", status: "active" },
            { id: 2, code: "FIT-2048", name: "Alice Smith", email: "alice@domain.com", phone: "+1 987 654 321", plan: "Monthly Pass", expiryDate: "July 28, 2026", status: "expiring" },
            { id: 3, code: "FIT-3091", name: "Michael Knight", email: "knight@corp.com", phone: "+1 555 019 283", plan: "Gold Quarterly", expiryDate: "June 10, 2026", status: "expired" },
            { id: 4, code: "FIT-4012", name: "Emma Watson", email: "emma@acting.com", phone: "+1 444 888 112", plan: "Gold Quarterly", expiryDate: "July 24, 2026", status: "expiring" }
        ];
    }
});