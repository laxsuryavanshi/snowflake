import wordarray from 'crypto-js/lib-typedarrays.js';

import { Encrypt } from './encrypt.js';

/**
 * SecureStorage provides encrypted storage using a passphrase and any Storage-like backend.
 *
 * @example
 *   const storage = new SecureStorage('my-passphrase', localStorage, 'myApp');
 *   storage.setItem('key', 'value');
 *   const value = storage.getItem('key');
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
   * Create a SecureStorage instance.
   * @param {string} [passphrase=''] - The passphrase to derive the encryption key.
   * @param {Storage} [storage=localStorage] - The storage backend to use.
   * @param {string} [namespace] - The namespace prefix for all keys.
   * @throws {Error} If the storage object is invalid or passphrase is not a string.
   */
  constructor(passphrase, storage, namespace) {
    if (!storage) {
      if (typeof window !== 'undefined' && window.localStorage) {
        storage = window.localStorage;
      } else {
        throw new Error('No storage provided and localStorage is not available.');
      }
    }
    if (
      !storage ||
      typeof storage.setItem !== 'function' ||
      typeof storage.getItem !== 'function'
    ) {
      throw new Error('Invalid storage object');
    }
    this._storage = storage;

    passphrase ||= '';
    this._encrypt = Encrypt.withPassphrase(passphrase);
    this._namespace =
      'jss:' +
      (typeof namespace === 'string' && namespace.length > 0
        ? namespace
        : wordarray.random(16).toString());
  }

  /**
   * @private
   * Generate a namespaced key for storage.
   * @param {string} key - The storage key.
   * @returns {string} The namespaced key.
   */
  _keyify(key) {
    return `${this._namespace}:${key}`;
  }

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
   * @param {string} key - The storage key.
   * @param {string} value - The string value to encrypt and store.
   * @returns {void}
   */
  setItem(key, value) {
    const encrypted = this._encrypt.encrypt(value);
    this._storage.setItem(this._keyify(key), encrypted);
  }

  /**
   * Retrieve and decrypt a value by key.
   * @param {string} key - The storage key.
   * @returns {string|null} The decrypted value, or null if not found or decryption fails.
   */
  getItem(key) {
    const item = this._storage.getItem(this._keyify(key));
    if (!item) return null;
    return this._encrypt.decrypt(item);
  }

  /**
   * Remove a value by key.
   * @param {string} key - The storage key.
   * @returns {void}
   */
  removeItem(key) {
    this._storage.removeItem(this._keyify(key));
  }

  /**
   * Clear all values from the storage backend for this namespace.
   * @returns {void}
   */
  clear() {
    this._keys().forEach(key => {
      this._storage.removeItem(key);
    });
  }
}
