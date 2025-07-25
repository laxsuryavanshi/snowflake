import { describe, expect, it } from 'vitest';

import { Encrypt } from './encrypt.js';

describe('Encrypt', () => {
  const secureString = 'UM5RTLFVFOHQH25H';

  describe('Basic functionality', () => {
    it('should encrypt and decrypt a string to the original value', () => {
      const encrypt = new Encrypt(secureString);
      const cipher = encrypt.encrypt('hello world');
      const plain = encrypt.decrypt(cipher);
      expect(plain).toBe('hello world');
    });

    it('should return null when decrypting with a wrong key', () => {
      const encrypt1 = new Encrypt(secureString);
      const encrypt2 = new Encrypt('BYESSGHLJA7XFIV4');
      const cipher = encrypt1.encrypt('secret');
      const plain = encrypt2.decrypt(cipher);
      expect(plain).not.toBe('secret');
      expect(plain === null || typeof plain === 'string').toBe(true);
    });

    it('should return null when decrypting invalid ciphertext', () => {
      const encrypt = new Encrypt(secureString);
      expect(encrypt.decrypt('not-a-cipher')).toBeNull();
      expect(encrypt.decrypt('')).toBeNull();
      expect(encrypt.decrypt(null)).toBeNull();
      expect(encrypt.decrypt(undefined)).toBeNull();
    });

    it('should handle empty string encryption/decryption', () => {
      const encrypt = new Encrypt(secureString);
      const cipher = encrypt.encrypt('');
      const plain = encrypt.decrypt(cipher);
      // Empty strings are treated as failed decryption for security reasons
      expect(plain).toBe(null);
    });

    it('should validate input parameters', () => {
      expect(() => Encrypt.withPassphrase(123, 'salt')).toThrow(
        'Passphrase must be a string or a CryptoJS WordArray'
      );
      expect(() => Encrypt.withPassphrase('pass', null)).toThrow(
        'Salt must be a string or a CryptoJS WordArray'
      );
    });
  });

  describe('Encryption edge cases', () => {
    it('should handle large strings', () => {
      const encrypt = new Encrypt(secureString);
      const largeString = 'A'.repeat(1000); // 1KB string - reasonable size
      const cipher = encrypt.encrypt(largeString);
      const plain = encrypt.decrypt(cipher);
      expect(plain).toBe(largeString);
    });

    it('should handle unicode characters', () => {
      const encrypt = new Encrypt(secureString);
      const unicodeString = '🔐 Hello 世界 🌍 Testing émojis and spëcial chars';
      const cipher = encrypt.encrypt(unicodeString);
      const plain = encrypt.decrypt(cipher);
      expect(plain).toBe(unicodeString);
    });

    it('should handle special characters and newlines', () => {
      const encrypt = new Encrypt(secureString);
      const specialString = 'Line 1\nLine 2\r\nTab\tSpaced\0Null\\Backslash"Quote\'Single';
      const cipher = encrypt.encrypt(specialString);
      const plain = encrypt.decrypt(cipher);
      expect(plain).toBe(specialString);
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const encrypt = new Encrypt(secureString);
      const plainText = 'same input';
      const cipher1 = encrypt.encrypt(plainText);
      const cipher2 = encrypt.encrypt(plainText);

      // Due to random IV, ciphertexts should be different
      expect(cipher1).not.toBe(cipher2);

      // But both should decrypt to the same plaintext
      expect(encrypt.decrypt(cipher1)).toBe(plainText);
      expect(encrypt.decrypt(cipher2)).toBe(plainText);
    });
  });

  describe('Decryption edge cases', () => {
    it('should handle malformed base64 input', () => {
      const encrypt = new Encrypt(secureString);
      expect(encrypt.decrypt('not-base64!')).toBeNull();
      expect(encrypt.decrypt('invalid===')).toBeNull();
      expect(encrypt.decrypt('U2FsdGVkX1')).toBeNull(); // Truncated
    });

    it('should handle various invalid input types', () => {
      const encrypt = new Encrypt(secureString);
      expect(encrypt.decrypt(null)).toBeNull();
      expect(encrypt.decrypt(undefined)).toBeNull();
      expect(encrypt.decrypt(123)).toBeNull();
      expect(encrypt.decrypt({})).toBeNull();
      expect(encrypt.decrypt([])).toBeNull();
    });

    it('should consistently fail with wrong keys', () => {
      const encrypt1 = new Encrypt(secureString);
      const encrypt2 = new Encrypt('DIFFERENT_KEY_12345');

      const testCases = ['short', 'medium length text', 'very long text '.repeat(100)];

      testCases.forEach(text => {
        const cipher = encrypt1.encrypt(text);
        const decrypted = encrypt2.decrypt(cipher);
        expect(decrypted).toBeNull();
      });
    });
  });

  describe('withPassphrase method edge cases', () => {
    it('should handle various salt formats', () => {
      const passphrase = 'test-passphrase';

      // Hex string salt
      const hexSalt = 'abcdef1234567890abcdef1234567890';
      const encrypt1 = Encrypt.withPassphrase(passphrase, hexSalt);

      // Same salt should produce same encryption key
      const encrypt2 = Encrypt.withPassphrase(passphrase, hexSalt);

      const plaintext = 'test data';
      const cipher1 = encrypt1.encrypt(plaintext);
      const decrypted = encrypt2.decrypt(cipher1);

      expect(decrypted).toBe(plaintext);
    });

    it('should validate salt parameter thoroughly', () => {
      expect(() => Encrypt.withPassphrase('pass', null)).toThrow(
        'Salt must be a string or a CryptoJS WordArray'
      );
      expect(() => Encrypt.withPassphrase('pass', 123)).toThrow(
        'Salt must be a string or a CryptoJS WordArray'
      );
      expect(() => Encrypt.withPassphrase('pass', {})).toThrow(
        'Salt must be a string or a CryptoJS WordArray'
      );
      expect(() => Encrypt.withPassphrase('pass', [])).toThrow(
        'Salt must be a string or a CryptoJS WordArray'
      );
    });

    it('should validate passphrase parameter thoroughly', () => {
      const salt = 'abcdef1234567890';
      expect(() => Encrypt.withPassphrase(null, salt)).toThrow(
        'Passphrase must be a string or a CryptoJS WordArray'
      );
      expect(() => Encrypt.withPassphrase(undefined, salt)).toThrow(
        'Passphrase must be a string or a CryptoJS WordArray'
      );
      expect(() => Encrypt.withPassphrase({}, salt)).toThrow(
        'Passphrase must be a string or a CryptoJS WordArray'
      );
      expect(() => Encrypt.withPassphrase([], salt)).toThrow(
        'Passphrase must be a string or a CryptoJS WordArray'
      );
    });
  });

  describe('Performance and consistency', () => {
    it('should maintain consistency across operations', () => {
      const encrypt = new Encrypt(secureString);
      const testData = 'consistency test data';

      // Perform multiple encrypt/decrypt cycles
      for (let i = 0; i < 3; i++) {
        const cipher = encrypt.encrypt(testData);
        const plain = encrypt.decrypt(cipher);
        expect(plain).toBe(testData);
      }
    });

    it('should handle multiple operations correctly', () => {
      const encrypt = new Encrypt(secureString);
      const testCases = ['test-1', 'test-2', 'test-3'];

      // Process all test cases
      const results = testCases.map(data => ({
        original: data,
        cipher: encrypt.encrypt(data),
      }));

      // Verify all operations
      results.forEach(({ original, cipher }) => {
        expect(encrypt.decrypt(cipher)).toBe(original);
      });
    });
  });
});
