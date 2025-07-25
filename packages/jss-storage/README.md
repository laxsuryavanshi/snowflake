# jss-storage

JavaScript secure storage utility for browsers and custom storage backends. Provides cryptographically secure encryption and decryption using `crypto-js`, with support for localStorage, sessionStorage, or any custom Storage-like interface.

## Features

- **AES-256 encryption/decryption** using `crypto-js`
- **Secure key derivation** from passphrase using PBKDF2 (100,000 iterations)
- **Namespace isolation** for multi-context environments
- **Storage flexibility** - works with any Storage-like interface (localStorage, sessionStorage, custom)
- **ES module support** with comprehensive TypeScript definitions
- **Input validation** and comprehensive error handling
- **Cross-session persistence** - data survives browser restarts with same passphrase and salt
- **Simple API** for storing, retrieving, and removing data

## Security Features

- **Strong Key Derivation**: PBKDF2 with 100,000 iterations prevents rainbow table attacks
- **Namespace Isolation**: Data from different namespaces cannot interfere with each other
- **Input Validation**: Comprehensive validation prevents common security issues
- **Secure Defaults**: Fails securely when decryption fails or invalid data is encountered
- **Random IV**: Each encryption operation uses a fresh random initialization vector
- **Tamper Detection**: Invalid or corrupted data returns null instead of partial results

## Installation

```sh
yarn add jss-storage crypto-js
# or
npm install jss-storage crypto-js
```

**Note**: `crypto-js` is a peer dependency and must be installed separately to ensure version compatibility with your project.

## Quick Start

```js
import { SecureStorage } from 'jss-storage';

// 1. Generate and store a salt (one-time setup)
let salt = localStorage.getItem('myApp_salt');
if (!salt) {
  salt = SecureStorage.generateSalt();
  localStorage.setItem('myApp_salt', salt);
}

// 2. Create secure storage instance
const storage = SecureStorage.withPassphrase('your-secure-passphrase', salt, localStorage, 'myApp');

// 3. Use like regular storage, but encrypted
storage.setItem('user', JSON.stringify({ name: 'Alice', email: 'alice@example.com' }));
const user = JSON.parse(storage.getItem('user'));

// Data persists across browser sessions with same passphrase and salt
```

## Usage Examples

### Basic Usage

```js
import { SecureStorage } from 'jss-storage';

// Generate and store salt (one-time setup)
let salt = localStorage.getItem('myApp_salt');
if (!salt) {
  salt = SecureStorage.generateSalt();
  localStorage.setItem('myApp_salt', salt);
}

const storage = SecureStorage.withPassphrase('user-passphrase', salt, localStorage, 'myApp');

// Store simple data
storage.setItem('username', 'alice');
storage.setItem('theme', 'dark');

// Store complex data as JSON
const userProfile = {
  name: 'Alice Johnson',
  email: 'alice@example.com',
  preferences: { notifications: true, language: 'en' },
};
storage.setItem('profile', JSON.stringify(userProfile));

// Retrieve data
console.log('Username:', storage.getItem('username'));
const profile = JSON.parse(storage.getItem('profile') || '{}');
```

### Cross-Session Persistence

```js
// Session 1: Store data
const salt = SecureStorage.generateSalt();
localStorage.setItem('app_salt', salt); // Persist salt
const storage1 = SecureStorage.withPassphrase('my-passphrase', salt, localStorage, 'myApp');
storage1.setItem('sessionData', 'This will persist across browser restarts');

// Session 2: Retrieve data (after browser restart)
const savedSalt = localStorage.getItem('app_salt');
const storage2 = SecureStorage.withPassphrase('my-passphrase', savedSalt, localStorage, 'myApp');
console.log(storage2.getItem('sessionData')); // "This will persist across browser restarts"
```

### Multiple Namespaces

```js
const salt = SecureStorage.generateSalt();
const userStorage = SecureStorage.withPassphrase('passphrase', salt, localStorage, 'user-data');
const appStorage = SecureStorage.withPassphrase('passphrase', salt, localStorage, 'app-config');

// Data is completely isolated
userStorage.setItem('name', 'Alice');
appStorage.setItem('name', 'MyApplication');

console.log(userStorage.getItem('name')); // "Alice"
console.log(appStorage.getItem('name')); // "MyApplication"
```

### Custom Storage Backend

```js
// Use sessionStorage instead of localStorage
const storage = SecureStorage.withPassphrase('passphrase', salt, sessionStorage, 'myApp');

// Or create a custom storage implementation
class MemoryStorage {
  constructor() {
    this.data = {};
  }
  setItem(key, value) {
    this.data[key] = value;
  }
  getItem(key) {
    return this.data[key] || null;
  }
  removeItem(key) {
    delete this.data[key];
  }
  get length() {
    return Object.keys(this.data).length;
  }
  key(index) {
    return Object.keys(this.data)[index] || null;
  }
  clear() {
    this.data = {};
  }
}

const memoryStorage = SecureStorage.withPassphrase('passphrase', salt, new MemoryStorage(), 'temp');
```

### Error Handling

```js
try {
  const storage = SecureStorage.withPassphrase('passphrase', salt, localStorage, 'myApp');
  storage.setItem('key', 'value');

  const value = storage.getItem('key');
  if (value === null) {
    console.log('Key not found or decryption failed');
  } else {
    console.log('Retrieved:', value);
  }
} catch (error) {
  console.error('Storage error:', error.message);
}
```

## API Reference

### SecureStorage Class

The main class for encrypted storage operations.

#### Static Methods

##### `SecureStorage.generateSalt(): string`

Generates a cryptographically secure random salt for key derivation.

**Returns**: A 32-character hexadecimal string (16 bytes)

