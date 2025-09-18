declare module 'react-native-maps-directions' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';
  import { LatLng } from 'react-native-maps';

  interface MapViewDirectionsProps {
    origin: LatLng | { latitude: number; longitude: number };
    destination: LatLng | { latitude: number; longitude: number };
    apikey: string;
    strokeWidth?: number;
    strokeColor?: string;
    precision?: 'high' | 'low';
    mode?: 'DRIVING' | 'BICYCLING' | 'WALKING' | 'TRANSIT';
    language?: string;
    waypoints?: LatLng[];
    splitWaypoints?: boolean;
    timePrecision?: 'now' | 'none';
    region?: string;
    onStart?: (params: any) => void;
    onReady?: (result: any) => void;
    onError?: (errorMessage: string) => void;
  }

  export default class MapViewDirections extends Component<MapViewDirectionsProps> {}
}