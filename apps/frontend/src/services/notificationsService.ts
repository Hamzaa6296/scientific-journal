import api from "./api";

const notificationsService = {
  getMyNotifications: async (page = 1, limit = 20) => {
    const response = await api.get(
      `/notifications?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  deleteAll: async () => {
    const response = await api.delete("/notifications/all");
    return response.data;
  },
};

export default notificationsService;
