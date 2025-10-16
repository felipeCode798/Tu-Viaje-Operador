import { Platform, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import FormData from 'form-data';
import { server } from '../constants/Urls';

// Interfaces para tipar los datos
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
  file: string;      // URI de la imagen
  fileF: any;        // Objeto con metadata
  base64: string;    // Base64 (opcional)
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

// Función para seleccionar imágenes usando Expo Image Picker
const pickImagesExpo = async (limit: number): Promise<PickImagesResult> => {
  try {
    const { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } = await import('expo-image-picker');
    
    // Solicitar permisos
    console.log("🔐 Solicitando permisos de galería...");
    const { status } = await requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Se necesitan permisos para acceder a la galería');
    }

    console.log("✅ Permisos de galería concedidos");

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: limit > 1,
      selectionLimit: limit,
    });

    console.log("📷 Resultado de Expo Image Picker:", {
      canceled: result.canceled,
      assetsCount: result.assets?.length
    });

    if (result.canceled) {
      throw new Error('Usuario canceló la selección');
    }

    if (!result.assets || result.assets.length === 0) {
      throw new Error('No se seleccionó ninguna imagen');
    }

    const firstAsset = result.assets[0];
    
    console.log("✅ Imagen seleccionada con Expo:", {
      uri: firstAsset.uri,
      width: firstAsset.width,
      height: firstAsset.height,
      hasBase64: !!firstAsset.base64
    });
    
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
    console.error("❌ Error con Expo Image Picker:", error);
    throw error;
  }
};

// Función para seleccionar imágenes usando React Native Image Picker
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

    console.log("🔧 Opciones de imagen RN:", options);

    // ✅ CORREGIDO: Usar la API con Promise en lugar de callback
    const result: ImagePickerResponse = await imagePicker.launchImageLibrary(options);
    
    console.log("📷 Resultado de RN Image Picker:", {
      didCancel: result.didCancel,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      assetsCount: result.assets?.length
    });

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
    console.error("❌ Error con RN Image Picker:", error);
    throw error;
  }
};

// Función principal para seleccionar imágenes
const pickImages = async (limit: number | string, aspect?: [number, number]): Promise<PickImagesResult> => {
  try {
    console.log("📸 Iniciando pickImages...");
    
    const actualLimit = typeof limit === 'string' ? parseInt(limit) : limit || 1;

    // Primero intentar con Expo Image Picker (más confiable)
    try {
      console.log("🔄 Intentando con Expo Image Picker...");
      return await pickImagesExpo(actualLimit);
    } catch (expoError) {
      console.log("🔄 Expo falló, intentando con React Native Image Picker...", expoError);
      // Si Expo falla, intentar con React Native Image Picker
      return await pickImagesRN(actualLimit);
    }
    
  } catch (error) {
    console.error("❌ Error en pickImages:", error);
    throw error;
  }
};

// Función para comprimir imágenes
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

    console.log('✅ Imagen comprimida:', manipulatedImage.uri);
    
    return {
      uri: manipulatedImage.uri,
      width: newWidth,
      height: newHeight,
      base64: manipulatedImage.base64 || undefined
    };
  } catch (error) {
    console.log('❌ Error al comprimir imagen:', error);
    return image;
  }
};

// Función para subir imágenes
const uploadImages = (
  file: ImageOption,  // Siempre recibe ImageOption
  id: string,
  type: string,
  nombrepaq: string,
  typeGalery: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("🔍 DEBUG uploadImages - Parámetros recibidos:");
      console.log("  - file:", JSON.stringify(file, null, 2));
      console.log("  - id:", id);
      console.log("  - type:", type);
      console.log("  - nombrepaq:", nombrepaq);
      console.log("  - typeGalery:", typeGalery);
      
      // ✅ Validación mejorada
      if (!file) {
        throw new Error('Objeto file es undefined o null');
      }

      // ✅ Obtener la URI correctamente
      let imageUri: string;
      
      if (typeof file === 'string') {
        // Si por alguna razón recibe un string directo
        imageUri = file;
        console.log("📍 URI recibida como string:", imageUri);
      } else if (file.file && typeof file.file === 'string') {
        // Si es un objeto ImageOption con propiedad file
        imageUri = file.file;
        console.log("📍 URI desde file.file:", imageUri);
      } else {
        console.error("❌ Estructura inválida. File recibido:", file);
        throw new Error('No se pudo obtener la URI de la imagen');
      }

      // Validar que la URI es válida
      if (!imageUri || typeof imageUri !== 'string') {
        console.error("❌ URI no válida:", imageUri);
        throw new Error('URI de imagen no válida');
      }

      console.log("✅ URI validada:", imageUri);

      const form = new FormData();

      // Extraer extensión de archivo
      let fileExtension = 'jpeg';
      try {
        const cleanUri = imageUri.split('?')[0];
        const parts = cleanUri.split('.');
        if (parts.length > 1) {
          fileExtension = parts.pop()?.toLowerCase() || 'jpeg';
        }
        console.log("🔧 Extensión detectada:", fileExtension);
      } catch (error) {
        console.warn("⚠️ No se pudo detectar extensión, usando jpeg por defecto");
      }

      const timestamp = Date.now();
      const nombreArchivo = `${nombrepaq.trim().replace(/\s+/g, '_')}--${typeGalery}--${id}${timestamp}.${fileExtension}`;
      
      // Preparar objeto para upload
      const fileToUpload = {
        uri: imageUri,
        name: nombreArchivo,
        type: `image/${fileExtension}`,
      };

      console.log("📦 Preparando upload con:", fileToUpload);

      form.append('file', fileToUpload as any);
      form.append('nombreImagen', `${nombrepaq}${id}`);
      form.append('id', id.toString());

      const uploadUrl = `${server}upload/${type}`;
      console.log("🚀 Enviando a:", uploadUrl);

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
      console.log("✅ Upload exitoso, respuesta:", responseData);
      
      const uploadedUrl = responseData.url || responseData.filename || nombreArchivo;
      console.log("✅ URL final:", uploadedUrl);
      
      resolve(uploadedUrl);
      
    } catch (error) {
      console.error('❌ Error en uploadImages:', error);
      reject(error);
    }
  });
};


// ✅ Función para verificar disponibilidad
const checkImagePickerAvailability = async () => {
  try {
    // Verificar si expo-image-picker está disponible
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

    // Verificar si react-native-image-picker está disponible
    try {
      const rnImagePicker = await import('react-native-image-picker');
      const isAvailable = !!rnImagePicker.launchImageLibrary;
      return {
        launchImageLibrary: isAvailable,
        platform: Platform.OS,
        type: 'react-native'
      };
    } catch (rnError) {
      console.log("React Native Image Picker no disponible");
    }

    return {
      launchImageLibrary: false,
      platform: Platform.OS,
      type: 'none'
    };
  } catch (error) {
    console.error("❌ Error verificando disponibilidad:", error);
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