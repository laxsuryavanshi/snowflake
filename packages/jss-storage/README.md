# jss-storage

JavaScript secure storage utility for browsers and custom storage backends. Provides cryptographically secure encryption and decryption using `crypto-js`, with support for localStorage, sessionStorage, or any custom Storage-like interface.

## Features

- AES encryption/decryption using `crypto-js`
- Deterministic key derivation from passphrase (PBKDF2)
- Works with any Storage-like interface (localStorage, sessionStorage, custom)
- ES module support
- Simple API for storing, retrieving, and removing data

## Installation

```sh
yarn add jss-storage crypto-js
# or
npm install jss-storage crypto-js
```

## Usage

```js
import { SecureStorage } from 'jss-storage';

// Create a secure storage instance with a passphrase and (optionally) a storage backend
const storage = new SecureStorage('your-passphrase', localStorage); // or sessionStorage, or custom

// Store data (string only)
storage.setItem('user', JSON.stringify({ name: 'Alice', email: 'alice@example.com' }));

// Retrieve data
const user = JSON.parse(storage.getItem('user'));

// Remove data
storage.removeItem('user');

// Clear all data
storage.clear();
```

## API

### SecureStorage

- `constructor(passphrase: string, storage?: Storage)`
  - `passphrase`: The passphrase to derive the encryption key (required)
  - `storage`: Any Storage-like object (defaults to `localStorage`)
- `setItem(key: string, value: string): void`
- `getItem(key: string): string | null`
- `removeItem(key: string): void`
- `clear(): void`

## Security Notes

- The encryption key is derived from the passphrase using PBKDF2 with a random salt per instance. This means data encrypted with one instance cannot be decrypted by another, even with the same passphrase.
- Only string values are supported for storage. Use `JSON.stringify`/`JSON.parse` for objects.
- The passphrase should be kept secret and not hardcoded in public code.

## License

MIT
