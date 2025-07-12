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
  beforeEach(() => {
    mock = new MockStorage();
    storage = new SecureStorage('test-pass', mock, 'testns');
  });

  it('should store and retrieve a string value', () => {
    storage.setItem('foo', 'bar');
    expect(storage.getItem('foo')).toBe('bar');
  });

  it('should store and retrieve an object (using JSON)', () => {
    const obj = { a: 1, b: 'x' };
    storage.setItem('obj', JSON.stringify(obj));
    expect(JSON.parse(storage.getItem('obj'))).toEqual(obj);
  });

  it('should return null for missing keys', () => {
    expect(storage.getItem('missing')).toBeNull();
  });

  it('should remove a value', () => {
    storage.setItem('foo', 'bar');
    storage.removeItem('foo');
    expect(storage.getItem('foo')).toBeNull();
  });

  it('should clear all values in the namespace only', () => {
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    // Add a value outside the namespace
    mock.setItem('otherkey', 'should-stay');
    storage.clear();
    expect(storage.getItem('a')).toBeNull();
    expect(storage.getItem('b')).toBeNull();
    expect(mock.getItem('otherkey')).toBe('should-stay');
  });

  it('should not affect other namespaces', () => {
    const storage2 = new SecureStorage('test-pass', mock, 'otherns');
    storage.setItem('foo', 'bar');
    storage2.setItem('foo', 'baz');
    expect(storage.getItem('foo')).toBe('bar');
    expect(storage2.getItem('foo')).toBe('baz');
    storage.clear();
    expect(storage.getItem('foo')).toBeNull();
    expect(storage2.getItem('foo')).toBe('baz');
  });

  it('should throw error for invalid storage', () => {
    expect(() => new SecureStorage('pass', null)).toThrow();
    expect(() => new SecureStorage('pass', {})).toThrow();
  });
});
