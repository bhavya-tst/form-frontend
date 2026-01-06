
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  FORMS: {
    LIST: '/forms',
    CREATE: '/forms',
    DELETE: (id) => `/forms/${id}`,
  },
  WEBSITES: {
    LIST: '/websites',
    BULK_CREATE: '/websites/bulk-create',
    UPDATE: (id) => `/websites/${id}`,
    DELETE: (id) => `/websites/${id}`,
    MIGRATE: '/websites/migrate',
  },
};

export const STORAGE_KEYS = {
  AUTH_SECRET: 'admin_secret',
  THEME: 'theme_mode',
};
