import api from "./api";

const reviewsService = {
  assignReviewers: async (paperId: string, reviewerIds: string[]) => {
    const response = await api.post(`/reviews/${paperId}/assign`, {
      reviewerIds,
    });
    return response.data;
  },

  getPaperReviews: async (paperId: string) => {
    const response = await api.get(`/reviews/${paperId}/all`);
    return response.data;
  },

  removeReviewer: async (paperId: string, reviewerId: string) => {
    const response = await api.delete(
      `/reviews/${paperId}/reviewer/${reviewerId}`,
    );
    return response.data;
  },

  getMyReviews: async () => {
    const response = await api.get("/reviews/my-reviews");
    return response.data;
  },

  getPaperForReview: async (paperId: string) => {
    const response = await api.get(`/reviews/my-reviews/${paperId}`);
    return response.data;
  },

  respondToInvitation: async (
    paperId: string,
    accepted: boolean,
    declineReason?: string,
  ) => {
    const response = await api.patch(`/reviews/${paperId}/respond`, {
      accepted,
      declineReason,
    });
    return response.data;
  },

  submitReview: async (
    paperId: string,
    data: {
      decision: string;
      comments: string;
      privateNotes?: string;
      score: number;
    },
  ) => {
    const response = await api.patch(`/reviews/${paperId}/submit`, data);
    return response.data;
  },
};

export default reviewsService;
