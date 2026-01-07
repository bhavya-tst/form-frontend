
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: { type: 'POST', endpoint: '/auth/login' },
  },
  FORMS: {
    LIST: { type: 'GET', endpoint: '/forms' },
    CREATE: { type: 'POST', endpoint: '/forms' },
    SET_DEFAULT: (id) => ({ type: 'PATCH', endpoint: `/forms/${id}/set-default` }),
    DELETE: (id) => ({ type: 'DELETE', endpoint: `/forms/${id}` }),
  },
  WEBSITES: {
    LIST: { type: 'GET', endpoint: '/websites' },
    CREATE: { type: 'POST', endpoint: '/websites' },
    BULK_CREATE: { type: 'POST', endpoint: '/websites/bulk-create' },
    UPDATE: (id) => ({ type: 'PATCH', endpoint: `/websites/${id}` }),
    DELETE: (id) => ({ type: 'DELETE', endpoint: `/websites/${id}` }),
    MIGRATE: { type: 'POST', endpoint: '/websites/migrate' },
  },
};

export const STORAGE_KEYS = {
  AUTH_SECRET: 'admin_secret',
  THEME: 'theme_mode',
};
