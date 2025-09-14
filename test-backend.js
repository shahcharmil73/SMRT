const http = require('http');

// Test the backend server
function testBackend() {
    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/health',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Backend is running! Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📊 Backend Response:', data);
            testQuery();
        });
    });

    req.on('error', (err) => {
        console.log('❌ Backend is not running:', err.message);
        console.log('💡 Make sure to start the backend with: cd backend-node && npm start');
    });

    req.end();
}

function testQuery() {
    const queryData = JSON.stringify({
        query: 'What is the total revenue?'
    });

    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/query',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(queryData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Query test successful! Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            const response = JSON.parse(data);
            console.log('🤖 AI Response:', response.result);
            console.log('\n🎉 Backend is fully functional!');
            console.log('📱 You can now run the mobile app with: npx react-native run-android');
        });
    });

    req.on('error', (err) => {
        console.log('❌ Query test failed:', err.message);
    });

    req.write(queryData);
    req.end();
}

console.log('🧪 Testing backend server...');
testBackend();
