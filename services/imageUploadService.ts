// services/imageUploadService.ts
import { imageUrl, server } from '../constants/Urls';

export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

class ImageUploadService {
  static async uploadImage(uri: string, folder: string, fileName: string): Promise<UploadResponse> {
    try {

      const formData = new FormData();
      
      const fileType = uri.substring(uri.lastIndexOf('.') + 1);
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
      
      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: fileName,
      } as any);
      
      formData.append('folder', folder);

      const response = await fetch(`${server}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.url) {
        return {
          success: true,
          url: result.url
        };
      } else {
        throw new Error(result.error || 'Error desconocido al subir imagen');
      }
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      return {
        success: false,
        error: error.message || 'Error al subir imagen'
      };
    }
  }

  static async uploadMultipleImages(images: string[], folder: string, baseName: string): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      try {
        const fileName = `${baseName}_${Date.now()}_${i}`;
        const result = await this.uploadImage(images[i], folder, fileName);
        
        if (result.success && result.url) {
          uploadedUrls.push(result.url);
        } else {
          console.warn(`No se pudo subir la imagen ${i}:`, result.error);
        }
      } catch (error) {
        console.error(`Error subiendo imagen ${i}:`, error);
      }
    }
    
    return uploadedUrls;
  }
}

export default ImageUploadService;