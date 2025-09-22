// Luego tu código principal:
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
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

interface ImagePickerResponse {
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
  assets?: Asset[];
}

interface ImageLibraryOptions {
  mediaType?: 'photo' | 'video' | 'mixed';
  selectionLimit?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowsMultipleSelection?: boolean;
  includeBase64?: boolean;
  aspect?: [number, number];
}

interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
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
  file: UploadFileData;
  id: string | number;
  type: string;
  nombrepaq: string;
  typeGalery: string;
}

// Función para seleccionar imágenes
const pickImages = async (limit: number | string, aspect?: [number, number]): Promise<PickImagesResult> => {
  const options: ImageLibraryOptions = {
    mediaType: 'photo',
    selectionLimit: typeof limit === 'string' ? parseInt(limit) : limit || 2,
    quality: 1,
    maxWidth: 1024,
    maxHeight: 1024,
    allowsMultipleSelection: true,
    includeBase64: false,
    aspect,
  };

  const result: ImagePickerResponse = await launchImageLibrary(options);

  if (!result.didCancel && result.assets && result.assets.length > 0) {
    const firstAsset = result.assets[0];
    if (firstAsset.height && firstAsset.width && 
        (firstAsset.height > 1024 || firstAsset.width > 1024)) {
      const compressedImage = await imageCompress(firstAsset);
      result.assets[0] = { ...firstAsset, ...compressedImage };
    }

    const base64Images = result.assets[0].base64 || null;
    const resp = result.assets[0].uri ? [result.assets[0].uri] : [];

    return { uri: resp, base64: base64Images, file: result };
  } else {
    return { uri: null, base64: null, file: null };
  }
};

// Función para comprimir imágenes
const imageCompress = async (image: Asset): Promise<CompressedImageResult> => {
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
    } else {
      if (width > height) {
        newHeight = Math.floor((maxWidth / width) * height);
        newWidth = maxWidth;
      } else {
        newWidth = Math.floor((maxHeight / height) * width);
        newHeight = maxHeight;
      }
    }

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log('Ruta de la nueva imagen redimensionada:', manipulatedImage.uri);
    
    return {
      uri: manipulatedImage.uri,
      width: newWidth,
      height: newHeight,
      base64: manipulatedImage.base64 || undefined
    };
  } catch (error) {
    console.log('Error al redimensionar la imagen:', error);
    return {
      uri: image.uri!,
      width: image.width!,
      height: image.height!,
      base64: image.base64
    };
  }
};

// Función para subir imágenes
const uploadImages = ({ file, id, type, nombrepaq, typeGalery }: UploadImagesParams): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const form = new FormData();

      const fileExtension = file.file.split('?')[0].split('.').pop();
      const nombreArchivo = `${nombrepaq.trim()}--${typeGalery.substring(0, 1)}--${id}${Date.now()}.${fileExtension}`;

      // Preparar el objeto file para upload
      const fileToUpload = {
        ...file.fileF,
        name: nombreArchivo,
        type: `image/${fileExtension}`,
        cancelled: false,
        height: file.fileF.assets?.[0]?.height || 0,
        width: file.fileF.assets?.[0]?.width || 0,
        uri: file.fileF.assets?.[0]?.uri || '',
      };

      // Eliminar assets si existe
      if (fileToUpload.assets) {
        delete fileToUpload.assets;
      }

      form.append('file', fileToUpload as any, nombreArchivo);
      form.append('nombreImagen', `${nombrepaq}${id}`);
      form.append('id', id.toString());

      const response = await fetch(`${server}upload/${type}`, {
        method: 'POST',
        body: form as any,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      resolve(data.url);
    } catch (error) {
      console.error('Error uploading images:', error);
      reject(error);
    }
  });
};

export const helpers = {
  pickImages,
  uploadImages,
};