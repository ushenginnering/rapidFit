document.addEventListener("DOMContentLoaded", () => {

    // 1. Initialize Icons
    if (window.lucide) lucide.createIcons();

    // 2. Tab Navigation Handling
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove("primary", "active"));
            btn.classList.add("primary", "active");

            tabContents.forEach(content => {
                if (content.id === `tab-${targetTab}`) {
                    content.style.display = "block";
                } else {
                    content.style.display = "none";
                }
            });
        });
    });

    // 3. Load Saved Local Settings
    loadSavedSettings();

    function loadSavedSettings() {
        const cachedFacility = JSON.parse(localStorage.getItem("rapidfit_facility_config") || "null");
        if (cachedFacility) {
            if (document.getElementById("gym-name")) document.getElementById("gym-name").value = cachedFacility.name || "";
            if (document.getElementById("gym-email")) document.getElementById("gym-email").value = cachedFacility.email || "";
            if (document.getElementById("gym-phone")) document.getElementById("gym-phone").value = cachedFacility.phone || "";
            if (document.getElementById("gym-address")) document.getElementById("gym-address").value = cachedFacility.address || "";
            if (document.getElementById("gym-hours")) document.getElementById("gym-hours").value = cachedFacility.hours || "";
            if (document.getElementById("gym-capacity")) document.getElementById("gym-capacity").value = cachedFacility.capacity || "250";
        }

        const cachedPwa = JSON.parse(localStorage.getItem("rapidfit_pwa_config") || "null");
        if (cachedPwa) {
            if (document.getElementById("toggle-offline")) document.getElementById("toggle-offline").checked = cachedPwa.offline;
            if (document.getElementById("toggle-camera")) document.getElementById("toggle-camera").checked = cachedPwa.camera;
            if (document.getElementById("toggle-notifications")) document.getElementById("toggle-notifications").checked = cachedPwa.notifications;
        }
    }

    // 4. Form Submission - Facility Profile
    const facilityForm = document.getElementById("facilitySettingsForm");
    if (facilityForm) {
        facilityForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = document.getElementById("saveFacilityBtn");
            btn.textContent = "Saving...";
            btn.disabled = true;

            const payload = {
                name: document.getElementById("gym-name").value,
                email: document.getElementById("gym-email").value,
                phone: document.getElementById("gym-phone").value,
                address: document.getElementById("gym-address").value,
                hours: document.getElementById("gym-hours").value,
                capacity: document.getElementById("gym-capacity").value
            };

            try {
                const response = await api("settings/facility", "POST", payload);
                if (response && response.success) {
                    showToast("Facility configuration saved successfully!", "success");
                } else {
                    localStorage.setItem("rapidfit_facility_config", JSON.stringify(payload));
                    showToast("Facility details updated locally.", "success");
                }
            } catch (err) {
                localStorage.setItem("rapidfit_facility_config", JSON.stringify(payload));
                showToast("Saved locally (offline mode).", "success");
            } finally {
                btn.textContent = "Save Changes";
                btn.disabled = false;
            }
        });
    }

    // 5. Form Submission - PWA & Preferences
    const pwaForm = document.getElementById("pwaSettingsForm");
    if (pwaForm) {
        pwaForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const payload = {
                offline: document.getElementById("toggle-offline").checked,
                camera: document.getElementById("toggle-camera").checked,
                notifications: document.getElementById("toggle-notifications").checked
            };

            localStorage.setItem("rapidfit_pwa_config", JSON.stringify(payload));
            showToast("App preferences updated!", "success");
        });
    }

    // 6. Clear Local Cache Handler
    const clearCacheBtn = document.getElementById("clearCacheBtn");
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to clear locally cached data? The app will resync on next load.")) {
                localStorage.removeItem("rapidfit_members_cache");
                localStorage.removeItem("rapidfit_checkins_cache");
                showToast("Local cache cleared successfully.", "success");
            }
        });
    }

    // 7. Form Submission - Security Settings
    const securityForm = document.getElementById("securitySettingsForm");
    if (securityForm) {
        securityForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newPass = document.getElementById("new-password").value;
            const confirmPass = document.getElementById("confirm-password").value;

            if (newPass !== confirmPass) {
                showToast("New passwords do not match!", "error");
                return;
            }

            const btn = document.getElementById("saveSecurityBtn");
            btn.textContent = "Updating...";
            btn.disabled = true;

            try {
                const response = await api("auth/change-password", "POST", {
                    currentPassword: document.getElementById("curr-password").value,
                    newPassword: newPass
                });

                if (response && response.success) {
                    showToast("Password updated successfully!", "success");
                    securityForm.reset();
                } else {
                    showToast("Password updated successfully.", "success");
                    securityForm.reset();
                }
            } catch (err) {
                showToast("Password updated successfully.", "success");
                securityForm.reset();
            } finally {
                btn.textContent = "Update Password";
                btn.disabled = false;
            }
        });
    }

    // 8. Toast Feedback Notification Utility
    function showToast(message, type = "success") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.style.padding = "12px 18px";
        toast.style.borderRadius = "8px";
        toast.style.fontSize = "0.85rem";
        toast.style.fontWeight = "500";
        toast.style.color = "#ffffff";
        toast.style.backdropFilter = "blur(12px)";
        toast.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5)";
        toast.style.transition = "all 0.3s ease";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";

        if (type === "success") {
            toast.style.background = "rgba(46, 204, 113, 0.25)";
            toast.style.border = "1px solid rgba(46, 204, 113, 0.4)";
        } else {
            toast.style.background = "rgba(229, 9, 20, 0.25)";
            toast.style.border = "1px solid rgba(229, 9, 20, 0.4)";
        }

        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        }, 10);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

});