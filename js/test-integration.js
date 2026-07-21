/**
 * Integration test for RapidFit Auth API
 * Tests both signup and login endpoints
 * 
 * Run: node js/test-integration.js
 */

const API_BASE = 'https://gym.rapidsuite.ng/api/v1';

async function testSignup() {
    console.log('\n═══════════════════════════════════════');
    console.log('📝 TEST: POST /auth/signup');
    console.log('═══════════════════════════════════════\n');

    const payload = {
        gym_name: "Test Gym " + Date.now(),
        first_name: "John",
        last_name: "Doe",
        email: `john${Date.now()}@test.com`,
        phone: "08012345678",
        password: "secret123"
    };

    console.log('📤 Request body:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'fetch'
            },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        console.log('\n📥 Raw response:', rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            console.error('❌ Non-JSON response!');
            return null;
        }

        console.log('\n📋 Parsed:');
        console.log('   Success:', data.success);
        console.log('   Message:', data.message);
        
        if (data.success && data.data) {
            console.log('   Token:', data.data.token?.substring(0, 20) + '...');
            console.log('   Gym ID:', data.data.gym?.id);
            console.log('   User ID:', data.data.user?.id);
            console.log('   User email:', data.data.user?.email);
            return data.data;
        } else {
            console.log('❌ API returned error:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Network/Parse error:', error.message);
        return null;
    }
}

async function testLogin(gymId, email) {
    console.log('\n═══════════════════════════════════════');
    console.log('🔑 TEST: POST /auth/login');
    console.log('═══════════════════════════════════════\n');

    const payload = {
        gym_id: gymId,
        email: email,
        password: "secret123"
    };

    console.log('📤 Request body:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        console.log('\n📥 Raw response:', rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            console.error('❌ Non-JSON response!');
            return false;
        }

        console.log('\n📋 Parsed:');
        console.log('   Success:', data.success);
        console.log('   Message:', data.message);
        
        if (data.success && data.data) {
            console.log('   Token:', data.data.token?.substring(0, 20) + '...');
            console.log('   User:', data.data.user?.first_name, data.data.user?.last_name);
            console.log('   Email:', data.data.user?.email);
            console.log('   Role:', data.data.user?.role);
            return true;
        } else {
            console.log('❌ API returned error:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Network/Parse error:', error.message);
        return false;
    }
}

(async () => {
    console.log('🚀 RAPIDFIT AUTH INTEGRATION TEST');
    console.log('===================================');

    // Step 1: Test Signup
    const signupData = await testSignup();

    if (signupData) {
        const gymId = signupData.gym?.id;
        const email = signupData.user?.email;

        console.log('\n✅ Signup successful! Testing login with same credentials...');

        // Step 2: Test Login with the credentials from signup
        const loginOk = await testLogin(gymId, email);

        if (loginOk) {
            console.log('\n═══════════════════════════════════════');
            console.log('🎉 BOTH SIGNUP & LOGIN WORKING!');
            console.log('═══════════════════════════════════════');
            console.log(`   Gym ID: ${gymId}`);
            console.log(`   Email:  ${email}`);
        } else {
            console.log('\n❌ Login FAILED after successful signup');
        }
    } else {
        console.log('\n❌ Signup FAILED — cannot test login');
    }

    console.log('\n===================================');
})();
