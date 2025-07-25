import aes from 'crypto-js/aes.js';
import hex from 'crypto-js/enc-hex.js';
import utf8 from 'crypto-js/enc-utf8.js';
import pbkdf2 from 'crypto-js/pbkdf2.js';

/**
 * Encrypt provides AES encryption/decryption using a key derived from a passphrase (PBKDF2).
 *
 * @example
 * ```js
 * // Create from passphrase and hex salt
 * const encrypt = Encrypt.withPassphrase('my-passphrase', 'AB0C5342F');
 * const cipher = encrypt.encrypt('hello world');
 * const plain = encrypt.decrypt(cipher);
 *
 * // Direct instantiation with pre-derived key
 * const encrypt2 = new Encrypt('pre-derived-key');
 * ```
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
   * Create an Encrypt instance from a passphrase and salt, generating a secure string using PBKDF2.
   * @param {string|CryptoJS.lib.WordArray} passphrase - The passphrase to derive the encryption key.
   * @param {string|CryptoJS.lib.WordArray} salt - The salt for key derivation. Should be randomly
   * generated and stored for later use. Can be hex string or WordArray.
   *
   * @returns {Encrypt} The Encrypt instance.
   * @throws {Error} If passphrase or salt are invalid or missing.
   *
   * @example
   * ```js
   * const salt = SecureStorage.generateSalt(); // Generate random salt
   * const encrypt = Encrypt.withPassphrase('my-secure-passphrase', salt);
   * ```
   */
  static withPassphrase(passphrase, salt) {
    // Parse passphrase
    if (typeof passphrase === 'string') {
      passphrase = utf8.parse(passphrase);
    }
    if (!passphrase || typeof passphrase.words === 'undefined') {
      throw new Error('Passphrase must be a string or a CryptoJS WordArray');
    }

    // Parse salt
    if (typeof salt === 'string') {
      salt = hex.parse(salt);
    }
    if (!salt || typeof salt.words === 'undefined') {
      throw new Error('Salt must be a string or a CryptoJS WordArray');
    }

    const secureString = pbkdf2(passphrase, salt, {
      keySize: 256 / 32,
      iterations: 100_000,
    });

    return new Encrypt(secureString.toString());
  }

  /**
   * Encrypt a string using AES-256 encryption.
   *
   * @param {string} plainText - The plaintext string to encrypt.
   * @returns {string} The AES-encrypted ciphertext encoded as base64.
   *
   * @example
   * ```js
   * const encrypted = encrypt.encrypt('sensitive data');
   * console.log(encrypted); // Base64 encoded encrypted string
   * ```
   */
  encrypt(plainText) {
    return aes.encrypt(plainText, this._secureString).toString();
  }

  /**
   * Decrypt an AES-encrypted string.
   *
   * Attempts to decrypt the given ciphertext. Returns null for invalid input,
   * decryption failures, or empty decrypted strings (for security reasons).
   *
   * @param {string} encryptedText - The base64-encoded ciphertext to decrypt.
   * @returns {string|null} The decrypted plaintext, or null if decryption fails
   *                       or input is invalid. Empty strings are also returned as null.
   *
   * @example
   * ```js
   * const decrypted = encrypt.decrypt(encryptedText);
   * if (decrypted !== null) {
   *   console.log('Decryption successful:', decrypted);
   * } else {
   *   console.log('Decryption failed or invalid input');
   * }
   * ```
   */
  decrypt(encryptedText) {
    try {
      const bytes = aes.decrypt(encryptedText, this._secureString);
      const plaintext = bytes.toString(utf8);

      // Return the actual decrypted content, including empty strings
      return plaintext.length > 0 ? plaintext : null;
    } catch (err) {
      return null;
    }
  }
}
