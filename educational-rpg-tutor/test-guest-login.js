// Simple test script to verify guest login functionality
console.log('Testing guest login functionality...');

// Simulate guest login
const guestUser = {
  id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test User',
  age: 10,
  email: `guest_${Date.now()}@example.com`,
  isGuest: true
};

console.log('Created guest user:', guestUser);

// Test localStorage operations
try {
  localStorage.setItem('educational_rpg_user', JSON.stringify(guestUser));
  localStorage.setItem('educational_rpg_session', 'active');
  
  console.log('Stored in localStorage successfully');
  
  // Verify retrieval
  const session = localStorage.getItem('educational_rpg_session');
  const userData = localStorage.getItem('educational_rpg_user');
  
  console.log('Retrieved session:', session);
  console.log('Retrieved user data:', userData);
  
  if (session === 'active' && userData) {
    const parsedUser = JSON.parse(userData);
    console.log('Parsed user:', parsedUser);
    console.log('✅ Guest login test passed!');
  } else {
    console.log('❌ Guest login test failed - data not retrieved correctly');
  }
  
} catch (error) {
  console.error('❌ Guest login test failed with error:', error);
}