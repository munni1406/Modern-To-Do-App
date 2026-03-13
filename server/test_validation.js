import axios from 'axios';

async function testValidation() {
  const url = 'http://localhost:5000/api/signup';
  
  console.log('Testing missing fields...');
  try {
    await axios.post(url, { name: '', email: '', password: '' });
  } catch (error) {
    console.log('Got expected error:', error.response?.data?.error);
  }

  console.log('Testing duplicate email...');
  try {
    await axios.post(url, { name: 'Test', email: 'test@example.com', password: 'password123' });
  } catch (error) {
    console.log('Got expected error:', error.response?.data?.error);
  }
}

testValidation();
