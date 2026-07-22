document.addEventListener("DOMContentLoaded", () => {

    // 1. DOM Elements & Local State
    let plansData = [];
    const plansContainer = document.getElementById("plansContainer");
    const loadingState = document.getElementById("loadingState");

    // Modal Elements
    const planModal = document.getElementById("planModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const openAddPlanBtn = document.getElementById("openAddPlanBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const planForm = document.getElementById("planForm");

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();

    // 2. Fetch Plans
    fetchPlans();

    async function fetchPlans() {
        showLoading(true);
        try {
            const response = await api("plans", "GET");
            if (response && response.success) {
                plansData = response.data;
            } else {
                plansData = getMockPlans();
            }
        } catch (error) {
            console.warn("API request failed, loading mock plans:", error);
            plansData = getMockPlans();
        } finally {
            showLoading(false);
            renderPlans();
        }
    }

    // 3. Render Plan Tiers Grid
    function renderPlans() {
        plansContainer.innerHTML = "";

        plansData.forEach(plan => {
            const card = document.createElement("div");
            const isFeatured = plan.badge ? "featured" : "";
            card.className = `content-card plan-card ${isFeatured}`;

            const featuresArray = Array.isArray(plan.features) 
                ? plan.features 
                : plan.features.split(",").map(f => f.trim());

            const featuresHTML = featuresArray.map(feature => `
                <li class="plan-feature-item">
                    <i data-lucide="check-circle-2"></i>
                    <span>${feature}</span>
                </li>
            `).join("");

            const badgeHTML = plan.badge 
                ? `<span class="badge badge-success" style="align-self: flex-start;">${plan.badge}</span>` 
                : `<span class="badge" style="align-self: flex-start; background: rgba(255,255,255,0.05); color: var(--text-secondary-gray);">${plan.duration}</span>`;

            card.innerHTML = `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        ${badgeHTML}
                        <span style="font-size: 0.75rem; color: var(--text-secondary-gray);">${plan.activeMembers || 0} Members</span>
                    </div>

                    <h2 style="font-size: 1.3rem; font-weight: 600; margin-top: 8px;">${plan.name}</h2>
                    
                    <div class="plan-price-tag">
                        $${parseFloat(plan.price).toFixed(2)}
                        <span>/ ${plan.duration.toLowerCase()}</span>
                    </div>

                    <ul class="plan-feature-list">
                        ${featuresHTML}
                    </ul>
                </div>

                <div style="display: flex; gap: 8px; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;">
                    <button class="table-action-btn edit-plan-btn" data-id="${plan.id}" style="flex-grow: 1;">
                        <i data-lucide="edit-2" style="width:14px; height:14px;"></i>
                        <span>Edit Tier</span>
                    </button>
                    <button class="table-action-btn primary toggle-plan-btn" data-id="${plan.id}">
                        ${plan.active ? "Active" : "Disabled"}
                    </button>
                </div>
            `;

            plansContainer.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();
        attachCardActionListeners();
    }

    // 4. Modal Interactions
    if (openAddPlanBtn) {
        openAddPlanBtn.addEventListener("click", () => openModal());
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function openModal(plan = null) {
        if (plan) {
            document.getElementById("modalTitle").textContent = "Edit Membership Tier";
            document.getElementById("plan-id").value = plan.id;
            document.getElementById("plan-name").value = plan.name;
            document.getElementById("plan-price").value = plan.price;
            document.getElementById("plan-duration").value = plan.duration;
            document.getElementById("plan-features").value = Array.isArray(plan.features) ? plan.features.join(", ") : plan.features;
            document.getElementById("plan-badge").value = plan.badge || "";
        } else {
            document.getElementById("modalTitle").textContent = "Create Plan Tier";
            planForm.reset();
            document.getElementById("plan-id").value = "";
        }

        modalOverlay.classList.add("active");
        planModal.style.display = "block";
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        planModal.style.display = "none";
    }

    // 5. Form Handling
    if (planForm) {
        planForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const payload = {
                id: document.getElementById("plan-id").value,
                name: document.getElementById("plan-name").value,
                price: parseFloat(document.getElementById("plan-price").value),
                duration: document.getElementById("plan-duration").value,
                features: document.getElementById("plan-features").value.split(",").map(s => s.trim()),
                badge: document.getElementById("plan-badge").value || null,
                active: true
            };

            const submitBtn = document.getElementById("savePlanBtn");
            submitBtn.textContent = "Saving...";
            submitBtn.disabled = true;

            try {
                const method = payload.id ? "PUT" : "POST";
                const response = await api("plans", method, payload);

                if (response && response.success) {
                    closeModal();
                    fetchPlans();
                } else {
                    optimisticSave(payload);
                    closeModal();
                }
            } catch (error) {
                console.warn("API save error, handling optimistically:", error);
                optimisticSave(payload);
                closeModal();
            } finally {
                submitBtn.textContent = "Save Plan Tier";
                submitBtn.disabled = false;
            }
        });
    }

    // Event Listeners for Dynamic Card Actions
    function attachCardActionListeners() {
        document.querySelectorAll(".edit-plan-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const plan = plansData.find(p => p.id == btn.dataset.id);
                if (plan) openModal(plan);
            });
        });

        document.querySelectorAll(".toggle-plan-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const plan = plansData.find(p => p.id == btn.dataset.id);
                if (plan) {
                    plan.active = !plan.active;
                    renderPlans();
                }
            });
        });
    }

    // Helpers
    function showLoading(isLoading) {
        if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
    }

    function optimisticSave(payload) {
        if (payload.id) {
            const index = plansData.findIndex(p => p.id == payload.id);
            if (index !== -1) plansData[index] = { ...plansData[index], ...payload };
        } else {
            plansData.unshift({
                ...payload,
                id: Date.now(),
                activeMembers: 0
            });
        }
        renderPlans();
    }

    function getMockPlans() {
        return [
            {
                id: 1,
                name: "Monthly Standard Pass",
                price: 49.99,
                duration: "Monthly",
                badge: null,
                activeMembers: 142,
                active: true,
                features: ["Full Gym Access", "Locker Room & Showers", "Free Wi-Fi", "RapidFit Mobile App Access"]
            },
            {
                id: 2,
                name: "Gold Quarterly",
                price: 129.99,
                duration: "Quarterly",
                badge: "Most Popular",
                activeMembers: 285,
                active: true,
                features: ["Full Gym Access", "1 Free Trainer Session/mo", "Sauna & Recovery Zone", "Guest Pass (1/mo)", "Mobile App Access"]
            },
            {
                id: 3,
                name: "Platinum Annual",
                price: 449.99,
                duration: "Annual",
                badge: "Best Value",
                activeMembers: 98,
                active: true,
                features: ["24/7 VIP Access", "Unlimited Trainer Sessions", "Full Recovery Suite Access", "3 Guest Passes/mo", "Free RapidFit Merchandise"]
            }
        ];
    }
});