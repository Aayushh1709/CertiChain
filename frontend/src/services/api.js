import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('certichain_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('certichain_token');
      localStorage.removeItem('certichain_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
};

// ===== Institution API =====
export const institutionAPI = {
  getPending: () => api.get('/admin/institutions/pending'),
  getAll: () => api.get('/admin/institutions'),
  approve: (id) => api.patch(`/admin/institutions/${id}/approve`),
  reject: (id) => api.patch(`/admin/institutions/${id}/reject`),
  suspend: (id) => api.patch(`/admin/institutions/${id}/suspend`),
};

// ===== Certificate API =====
export const certificateAPI = {
  issue: (data) => api.post('/certificates/issue', data),
  bulkIssue: (data) => api.post('/certificates/bulk-issue', data),
  revoke: (id, reason) => api.post(`/certificates/${id}/revoke`, { reason }),
  getMine: () => api.get('/certificates/mine'),
  getInstitution: () => api.get('/certificates/institution'),
  getStudents: () => api.get('/certificates/students'),
  getByUid: (uid) => api.get(`/certificates/${uid}`),
  downloadPdf: (uid) => api.get(`/certificates/download/${uid}`, { responseType: 'blob' }),
};

// ===== Verification API =====
export const verifyAPI = {
  byId: (certificateId) => api.get(`/verify?certificateId=${certificateId}`),
  byFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/verify/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  bulk: (ids) => api.post('/verify/bulk', ids),
};

// ===== Dashboard API =====
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getPlatformAudit: () => api.get('/audit/platform'),
  getInstitutionAudit: (id) => api.get(`/audit/${id}`),
};

export default api;
