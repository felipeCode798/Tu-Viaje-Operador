// mapUtils.ts - Utilidades para manejo de mapas y coordenadas

import { Programming, Tourism } from '../types';

export interface MapPoint {
  name: string;
  latitude: number;
  longitude: number;
  type?: 'origin' | 'destination' | 'waypoint' | 'user';
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export class MapUtils {
  // Extraer coordenadas de un objeto Programming
  static extractCoordinatesFromProgramming(programming: Programming): MapPoint[] {
    const coordinates: MapPoint[] = [];

    // Función auxiliar para validar coordenadas
    const isValidCoordinate = (lat: any, lng: any): boolean => {
      return (
        lat !== null && 
        lat !== undefined && 
        lng !== null && 
        lng !== undefined &&
        typeof lat === 'number' && 
        typeof lng === 'number' &&
        !isNaN(lat) && 
        !isNaN(lng) &&
        lat !== 0 && 
        lng !== 0 &&
        lat >= -90 && 
        lat <= 90 &&
        lng >= -180 && 
        lng <= 180
      );
    };

    // Origen
    if (programming.tour?.origin && 
        isValidCoordinate(programming.tour.origin.latitude, programming.tour.origin.longitude)) {
      coordinates.push({
        name: programming.tour.origin.name || 'Origen',
        latitude: Number(programming.tour.origin.latitude),
        longitude: Number(programming.tour.origin.longitude),
        type: 'origin'
      });
    }

    // Puntos intermedios
    if (programming.places && programming.places.length > 0) {
      programming.places.forEach((place, index) => {
        if (isValidCoordinate(place.latitude, place.longitude)) {
          coordinates.push({
            name: place.name || `Punto ${index + 1}`,
            latitude: Number(place.latitude),
            longitude: Number(place.longitude),
            type: 'waypoint'
          });
        }
      });
    }

    // Destino
    if (programming.tour?.destination?.place && 
        isValidCoordinate(programming.tour.destination.place.latitude, programming.tour.destination.place.longitude)) {
      coordinates.push({
        name: programming.tour.destination.name || 'Destino',
        latitude: Number(programming.tour.destination.place.latitude),
        longitude: Number(programming.tour.destination.place.longitude),
        type: 'destination'
      });
    }

    // Punto final (si es diferente al destino)
    if (programming.puntoFin && 
        isValidCoordinate(programming.puntoFin.latitude, programming.puntoFin.longitude)) {
      coordinates.push({
        name: programming.puntoFin.name || 'Punto Final',
        latitude: Number(programming.puntoFin.latitude),
        longitude: Number(programming.puntoFin.longitude),
        type: 'destination'
      });
    }

    console.log('Programming coordinates extracted:', coordinates);
    return coordinates;
  }

  // Extraer coordenadas de un objeto Tourism
  static extractCoordinatesFromTourism(tourism: Tourism): MapPoint[] {
    const coordinates: MapPoint[] = [];

    // Función auxiliar para validar coordenadas
    const isValidCoordinate = (lat: any, lng: any): boolean => {
      return (
        lat !== null && 
        lat !== undefined && 
        lng !== null && 
        lng !== undefined &&
        typeof lat === 'number' && 
        typeof lng === 'number' &&
        !isNaN(lat) && 
        !isNaN(lng) &&
        lat !== 0 && 
        lng !== 0 &&
        lat >= -90 && 
        lat <= 90 &&
        lng >= -180 && 
        lng <= 180
      );
    };

    // Origen
    if (tourism.origen && 
        isValidCoordinate(tourism.origen.latitude, tourism.origen.longitude)) {
      coordinates.push({
        name: tourism.origen.name || 'Origen',
        latitude: Number(tourism.origen.latitude),
        longitude: Number(tourism.origen.longitude),
        type: 'origin'
      });
    }

    // Destino
    if (tourism.destino?.place && 
        isValidCoordinate(tourism.destino.place.latitude, tourism.destino.place.longitude)) {
      coordinates.push({
        name: tourism.destino.name || 'Destino',
        latitude: Number(tourism.destino.place.latitude),
        longitude: Number(tourism.destino.place.longitude),
        type: 'destination'
      });
    }

    console.log('Tourism coordinates extracted:', coordinates);
    return coordinates;
  }

  // Calcular región que contenga todos los puntos
  static calculateRegionForPoints(points: MapPoint[], padding: number = 0.01): MapRegion {
    if (points.length === 0) {
      // Región por defecto (Bogotá, Colombia)
      return {
        latitude: 4.7109886,
        longitude: -74.072092,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    if (points.length === 1) {
      return {
        latitude: points[0].latitude,
        longitude: points[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLng = points[0].longitude;
    let maxLng = points[0].longitude;

    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) + padding;
    const deltaLng = (maxLng - minLng) + padding;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  }

  // Calcular distancia entre dos puntos en kilómetros
  static calculateDistance(point1: MapPoint, point2: MapPoint): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
      Math.cos(this.deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Obtener color del marcador según el tipo
  static getMarkerColor(type?: string): string {
    switch (type) {
      case 'origin':
        return '#4CAF50'; // Verde para origen
      case 'destination':
        return '#F44336'; // Rojo para destino
      case 'waypoint':
        return '#FF9500'; // Naranja para puntos intermedios
      case 'user':
        return '#2196F3'; // Azul para usuario
      default:
        return '#999999'; // Gris por defecto
    }
  }

  // Generar coordenadas para la polyline de la ruta
  static generateRoutePolyline(points: MapPoint[]): { latitude: number; longitude: number }[] {
    return points.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude
    }));
  }

  // Validar si las coordenadas son válidas
  static isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  // Formatear coordenadas para mostrar
  static formatCoordinates(latitude: number, longitude: number): string {
    const latDir = latitude >= 0 ? 'N' : 'S';
    const lngDir = longitude >= 0 ? 'E' : 'W';
    
    return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lngDir}`;
  }

  // Obtener el punto más cercano a una coordenada dada
  static findNearestPoint(targetPoint: MapPoint, points: MapPoint[]): MapPoint | null {
    if (points.length === 0) return null;

    let nearestPoint = points[0];
    let minDistance = this.calculateDistance(targetPoint, nearestPoint);

    points.forEach(point => {
      const distance = this.calculateDistance(targetPoint, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    return nearestPoint;
  }

  // Ordenar puntos por distancia desde un punto de origen
  static sortPointsByDistance(origin: MapPoint, points: MapPoint[]): MapPoint[] {
    return points
      .map(point => ({
        ...point,
        distance: this.calculateDistance(origin, point)
      }))
      .sort((a, b) => a.distance - b.distance)
      .map(({ distance, ...point }) => point);
  }

  // Calcular tiempo estimado de viaje (aproximado)
  static estimateTravelTime(points: MapPoint[], averageSpeed: number = 40): number {
    if (points.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += this.calculateDistance(points[i - 1], points[i]);
    }

    // Retorna tiempo en minutos
    return Math.round((totalDistance / averageSpeed) * 60);
  }

  // Crear región centrada en un punto específico
  static createRegionFromPoint(
    point: MapPoint, 
    latitudeDelta: number = 0.01, 
    longitudeDelta: number = 0.01
  ): MapRegion {
    return {
      latitude: point.latitude,
      longitude: point.longitude,
      latitudeDelta,
      longitudeDelta,
    };
  }

  // Verificar si un punto está dentro de una región
  static isPointInRegion(point: MapPoint, region: MapRegion): boolean {
    const latMin = region.latitude - region.latitudeDelta / 2;
    const latMax = region.latitude + region.latitudeDelta / 2;
    const lngMin = region.longitude - region.longitudeDelta / 2;
    const lngMax = region.longitude + region.longitudeDelta / 2;

    return (
      point.latitude >= latMin &&
      point.latitude <= latMax &&
      point.longitude >= lngMin &&
      point.longitude <= lngMax
    );
  }

  // Obtener información de la ruta
  static getRouteInfo(points: MapPoint[]): {
    totalDistance: number;
    estimatedTime: number;
    pointCount: number;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  } {
    if (points.length === 0) {
      return {
        totalDistance: 0,
        estimatedTime: 0,
        pointCount: 0,
        bounds: { north: 0, south: 0, east: 0, west: 0 }
      };
    }

    let totalDistance = 0;
    let north = points[0].latitude;
    let south = points[0].latitude;
    let east = points[0].longitude;
    let west = points[0].longitude;

    // Calcular distancia total y límites
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      
      // Actualizar límites
      north = Math.max(north, point.latitude);
      south = Math.min(south, point.latitude);
      east = Math.max(east, point.longitude);
      west = Math.min(west, point.longitude);

      // Calcular distancia al siguiente punto
      if (i < points.length - 1) {
        totalDistance += this.calculateDistance(point, points[i + 1]);
      }
    }

    return {
      totalDistance: Math.round(totalDistance * 100) / 100,
      estimatedTime: this.estimateTravelTime(points),
      pointCount: points.length,
      bounds: { north, south, east, west }
    };
  }
}