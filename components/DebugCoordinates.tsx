// DebugCoordinates.tsx - Componente para depurar coordenadas
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Point {
  name?: string;
  latitude: number;
  longitude: number;
  type?: string;
}

interface DebugCoordinatesProps {
  coords: Point[];
  title: string;
}

const DebugCoordinates: React.FC<DebugCoordinatesProps> = ({ coords, title }) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Total de puntos: {coords.length}</Text>
      
      <ScrollView style={styles.scrollView}>
        {coords.map((point, index) => {
          const isValid = isValidCoordinate(point.latitude, point.longitude);
          
          return (
            <View key={index} style={[styles.pointContainer, !isValid && styles.invalidPoint]}>
              <Text style={styles.pointIndex}>Punto {index + 1}</Text>
              <Text style={styles.pointName}>Nombre: {point.name || 'Sin nombre'}</Text>
              <Text style={styles.pointType}>Tipo: {point.type || 'Sin tipo'}</Text>
              <Text style={[styles.coordinate, !isValid && styles.invalidText]}>
                Lat: {point.latitude} ({typeof point.latitude})
              </Text>
              <Text style={[styles.coordinate, !isValid && styles.invalidText]}>
                Lng: {point.longitude} ({typeof point.longitude})
              </Text>
              <Text style={[styles.status, isValid ? styles.valid : styles.invalid]}>
                {isValid ? '✓ Válido' : '✗ Inválido'}
              </Text>
              
              {!isValid && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorText}>Errores:</Text>
                  {point.latitude === null && <Text style={styles.errorItem}>- Latitud es null</Text>}
                  {point.latitude === undefined && <Text style={styles.errorItem}>- Latitud es undefined</Text>}
                  {typeof point.latitude !== 'number' && <Text style={styles.errorItem}>- Latitud no es número</Text>}
                  {isNaN(point.latitude) && <Text style={styles.errorItem}>- Latitud es NaN</Text>}
                  {point.latitude === 0 && <Text style={styles.errorItem}>- Latitud es 0</Text>}
                  {point.longitude === null && <Text style={styles.errorItem}>- Longitud es null</Text>}
                  {point.longitude === undefined && <Text style={styles.errorItem}>- Longitud es undefined</Text>}
                  {typeof point.longitude !== 'number' && <Text style={styles.errorItem}>- Longitud no es número</Text>}
                  {isNaN(point.longitude) && <Text style={styles.errorItem}>- Longitud es NaN</Text>}
                  {point.longitude === 0 && <Text style={styles.errorItem}>- Longitud es 0</Text>}
                </View>
              )}
            </View>
          );
        })}
        
        {coords.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay coordenadas para mostrar</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 15,
  },
  scrollView: {
    flex: 1,
  },
  pointContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  invalidPoint: {
    borderLeftColor: '#F44336',
    backgroundColor: '#4a2a2a',
  },
  pointIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 4,
  },
  pointName: {
    fontSize: 14,
    color: 'white',
    marginBottom: 2,
  },
  pointType: {
    fontSize: 12,
    color: '#CCC',
    marginBottom: 4,
  },
  coordinate: {
    fontSize: 12,
    color: '#CCC',
    marginBottom: 1,
  },
  invalidText: {
    color: '#FF8A80',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  valid: {
    color: '#4CAF50',
  },
  invalid: {
    color: '#F44336',
  },
  errorDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  errorText: {
    fontSize: 12,
    color: '#FF8A80',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorItem: {
    fontSize: 11,
    color: '#FF8A80',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default DebugCoordinates;