import { Platform, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import FormData from 'form-data';
import { server } from '../constants/Urls';

interface Asset {
  uri?: string;
  width?: number;
  height?: number;
  base64?: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}

interface ImageOption {
  name: string;
  file: string;
  fileF: any;
  base64: string;
}

interface ImagePickerResponse {
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
  assets?: Asset[];
  customButton?: string;
}

interface PickImagesResult {
  uri: string[] | null;
  base64: string | null;
  file: any;
}

interface UploadFileData {
  file: string;
  fileF: any;
}

interface UploadImagesParams {
  file: ImageOption;
  id: string | number;
  type: string;
  nombrepaq: string;
  typeGalery: string;
}

const pickImagesExpo = async (limit: number): Promise<PickImagesResult> => {
  try {
    const { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } = await import('expo-image-picker');
    
    const { status } = await requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Se necesitan permisos para acceder a la galería');
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: limit > 1,
      selectionLimit: limit,
    });

    if (result.canceled) {
      throw new Error('Usuario canceló la selección');
    }

    if (!result.assets || result.assets.length === 0) {
      throw new Error('No se seleccionó ninguna imagen');
    }

    const firstAsset = result.assets[0];
    
    return {
      uri: [firstAsset.uri],
      base64: firstAsset.base64 || null,
      file: {
        assets: [{
          uri: firstAsset.uri,
          width: firstAsset.width,
          height: firstAsset.height,
          base64: firstAsset.base64,
        }]
      }
    };
  } catch (error) {
    console.error("Error con Expo Image Picker:", error);
    throw error;
  }
};

const pickImagesRN = async (limit: number): Promise<PickImagesResult> => {
  try {
    const imagePicker = await import('react-native-image-picker');
    
    if (!imagePicker.launchImageLibrary) {
      throw new Error('launchImageLibrary no disponible');
    }

    const options = {
      mediaType: 'photo' as const,
      selectionLimit: limit,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: true,
    };

    const result: ImagePickerResponse = await imagePicker.launchImageLibrary(options);
    
    if (result.didCancel) {
      throw new Error('Usuario canceló la selección');
    }

    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Error al seleccionar imagen');
    }

    if (!result.assets || result.assets.length === 0) {
      throw new Error('No se seleccionó ninguna imagen');
    }

    const firstAsset = result.assets[0];
    
    return {
      uri: firstAsset.uri ? [firstAsset.uri] : null,
      base64: firstAsset.base64 || null,
      file: result
    };
    
  } catch (error) {
    console.error("Error con RN Image Picker:", error);
    throw error;
  }
};

// Función principal para seleccionar imágenes
const pickImages = async (limit: number | string, aspect?: [number, number]): Promise<PickImagesResult> => {
  try {  
    const actualLimit = typeof limit === 'string' ? parseInt(limit) : limit || 1;

    return await pickImagesExpo(actualLimit);
    
  } catch (error) {
    console.error("Error en pickImages:", error);
    
    let errorMessage = "No se pudo seleccionar la imagen";
    
    if (error instanceof Error) {
      if (error.message.includes('cancel')) {
        errorMessage = "Selección de imagen cancelada";
      } else if (error.message.includes('permisos')) {
        errorMessage = "Se necesitan permisos para acceder a la galería";
      } else if (error.message.includes('No se seleccionó')) {
        errorMessage = "No se seleccionó ninguna imagen";
      }
    }
    
    throw new Error(errorMessage);
  }
};

const imageCompress = async (image: Asset): Promise<any> => {
  const maxWidth = 1024;
  const maxHeight = 1024;

  try {
    const { width, height, uri } = image;

    if (!uri || !width || !height) {
      throw new Error('Invalid image data');
    }

    let newWidth = width;
    let newHeight = height;

    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        newWidth = maxWidth;
        newHeight = Math.floor((newWidth / width) * height);
      } else {
        newHeight = maxHeight;
        newWidth = Math.floor((newHeight / height) * width);
      }
    }

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return {
      uri: manipulatedImage.uri,
      width: newWidth,
      height: newHeight,
      base64: manipulatedImage.base64 || undefined
    };
  } catch (error) {
    console.log('Error al comprimir imagen:', error);
    return image;
  }
};

const uploadImages = (
  file: ImageOption,
  id: string,
  type: string,
  nombrepaq: string,
  typeGalery: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {

      if (!file) {
        throw new Error('Objeto file es undefined o null');
      }

      let imageUri: string;
      
      if (typeof file === 'string') {
        imageUri = file;
      } else if (file.file && typeof file.file === 'string') {
        imageUri = file.file;
      } else {
        console.error("Estructura inválida. File recibido:", file);
        throw new Error('No se pudo obtener la URI de la imagen');
      }

      // Validar que la URI es válida
      if (!imageUri || typeof imageUri !== 'string') {
        console.error("URI no válida:", imageUri);
        throw new Error('URI de imagen no válida');
      }

      const form = new FormData();

      let fileExtension = 'jpeg';
      try {
        const cleanUri = imageUri.split('?')[0];
        const parts = cleanUri.split('.');
        if (parts.length > 1) {
          fileExtension = parts.pop()?.toLowerCase() || 'jpeg';
        }
      } catch (error) {
        console.warn("No se pudo detectar extensión, usando jpeg por defecto");
      }

      const timestamp = Date.now();
      const nombreArchivo = `${nombrepaq.trim().replace(/\s+/g, '_')}--${typeGalery}--${id}${timestamp}.${fileExtension}`;
      
      const fileToUpload = {
        uri: imageUri,
        name: nombreArchivo,
        type: `image/${fileExtension}`,
      };

      form.append('file', fileToUpload as any);
      form.append('nombreImagen', `${nombrepaq}${id}`);
      form.append('id', id.toString());

      const uploadUrl = `${server}upload/${type}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: form as any,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Respuesta del servidor:", response.status, errorText);
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      
      const uploadedUrl = responseData.url || responseData.filename || nombreArchivo;
      
      resolve(uploadedUrl);
      
    } catch (error) {
      console.error('Error en uploadImages:', error);
      reject(error);
    }
  });
};


const checkImagePickerAvailability = async () => {
  try {
    try {
      await import('expo-image-picker');
      return {
        launchImageLibrary: true,
        platform: Platform.OS,
        type: 'expo'
      };
    } catch (expoError) {
      console.log("Expo Image Picker no disponible");
    }

    try {
      const rnImagePicker = await import('react-native-image-picker');
      const isAvailable = !!rnImagePicker.launchImageLibrary;
      return {
        launchImageLibrary: isAvailable,
        platform: Platform.OS,
        type: 'react-native'
      };
    } catch (rnError) {

    }

    return {
      launchImageLibrary: false,
      platform: Platform.OS,
      type: 'none'
    };
  } catch (error) {
    console.error("Error verificando disponibilidad:", error);
    return {
      launchImageLibrary: false,
      platform: Platform.OS,
      type: 'error'
    };
  }
};

export const helpers = {
  pickImages,
  uploadImages,
  checkImagePickerAvailability,
};