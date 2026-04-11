import { UPLOAD_MAX_BYTES, UPLOAD_MAX_MB } from '../constants/upload';
import api from './api';

/** Lanza Error con mensaje en español si el archivo supera el límite del servidor. */
export function assertFileSizeWithinUploadLimit(file: File): void {
  if (file.size > UPLOAD_MAX_BYTES) {
    throw new Error(
      `«${file.name}» supera el máximo de ${UPLOAD_MAX_MB} MB. Comprimí la imagen e intentá de nuevo.`,
    );
  }
}

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    assertFileSizeWithinUploadLimit(file);
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadImages(files: File[]): Promise<{ url: string; filename: string }[]> {
    files.forEach(assertFileSizeWithinUploadLimit);
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    const { data } = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
