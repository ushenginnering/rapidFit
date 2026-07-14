document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // --- DOM REFERENCES ---
    const loginForm = document.getElementById("loginForm");
    const signUpForm = document.getElementById("signUpForm");
    const forgotForm = document.getElementById("forgotForm");
    const otpForm = document.getElementById("otpForm");
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const biometricBtn = document.getElementById("biometricLoginBtn");
    const resendOtpBtn = document.getElementById("resendOtpBtn");

    // --- 3D BOOK ENGINE ---
    window.switchBookState = function (nextStateId) {
        const activePage = document.querySelector('.auth-state.active');
        const nextPage = document.getElementById(nextStateId);

        if (!activePage || !nextPage || activePage.id === nextStateId) return;

        // Step 1: Swing active page open to left hinge
        activePage.classList.add('flipped');
        activePage.classList.remove('active');

        // Step 2: Swap active flags and turn target page flat
        nextPage.classList.remove('flipped');
        nextPage.classList.add('active');

        // Step 3: Automatically focus first nested field
        setTimeout(() => {
            const inputField = nextPage.querySelector('input');
            if (inputField) inputField.focus();
        }, 650);
    };

    // Attach Navigation Bindings
    document.querySelectorAll('[data-target]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetState = trigger.getAttribute('data-target');
            window.switchBookState(targetState);
        });
    });

    // --- PASSWORD HIDE / REVEAL ---
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const inputId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(inputId);
            const icon = btn.querySelector('i');
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                targetInput.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            if (window.lucide) window.lucide.createIcons();
        });
    });

    // --- SEGMENTED OTP UTILITIES ---
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((field, index) => {
        field.addEventListener('keyup', (e) => {
            if (field.value.length === 1 && otpInputs[index + 1]) {
                otpInputs[index + 1].focus();
            }
            if (e.key === 'Backspace' && otpInputs[index - 1]) {
                otpInputs[index - 1].focus();
            }
        });
    });

    // --- TOAST ALERTS SYSTEM ---
    function triggerToast(message) {
        const toast = document.getElementById('systemToast');
        const textContainer = document.getElementById('toastMessage');
        textContainer.innerText = message;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    }

    // --- SUBMISSIONS & SIMULATED API LOADS ---
    function performButtonLoading(form, text) {
        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerText;
        btn.innerText = text;
        btn.style.opacity = "0.7";
        btn.style.pointerEvents = "none";
        return () => {
            btn.innerText = originalText;
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
        };
    }

    // Login Handle
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const identity = document.getElementById("login-identity").value;
            const stopLoading = performButtonLoading(loginForm, "Authenticating...");

            setTimeout(() => {
                stopLoading();
                triggerToast(`Access Granted! Welcome back ${identity}.`);
            }, 1200);
        });
    }

    // Sign Up Handle
    if (signUpForm) {
        signUpForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const stopLoading = performButtonLoading(signUpForm, "Registering...");

            setTimeout(() => {
                stopLoading();
                triggerToast("Account setup complete! Redirecting to Log In...");
                window.switchBookState('state-login');
            }, 1200);
        });
    }

    // Forgot Request Handle
    if (forgotForm) {
        forgotForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("forgot-email").value;
            const stopLoading = performButtonLoading(forgotForm, "Sending OTP...");

            setTimeout(() => {
                stopLoading();
                triggerToast(`A secure OTP key has been sent to ${email}`);
                window.switchBookState('state-otp');
            }, 1200);
        });
    }

    // Security Verification Handle
    if (otpForm) {
        otpForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let rawCode = "";
            otpInputs.forEach(i => rawCode += i.value);

            if (rawCode.length < 6) {
                triggerToast("Validation error: Verification code must contain 6 digits.");
                return;
            }

            triggerToast("OTP Verification Cleared!");
            window.switchBookState('state-create-password');
        });
    }

    // Reset Master Key Handle
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newPass = document.getElementById("new-password").value;
            const confirmPass = document.getElementById("confirm-password").value;

            if (newPass !== confirmPass) {
                triggerToast("Error: Passwords do not match.");
                return;
            }

            triggerToast("Master password changed. Sign in with your new credentials.");
            window.switchBookState('state-login');

            // Reset flipped pages
            setTimeout(() => {
                document.querySelectorAll('.auth-state').forEach(page => {
                    if (page.id !== 'state-login') {
                        page.classList.remove('flipped');
                    }
                });
            }, 800);
        });
    }

    // External Utilities
    if (biometricBtn) {
        biometricBtn.addEventListener("click", () => {
            triggerToast("Initializing device biometric scanner hardware...");
        });
    }

    if (resendOtpBtn) {
        resendOtpBtn.addEventListener("click", () => {
            triggerToast("A new security OTP has been dispatched to your mailbox.");
        });
    }
});