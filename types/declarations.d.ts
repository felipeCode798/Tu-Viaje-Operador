declare module '@tighten/react-native-time-input' {
  import { Component } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  interface TimeInputProps {
    setCurrentTime?: boolean;
    onTimeChange?: (time: string) => void;
    theme?: {
      inputBackgroundColor?: string;
      inputTextColor?: string;
    };
    styles?: {
      componentContainer?: ViewStyle;
    };
  }

  export default class TimeInput extends Component<TimeInputProps> {}
}

declare module '@codler/react-native-keyboard-aware-scroll-view' {
  import { Component } from 'react';
  import { ScrollViewProps } from 'react-native';

  export class KeyboardAwareScrollView extends Component<ScrollViewProps> {
    scrollToFocusedInput: (event: any) => void;
  }
}

declare module 'expo-image-manipulator' {
  export enum SaveFormat {
    JPEG = 'jpeg',
    PNG = 'png',
  }

  export interface ImageResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }

  export interface ResizeOptions {
    width: number;
    height: number;
  }

  export interface ManipulateOptions {
    compress?: number;
    format?: SaveFormat;
  }

  export function manipulateAsync(
    uri: string,
    actions: Array<{ resize: ResizeOptions }>,
    options: ManipulateOptions
  ): Promise<ImageResult>;
}
declare module 'react-native-image-picker' {
  export interface Asset {
    uri?: string;
    width?: number;
    height?: number;
    base64?: string;
    fileName?: string;
    type?: string;
    fileSize?: number;
  }

  export interface ImagePickerResponse {
    didCancel?: boolean;
    errorCode?: string;
    errorMessage?: string;
    assets?: Asset[];
  }

  export interface ImageLibraryOptions {
    mediaType?: 'photo' | 'video' | 'mixed';
    selectionLimit?: number;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowsMultipleSelection?: boolean;
    includeBase64?: boolean;
    aspect?: [number, number];
  }

  export function launchImageLibrary(options: ImageLibraryOptions): Promise<ImagePickerResponse>;
  export function launchCamera(options: ImageLibraryOptions): Promise<ImagePickerResponse>;
}

declare module 'react-native-fs' {
  const RNFS: {
    readFile(filePath: string, encoding: 'base64' | 'utf8' | 'ascii'): Promise<string>;
    writeFile(filePath: string, contents: string, encoding?: 'base64' | 'utf8' | 'ascii'): Promise<void>;
    unlink(filePath: string): Promise<void>;
    exists(filePath: string): Promise<boolean>;
    mkdir(filePath: string): Promise<void>;
    DocumentDirectoryPath: string;
    TemporaryDirectoryPath: string;
  };
  export default RNFS;
}

declare module 'form-data' {
  class FormData {
    append(name: string, value: any, filename?: string): void;
    getHeaders(): { [key: string]: string };
  }
  export = FormData;
}

declare module 'expo-image-manipulator' {
  export enum SaveFormat {
    JPEG = 'jpeg',
    PNG = 'png',
  }

  export interface ImageResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }

  export interface ResizeOptions {
    width: number;
    height: number;
  }

  export interface ManipulateOptions {
    compress?: number;
    format?: SaveFormat;
  }

  export function manipulateAsync(
    uri: string,
    actions: Array<{ resize: ResizeOptions }>,
    options: ManipulateOptions
  ): Promise<ImageResult>;
}