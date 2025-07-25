import { SecureStorage } from './index.js';

/**
 * Example usage of SecureStorage for various scenarios
 */

console.log('🔐 SecureStorage Examples\n');

// Example 1: Basic usage with mandatory salt
console.log('1. Basic Usage:');
try {
  const salt = SecureStorage.generateSalt();
  const storage = SecureStorage.withPassphrase('my-secure-passphrase', salt, localStorage, 'myApp');

  // Store simple data
  storage.setItem('username', 'alice');
  storage.setItem('theme', 'dark');

  // Store complex data (JSON)
  const userProfile = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    preferences: {
      notifications: true,
      language: 'en',
    },
  };
  storage.setItem('profile', JSON.stringify(userProfile));

  // Retrieve data
  console.log('Username:', storage.getItem('username'));
  console.log('Theme:', storage.getItem('theme'));
  console.log('Profile:', JSON.parse(storage.getItem('profile')));

  console.log('✅ Basic usage successful\n');
} catch (error) {
  console.error('❌ Basic usage failed:', error.message);
}

// Example 2: Persistent salt management (recommended for production)
console.log('2. Persistent Salt Management:');
try {
  // This is how you'd manage salt persistence in a real app
  let salt = localStorage.getItem('myApp_salt');
  if (!salt) {
    salt = SecureStorage.generateSalt();
    localStorage.setItem('myApp_salt', salt);
    console.log('Generated new salt and stored it');
  }

  const storage1 = SecureStorage.withPassphrase(
    'test-passphrase',
    salt,
    localStorage,
    'persistentDemo'
  );
  storage1.setItem('persistentData', 'This survives app restarts');

  // Simulate app restart - salt is recovered from localStorage
  const recoveredSalt = localStorage.getItem('myApp_salt');
  const storage2 = SecureStorage.withPassphrase(
    'test-passphrase',
    recoveredSalt,
    localStorage,
    'persistentDemo'
  );

  console.log('Data after "restart":', storage2.getItem('persistentData'));
  console.log('✅ Persistent salt management successful\n');

  // Clean up
  storage1.clear();
  localStorage.removeItem('myApp_salt');
} catch (error) {
  console.error('❌ Persistent salt management failed:', error.message);
}

// Example 3: Fresh salt (highest security, no persistence)
console.log('3. Fresh Salt (No Persistence):');
try {
  // Each instance gets a fresh salt - most secure but data doesn't persist
  const freshSalt = SecureStorage.generateSalt();
  const storage = SecureStorage.withPassphrase(
    'test-passphrase',
    freshSalt,
    localStorage,
    'freshDemo'
  );
  storage.setItem('tempData', 'This data is lost when salt is lost');

  // Different salt = can't decrypt
  const anotherFreshSalt = SecureStorage.generateSalt();
  const storage2 = SecureStorage.withPassphrase(
    'test-passphrase',
    anotherFreshSalt,
    localStorage,
    'freshDemo'
  );
  console.log('Data with different salt:', storage2.getItem('tempData')); // null

  console.log('✅ Fresh salt demonstration successful\n');

  // Clean up
  storage.clear();
} catch (error) {
  console.error('❌ Fresh salt demonstration failed:', error.message);
}

// Example 4: Default namespace behavior (consistent across instances)
console.log('4. Default Namespace Behavior:');
try {
  const sharedSalt = SecureStorage.generateSalt();
  const storage1 = SecureStorage.withPassphrase('test-passphrase', sharedSalt, localStorage);
  const storage2 = SecureStorage.withPassphrase('test-passphrase', sharedSalt, localStorage);

  storage1.setItem('defaultData', 'This uses the default namespace');

  // Both instances can access the same data since they use the same default namespace
  console.log('Data from instance 1:', storage1.getItem('defaultData'));
  console.log('Data from instance 2:', storage2.getItem('defaultData'));
  console.log('✅ Default namespace behavior successful\n');

  // Clean up
  storage1.clear();
} catch (error) {
  console.error('❌ Default namespace behavior failed:', error.message);
}

// Example 5: Cross-session persistence with explicit namespace
console.log('5. Cross-Session Persistence:');
try {
  const sessionSalt = SecureStorage.generateSalt();
  const storage1 = SecureStorage.withPassphrase(
    'test-passphrase',
    sessionSalt,
    localStorage,
    'sessionTest'
  );
  storage1.setItem('sessionData', 'This persists across sessions with the same salt');

  // Simulate new session - create new instance with same passphrase, salt and namespace
  const storage2 = SecureStorage.withPassphrase(
    'test-passphrase',
    sessionSalt,
    localStorage,
    'sessionTest'
  );
  const retrievedData = storage2.getItem('sessionData');

  console.log('Data from previous "session":', retrievedData);
  console.log('✅ Cross-session persistence successful\n');

  // Clean up
  storage2.clear();
} catch (error) {
  console.error('❌ Cross-session persistence failed:', error.message);
}

// Example 6: Namespace isolation
console.log('6. Namespace Isolation:');
try {
  const sharedSalt = SecureStorage.generateSalt();
  const appStorage = SecureStorage.withPassphrase(
    'shared-passphrase',
    sharedSalt,
    localStorage,
    'app'
  );
  const userStorage = SecureStorage.withPassphrase(
    'shared-passphrase',
    sharedSalt,
    localStorage,
    'user'
  );

  appStorage.setItem('config', 'app-config-data');
  userStorage.setItem('config', 'user-config-data');

  console.log('App config:', appStorage.getItem('config'));
  console.log('User config:', userStorage.getItem('config'));
  console.log('✅ Namespace isolation successful\n');

  // Clean up
  appStorage.clear();
  userStorage.clear();
} catch (error) {
  console.error('❌ Namespace isolation failed:', error.message);
}

// Example 7: Error handling
console.log('7. Error Handling:');

// Missing salt
try {
  SecureStorage.withPassphrase('valid-passphrase', null, localStorage);
  console.log('❌ Should have thrown error for missing salt');
} catch (error) {
  console.log('✅ Correctly caught missing salt:', error.message);
}

// Invalid passphrase
try {
  const salt = SecureStorage.generateSalt();
  SecureStorage.withPassphrase(123, salt, localStorage);
  console.log('❌ Should have thrown error for invalid passphrase');
} catch (error) {
  console.log('✅ Correctly caught invalid passphrase:', error.message);
}

// Invalid storage
try {
  const salt = SecureStorage.generateSalt();
  SecureStorage.withPassphrase('valid-passphrase', salt, {});
  console.log('❌ Should have thrown error for invalid storage');
} catch (error) {
  console.log('✅ Correctly caught invalid storage:', error.message);
}

console.log('\n8. Security Demonstration:');
try {
  const salt1 = SecureStorage.generateSalt();
  const salt2 = SecureStorage.generateSalt();
  const storage1 = SecureStorage.withPassphrase('password123', salt1, localStorage, 'demo');
  const storage2 = SecureStorage.withPassphrase('different-password', salt2, localStorage, 'demo');

  storage1.setItem('secret', 'confidential-data');

  // Try to read with wrong passphrase and different salt - should return null
  const retrieved = storage2.getItem('secret');
  console.log('Data with wrong passphrase and different salt:', retrieved);
  console.log('✅ Security check successful - wrong credentials return null\n');

  storage1.clear();
} catch (error) {
  console.error('❌ Security demonstration failed:', error.message);
}

console.log('🎉 All examples completed!');
