// Connection test utility
export const testConnection = async (baseUrl: string = 'http://192.168.1.64:5000') => {
    try {
        console.log('🔍 Testing connection to:', baseUrl);

        // Test basic health check
        const healthResponse = await fetch(`${baseUrl}/`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check successful:', healthData);

        // Test API endpoint
        const apiResponse = await fetch(`${baseUrl}/api/v1/auth/generate-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@example.com' }),
        });

        if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            console.log('✅ API endpoint accessible:', apiData);
            return { success: true, message: 'Connection successful' };
        } else {
            console.log('❌ API endpoint failed:', apiResponse.status, apiResponse.statusText);
            return { success: false, message: `API failed: ${apiResponse.status}` };
        }
    } catch (error) {
        console.log('❌ Connection failed:', error);
        return { success: false, message: `Connection failed: ${error.message}` };
    }
};

// Test different URLs
export const testMultipleConnections = async () => {
    const urls = [
        'http://192.168.1.64:5000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
    ];

    for (const url of urls) {
        console.log(`\n🧪 Testing ${url}:`);
        const result = await testConnection(url);
        console.log(`Result: ${result.success ? '✅' : '❌'} ${result.message}`);
    }
};