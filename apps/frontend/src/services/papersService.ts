import api from "./api";

export interface CreatePaperData {
  title: string;
  abstract: string;
  keywords: string[];
  authors: { userId: string; name: string; affiliation: string }[];
  category: string;
  journal?: string;
  coverLetter?: string;
  fileUrl?: string;
}

export interface UpdateStatusData {
  status: string;
  editorComments?: string;
  editorNotes?: string;
  doi?: string;
  volume?: number;
  issue?: number;
}

const papersService = {
  // Author
  createPaper: async (data: CreatePaperData) => {
    const response = await api.post("/papers", data);
    return response.data;
  },

  getMySubmissions: async () => {
    const response = await api.get("/papers/my-submissions");
    return response.data;
  },

  getPaperById: async (id: string) => {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },

  updatePaper: async (id: string, data: Partial<CreatePaperData>) => {
    const response = await api.patch(`/papers/${id}`, data);
    return response.data;
  },

  submitPaper: async (id: string) => {
    const response = await api.post(`/papers/${id}/submit`);
    return response.data;
  },

  submitRevision: async (
    id: string,
    data: { fileUrl: string; revisionNote?: string },
  ) => {
    const response = await api.post(`/papers/${id}/revision`, data);
    return response.data;
  },

  deletePaper: async (id: string) => {
    const response = await api.delete(`/papers/${id}`);
    return response.data;
  },

  // Editor
  getAllPapers: async (params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.category) query.append("category", params.category);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const response = await api.get(`/papers?${query.toString()}`);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateStatusData) => {
    const response = await api.patch(`/papers/${id}/status`, data);
    return response.data;
  },

  // Public
  getPublishedPapers: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const response = await api.get(`/papers/published?${query.toString()}`);
    return response.data;
  },
};

export default papersService;
