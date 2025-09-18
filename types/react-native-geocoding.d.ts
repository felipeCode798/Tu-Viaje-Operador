declare module 'react-native-geocoding' {
  export function init(apiKey: string): void;
  
  export function from(latitude: number, longitude: number): Promise<{
    results: Array<{
      formatted_address: string;
      geometry: {
        location: {
          lat: number;
          lng: number;
        };
      };
    }>;
  }>;
  
  export function setLanguage(language: string): void;
  export function setRegion(region: string): void;
}