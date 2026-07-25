/**
 * API Helper - Universal Configuration
 * 
 * This file works in three modes:
 * 1. Dev mode (proxy): Access via http://localhost:3000/Pages/login.html → same-origin fetch to proxy
 * 2. Dev mode (Live Server): Access via any other local server → cors fetch to localhost:3000 proxy
 * 3. Production: Deployed to live server → direct fetch to API
 * 
 * The proxy (server.js) runs on localhost:3000 and handles API calls without CORS issues.
 * Make sure to start it with: node server.js
 */

const host = window.location.hostname;
const port = window.location.port;

// Determine if we're running locally (any local server)
const IS_LOCAL = host === 'localhost' || host === '127.0.0.1';

// If we're on the proxy itself (port 3000), use root-relative URLs
const ON_PROXY = IS_LOCAL && port === '3000';

// Proxy server URL (for Live Server or other local setups)
const PROXY_URL = 'http://localhost:3000';

// Choose API base URL
let API_BASE;
let FETCH_MODE;

if (ON_PROXY) {
    // Directly on proxy server — same origin, root-relative paths
    API_BASE = '/';
    FETCH_MODE = 'same-origin';
} else if (IS_LOCAL) {
    // On Live Server or any local server — use proxy via CORS
    API_BASE = PROXY_URL + '/';
    FETCH_MODE = 'cors';
} else {
    // Production — use direct API URL
    API_BASE = 'https://gym.rapidsuite.ng/api/v1/';
    FETCH_MODE = 'cors';
}

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
        mode: FETCH_MODE,
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
