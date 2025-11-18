import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Programming, Tourism } from '../types';
import { MapUtils } from '../utils/mapUtils';
import ModalMaps from './ModalMaps';
import ModalTableProgrammings from './ModalTableProgrammings';

interface ServiceListProps {
  programmings: Programming[];
  tourisms: Tourism[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: string, type: 'programming' | 'tourism') => void;
  onOpenPlanilla: (service: any) => void;
  onOpenMap: (service: any) => void;
  refreshing: boolean;
  onRefresh: () => void;
  userType: 'Conductor' | 'Empresa' | null;
}

interface ServiceItemProps {
  item: Programming | Tourism;
  type: 'programming' | 'tourism';
  onStatusChange: (id: string, newStatus: string, type: 'programming' | 'tourism') => void;
  onOpenPlanilla: (service: any) => void;
  onOpenMap: (service: any) => void;
  userType: 'Conductor' | 'Empresa' | null;
}

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

// Función para formatear solo la hora - CORREGIDA
const formatTime = (dateString: string | number): string => {
  try {
    let date: Date;
    
    if (typeof dateString === 'string' && !isNaN(Number(dateString))) {
      const timestamp = parseInt(dateString, 10);
      if (isNaN(timestamp) || timestamp <= 0) {
        return 'Hora no disponible';
      }
      date = new Date(timestamp);
    } else if (typeof dateString === 'number') {
      if (dateString <= 0) {
        return 'Hora no disponible';
      }
      date = new Date(dateString);
    } else {
      date = new Date(dateString);
    }
    
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

const formatDateOnly = (dateString: string | number): string => {
  try {
    let date: Date;
    
    if (typeof dateString === 'string' && !isNaN(Number(dateString))) {
      const timestamp = parseInt(dateString, 10);
      if (isNaN(timestamp) || timestamp <= 0) {
        return 'Fecha no disponible';
      }
      date = new Date(timestamp);
    } else if (typeof dateString === 'number') {
      if (dateString <= 0) {
        return 'Fecha no disponible';
      }
      date = new Date(dateString);
    } else {
      date = new Date(dateString);
    }
    
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

const ServiceItem: React.FC<ServiceItemProps> = ({ 
  item, 
  type, 
  onStatusChange, 
  onOpenPlanilla, 
  onOpenMap,
  userType 
}) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [showPlanillaModal, setShowPlanillaModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const handleGoToChat = () => {
    try {
      navigation.navigate('MessagesScreen' as never);
    } catch (error) {
      console.error('Error en navegación:', error);
      try {
        navigation.jumpTo('MessagesScreen' as never);
      } catch (error2) {
        console.error('Error en navegación alternativa:', error2);
        Alert.alert('Navegación', 'Redirigiendo al chat...');
      }
    }
  };

  // ✅ Función para mostrar detalles
  const handleViewDetails = () => {
    if (type === 'programming') {
      setShowPlanillaModal(true);
    } else {
      Alert.alert('Detalles', 'Información del paquete turístico disponible próximamente');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'pendiente':
        return '#FF9500';
      case 'started':
      case 'iniciado':
      case 'progreso':
        return '#4CAF50';
      case 'finished':
      case 'finalizado':
        return '#2196F3';
      case 'cancelled':
      case 'cancelado':
        return '#F44336';
      case 'confirmado':
        return '#9C27B0';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'pendiente':
        return 'Pendiente';
      case 'started':
      case 'iniciado':
      case 'progreso':
        return 'En Progreso';
      case 'finished':
      case 'finalizado':
        return 'Finalizado';
      case 'cancelled':
      case 'cancelado':
        return 'Cancelado';
      case 'confirmado':
        return 'Confirmado';
      default:
        return status || 'Sin estado';
    }
  };

  // Función mejorada para cambiar estado
  const handleStatusPress = () => {
    const currentStatus = item.status;
    const currentStatusService = (item as any).statusService;
    const isConfirmed = currentStatusService === 'Confirmado';

    if (userType === 'Empresa') {
      if (!isConfirmed) {
        Alert.alert(
          'Confirmar Servicio',
          '¿Confirmar este servicio para que el conductor pueda iniciarlo?',
          [
            { 
              text: 'Cancelar', 
              style: 'cancel' 
            },
            {
              text: 'Confirmar',
              onPress: async () => {
                try {
                  await onStatusChange(item._id, 'Confirmado', type);
                } catch (error) {
                  console.error('Error al confirmar:', error);
                  Alert.alert('Error', 'No se pudo confirmar el servicio');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Desconfirmar Servicio',
          '¿Marcar este servicio como no confirmado?',
          [
            { 
              text: 'Cancelar', 
              style: 'cancel' 
            },
            {
              text: 'Desconfirmar',
              style: 'destructive',
              onPress: async () => {
                try {
                  await onStatusChange(item._id, 'NoConfirmado', type);
                } catch (error) {
                  console.error('Error al desconfirmar:', error);
                  Alert.alert('Error', 'No se pudo desconfirmar el servicio');
                }
              }
            }
          ]
        );
      }
    } else {
      let statusOptions = [];
      
      if (!isConfirmed) {
        Alert.alert(
          'Servicio No Confirmado',
          'Este servicio debe ser confirmado por la empresa antes de poder iniciarlo.',
          [{ text: 'Entendido', style: 'default' }]
        );
        return;
      }
      
      if (currentStatus === 'Pendiente') {
        statusOptions.push({ label: 'Iniciar Viaje', value: 'Progreso' });
      }
      if (currentStatus === 'Progreso') {
        statusOptions.push({ label: 'Finalizar Viaje', value: 'Finalizado' });
      }
      if (statusOptions.length === 0) {
        Alert.alert('Info', 'No hay acciones disponibles para el estado actual');
        return;
      }

      Alert.alert(
        'Cambiar estado del viaje',
        'Selecciona el nuevo estado:',
        statusOptions.map(option => ({
          text: option.label,
          style: option.style,
          onPress: async () => {
            try {
              await onStatusChange(item._id, option.value, type);
            } catch (error) {
              console.error('Error al cambiar estado:', error);
              Alert.alert('Error', 'No se pudo cambiar el estado');
            }
          }
        })).concat([{ text: 'Cancelar', style: 'cancel' }])
      );
    }
  };

  const handleOpenPlanilla = () => {
    onOpenPlanilla(item);
    setShowPlanillaModal(true);
  };


  const handleOpenMap = () => {
    onOpenMap(item);
    setShowMapModal(true);
  };

  const getCoordinatesForMap = () => {
    if (type === 'programming') {
      return MapUtils.extractCoordinatesFromProgramming(item as Programming);
    } else {
      return MapUtils.extractCoordinatesFromTourism(item as Tourism);
    }
  };

  const getRouteInfo = () => {
    const coords = getCoordinatesForMap();
    return MapUtils.getRouteInfo(coords);
  };

  const getRouteNames = () => {
    if (type === 'programming') {
      const programming = item as Programming;
      return {
        origin: programming.tour?.origin?.name || 'N/A',
        destination: programming.tour?.destination?.name || 'N/A'
      };
    } else {
      const tourism = item as Tourism;
      return {
        destination: tourism.destino?.name || 'N/A'
      };
    }
  };

  const getNextStatus = (currentStatus: string, isConfirmed: boolean): string => {
    if (!isConfirmed) {
      return 'Confirmado';
    }

    switch (currentStatus?.toLowerCase()) {
      case 'pendiente':
        return 'Progreso'; 
      case 'progreso':
      case 'iniciado':
        return 'Finalizado';
      case 'finalizado':
        return 'Pendiente';
      case 'cancelado':
        return 'Pendiente';
      default:
        return 'Progreso';
    }
  };

  const { origin, destination } = getRouteNames();
  const routeInfo = getRouteInfo();

  return (
    <View>
      <TouchableOpacity 
        style={styles.serviceItem}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIcon}>
            <MaterialIcons 
              name={type === 'programming' ? "directions-bus" : "tour"} 
              size={24} 
              color="#FF9500" 
            />
          </View>
          
          <View style={styles.serviceInfo}>
            <Text style={styles.routeText}>
              {type === 'programming' 
                ? `${origin} → ${destination}` 
                : `${destination}`}
            </Text>
            <View style={styles.serviceMetrics}>
              <Text style={styles.timeText}>
                {formatTime(type === 'programming' ? item.start : (item as Tourism).ida)}
              </Text>
              {routeInfo.totalDistance > 0 && (
                <Text style={styles.distanceText}>
                  • {routeInfo.totalDistance}km • {routeInfo.estimatedTime}min
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
            onPress={handleStatusPress}
          >
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </TouchableOpacity>
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <MaterialIcons name="business" size={16} color="#999" />
                <Text style={styles.detailText}>
                  Empresa: {type === 'programming' 
                    ? (item as Programming).enterprise?.name 
                    : (item as Tourism).empresa?.name || 'N/A'}
                </Text>
              </View>
              
              {type === 'programming' && (item as Programming).driverInfo && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="person" size={16} color="#999" />
                  <Text style={styles.detailText}>
                    Conductor: {(item as Programming).driverInfo.names} {(item as Programming).driverInfo.lastName}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <MaterialIcons name="calendar-today" size={16} color="#999" />
                <Text style={styles.detailText}>
                  Fecha: {formatDateOnly(type === 'programming' ? item.start : (item as Tourism).ida)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialIcons name="schedule" size={16} color="#999" />
                <Text style={styles.detailText}>
                  Inicio: {formatTime(type === 'programming' ? item.start : (item as Tourism).ida)} • 
                  Fin: {formatTime(type === 'programming' ? item.end : (item as Tourism).vuelta)}
                </Text>
              </View>

              {type === 'programming' && (item as Programming).bus && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="directions-bus" size={16} color="#999" />
                  <Text style={styles.detailText}>
                    Vehículo: {(item as Programming).bus.name} - {(item as Programming).bus.placa}
                  </Text>
                </View>
              )}

              {routeInfo.pointCount > 0 && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="route" size={16} color="#999" />
                  <Text style={styles.detailText}>
                    Ruta: {routeInfo.pointCount} puntos • {routeInfo.totalDistance}km • {routeInfo.estimatedTime}min
                  </Text>
                </View>
              )}

              {type === 'programming' && (item as Programming).available !== undefined && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="airline-seat-recline-normal" size={16} color="#999" />
                  <Text style={styles.detailText}>
                    Cupos disponibles: {(item as Programming).available}
                  </Text>
                </View>
              )}

              {type === 'tourism' && (
                <>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="group" size={16} color="#999" />
                    <Text style={styles.detailText}>
                      Cupos: {(item as Tourism).disponibles}/{(item as Tourism).cupos}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={16} color="#999" />
                    <Text style={styles.detailText}>
                      Precio: ${(item as Tourism).precio?.toLocaleString() || '0'}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.detailRow}>
                <MaterialIcons name="info" size={16} color="#999" />
                <Text style={styles.detailText}>
                  Estado: {getStatusText(item.status)}
                </Text>
              </View>

              {(item as any).statusService && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="check-circle" size={16} color="#999" />
                  <Text style={styles.detailText}>
                    Confirmación: {(item as any).statusService}
                  </Text>
                </View>
              )}
            </View>
            
            {userType === 'Conductor' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.planillaButton]}
                  onPress={handleOpenPlanilla}
                >
                  <MaterialIcons name="description" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Planilla</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.mapButton]}
                  onPress={handleOpenMap}
                >
                  <MaterialIcons name="map" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Mapa</Text>
                </TouchableOpacity>
              </View>
            )}

            {userType === 'Empresa' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.mapButton]}
                onPress={handleOpenMap}
              >
                <MaterialIcons name="map" size={20} color="white" />
                <Text style={styles.actionButtonText}>Mapa</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>

      {type === 'programming' && (
        <ModalTableProgrammings
          visible={showPlanillaModal}
          onClose={() => setShowPlanillaModal(false)}
          item={item as Programming}
        />
      )}

      <ModalMaps
        showModal={showMapModal}
        closeModal={() => {
          setShowMapModal(false);
        }}
        coords={getCoordinatesForMap()}
        programmingId={type === 'programming' ? item._id : undefined}
        itemData={item}
        onGoToChat={handleGoToChat}
        onViewDetails={handleViewDetails}
        onStatusChange={onStatusChange}
        userType={userType}
      />
    </View>
  );
};

const ServiceList: React.FC<ServiceListProps> = ({
  programmings,
  tourisms,
  loading,
  onStatusChange,
  onOpenPlanilla,
  onOpenMap,
  refreshing,
  onRefresh,
  userType,
}) => {
  const combinedData = [
    ...programmings.map(item => ({ 
      ...item, 
      type: 'programming' as const,
      start: item.start,
      end: item.end
    })),
    ...tourisms.map(item => ({ 
      ...item, 
      type: 'tourism' as const,
      start: item.ida,
      end: item.vuelta
    })),
  ];

  combinedData.sort((a, b) => {
    try {
      const getTimestamp = (dateValue: string | number) => {
        if (typeof dateValue === 'string') {
          const parsed = parseInt(dateValue, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
        return typeof dateValue === 'number' ? dateValue : 0;
      };

      const dateA = getTimestamp(a.start);
      const dateB = getTimestamp(b.start);
      
      return dateA - dateB;
    } catch (error) {
      console.error('Error sorting services:', error);
      return 0;
    }
  });

  const renderItem = ({ item }: { item: any }) => (
    <ServiceItem
      item={item}
      type={item.type}
      onStatusChange={onStatusChange}
      onOpenPlanilla={onOpenPlanilla}
      onOpenMap={onOpenMap}
      userType={userType}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item._id}`}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={50} color="#666" />
            <Text style={styles.emptyText}>No hay servicios programados</Text>
            <Text style={styles.emptySubText}>para la fecha seleccionada</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF9500']}
            tintColor="#FF9500"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.flatListContent,
          combinedData.length === 0 && styles.emptyContentStyle
        ]}
        nestedScrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContentStyle: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
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
    paddingTop: 100,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptySubText: {
    color: '#CCC',
    fontSize: 14,
    marginTop: 5,
  },
  serviceItem: {
    backgroundColor: '#3a3a3a',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#4a4a4a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 15,
  },
  routeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#CCC',
    fontSize: 14,
  },
  distanceText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#4a4a4a',
    paddingTop: 15,
  },
  detailsContainer: {
    marginBottom: 15,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#CCC',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 60,
  },
  planillaButton: {
    backgroundColor: '#FF9500',
  },
  mapButton: {
    backgroundColor: '#4CAF50',
  },
  statusButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtonSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  infoContainer: {
    backgroundColor: '#4a4a4a',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ServiceList;