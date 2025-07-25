import hex from 'crypto-js/enc-hex.js';
import wordarray from 'crypto-js/lib-typedarrays.js';

import { Encrypt } from './encrypt.js';

/**
 * SecureStorage provides encrypted storage using a passphrase and any Storage-like backend.
 *
 * This class encrypts all stored values using AES-256 encryption with PBKDF2 key derivation.
 * It supports namespace isolation to prevent data conflicts between different applications
 * or contexts. Data encrypted with one instance can be decrypted by another instance
 * using the same passphrase, salt, and namespace.
 *
 * @example
 * ```js
 * // Generate a salt for key derivation
 * const salt = SecureStorage.generateSalt();
 *
 * // Create a secure storage instance
 * const storage = SecureStorage.withPassphrase('my-secure-passphrase', salt, localStorage, 'myApp');
 *
 * // Store and retrieve data
 * storage.setItem('user', JSON.stringify({name: 'Alice'}));
 * const user = JSON.parse(storage.getItem('user'));
 *
 * // Data persists across browser sessions with the same passphrase and salt
 * ```
 */
export class SecureStorage {
  /**
   * @private
   * @readonly
   * @type {Storage}
   * The storage backend (localStorage, sessionStorage, or custom).
   */
  _storage;
  /**
   * @private
   * @readonly
   * @type {Encrypt}
   * The encryption service instance.
   */
  _encrypt;
  /**
   * @private
   * @readonly
   * @type {string}
   * The namespace prefix for all keys.
   */
  _namespace;

  /**
   * Generate a cryptographically secure random salt for use with SecureStorage.
   *
   * The salt should be stored and reused to ensure data can be decrypted across
   * browser sessions. Each application or context should use a unique salt.
   *
   * @returns {string} A random 16-byte salt encoded as hexadecimal string.
   *
   * @example
   * ```js
   * // Generate and store salt for persistence
   * let salt = localStorage.getItem('myApp_salt');
   * if (!salt) {
   *   salt = SecureStorage.generateSalt();
   *   localStorage.setItem('myApp_salt', salt);
   * }
   * const storage = SecureStorage.withPassphrase('passphrase', salt, localStorage, 'myApp');
   * ```
   */
  static generateSalt() {
    return wordarray.random(16).toString(hex);
  }

  /**
   * Create a SecureStorage instance with a passphrase and salt.
   *
   * This is the recommended way to create a SecureStorage instance. The passphrase
   * and salt are used to derive an encryption key using PBKDF2 with 100,000 iterations.
   *
   * @param {string|CryptoJS.lib.WordArray} passphrase - The passphrase to derive the encryption key from.
   *                                                    Should be strong and kept secure.
   * @param {string|CryptoJS.lib.WordArray} salt - The salt for key derivation. Use generateSalt()
   *                                               to create a secure random salt.
   * @param {Storage} [storage=localStorage] - The storage backend to use. Defaults to localStorage
   *                                          if available in the current environment.
   * @param {string} [namespace='default'] - The namespace prefix for all keys. Use unique
   *                                        namespaces for different applications or contexts.
   *
   * @returns {SecureStorage} A new SecureStorage instance ready for encrypted storage operations.
   * @throws {Error} If passphrase or salt are invalid, or if no storage is available.
   *
   * @example
   * ```js
   * const salt = SecureStorage.generateSalt();
   * const storage = SecureStorage.withPassphrase('my-passphrase', salt, localStorage, 'myApp');
   * ```
   */
  static withPassphrase(passphrase, salt, storage, namespace) {
    // Input validation is handled in Encrypt.withPassphrase
    const encrypt = Encrypt.withPassphrase(passphrase, salt);
    return new SecureStorage(encrypt, storage, namespace);
  }

