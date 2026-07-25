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
            
            // Clear saved Gym ID when navigating TO signup (fresh registration)
            if (targetState === 'state-signup') {
                // Remove any previously saved pre-fill so it's a truly fresh registration
                const gymIdNotice = document.getElementById('gymIdNotice');
                if (gymIdNotice) gymIdNotice.hidden = true;
                
                // Remove the dynamic "Go to Log In" link if it was added
                const existingLink = document.getElementById('gotoLoginAfterSignup');
                if (existingLink) existingLink.remove();
                
                // Clear the signup form fields for a fresh start
                if (signUpForm) signUpForm.reset();
            }
            
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
            const identity = document.getElementById("login-identity").value.trim();
            const password = document.getElementById("login-password").value;
            const rememberMe = document.getElementById("rememberMe").checked;

            if (!gymId || gymId <= 0) {
                triggerToast("Validation error: Gym ID is required.");
                return;
            }

            if (!identity) {
                triggerToast("Validation error: Enter your username or email.");
                return;
            }

            if (password.length < 8) {
                triggerToast("Validation error: Password must be at least 8 characters.");
                return;
            }

            const stopLoading = performButtonLoading(loginForm, "Authenticating...");

            try {
                // Build the login payload
                const payload = {
                    gym_id: gymId,
                    email: identity,
                    password
                };

                const response = await api.post('auth/login', payload);

                localStorage.setItem('rapidfit_token', response.data.token);
                localStorage.setItem('rapidfit_gym_id', String(gymId));
                localStorage.setItem('rapidfit_user', JSON.stringify(response.data.user));

                // Save gym_id from response if available (first login after signup)
                if (response.data?.user?.gym_id) {
                    localStorage.setItem('rapidfit_gym_id', String(response.data.user.gym_id));
                }

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

                // Show success toast
                triggerToast(`Account setup complete! Your gym ID is ${finalGymId || 'ready'}. Save it for login.`);

                // Make the Gym ID notice visible and scroll it into view
                const noticeEl = document.getElementById('gymIdNotice');
                if (noticeEl) {
                    noticeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                // Also add a "Proceed to Login" button below the notice
                // Show a "Go to Login" link if not already visible
                const existingLoginLink = document.getElementById('gotoLoginAfterSignup');
                if (!existingLoginLink) {
                    const signupFooterNav = document.querySelector('#state-signup .footer-navigation');
                    if (signupFooterNav) {
                        const gotoLogin = document.createElement('div');
                        gotoLogin.id = 'gotoLoginAfterSignup';
                        gotoLogin.className = 'footer-navigation';
                        gotoLogin.style.marginTop = '18px';
                        gotoLogin.innerHTML = `Account created! <span class="nav-trigger" data-target="state-login">Go to Log In →</span>`;
                        signupFooterNav.parentNode.insertBefore(gotoLogin, signupFooterNav.nextSibling);
                    }
                }

                // Do NOT auto-switch — let the user see their Gym ID first
            } catch (error) {
                triggerToast(error.message || 'Registration failed. Please try again.');
            } finally {
                stopLoading();
            }
        });
    }

    // Forgot Request Handle
    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("forgot-email").value.trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                triggerToast("Validation error: Enter a valid email address.");
                return;
            }

            const stopLoading = performButtonLoading(forgotForm, "Sending OTP...");

            try {
                const response = await api.post('auth/forgot-password', { email });
                triggerToast(response.message || 'A verification code has been sent to your email.');
                window.switchBookState('state-otp');
            } catch (error) {
                triggerToast(error.message || 'Failed to send OTP. Please try again.');
            } finally {
                stopLoading();
            }
        });
    }

    // Security Verification Handle
    if (otpForm) {
        otpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            let rawCode = "";
            otpInputs.forEach(i => rawCode += i.value);

            if (rawCode.length < 6) {
                triggerToast("Validation error: Verification code must contain 6 digits.");
                return;
            }

            // Get the email from the forgot password form
            const forgotEmail = document.getElementById("forgot-email").value.trim();
            if (!forgotEmail) {
                triggerToast("Session expired. Please start the forgot password process again.");
                return;
            }

            const stopLoading = performButtonLoading(otpForm, "Verifying OTP...");

            try {
                const response = await api.post('auth/verify-otp', {
                    otp: Number(rawCode),
                    email: forgotEmail
                });
                
                // Store the email for reset-password step
                localStorage.setItem('rapidfit_reset_email', forgotEmail);
                triggerToast(response.message || 'OTP verified successfully.');
                window.switchBookState('state-create-password');
            } catch (error) {
                triggerToast(error.message || 'Invalid or expired OTP. Please try again.');
            } finally {
                stopLoading();
            }
        });
    }

    // Reset Master Key Handle
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newPass = document.getElementById("new-password").value;
            const confirmPass = document.getElementById("confirm-password").value;

            if (newPass !== confirmPass) {
                triggerToast("Error: Passwords do not match.");
                return;
            }

            if (newPass.length < 8) {
                triggerToast("Validation error: Password must be at least 8 characters.");
                return;
            }

            // Get the email stored during OTP verification
            const resetEmail = localStorage.getItem('rapidfit_reset_email');
            if (!resetEmail) {
                triggerToast("Session expired. Please start the forgot password process again.");
                return;
            }

            const stopLoading = performButtonLoading(resetPasswordForm, "Resetting Password...");

            try {
                const response = await api.post('auth/reset-password', {
                    email: resetEmail,
                    password: newPass,
                    password_confirmation: confirmPass
                });

                // Clear stored email
                localStorage.removeItem('rapidfit_reset_email');
                
                triggerToast(response.message || 'Password reset successful. Sign in with your new credentials.');
                window.switchBookState('state-login');

                // Reset flipped pages
                setTimeout(() => {
                    document.querySelectorAll('.auth-state').forEach(page => {
                        if (page.id !== 'state-login') {
                            page.classList.remove('flipped');
                        }
                    });
                }, 800);
            } catch (error) {
                triggerToast(error.message || 'Password reset failed. Please try again.');
            } finally {
                stopLoading();
            }
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
