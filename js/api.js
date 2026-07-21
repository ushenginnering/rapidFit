const API_BASE = 'https://gym.rapidsuite.ng/api/v1/';

function getStoredToken() {
    return localStorage.getItem('rapidfit_token') || '';
}

function getStoredGymId() {
    const value = localStorage.getItem('rapidfit_gym_id');
    return value ? Number(value) : 0;
}

async function apiRequest(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = new Headers(options.headers || {});

    const token = getStoredToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const gymId = getStoredGymId();
    if (gymId > 0) {
        headers.set('X-Gym-Id', String(gymId));
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const requestOptions = {
        method,
        headers,
    };

    if (options.body !== undefined && options.body !== null) {
        requestOptions.body = options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, requestOptions);
    const rawText = await response.text();

    let payload = {};
    if (rawText) {
        try {
            payload = JSON.parse(rawText);
        } catch (error) {
            const preview = rawText.replace(/\s+/g, ' ').trim().slice(0, 180);
            throw new Error(
                `The server returned a non-JSON response (${response.status}). ${preview || 'Please check the backend route and server logs.'}`
            );
        }
    }

    if (!response.ok || payload.success === false) {
        const message = payload.message || `Request failed with status ${response.status}.`;
        throw new Error(message);
    }

    return payload;
}

const api = {
    request: apiRequest,
    get: (endpoint, headers = {}) => apiRequest(endpoint, { method: 'GET', headers }),
    post: (endpoint, body, headers = {}) => apiRequest(endpoint, { method: 'POST', body, headers }),
    put: (endpoint, body, headers = {}) => apiRequest(endpoint, { method: 'PUT', body, headers }),
    patch: (endpoint, body, headers = {}) => apiRequest(endpoint, { method: 'PATCH', body, headers }),
    delete: (endpoint, headers = {}) => apiRequest(endpoint, { method: 'DELETE', headers }),
};
