// components/ModalMaps.tsx - Versión simplificada
import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

interface Point {
  name?: string;
  latitude: number;
  longitude: number;
}

interface ModalMapsProps {
  showModal: boolean;
  closeModal: () => void;
  coords: Point[];
}

const ModalMaps: React.FC<ModalMapsProps> = ({ showModal, closeModal, coords }) => {
  return (
    <Modal animationType="fade" visible={showModal} onRequestClose={closeModal}>
      <View style={styles.container}>
        <View style={styles.mapArea}>
          <TouchableOpacity style={styles.backButton} onPress={closeModal}>
            <MaterialIcons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <View style={styles.mapSimulation}>
            <MaterialIcons name="map" size={100} color="#4CAF50" />
            <Text style={styles.mapText}>Vista del Mapa de Ruta</Text>
            
            <View style={styles.markersContainer}>
              {coords.map((point, index) => (
                <View key={index} style={styles.markerInfo}>
                  <MaterialIcons name="location-on" size={20} color="#FF9500" />
                  <Text style={styles.markerText}>
                    {point.name || `Punto ${index + 1}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  mapArea: { flex: 1, position: 'relative' },
  backButton: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 10, borderRadius: 25,
  },
  mapSimulation: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e8',
  },
  mapText: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginTop: 10 },
  markersContainer: { marginTop: 20, alignItems: 'center' },
  markerInfo: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)', padding: 8, borderRadius: 15, marginVertical: 5,
  },
  markerText: { fontSize: 14, color: '#333', marginLeft: 5, fontWeight: '500' },
});

export default ModalMaps;