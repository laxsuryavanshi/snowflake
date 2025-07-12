import aes from 'crypto-js/aes.js';
import utf8 from 'crypto-js/enc-utf8.js';
import wordarray from 'crypto-js/lib-typedarrays.js';
import pbkdf2 from 'crypto-js/pbkdf2.js';

/**
 * Encrypt provides AES encryption/decryption using a key derived from a passphrase (PBKDF2).
 *
 * @example
 *   const encrypt = new Encrypt('my-passphrase');
 *   const cipher = encrypt.encrypt('hello');
 *   const plain = encrypt.decrypt(cipher);
 */
export class Encrypt {
  /**
   * @private
   * @readonly
   * @type {string}
   * The derived key for encryption/decryption.
   */
  _secureString;

  /**
   * @param {string} secureString - The derived key for encryption/decryption.
   */
  constructor(secureString) {
    this._secureString = secureString;
  }

  /**
   * Create an Encrypt instance from a passphrase, generating a secure string using PBKDF2 and a random salt.
   * @param {string} passphrase - The passphrase to derive the encryption key.
   * @returns {Encrypt} The Encrypt instance.
   */
  static withPassphrase(passphrase) {
    const salt = wordarray.random(16);
    const secureString = pbkdf2(passphrase, salt, {
      keySize: 256 / 32,
      iterations: 100_000,
    }).toString();

    return new Encrypt(secureString);
  }

  /**
   * Encrypt a string using AES.
   * @param {string} plainText - The plaintext to encrypt.
   * @returns {string} The AES-encrypted ciphertext (base64).
   */
  encrypt(plainText) {
    return aes.encrypt(plainText, this._secureString).toString();
  }

  /**
   * Decrypt an AES-encrypted string.
   * @param {string} encryptedText - The ciphertext to decrypt.
   * @returns {string|null} The decrypted plaintext, or null if decryption fails.
   */
  decrypt(encryptedText) {
    try {
      const bytes = aes.decrypt(encryptedText, this._secureString);
      return bytes.toString(utf8) || null;
    } catch (err) {
      return null;
    }
  }
}
