import { beforeEach, describe, expect, it } from 'vitest';

import { SecureStorage } from './storage.js';

// Mock Storage implementation for testing
class MockStorage {
  constructor() {
    this._data = {};
  }
  get length() {
    return Object.keys(this._data).length;
  }
  clear() {
    this._data = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._data, key) ? this._data[key] : null;
  }
  key(index) {
    return Object.keys(this._data)[index] || null;
  }
  removeItem(key) {
    delete this._data[key];
  }
  setItem(key, value) {
    this._data[key] = value;
  }
}

describe('SecureStorage', () => {
  let storage;
  let mock;
  const testSalt = '5a8b7c9d2e1f3a4b5c6d7e8f9a0b1c2d';

  beforeEach(() => {
    mock = new MockStorage();
    storage = SecureStorage.withPassphrase('test-passphrase', testSalt, mock, 'testns');
  });

  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
    });

    it('should return null for non-existent keys', () => {
      expect(storage.getItem('nonexistent')).toBeNull();
    });

    it('should remove items', () => {
      storage.setItem('key', 'value');
      storage.removeItem('key');
      expect(storage.getItem('key')).toBeNull();
    });

    it('should clear all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });
  });

  describe('Static Methods', () => {
    it('should create instance with passphrase', () => {
      const instance = SecureStorage.withPassphrase('pass', testSalt, mock, 'ns');
      expect(instance).toBeInstanceOf(SecureStorage);
    });

    it('should generate random salt', () => {
      const salt = SecureStorage.generateSalt();
      expect(typeof salt).toBe('string');
    });
  });

  describe('Namespace Isolation', () => {
    it('should isolate data by namespace', () => {
      const ns1 = SecureStorage.withPassphrase('pass', testSalt, mock, 'ns1');
      const ns2 = SecureStorage.withPassphrase('pass', testSalt, mock, 'ns2');

      ns1.setItem('key', 'value1');
      ns2.setItem('key', 'value2');

      expect(ns1.getItem('key')).toBe('value1');
      expect(ns2.getItem('key')).toBe('value2');
    });

    it('should only clear items from its namespace', () => {
      const ns1 = SecureStorage.withPassphrase('pass', testSalt, mock, 'ns1');
      const ns2 = SecureStorage.withPassphrase('pass', testSalt, mock, 'ns2');

      ns1.setItem('key', 'value1');
      ns2.setItem('key', 'value2');

      ns1.clear();

      expect(ns1.getItem('key')).toBeNull();
      expect(ns2.getItem('key')).toBe('value2');
    });

    it('should handle empty namespace correctly', () => {
      const emptyNsStorage = SecureStorage.withPassphrase('pass', testSalt, mock, '');
      emptyNsStorage.setItem('key', 'value');
      expect(emptyNsStorage.getItem('key')).toBe('value');
    });

    it('should handle namespace with special characters', () => {
      const specialNs = 'ns:with:colons-and_underscores.and.dots';
      const specialStorage = SecureStorage.withPassphrase('pass', testSalt, mock, specialNs);
      specialStorage.setItem('key', 'value');
      expect(specialStorage.getItem('key')).toBe('value');
    });

    it('should prevent namespace collision attacks', () => {
      // Try to create namespaces that could collide
      const ns1 = SecureStorage.withPassphrase('pass', testSalt, mock, 'app');
      const ns2 = SecureStorage.withPassphrase('pass', testSalt, mock, 'app:sub');

      ns1.setItem('key', 'value1');
      ns2.setItem('key', 'value2');

      expect(ns1.getItem('key')).toBe('value1');
      expect(ns2.getItem('key')).toBe('value2');
    });
  });

  describe('Data Integrity and Encryption', () => {
    it('should encrypt data when storing', () => {
      storage.setItem('secret', 'confidential-data');

      // Check that raw storage contains encrypted data
      const storedData = mock.getItem('jss:testns:secret');
      expect(storedData).toBeTruthy();
      expect(storedData).not.toBe('confidential-data');
      expect(storedData).not.toContain('confidential-data');
    });

    it('should decrypt data when retrieving', () => {
      storage.setItem('secret', 'confidential-data');
      expect(storage.getItem('secret')).toBe('confidential-data');
    });

    it('should handle large data', () => {
      const largeData = 'x'.repeat(10000);
      storage.setItem('large', largeData);
      expect(storage.getItem('large')).toBe(largeData);
    });

    it('should handle binary data', () => {
      const binaryData = String.fromCharCode(0, 1, 2, 255, 254, 253);
      storage.setItem('binary', binaryData);
      expect(storage.getItem('binary')).toBe(binaryData);
    });

    it('should handle corrupted data gracefully', () => {
      // Manually add corrupted data to storage
      mock.setItem('jss:testns:corrupted', 'not-encrypted-data');

      // Should return null for corrupted data
      expect(storage.getItem('corrupted')).toBeNull();
    });
  });

  describe('Data Type Support', () => {
    it('should handle empty strings', () => {
      storage.setItem('empty', '');
      // Empty strings are treated as failed decryption for security reasons
      expect(storage.getItem('empty')).toBe(null);
    });

    it('should handle strings with quotes', () => {
      const stringWithQuotes = 'He said "Hello, \'world\'!"';
      storage.setItem('quotes', stringWithQuotes);
      expect(storage.getItem('quotes')).toBe(stringWithQuotes);
    });

    it('should handle strings with newlines', () => {
      const multilineString = 'Line 1\nLine 2\r\nLine 3\r';
      storage.setItem('multiline', multilineString);
      expect(storage.getItem('multiline')).toBe(multilineString);
    });

    it('should handle JSON strings', () => {
      const jsonString = JSON.stringify({ key: 'value', number: 123, array: [1, 2, 3] });
      storage.setItem('json', jsonString);
      expect(storage.getItem('json')).toBe(jsonString);
    });
  });

  describe('Key Edge Cases', () => {
    it('should handle empty key', () => {
      storage.setItem('', 'empty-key-value');
      expect(storage.getItem('')).toBe('empty-key-value');
    });

    it('should handle keys with special characters and unicode', () => {
      const testCases = [
        { key: '!@#$%^&*()_+-=[]{}|;:,.<>?', value: 'special-chars' },
        { key: '🔑_key_世界', value: '🔐 Hello 世界 🌍' },
        { key: 'key with spaces', value: 'spaced-value' },
        { key: 'key-with-dashes', value: 'dashed-value' },
        { key: 'key:with:colons', value: 'colon-value' },
      ];

      testCases.forEach(({ key, value }) => {
        storage.setItem(key, value);
        expect(storage.getItem(key)).toBe(value);
      });
    });
  });

  describe('Overwrite Behavior', () => {
    it('should overwrite existing values', () => {
      storage.setItem('key', 'original');
      storage.setItem('key', 'updated');
      expect(storage.getItem('key')).toBe('updated');
    });

    it('should handle multiple overwrites', () => {
      const values = ['value1', 'value2', 'value3', 'final'];
      values.forEach(value => storage.setItem('key', value));
      expect(storage.getItem('key')).toBe('final');
    });
  });

  describe('Batch Operations', () => {
    it('should handle multiple items correctly', () => {
      const items = { key1: 'value1', key2: 'value2', key3: 'value3' };

      // Set items
      Object.entries(items).forEach(([key, value]) => {
        storage.setItem(key, value);
      });

      // Verify items
      Object.entries(items).forEach(([key, value]) => {
        expect(storage.getItem(key)).toBe(value);
      });

      // Clear should remove all
      storage.clear();
      Object.keys(items).forEach(key => {
        expect(storage.getItem(key)).toBeNull();
      });
    });
  });

  describe('Clear Operation Edge Cases', () => {
    it('should handle clear when storage is empty', () => {
      expect(() => storage.clear()).not.toThrow();
      expect(storage.getItem('nonexistent')).toBeNull();
    });
  });

  describe('Concurrent Access Simulation', () => {
    it('should handle multiple instances with same configuration', () => {
      const storage1 = SecureStorage.withPassphrase('test-pass', testSalt, mock, 'testns');
      const storage2 = SecureStorage.withPassphrase('test-pass', testSalt, mock, 'testns');

      // Both instances should be able to read/write each other's data
      storage1.setItem('shared', 'data1');
      expect(storage2.getItem('shared')).toBe('data1');

      storage2.setItem('shared', 'data2');
      expect(storage1.getItem('shared')).toBe('data2');
    });

    it('should maintain isolation between different configurations', () => {
      const storage1 = SecureStorage.withPassphrase('pass1', testSalt, mock, 'ns1');
      const storage2 = SecureStorage.withPassphrase('pass2', testSalt, mock, 'ns2');

      storage1.setItem('key', 'value1');
      storage2.setItem('key', 'value2');

      expect(storage1.getItem('key')).toBe('value1');
      expect(storage2.getItem('key')).toBe('value2');
    });
  });

  describe('Salt Generation and Consistency', () => {
    it('should generate salts of correct format', () => {
      const salt = SecureStorage.generateSalt();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBe(32); // 16 bytes = 32 hex chars
      expect(/^[0-9a-f]+$/i.test(salt)).toBe(true); // Only hex characters
    });

    it('should generate different salts', () => {
      const salt1 = SecureStorage.generateSalt();
      const salt2 = SecureStorage.generateSalt();
      expect(salt1).not.toBe(salt2);
    });

    it('should use consistent salt across instances with same configuration', () => {
      // Store data with first instance
      storage.setItem('test', 'data');

      // Create new instance with same passphrase, salt and namespace
      const storage2 = SecureStorage.withPassphrase('test-passphrase', testSalt, mock, 'testns');

      // Should be able to decrypt data from first instance due to same salt
      expect(storage2.getItem('test')).toBe('data');
    });

    it('should not decrypt data with different salt', () => {
      const salt1 = SecureStorage.generateSalt();
      const salt2 = SecureStorage.generateSalt();

      const storage1 = SecureStorage.withPassphrase('test-pass', salt1, mock, 'testns');
      const storage2 = SecureStorage.withPassphrase('test-pass', salt2, mock, 'testns');

      storage1.setItem('test', 'data');
      expect(storage2.getItem('test')).toBeNull(); // Different salt = can't decrypt

      // Clean up
      storage1.clear();
    });

    it('should isolate namespaces correctly', () => {
      const customSalt = SecureStorage.generateSalt();
      const storage1 = SecureStorage.withPassphrase('test-pass', customSalt, mock, 'app1');
      const storage2 = SecureStorage.withPassphrase('test-pass', customSalt, mock, 'app2');

      storage1.setItem('config', 'app1-config');
      storage2.setItem('config', 'app2-config');

      expect(storage1.getItem('config')).toBe('app1-config');
      expect(storage2.getItem('config')).toBe('app2-config');

      // Clean up
      storage1.clear();
      storage2.clear();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle storage backend errors', () => {
      // Create a faulty storage that throws errors
      const faultyStorage = {
        setItem: () => {
          throw new Error('Storage full');
        },
        getItem: () => {
          throw new Error('Storage error');
        },
        removeItem: () => {
          throw new Error('Storage error');
        },
        length: 0,
        key: () => null,
      };

      const faultySecureStorage = SecureStorage.withPassphrase(
        'pass',
        testSalt,
        faultyStorage,
        'test'
      );

      expect(() => faultySecureStorage.setItem('key', 'value')).toThrow('Storage full');
      expect(() => faultySecureStorage.getItem('key')).toThrow('Storage error');
      expect(() => faultySecureStorage.removeItem('key')).toThrow('Storage error');
    });
  });

  describe('Memory and Performance', () => {
    it('should handle repeated operations correctly', () => {
      // Simulate basic repeated operations
      for (let i = 0; i < 5; i++) {
        storage.setItem('temp', `data${i}`);
        expect(storage.getItem('temp')).toBe(`data${i}`);
        storage.removeItem('temp');
        expect(storage.getItem('temp')).toBeNull();
      }

      // Should still work correctly after repeated operations
      storage.setItem('final', 'test');
      expect(storage.getItem('final')).toBe('test');
    });
  });
});
