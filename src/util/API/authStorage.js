import { STORAGE_KEYS } from '../constant/CONSTANTS';

export const authStorage = {
  getSecret() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_SECRET);
  },

  setSecret(secret) {
    localStorage.setItem(STORAGE_KEYS.AUTH_SECRET, secret);
  },

  removeSecret() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SECRET);
  },

  isAuthenticated() {
    return !!this.getSecret();
  },
};
