import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: any) => api.post('/auth/register', data).then(r => r.data),
  login: (data: any) => api.post('/auth/login', data).then(r => r.data),
  refresh: (token: string) => api.post('/auth/refresh', { refreshToken: token }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

// Courses
export const coursesApi = {
  list: () => api.get('/courses').then(r => r.data),
  mine: () => api.get('/courses/mine').then(r => r.data),
  get: (id: string) => api.get(`/courses/${id}`).then(r => r.data),
  create: (data: any) => api.post('/courses', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data).then(r => r.data),
  publish: (id: string) => api.post(`/courses/${id}/publish`).then(r => r.data),
  delete: (id: string) => api.delete(`/courses/${id}`).then(r => r.data),
  fork: (id: string) => api.post(`/courses/${id}/fork`).then(r => r.data),
  versions: (id: string) => api.get(`/courses/${id}/versions`).then(r => r.data),
  bookmark: (id: string) => api.post(`/courses/${id}/bookmark`).then(r => r.data),
  like: (id: string) => api.post(`/courses/${id}/like`).then(r => r.data),
};

// AI
export const aiApi = {
  generate: (data: any) => api.post('/ai/generate', data).then(r => r.data),
  generatePdf: (formData: FormData) =>
    api.post('/ai/generate/pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  chat: (courseId: string, data: any) => api.post(`/ai/courses/${courseId}/chat`, data).then(r => r.data),
  getSessions: (courseId: string) => api.get(`/ai/courses/${courseId}/chat/sessions`).then(r => r.data),
  getHistory: (sessionId: string) => api.get(`/ai/chat/sessions/${sessionId}/messages`).then(r => r.data),
};

// Lessons
export const lessonsApi = {
  get: (id: string) => api.get(`/lessons/${id}`).then(r => r.data),
  create: (chapterId: string, data: any) => api.post(`/chapters/${chapterId}/lessons`, data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/lessons/${id}`, data).then(r => r.data),
  complete: (id: string) => api.post(`/lessons/${id}/complete`).then(r => r.data),
};

// Chapters
export const chaptersApi = {
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/chapters`, data).then(r => r.data),
  update: (courseId: string, id: string, data: any) => api.put(`/courses/${courseId}/chapters/${id}`, data).then(r => r.data),
};

// Quizzes
export const quizzesApi = {
  get: (id: string) => api.get(`/quizzes/${id}`).then(r => r.data),
  submit: (id: string, data: any) => api.post(`/quizzes/${id}/attempt`, data).then(r => r.data),
  attempts: (id: string) => api.get(`/quizzes/${id}/attempts`).then(r => r.data),
};

// Search
export const searchApi = {
  search: (q: string, filters?: any) => api.get('/search', { params: { q, ...filters } }).then(r => r.data),
  tags: () => api.get('/search/tags').then(r => r.data),
};

// Progress
export const progressApi = {
  dashboard: () => api.get('/progress/dashboard').then(r => r.data),
  mine: () => api.get('/progress/mine').then(r => r.data),
  course: (courseId: string) => api.get(`/progress/courses/${courseId}`).then(r => r.data),
};

// Users
export const usersApi = {
  me: () => api.get('/users/me').then(r => r.data),
  profile: (id: string) => api.get(`/users/${id}/profile`).then(r => r.data),
  updateProfile: (data: any) => api.put('/users/me/profile', data).then(r => r.data),
  bookmarks: () => api.get('/users/me/bookmarks').then(r => r.data),
};
