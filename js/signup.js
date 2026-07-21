/**
 * RapidFit Signup API Example
 * 
 * Calls: POST https://gym.rapidsuite.ng/api/v1/auth/signup
 * 
 * Expected request body (JSON):
 * {
 *   "gym_name":     string  (required) - Your gym/business name
 *   "first_name":   string  (required) - Your first name
 *   "last_name":    string  (required) - Your last name
 *   "email":        string  (required) - Email address (valid format)
 *   "phone":        string  (optional) - Phone number
 *   "password":     string  (required) - Min 6 characters
 * }
 * 
 * Expected response:
 * {
 *   "success": true,
 *   "message": "Gym created successfully",
 *   "data": {
 *     "token": "...",
 *     "gym": { "id": 123, "name": "...", "slug": "..." },
 *     "user": { "id": 456, "gym_id": 123, "first_name": "...", ... }
 *   }
 * }
 */

const API_BASE_URL = 'https://gym.rapidsuite.ng/api/v1';

/**
 * Register a new gym account.
 * Automatically saves token, gym ID, and user to localStorage on success.
 * 
 * @param {Object} params
 * @param {string} params.gym_name     - Gym/business name (e.g. "Fit Zone Gym")
 * @param {string} params.first_name   - Admin first name (e.g. "Uchenna")
 * @param {string} params.last_name    - Admin last name (e.g. "Ukeh")
 * @param {string} params.email        - Admin email (e.g. "admin@fitzone.com")
 * @param {string} params.phone        - Admin phone (e.g. "08012345678")
 * @param {string} params.password     - Password, min 6 chars (e.g. "secret123")
 * @returns {Promise<Object>}          - The API response data (token, gym, user)
 */
async function signupGym({ gym_name, first_name, last_name, email, phone, password }) {
    // --- Validation ---
    if (!gym_name)  throw new Error('Gym name is required');
    if (!first_name) throw new Error('First name is required');
    if (!last_name)  throw new Error('Last name is required');
    if (!email)      throw new Error('Email is required');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

    // --- Build request payload ---
    const payload = {
        gym_name,
        first_name,
        last_name,
        email,
        phone: phone || '',
        password
    };

    // --- Send request ---
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'fetch'
        },
        body: JSON.stringify(payload)
    });

    // --- Parse response ---
    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch (err) {
        throw new Error(`Server returned non-JSON response (${response.status}): ${rawText.slice(0, 150)}`);
    }

    // --- Handle errors ---
    if (!response.ok || data.success === false) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    // --- Save to localStorage ---
    if (data.data && data.data.token) {
        localStorage.setItem('rapidfit_token', data.data.token);
    }

    if (data.data && data.data.user) {
        localStorage.setItem('rapidfit_user', JSON.stringify(data.data.user));
    }

    if (data.data && data.data.gym) {
        localStorage.setItem('rapidfit_gym_id', String(data.data.gym.id));
    }

    return data.data;
}

// =======================================================
//  USAGE EXAMPLE
// =======================================================
/*
(async () => {
    try {
        const result = await signupGym({
            gym_name: "Fit Zone Gym",
            first_name: "Uchenna",
            last_name: "Ukeh",
            email: "admin@fitzone.com",
            phone: "08012345678",
            password: "secret123"
        });

        console.log('✅ Signup successful!');
        console.log('Token:', result.token);
        console.log('Gym ID:', result.gym.id);
        console.log('User:', result.user);

    } catch (error) {
        console.error('❌ Signup failed:', error.message);
    }
})();
*/
