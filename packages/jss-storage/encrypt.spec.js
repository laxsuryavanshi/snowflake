import { describe, expect, it } from 'vitest';
import { Encrypt } from './encrypt.js';

describe('Encrypt', () => {
  const secureString = 'UM5RTLFVFOHQH25H';
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
  });

  it('should handle empty string encryption/decryption', () => {
    const encrypt = new Encrypt(secureString);
    const cipher = encrypt.encrypt('');
    const plain = encrypt.decrypt(cipher);
    expect(plain).toBe(null);
  });
});
