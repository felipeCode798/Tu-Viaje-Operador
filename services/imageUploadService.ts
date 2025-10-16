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
      console.log(`📤 Subiendo imagen: ${fileName} a ${folder}`);
      
      // Crear FormData
      const formData = new FormData();
      
      // Obtener el tipo MIME de la imagen
      const fileType = uri.substring(uri.lastIndexOf('.') + 1);
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
      
      // Agregar la imagen al FormData
      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: fileName,
      } as any);
      
      formData.append('folder', folder);
      
      console.log('📦 FormData creado:', {
        uri,
        fileType,
        mimeType,
        fileName,
        folder
      });

      // Hacer la petición POST para subir la imagen
      const response = await fetch(`${server}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📨 Respuesta del servidor:', response.status);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Imagen subida exitosamente:', result);

      if (result.success && result.url) {
        return {
          success: true,
          url: result.url
        };
      } else {
        throw new Error(result.error || 'Error desconocido al subir imagen');
      }
    } catch (error: any) {
      console.error('❌ Error subiendo imagen:', error);
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
          console.warn(`⚠️ No se pudo subir la imagen ${i}:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Error subiendo imagen ${i}:`, error);
      }
    }
    
    return uploadedUrls;
  }
}

export default ImageUploadService;