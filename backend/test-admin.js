// Test admin account creation and login
const http = require('http');

// Test data
const adminData = {
  firstName: 'Nicholas',
  lastName: 'Baluka',
  email: 'nicholasmbaluka05@gmail.com',
  password: 'Nisuchondey2702#'
};

// Function to make HTTP request
function makeRequest(data, endpoint, method = 'POST') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test registration
async function testRegistration() {
  console.log('🔍 Testing admin registration...');
  
  try {
    const response = await makeRequest(adminData, '/api/auth/register');
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Admin registration successful!');
      console.log('📧 Email:', response.data.user.email);
      console.log('🛡️ Role:', response.data.user.role);
      console.log('🎫 Token:', response.data.token.substring(0, 50) + '...');
      
      // Test login with the registered admin
      await testLogin();
    } else {
      console.log('❌ Registration failed:', response.data);
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
  }
}

// Test login
async function testLogin() {
  console.log('\n🔍 Testing admin login...');
  
  try {
    const response = await makeRequest({
      email: adminData.email,
      password: adminData.password
    }, '/api/auth/login');
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Admin login successful!');
      console.log('📧 Email:', response.data.user.email);
      console.log('🛡️ Role:', response.data.user.role);
      console.log('✅ Email verified:', response.data.user.emailVerified);
      
      // Test protected route
      await testProtectedRoute(response.data.token);
    } else {
      console.log('❌ Login failed:', response.data);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
  }
}

// Test protected route
async function testProtectedRoute(token) {
  console.log('\n🔍 Testing protected admin route...');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/overview',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          
          if (res.statusCode === 200 && parsedData.success) {
            console.log('✅ Admin route access successful!');
            console.log('📊 Stats:', parsedData.stats);
            console.log('\n🎉 All tests passed! Admin account is working correctly.');
          } else {
            console.log('❌ Admin route access failed:', parsedData);
          }
        } catch (error) {
          console.log('❌ Response parsing error:', error.message);
          console.log('Raw response:', responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Protected route error:', error.message);
    });

    req.end();
  } catch (error) {
    console.error('❌ Protected route error:', error.message);
  }
}

// Run tests
testRegistration();
