import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import ChatServices from '../../services/ChatServices';
import HomeServices from '../../services/homeServices';

interface ServiceItem {
  _id: string;
  tipoProducto: 'program' | 'tour';
  status: string;
  start: string;
  ida?: string;
  end?: string;
  vuelta?: string;
  tour?: {
    origin: { name: string };
    destination: { name: string };
  };
  destino?: { name: string };
}

const MessagesScreen: React.FC = () => {
  const { user, userType } = useAuth();
  const [mergeData, setMergeData] = useState<ServiceItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  console.log('User en MessagesScreen:', user);

  // Cargar datos al iniciar
  useEffect(() => {
    onLoading();
  }, []);

  const onLoading = async (date = new Date()) => {
    setLoading(true);
    try {
      await getProgrammingDriver(date);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getProgrammingDriver = async (date: Date) => {
    setMergeData([]);
    
    try {
      let programmingData: any[] = [];
      
      if (userType === 'Conductor') {
        programmingData = await HomeServices.getProgrammingDriver(
          user?.idUser || user?._id, 
          new Date(date).getTime().toString()
        );
      } else {
        programmingData = await HomeServices.getProgrammingsEnterprise(
          user?.idUser || user?._id, 
          new Date(date).getTime().toString()
        );
      }

      // Procesar programaciones
      const processedProgrammings = programmingData.map(item => ({
        ...item,
        tipoProducto: 'program' as const
      }));

      setMergeData(processedProgrammings);
      await getTourismsDriver(date);
    } catch (error) {
      console.error('Error fetching programming:', error);
      await getTourismsDriver(date);
    }
  };

  const getTourismsDriver = async (date: Date) => {
    try {
      let tourismData: any[] = [];
      const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (userType === 'Conductor') {
        tourismData = await HomeServices.getTourismsDriver(
          user?.idUser || user?._id, 
          dateString
        );
      } else {
        tourismData = await HomeServices.getTourismByEnterprises(
          user?.idUser || user?._id, 
          new Date(date).getTime().toString()
        );
      }

      // Procesar turismos
      const processedTourisms = tourismData.map(item => ({
        ...item,
        tipoProducto: 'tour' as const
      }));

      setMergeData(prev => [...prev, ...processedTourisms]);
    } catch (error) {
      console.error('Error fetching tourisms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await onLoading();
  }, []);

  const getPassengers = async (id: string, type: string) => {
    try {
      const passengersData = await ChatServices.getPassengers(id, type);
      setPassengers(passengersData);
      setSelectedService(mergeData.find(item => item._id === id) || null);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching passengers:', error);
      Alert.alert('Error', 'No se pudieron cargar los pasajeros');
    }
  };

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(parseInt(timestamp));
      if (isNaN(date.getTime())) return 'Hora no disponible';
      
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      return 'Hora no disponible';
    }
  };

  const getRouteName = (item: ServiceItem): string => {
    if (item.tipoProducto === 'program' && item.tour) {
      return `${item.tour.origin.name} - ${item.tour.destination.name}`;
    } else if (item.tipoProducto === 'tour' && item.destino) {
      return item.destino.name;
    }
    return 'Ruta no disponible';
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pendiente': return '#FF9500';
      case 'progreso': return '#4CAF50';
      case 'finalizado': return '#2196F3';
      case 'cancelado': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'progreso': return 'En Progreso';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const filteredData = mergeData.filter(item => 
    (item.tipoProducto === 'program' && (item.status === 'Pendiente' || item.status === 'Progreso')) ||
    (item.tipoProducto === 'tour' && (item.status === 'Pendiente' || item.status === 'Progreso'))
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mensajes</Text>
        </View>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="refresh" size={50} color="#FF9500" />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <MaterialIcons name="search" size={24} color="#FF9500" />
        </TouchableOpacity>
      </View>

      {/* Banner Informativo */}
      <View style={styles.infoBanner}>
        <MaterialIcons name="message" size={40} color="white" />
        <Text style={styles.infoText}>Conversa con tus clientes confirmados</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF9500']}
            tintColor="#FF9500"
          />
        }
      >
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat-bubble-outline" size={80} color="#FF9500" />
            <Text style={styles.emptyTitle}>No hay servicios activos</Text>
            <Text style={styles.emptySubtitle}>
              Los servicios pendientes o en progreso aparecerán aquí para chatear con los pasajeros
            </Text>
          </View>
        ) : (
          <View style={styles.servicesList}>
            {filteredData.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.serviceItem}
                onPress={() => getPassengers(item._id, 
                  item.tipoProducto === 'program' ? 'Programming' : 'TourismService'
                )}
              >
                <View style={styles.serviceIcon}>
                  <MaterialIcons 
                    name={item.tipoProducto === 'program' ? "directions-bus" : "beach-access"} 
                    size={24} 
                    color="#FF9500" 
                  />
                </View>
                
                <View style={styles.serviceContent}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceRoute} numberOfLines={1}>
                      {getRouteName(item)}
                    </Text>
                    <Text style={styles.serviceTime}>
                      {formatTime(item.start || item.ida || '')}
                    </Text>
                  </View>
                  
                  <View style={styles.serviceFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                    <Text style={styles.serviceType}>
                      {item.tipoProducto === 'program' ? 'Viaje' : 'Paquete Turístico'}
                    </Text>
                  </View>
                </View>

                <View style={styles.arrowContainer}>
                  <MaterialIcons name="chevron-right" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Modal de Pasajeros (simulado - necesitarías implementar el modal real) */}
        {/* <ModalListPassagers
          visible={showModal}
          onClose={() => setShowModal(false)}
          passengers={passengers}
          service={selectedService}
        /> */}
      </ScrollView>

      {/* Modal simplificado para mostrar pasajeros */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pasajeros del Servicio</Text>
            <ScrollView style={styles.passengersList}>
              {passengers.length === 0 ? (
                <Text style={styles.noPassengers}>No hay pasajeros registrados</Text>
              ) : (
                passengers.map((passenger, index) => (
                  <View key={passenger._id || index} style={styles.passengerItem}>
                    <Text style={styles.passengerName}>
                      {passenger.names} {passenger.lastnames}
                    </Text>
                    <Text style={styles.passengerPhone}>{passenger.phone || passenger.cel}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  filterIcon: {
    padding: 8,
  },
  infoBanner: {
    backgroundColor: '#FF9500',
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  servicesList: {
    padding: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    backgroundColor: '#3a3a3a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a4a4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  serviceContent: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceRoute: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginRight: 10,
  },
  serviceTime: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceType: {
    fontSize: 12,
    color: '#999',
  },
  arrowContainer: {
    marginLeft: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#3a3a3a',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  passengersList: {
    maxHeight: 300,
  },
  passengerItem: {
    backgroundColor: '#4a4a4a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  passengerPhone: {
    fontSize: 14,
    color: '#FF9500',
  },
  noPassengers: {
    color: '#999',
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  closeButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MessagesScreen;