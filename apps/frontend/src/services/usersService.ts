import api from "./api";

const usersService = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    affiliation?: string;
    bio?: string;
    expertise?: string[];
  }) => {
    const response = await api.patch("/users/profile", data);
    return response.data;
  },

  getReviewers: async () => {
    const response = await api.get("/users/reviewers");
    return response.data;
  },

  getAllUsers: async (role?: string) => {
    const url = role ? `/users?role=${role}` : "/users";
    const response = await api.get(url);
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateRole: async (id: string, role: string) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default usersService;
