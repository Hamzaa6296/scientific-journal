// PURPOSE: Handles file upload to the backend.
// Uses FormData (not JSON) because we are sending a binary file.

import api from "./api";

export interface UploadResult {
  message: string;
  fileUrl: string;
  filename: string;
  originalName: string;
  size: number;
}

const uploadService = {
  uploadPdf: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<UploadResult>("/upload/pdf", formData, {
      headers: {
        // Let the browser set Content-Type automatically with the correct boundary
        // Never manually set multipart/form-data — the boundary will be missing
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });

    return response.data;
  },
};

export default uploadService;
