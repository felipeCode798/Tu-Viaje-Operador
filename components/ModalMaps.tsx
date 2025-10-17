import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import WayRouteServices from '../services/wayRouteServices';
import { Programming, Tourism } from '../types';
import { GooglePlacesComponent } from './GooglePlacesComponent';

const { height, width } = Dimensions.get('window');

interface Point {
  name?: string;
  latitude: number;
  longitude: number;
}

interface ServiceByPlace {
  id: string;
  status: string;
  pickup: boolean;
  passenger: {
    id: string;
    names: string;
    lastName: string;
    profile: string;
    phone: string;
  };
}

interface ModalMapsProps {
  showModal: boolean;
  closeModal: () => void;
  coords: Point[];
  programmingId?: string;
  itemData?: Programming | Tourism;
  onGoToChat?: () => void;
  onViewDetails?: () => void;
  onStatusChange?: (id: string, newStatus: string, type: 'programming' | 'tourism') => void;
  userType?: 'Conductor' | 'Empresa' | null;
}

const ModalMaps: React.FC<ModalMapsProps> = ({ 
  showModal, 
  closeModal, 
  coords, 
  programmingId, 
  itemData,
  onGoToChat,
  onViewDetails,
  onStatusChange,
  userType = 'Conductor'
}) => {
  const [region, setRegion] = useState({
    latitude: 4.7109886,
    longitude: -74.072092,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [userLocation, setUserLocation] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [passengers, setPassengers] = useState<ServiceByPlace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [routeStarted, setRouteStarted] = useState<boolean>(false);
  const [showPlacesModal, setShowPlacesModal] = useState<boolean>(false);
  const [routePoints, setRoutePoints] = useState<Point[]>(coords || []);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (showModal) {
      console.log('Modal opened, coords received:', coords);
      getCurrentLocation();
      setRoutePoints(coords || []);
      if (coords && coords.length > 0) {
        calculateRegion();
      }
    }
  }, [showModal, coords]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesitan permisos de ubicación para mostrar tu posición');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userPos = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        name: 'Tu ubicación'
      };
      
      setUserLocation(userPos);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateRegion = () => {
    const validCoords = routePoints.filter(point => 
      point && 
      typeof point.latitude === 'number' && 
      typeof point.longitude === 'number' &&
      !isNaN(point.latitude) && 
      !isNaN(point.longitude) &&
      point.latitude !== 0 && 
      point.longitude !== 0
    );

    if (!validCoords || validCoords.length === 0) {
      console.log('No valid coordinates found, using default region');
      return;
    }

    if (validCoords.length === 1) {
      setRegion({
        latitude: validCoords[0].latitude,
        longitude: validCoords[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      return;
    }

    let minLat = validCoords[0].latitude;
    let maxLat = validCoords[0].latitude;
    let minLng = validCoords[0].longitude;
    let maxLng = validCoords[0].longitude;

    validCoords.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = Math.max((maxLat - minLat) * 1.5, 0.01);
    const deltaLng = Math.max((maxLng - minLng) * 1.5, 0.01);

    setRegion({
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    });
  };

  // Función para manejar cambios de estado desde el modal
  const handleStatusChange = async (newStatus: string) => {
    if (!itemData?._id) {
      Alert.alert('Error', 'No se pudo identificar el servicio');
      return;
    }

    const serviceType = 'tour' in itemData ? 'tourism' : 'programming';
    
    let confirmationMessage = '';
    let confirmText = '';

    switch (newStatus) {
      case 'Progreso':
        confirmationMessage = '¿Estás seguro de que quieres iniciar el viaje?';
        confirmText = 'Iniciar viaje';
        break;
      case 'Finalizado':
        confirmationMessage = '¿Estás seguro de que quieres finalizar el viaje?';
        confirmText = 'Finalizar viaje';
        break;
      case 'Cancelado':
        confirmationMessage = '¿Estás seguro de que quieres cancelar el viaje?';
        confirmText = 'Cancelar viaje';
        break;
      default:
        confirmationMessage = `¿Estás seguro de que quieres cambiar el estado a ${newStatus}?`;
        confirmText = 'Cambiar estado';
    }

    Alert.alert(
      'Confirmar cambio de estado',
      confirmationMessage,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: async () => {
            try {
              if (onStatusChange) {
                await onStatusChange(itemData._id, newStatus, serviceType);
              } else {
                console.log(`Cambiando estado a: ${newStatus} para servicio: ${itemData._id}`);
                // Aquí podrías llamar directamente al servicio si no tienes acceso a onStatusChange
              }
              
              Alert.alert('Éxito', `Estado cambiado a ${newStatus} correctamente`);
              
              setTimeout(() => {
                closeModal();
              }, 1500);
              
            } catch (error) {
              console.error('Error al cambiar estado:', error);
              Alert.alert('Error', 'No se pudo cambiar el estado del servicio');
            }
          },
        },
      ]
    );
  };

  // Función para renderizar el botón de estado según el rol y estado del servicio
  const renderStatusButton = () => {
    if (!itemData) return null;

    const currentStatus = itemData.status;
    const currentStatusService = (itemData as any).statusService;
    const isConfirmed = currentStatusService === 'Confirmado';

    // Para rol Conductor
    if (userType === 'Conductor') {
      if (!isConfirmed) {
        return (
          <TouchableOpacity style={[styles.statusButton, styles.disabledButton]} disabled>
            <Text style={styles.disabledButtonText}>Esperando confirmación</Text>
          </TouchableOpacity>
        );
      }

      switch (currentStatus?.toLowerCase()) {
        case 'pendiente':
          return (
            <TouchableOpacity 
              style={[styles.statusButton, styles.startButton]}
              onPress={() => handleStatusChange('Progreso')}
            >
              <MaterialIcons name="play-arrow" size={20} color="white" />
              <Text style={styles.statusButtonText}>Iniciar Viaje</Text>
            </TouchableOpacity>
          );
        case 'progreso':
        case 'iniciado':
          return (
            <TouchableOpacity 
              style={[styles.statusButton, styles.finishButton]}
              onPress={() => handleStatusChange('Finalizado')}
            >
              <MaterialIcons name="check-circle" size={20} color="white" />
              <Text style={styles.statusButtonText}>Finalizar Viaje</Text>
            </TouchableOpacity>
          );
        case 'finalizado':
        case 'cancelado':
          return (
            <TouchableOpacity style={[styles.statusButton, styles.disabledButton]} disabled>
              <Text style={styles.disabledButtonText}>
                {currentStatus === 'finalizado' ? 'Viaje Finalizado' : 'Viaje Cancelado'}
              </Text>
            </TouchableOpacity>
          );
        default:
          return (
            <TouchableOpacity style={[styles.statusButton, styles.disabledButton]} disabled>
              <Text style={styles.disabledButtonText}>Estado no disponible</Text>
            </TouchableOpacity>
          );
      }
    }

    // Para rol Empresa - SIEMPRE mostrar Cancelar Viaje si no está finalizado o cancelado
    if (userType === 'Empresa') {
      const canCancel = currentStatus === 'Pendiente' || currentStatus === 'Progreso' || currentStatus === 'Iniciado';
      
      if (canCancel) {
        return (
          <TouchableOpacity 
            style={[styles.statusButton, styles.cancelButton]}
            onPress={() => handleStatusChange('Cancelado')}
          >
            <MaterialIcons name="cancel" size={20} color="white" />
            <Text style={styles.statusButtonText}>Cancelar viaje</Text>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity style={[styles.statusButton, styles.disabledButton]} disabled>
            <Text style={styles.disabledButtonText}>
              {currentStatus === 'finalizado' ? 'Viaje finalizado' : 'Viaje cancelado'}
            </Text>
          </TouchableOpacity>
        );
      }
    }

    return null;
  };
  
  const handleMarkerPress = async (point: Point) => {
    setSelectedPoint(point);
    
    if (programmingId && point.latitude && point.longitude) {
      await loadPassengersByPlace(point);
    }
  };

  const loadPassengersByPlace = async (place: Point) => {
    if (!programmingId) return;
    
    setLoading(true);
    try {
      const passengersData = await WayRouteServices.getPassengersByPlaces(
        programmingId, 
        { latitude: place.latitude, longitude: place.longitude }
      );
      setPassengers(passengersData || []);
    } catch (error) {
      console.error('Error loading passengers:', error);
      Alert.alert('Error', 'Error al cargar los pasajeros en este punto');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToChat = () => {
    console.log('🔄 Botón de chat presionado');
    if (onGoToChat) {
      console.log('✅ Ejecutando onGoToChat callback');
      onGoToChat();
    } else {
      console.log('❌ onGoToChat callback no definido');
      Alert.alert('Error', 'La funcionalidad de chat no está configurada correctamente');
    }
    closeModal();
  };

  const formatTime = (timestamp: string | number): string => {
    try {
      const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
      
      if (isNaN(timestampNum) || timestampNum <= 0) {
        return 'Hora no disponible';
      }
      
      const date = new Date(timestampNum);
      
      if (isNaN(date.getTime())) {
        return 'Hora no disponible';
      }
      
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formateando hora:', error);
      return 'Hora no disponible';
    }
  };

  const formatDate = (timestamp: string | number): string => {
    try {
      const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
      
      if (isNaN(timestampNum) || timestampNum <= 0) {
        return 'Fecha no disponible';
      }
      
      const date = new Date(timestampNum);
      
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
  };

  return (
    <Modal 
      animationType="slide" 
      visible={showModal} 
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Mapa (sin cambios) */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            provider={PROVIDER_GOOGLE}
            showsUserLocation
            showsMyLocationButton={false}
            onRegionChangeComplete={setRegion}
          >
            {/* Marcadores de la ruta */}
            {routePoints
              .filter(point => 
                point && 
                typeof point.latitude === 'number' && 
                typeof point.longitude === 'number' &&
                !isNaN(point.latitude) && 
                !isNaN(point.longitude) &&
                point.latitude !== 0 && 
                point.longitude !== 0
              )
              .map((point, index) => (
                <Marker
                  key={`route-${index}-${point.latitude}-${point.longitude}`}
                  coordinate={{
                    latitude: Number(point.latitude),
                    longitude: Number(point.longitude),
                  }}
                  title={point.name || `Punto ${index + 1}`}
                  description={`${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`}
                  onPress={() => handleMarkerPress(point)}
                  pinColor={index === 0 ? '#4CAF50' : index === routePoints.length - 1 ? '#F44336' : '#FF9500'}
                />
              ))}

            {userLocation && 
             typeof userLocation.latitude === 'number' && 
             typeof userLocation.longitude === 'number' &&
             !isNaN(userLocation.latitude) && 
             !isNaN(userLocation.longitude) && (
              <Marker
                coordinate={{
                  latitude: Number(userLocation.latitude),
                  longitude: Number(userLocation.longitude),
                }}
                title="Tu ubicación"
                description="Ubicación actual"
                pinColor="#2196F3"
              />
            )}

            {routePoints.length > 1 && (
              <Polyline
                coordinates={routePoints
                  .filter(point => 
                    point && 
                    typeof point.latitude === 'number' && 
                    typeof point.longitude === 'number' &&
                    !isNaN(point.latitude) && 
                    !isNaN(point.longitude) &&
                    point.latitude !== 0 && 
                    point.longitude !== 0
                  )
                  .map(point => ({
                    latitude: Number(point.latitude),
                    longitude: Number(point.longitude),
                  }))}
                strokeColor="#FF9500"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>
        </View>

        {/* Panel de información inferior */}
        <View style={styles.bottomInfoPanel}>

          <View style={styles.panelHeader}>
            <TouchableOpacity style={styles.backButton} onPress={closeModal}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>
                {itemData && 'tour' in itemData 
                  ? `${itemData.tour?.origin?.name || 'Origen'} → ${itemData.tour?.destination?.name || 'Destino'}` 
                  : 'Origen → Destino'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={getCurrentLocation}
            >
              <MaterialIcons name="my-location" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {/* Información del viaje */}
          <View style={styles.tripInfoContainer}>     
            <View style={styles.tripDetails}>
              <View style={styles.tripDetailRow}>
                <View style={styles.tripDetailItem}>
                  <Text style={styles.tripDetailLabel}>Fecha de salida</Text>
                  <Text style={styles.tripDetailValue}>
                    {itemData && 'start' in itemData ? formatDate(itemData.start) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.tripDetailItem}>
                  <Text style={styles.tripDetailLabel}>Lugar de recogida</Text>
                  <Text style={styles.tripDetailValue}>
                    {itemData && 'tour' in itemData ? itemData.tour?.origin?.name || 'N/A' : 'N/A'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.tripDetailRow}>
                <View style={styles.tripDetailItem}>
                  <Text style={styles.tripDetailLabel}>Fecha llegada</Text>
                  <Text style={styles.tripDetailValue}>
                    {itemData && 'end' in itemData ? formatDate(itemData.end) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.tripDetailItem}>
                  <Text style={styles.tripDetailLabel}>Lugar de llegada</Text>
                  <Text style={styles.tripDetailValue}>
                    {itemData && 'tour' in itemData ? itemData.tour?.destination?.name || 'N/A' : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Botones de acción actualizados */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.chatButton} onPress={handleGoToChat}>
              <MaterialIcons name="chat" size={20} color="white" />
              <Text style={styles.chatButtonText}>Ir al chat grupal</Text>
            </TouchableOpacity>
            
            {/* Botón de estado dinámico */}
            {renderStatusButton()}
          </View>
        </View>

        {/* Resto del código sin cambios... */}
        {selectedPoint && (
          <View style={styles.passengersPanel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>
                Pasajeros en {selectedPoint.name || 'Punto seleccionado'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                <MaterialIcons name="close" size={20} color="#999" />
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <ActivityIndicator size="small" color="#FF9500" />
            ) : (
              <ScrollView style={styles.passengersList}>
                {passengers.length > 0 ? (
                  passengers.map((passenger) => (
                    <View key={passenger.id} style={styles.passengerCard}>
                      <View style={styles.passengerHeader}>
                        <View style={styles.passengerAvatar}>
                          <MaterialIcons name="person" size={20} color="#FF9500" />
                        </View>
                        <View style={styles.passengerInfo}>
                          <Text style={styles.passengerName}>
                            {passenger.passenger.names} {passenger.passenger.lastName}
                          </Text>
                          <Text style={styles.passengerPhone}>
                            {passenger.passenger.phone}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noPassengersText}>
                    No hay pasajeros en este punto
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#1a1a1a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  locationButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomInfoPanel: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  tripInfoContainer: {
    marginBottom: 20,
  },
  locationBadge: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 15,
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripDetails: {
    gap: 10,
  },
  tripDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripDetailItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  tripDetailLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 2,
  },
  tripDetailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    gap: 12,
  },
  chatButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  finishButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#CCC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passengersPanel: {
    position: 'absolute',
    bottom: 280,
    left: 0,
    right: 0,
    backgroundColor: '#3a3a3a',
    maxHeight: height * 0.4,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  passengersList: {
    maxHeight: height * 0.25,
  },
  passengerCard: {
    backgroundColor: '#4a4a4a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#5a5a5a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  passengerPhone: {
    fontSize: 12,
    color: '#CCC',
  },
  noPassengersText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
  },
});

export default ModalMaps;