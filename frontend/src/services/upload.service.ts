import api from './api';

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadImages(files: File[]): Promise<{ url: string; filename: string }[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    const { data } = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