```js
const salt = SecureStorage.generateSalt();
// Example: "a1b2c3d4e5f67890a1b2c3d4e5f67890"
```

##### `SecureStorage.withPassphrase(passphrase, salt, storage?, namespace?): SecureStorage`

Creates a SecureStorage instance using PBKDF2 key derivation.

**Parameters**:

- `passphrase` _(string|WordArray)_: The passphrase for encryption
- `salt` _(string|WordArray)_: The salt for key derivation
- `storage` _(Storage, optional)_: Storage backend (defaults to localStorage)
- `namespace` _(string, optional)_: Namespace for key isolation (defaults to 'default')

**Returns**: SecureStorage instance

**Throws**: Error if passphrase/salt are invalid or storage is unavailable

```js
const storage = SecureStorage.withPassphrase('my-passphrase', salt, localStorage, 'myApp');
```

#### Constructor

##### `new SecureStorage(encrypt, storage?, namespace?)`

Creates a SecureStorage instance with a pre-configured Encrypt instance.

**Parameters**:

- `encrypt` _(Encrypt)_: Configured encryption instance
- `storage` _(Storage, optional)_: Storage backend (defaults to localStorage)
- `namespace` _(string, optional)_: Namespace for key isolation

**Note**: Most users should use `withPassphrase()` instead.

#### Instance Methods

##### `setItem(key: string, value: string): void`

Stores an encrypted value by key.

**Parameters**:

- `key`: Storage key
- `value`: String value to encrypt and store

```js
storage.setItem('username', 'alice');
storage.setItem('settings', JSON.stringify({ theme: 'dark' }));
```

##### `getItem(key: string): string | null`

Retrieves and decrypts a value by key.

**Parameters**:

- `key`: Storage key to retrieve

**Returns**: Decrypted value or null if not found/decryption fails

```js
const username = storage.getItem('username');
if (username !== null) {
  console.log('User:', username);
}
```

##### `removeItem(key: string): void`

Removes a value by key.

**Parameters**:

- `key`: Storage key to remove

```js
storage.removeItem('username');
```

##### `clear(): void`

Clears all values for this namespace only.

```js
storage.clear(); // Only removes data from this namespace
```

### Encrypt Class

Low-level encryption class (usually not needed directly).

##### `Encrypt.withPassphrase(passphrase, salt): Encrypt`

Creates an Encrypt instance using PBKDF2 key derivation.

##### `encrypt(plainText: string): string`

Encrypts a string using AES-256.

##### `decrypt(encryptedText: string): string | null`

Decrypts an encrypted string.

## Security Considerations

⚠️ **Critical Security Guidelines**

### Passphrase Security

- **Use strong passphrases**: Minimum 12 characters with mixed case, numbers, and symbols
- **Never hardcode passphrases**: Don't embed passphrases in client-side code
- **Prompt users**: Collect passphrases through secure input methods
- **Consider passphrase policies**: Implement strength requirements for your application

### Salt Management

- **Store salts safely**: While salts can be public, store them securely alongside your application data
- **One salt per context**: Use unique salts for different applications or user contexts
- **Persistent salts**: Store salts to ensure data can be decrypted across sessions
- **Salt generation**: Always use `SecureStorage.generateSalt()` for cryptographically secure salts

### Data Protection

- **String-only storage**: Only string values are supported - use `JSON.stringify()` for objects
- **Sensitive data**: Be mindful of what data you encrypt - consider privacy implications
- **Client-side limitations**: Remember that client-side encryption protects against casual inspection, not determined attackers with device access

### Browser Environment

- **Storage persistence**: localStorage persists until manually cleared by user or application
- **Cross-origin isolation**: Data is isolated per origin (domain + protocol + port)
- **Incognito mode**: Data may not persist in private browsing modes
- **Storage limits**: Be aware of browser storage quotas (typically 5-10MB for localStorage)

### Namespace Isolation

- **Unique namespaces**: Always use unique namespaces for different applications or contexts
- **Avoid namespace collisions**: Don't use generic names like 'app' or 'data'
- **Namespace format**: Use descriptive names like 'mycompany-myapp-v1'

### Attack Vectors

- **Device access**: If an attacker has device access, client-side encryption provides limited protection
- **Memory inspection**: Decrypted data exists in memory during use
- **Developer tools**: Browser developer tools can inspect application state
- **XSS vulnerabilities**: Cross-site scripting can bypass client-side encryption

## Salt Management Strategies

### Option 1: Fresh Salt (Highest Security)

```js
// Generate a new salt each time - most secure but data is lost when app restarts
const salt = SecureStorage.generateSalt();
const storage = SecureStorage.withPassphrase('passphrase', salt, localStorage, 'myApp');
```

### Option 2: Persistent Salt (Recommended)

```js
// Store and reuse salt for data persistence
let salt = localStorage.getItem('myApp_salt');
if (!salt) {
  salt = SecureStorage.generateSalt();
  localStorage.setItem('myApp_salt', salt);
}
const storage = SecureStorage.withPassphrase('passphrase', salt, localStorage, 'myApp');
```

### Option 3: Derived Salt

```js
// Derive salt from user input (e.g., username + app name)
const userSalt = 'username-myApp-2025'; // User-specific salt
const storage = new SecureStorage('passphrase', userSalt, localStorage, 'myApp');
```

## Error Handling

The library throws descriptive errors for:

- Invalid passphrase or salt
- Unsupported storage backends

## Browser Compatibility

- Modern browsers with localStorage/sessionStorage support
- Node.js environments with custom storage implementations
- Requires ES2015+ for proper module support

## Performance

- Key derivation: ~100ms on modern devices (due to PBKDF2 iterations)
- Encryption/decryption: < 1ms for typical data sizes
- Storage overhead: ~33% due to base64 encoding

## License

MIT
