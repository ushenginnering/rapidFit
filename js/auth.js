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
    const loginGymIdInput = document.getElementById("login-gym-id");
    const copyGymIdBtn = document.getElementById("copyGymIdBtn");

    if (loginGymIdInput) {
        const savedGymId = localStorage.getItem('rapidfit_gym_id');
        if (savedGymId) {
            loginGymIdInput.value = savedGymId;
        }
    }

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
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const gymId = Number(document.getElementById("login-gym-id").value);
            const email = document.getElementById("login-identity").value.trim();
            const password = document.getElementById("login-password").value;
            const rememberMe = document.getElementById("rememberMe").checked;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!gymId || gymId <= 0) {
                triggerToast("Validation error: Gym ID is required.");
                return;
            }

            if (!emailPattern.test(email)) {
                triggerToast("Validation error: Enter a valid email address.");
                return;
            }

            if (password.length < 8) {
                triggerToast("Validation error: Password must be at least 8 characters.");
                return;
            }

            const stopLoading = performButtonLoading(loginForm, "Authenticating...");

            try {
                const response = await api.post('auth/login', {
                    gym_id: gymId,
                    email,
                    password
                });

                localStorage.setItem('rapidfit_token', response.data.token);
                localStorage.setItem('rapidfit_gym_id', String(gymId));
                localStorage.setItem('rapidfit_user', JSON.stringify(response.data.user));

                if (rememberMe) {
                    localStorage.setItem('rapidfit_remember_me', '1');
                } else {
                    localStorage.removeItem('rapidfit_remember_me');
                }

                triggerToast(response.message || 'Access granted. Redirecting...');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1200);
            } catch (error) {
                triggerToast(error.message || 'Login failed. Please try again.');
            } finally {
                stopLoading();
            }
        });
    }

    // Sign Up Handle
    if (signUpForm) {
        signUpForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const gymName = document.getElementById("signup-gym-name").value.trim();
            const firstName = document.getElementById("signup-first-name").value.trim();
            const lastName = document.getElementById("signup-last-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const phone = document.getElementById("signup-phone").value.trim();
            const password = document.getElementById("signup-password").value;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!gymName || !firstName || !lastName) {
                triggerToast("Validation error: Please complete the gym and name fields.");
                return;
            }

            if (!emailPattern.test(email)) {
                triggerToast("Validation error: Enter a valid email address.");
                return;
            }

            if (password.length < 6) {
                triggerToast("Validation error: Password must be at least 6 characters.");
                return;
            }

            const stopLoading = performButtonLoading(signUpForm, "Registering...");

            try {
                const response = await api.post('auth/signup', {
                    gym_name: gymName,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    phone,
                    password
                }, { 'X-Requested-With': 'fetch' });

                const gymIdNotice = document.getElementById('gymIdNotice');
                const gymIdValue = document.getElementById('gymIdValue');
                const generatedGymId = response.data?.gym?.id;
                const fallbackGymId = response.data?.user?.gym_id;
                const finalGymId = generatedGymId || fallbackGymId;

                if (finalGymId) {
                    gymIdValue.textContent = finalGymId;
                    gymIdNotice.hidden = false;
                    if (loginGymIdInput) loginGymIdInput.value = finalGymId;
                } else {
                    // Keep system stable even if backend payload shape changes
                    gymIdNotice.hidden = true;
                }

                localStorage.setItem('rapidfit_token', response.data.token);
                if (finalGymId) {
                    localStorage.setItem('rapidfit_gym_id', String(finalGymId));
                }
                localStorage.setItem('rapidfit_user', JSON.stringify(response.data.user));

                triggerToast(`Account setup complete! Your gym ID is ${finalGymId || 'ready'}. Save it for login.`);
                if (finalGymId && document.getElementById('login-gym-id')) {
                    document.getElementById('login-gym-id').value = String(finalGymId);
                }
                window.switchBookState('state-login');
            } catch (error) {
                triggerToast(error.message || 'Registration failed. Please try again.');
            } finally {
                stopLoading();
            }
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
    if (copyGymIdBtn) {
        copyGymIdBtn.addEventListener("click", async () => {
            const gymIdValue = document.getElementById('gymIdValue');
            const idToCopy = gymIdValue?.textContent?.trim();

            if (!idToCopy) {
                triggerToast("No Gym ID available to copy yet.");
                return;
            }

            try {
                await navigator.clipboard.writeText(idToCopy);
                triggerToast("Gym ID copied to your clipboard.");
            } catch (error) {
                triggerToast("Unable to copy automatically. Please copy the Gym ID manually.");
            }
        });
    }

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
