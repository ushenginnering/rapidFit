document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Element Binding
    const checkinForm = document.getElementById("checkinForm");
    const memberCodeInput = document.getElementById("memberCodeInput");
    const resultStandby = document.getElementById("resultStandby");
    const resultActive = document.getElementById("resultActive");
    const checkinLogsTable = document.getElementById("checkinLogsTable");
    const clearLogBtn = document.getElementById("clearLogBtn");

    // Result DOM Elements
    const resultBanner = document.getElementById("resultBanner");
    const resultTitle = document.getElementById("resultTitle");
    const resultSubtitle = document.getElementById("resultSubtitle");
    const resAvatar = document.getElementById("resAvatar");
    const resName = document.getElementById("resName");
    const resCode = document.getElementById("resCode");
    const resPlan = document.getElementById("resPlan");
    const resExpiry = document.getElementById("resExpiry");
    const resLastCheckin = document.getElementById("resLastCheckin");

    // Initialize Icons
    if (window.lucide) lucide.createIcons();

    // Focus input automatically for handheld hardware scanner support
    if (memberCodeInput) memberCodeInput.focus();

    // 2. Handle Form / Scanner Submission
    if (checkinForm) {
        checkinForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const code = memberCodeInput.value.trim().toUpperCase();
            if (!code) return;

            await processCheckIn(code);
            memberCodeInput.value = "";
            memberCodeInput.focus();
        });
    }

    // 3. Main Check-In Verification Logic
    async function processCheckIn(memberCode) {
        try {
            let response;
            // Central API helper request
            if (typeof api === "function") {
                response = await api("checkin", "POST", { code: memberCode });
            }

            if (response && response.success) {
                renderOutcome(response.data, true);
                playAudioFeedback(true);
            } else {
                // Fallback mock check for local testing
                const mockResult = evaluateMockMember(memberCode);
                renderOutcome(mockResult, mockResult.status === "active");
                playAudioFeedback(mockResult.status === "active");
            }
        } catch (error) {
            console.warn("API check-in error, using local validation:", error);
            const mockResult = evaluateMockMember(memberCode);
            renderOutcome(mockResult, mockResult.status === "active");
            playAudioFeedback(mockResult.status === "active");
        }
    }

    // 4. Render Verification Result & Update Log
    function renderOutcome(member, isAllowed) {
        resultStandby.style.display = "none";
        resultActive.style.display = "block";

        if (isAllowed) {
            resultBanner.className = "result-banner success";
            resultTitle.textContent = "ACCESS GRANTED";
            resultSubtitle.textContent = "Membership active and valid";
        } else {
            resultBanner.className = "result-banner danger";
            resultTitle.textContent = "ACCESS DENIED";
            resultSubtitle.textContent = member.reason || "Membership expired or inactive";
        }

        resAvatar.textContent = getInitials(member.name);
        resName.textContent = member.name;
        resCode.textContent = member.code;
        resPlan.textContent = member.plan;
        resExpiry.textContent = member.expiryDate;
        resLastCheckin.textContent = "Just now";

        // Prepend to attendance feed table
        prependLogEntry(member, isAllowed);
    }

    // 5. Prepend Record to Attendance Feed Table
    function prependLogEntry(member, isAllowed) {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const row = document.createElement("tr");

        const badgeClass = isAllowed ? "badge-success" : "badge-danger";
        const statusText = isAllowed ? "Granted" : "Denied";

        row.innerHTML = `
            <td style="color: var(--text-secondary-gray); font-size: 0.8rem;">${timeNow}</td>
            <td><strong style="color: var(--primary-rapid-red);">${member.code}</strong></td>
            <td>
                <div class="table-user-cell">
                    <div class="table-avatar">${getInitials(member.name)}</div>
                    <span class="user-name">${member.name}</span>
                </div>
            </td>
            <td>${member.plan}</td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
        `;

        checkinLogsTable.prepend(row);
    }

    // 6. Clear Table View
    if (clearLogBtn) {
        clearLogBtn.addEventListener("click", () => {
            checkinLogsTable.innerHTML = "";
        });
    }

    // Helper: Web Audio Synthesizer Beep (Zero external asset dependencies)
    function playAudioFeedback(isSuccess) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = "sine";
            osc.frequency.value = isSuccess ? 880 : 220; // High frequency for grant, low for deny
            gain.gain.value = 0.1;

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + (isSuccess ? 0.15 : 0.4));
        } catch (e) {
            // Audio context not allowed without user interaction
        }
    }

    // Helper: Get Initials
    function getInitials(name) {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??";
    }

    // Local Mock Evaluation Handler
    function evaluateMockMember(code) {
        const database = {
            "FIT-1024": { code: "FIT-1024", name: "John Doe", plan: "Platinum Annual", expiryDate: "Dec 15, 2026", status: "active" },
            "FIT-2048": { code: "FIT-2048", name: "Alice Smith", plan: "Monthly Pass", expiryDate: "July 28, 2026", status: "active" },
            "FIT-3091": { code: "FIT-3091", name: "Michael Knight", plan: "Gold Quarterly", expiryDate: "June 10, 2026", status: "expired", reason: "Subscription expired on June 10" }
        };

        if (database[code]) {
            return database[code];
        }

        return {
            code: code,
            name: "Unknown / Unregistered",
            plan: "N/A",
            expiryDate: "N/A",
            status: "expired",
            reason: "ID not found in active database"
        };
    }
});