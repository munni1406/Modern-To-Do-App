import axios from 'axios';

async function testSignupSuccess() {
  const url = 'http://localhost:5000/api/signup';
  const timestamp = Date.now();
  const testUser = {
    name: 'Success Test',
    email: `success_${timestamp}@example.com`,
    password: 'Password123!'
  };

  console.log(`Attempting signup with: ${testUser.email}`);
  try {
    const response = await axios.post(url, testUser);
    console.log('Signup Successful!');
    console.log('Response status:', response.status);
    console.log('User ID:', response.data.user.id);
    console.log('Token received:', !!response.data.token);
  } catch (error) {
    if (error.response) {
      console.error('Signup failed with server error:', error.response.status, error.response.data);
    } else {
      console.error('Signup failed with network error:', error.message);
    }
    process.exit(1);
  }
}

testSignupSuccess();