  /**
   * Create a SecureStorage instance with a pre-configured Encrypt instance.
   *
   * This constructor is primarily for advanced use cases or testing. Most users
   * should use the static withPassphrase() method instead.
   *
   * @param {Encrypt} encrypt - The Encrypt instance for encryption/decryption operations.
   *                           Must implement encrypt() and decrypt() methods.
   * @param {Storage} [storage=localStorage] - The storage backend to use. Must implement
   *                                          the Storage interface (setItem, getItem, removeItem).
   * @param {string} [namespace='default'] - The namespace for storage key isolation.
   *                                        Different namespaces store data separately.
   *
   * @throws {Error} If the Encrypt instance is invalid or the storage object doesn't
   *                implement the required Storage interface methods.
   *
   * @example
   * ```js
   * const encrypt = Encrypt.withPassphrase('passphrase', 'salt');
   * const storage = new SecureStorage(encrypt, localStorage, 'myApp');
   * ```
   */
  constructor(encrypt, storage, namespace) {
    if (
      !encrypt ||
      typeof encrypt.encrypt !== 'function' ||
      typeof encrypt.decrypt !== 'function'
    ) {
      throw new Error(
        'Invalid Encrypt instance provided - must implement encrypt() and decrypt() methods'
      );
    }
    this._encrypt = encrypt;

    if (!storage) {
      if (typeof window !== 'undefined' && window.localStorage) {
        storage = window.localStorage;
      } else {
        throw new Error(
          'No storage provided and localStorage is not available in this environment'
        );
      }
    }
    if (
      !storage ||
      typeof storage.setItem !== 'function' ||
      typeof storage.getItem !== 'function'
    ) {
      throw new Error(
        'Invalid storage object - must implement Storage interface (setItem, getItem, removeItem)'
      );
    }
    this._storage = storage;

    // Set namespace - use provided namespace or default
    this._namespace =
      'jss:' + (typeof namespace === 'string' && namespace.length > 0 ? namespace : 'default');
  }

  /**
   * @private
   * Generate a namespaced key for storage operations.
   *
   * All keys are prefixed with the namespace to prevent conflicts between
   * different applications or contexts using the same storage backend.
   *
   * @param {string} key - The user-provided storage key.
   * @returns {string} The namespaced key with format "jss:{namespace}:{key}".
   */
  _keyify(key) {
    return `${this._namespace}:${key}`;
  }

  /**
   * @private
   * Get all keys belonging to this namespace from the storage backend.
   *
   * @returns {string[]} Array of all namespaced keys in the storage.
   */
  _keys() {
    const prefix = `${this._namespace}:`;
    const keys = [];
    for (let i = 0; i < this._storage.length; i++) {
      const k = this._storage.key(i);
      if (k && k.startsWith(prefix)) {
        keys.push(k);
      }
    }
    return keys;
  }

  /**
   * Store an encrypted value by key.
   *
   * The value is encrypted using AES-256 before being stored in the backend storage.
   * Only string values are supported - use JSON.stringify() for objects.
   *
   * @param {string} key - The storage key.
   * @param {string} value - The string value to encrypt and store.
   *
   * @example
   * ```js
   * // Store simple string
   * storage.setItem('username', 'alice');
   *
   * // Store object as JSON
   * storage.setItem('user', JSON.stringify({name: 'Alice', age: 30}));
   * ```
   */
  setItem(key, value) {
    const encrypted = this._encrypt.encrypt(value);
    this._storage.setItem(this._keyify(key), encrypted);
  }

  /**
   * Retrieve and decrypt a value by key.
   *
   * Attempts to retrieve the encrypted value from storage and decrypt it.
   * Returns null if the key doesn't exist, decryption fails, or the decrypted
   * value is empty.
   *
   * @param {string} key - The storage key to retrieve.
   * @returns {string|null} The decrypted value, or null if not found or decryption fails.
   *
   * @example
   * ```js
   * const username = storage.getItem('username');
   * if (username !== null) {
   *   console.log('Found user:', username);
   * }
   *
   * // Retrieve and parse JSON object
   * const userJson = storage.getItem('user');
   * const user = userJson ? JSON.parse(userJson) : null;
   * ```
   */
  getItem(key) {
    const item = this._storage.getItem(this._keyify(key));
    if (!item) return null;
    return this._encrypt.decrypt(item);
  }

  /**
   * Remove a value by key from storage.
   *
   * Removes the encrypted value associated with the given key from the storage backend.
   * Does nothing if the key doesn't exist.
   *
   * @param {string} key - The storage key to remove.
   *
   * @example
   * ```js
   * storage.removeItem('username');
   * ```
   */
  removeItem(key) {
    this._storage.removeItem(this._keyify(key));
  }

  /**
   * Clear all values from storage for this namespace only.
   *
   * Removes all keys that belong to this SecureStorage instance's namespace,
   * leaving data from other namespaces intact. This operation cannot be undone.
   *
   * @example
   * ```js
   * // Clear all data for this namespace
   * storage.clear();
   *
   * // Data from other namespaces remains untouched
   * otherStorage.getItem('key'); // Still accessible
   * ```
   */
  clear() {
    this._keys().forEach(key => {
      this._storage.removeItem(key);
    });
  }
}
