export class StorageService {
  static #isAvailable = null;
  static #prefix = 'app_';

  static #checkAvailability() {
    if (this.#isAvailable !== null) {
      return this.#isAvailable;
    }

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.#isAvailable = true;
      return true;
    } catch (e) {
      this.#isAvailable = false;
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  static #validateKey(key) {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
  }

  static #getFullKey(key) {
    return `${this.#prefix}${key}`;
  }

  static set(key, value) {
    if (!this.#checkAvailability()) {
      return false;
    }

    try {
      this.#validateKey(key);
      const fullKey = this.#getFullKey(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Consider clearing old data.');
      } else {
        console.error('Error saving to localStorage:', e);
      }
      return false;
    }
  }

  static get(key, defaultValue = null) {
    if (!this.#checkAvailability()) {
      return defaultValue;
    }

    try {
      this.#validateKey(key);
      const fullKey = this.#getFullKey(key);
      const data = localStorage.getItem(fullKey);

      if (data === null) {
        return defaultValue;
      }

      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return defaultValue;
    }
  }

  static remove(key) {
    if (!this.#checkAvailability()) {
      return false;
    }

    try {
      this.#validateKey(key);
      const fullKey = this.#getFullKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  }

  static has(key) {
    if (!this.#checkAvailability()) {
      return false;
    }

    try {
      this.#validateKey(key);
      const fullKey = this.#getFullKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (e) {
      console.error('Error checking localStorage:', e);
      return false;
    }
  }

  static clear() {
    if (!this.#checkAvailability()) {
      return false;
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.#prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }

  static keys() {
    if (!this.#checkAvailability()) {
      return [];
    }

    try {
      const allKeys = Object.keys(localStorage);
      return allKeys
        .filter(key => key.startsWith(this.#prefix))
        .map(key => key.replace(this.#prefix, ''));
    } catch (e) {
      console.error('Error getting keys from localStorage:', e);
      return [];
    }
  }
}