// types/react-native-google-places-autocomplete.d.ts
declare module 'react-native-google-places-autocomplete' {
  import { Component } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  interface GooglePlacesAutocompleteProps {
    placeholder?: string;
    textInputProps?: any;
    styles?: {
      textInput?: TextStyle;
      description?: TextStyle;
      [key: string]: ViewStyle | TextStyle | undefined;
    };
    fetchDetails?: boolean;
    onPress?: (data: any, details?: any) => void;
    query?: {
      key: string;
      language?: string;
      components?: string;
    };
  }

  export class GooglePlacesAutocomplete extends Component<GooglePlacesAutocompleteProps> {}
}