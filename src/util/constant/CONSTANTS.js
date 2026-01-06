
export const CONSTANTS = {
  API: {
    auth: {
      login: { type: "POST", endpoint: "/auth/login" }
    },
    forms: {
        get: { type: "GET", endpoint: "/forms" },
        create: { type: "POST", endpoint: "/forms" },
        delete: { type: "DELETE", endpoint: "/forms" } 
    },
    websites: {
        get: { type: "GET", endpoint: "/websites" },
        create: { type: "POST", endpoint: "/websites" },
        bulkCreate: { type: "POST", endpoint: "/websites/bulk-create" },
        update: { type: "PATCH", endpoint: "/websites" }, 
        delete: { type: "DELETE", endpoint: "/websites" }, 
        migrate: { type: "POST", endpoint: "/websites/migrate" }
    },
    system: {
        rebuildCache: { type: "POST", endpoint: "/system/rebuild-cache" }
    }
  }
};
