import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Programming, Tourism } from '../types';
import ModalTableProgrammings from './ModalTableProgrammings';
import ModalMaps from './ModalMaps';

interface ServiceListProps {
  programmings: Programming[];
  tourisms: Tourism[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: string, type: 'programming' | 'tourism') => void;
  userType?: string;
  refreshing: boolean;
  onRefresh: () => void;
  headerComponent?: React.ReactNode;
}

interface ServiceItemProps {
  item: Programming | Tourism;
  type: 'programming' | 'tourism';
  onStatusChange: (id: string, newStatus: string, type: 'programming' | 'tourism') => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ item, type, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [showPlanillaModal, setShowPlanillaModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'started': return '#4CAF50';
      case 'finished': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'started': return 'Iniciado';
      case 'finished': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleStatusPress = () => {
    const statusOptions = [
      { label: 'Pendiente', value: 'pending' },
      { label: 'Iniciado', value: 'started' },
      { label: 'Finalizado', value: 'finished' },
      { label: 'Cancelado', value: 'cancelled' }
    ];

    Alert.alert(
      'Cambiar Estado',
      'Selecciona el nuevo estado:',
      statusOptions.map(option => ({
        text: option.label,
        onPress: () => onStatusChange(item._id, option.value, type)
      })).concat([{ text: 'Cancelar', style: 'cancel' }])
    );
  };

  // Función para obtener las coordenadas del item para el mapa
  const getCoordinatesForMap = (): any[] => {
    if ('tour' in item && item.tour) {
      const coords = [];
      if (item.tour.origin) {
        coords.push({
          name: item.tour.origin.name,
          latitude: item.tour.origin.latitude || 0,
          longitude: item.tour.origin.longitude || 0,
        });
      }
      if (item.tour.destination) {
        coords.push({
          name: item.tour.destination.name,
          latitude: item.tour.destination.latitude || 0,
          longitude: item.tour.destination.longitude || 0,
        });
      }
      return coords;
    }
    return [];
  };

  const origin = 'tour' in item ? item.tour?.origin?.name : 'tourism' in item ? item.tourism?.origin?.name : 'N/A';
  const destination = 'tour' in item ? item.tour?.destination?.name : 'tourism' in item ? item.tourism?.destination?.name : 'N/A';

  return (
    <View>
      <TouchableOpacity 
        style={styles.serviceItem}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIcon}>
            <MaterialIcons name="directions-bus" size={24} color="#FF9500" />
          </View>
          
          <View style={styles.serviceInfo}>
            <Text style={styles.routeText}>
              {origin} - {destination}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(item.start)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusService || 'pending') }]}
            onPress={handleStatusPress}
          >
            <Text style={styles.statusText}>
              {getStatusText(item.statusService || 'pending')}
            </Text>
          </TouchableOpacity>
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>
                Empresa: {'enterprise' in item ? item.enterprise?.name : 'N/A'}
              </Text>
              <Text style={styles.detailText}>
                Conductor: {'driverInfo' in item ? `${item.driverInfo?.names} ${item.driverInfo?.lastName}` : 'N/A'}
              </Text>
              <Text style={styles.detailText}>
                Fecha: {new Date(item.start).toLocaleDateString('es-ES')}
              </Text>
            </View>
            
            {/* Botones Planilla y Mapa */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.planillaButton]}
                onPress={() => setShowPlanillaModal(true)}
              >
                <MaterialIcons name="description" size={20} color="white" />
                <Text style={styles.actionButtonText}>Planilla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.mapButton]}
                onPress={() => setShowMapModal(true)}
              >
                <MaterialIcons name="map" size={20} color="white" />
                <Text style={styles.actionButtonText}>Mapa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal para Planilla - Solo para programmings */}
      {type === 'programming' && (
        <ModalTableProgrammings
          visible={showPlanillaModal}
          onClose={() => setShowPlanillaModal(false)}
          item={item as Programming}
        />
      )}

      {/* Modal para Mapa */}
      <ModalMaps
        showModal={showMapModal}
        closeModal={() => setShowMapModal(false)}
        coords={getCoordinatesForMap()}
      />
    </View>
  );
};

const ServiceList: React.FC<ServiceListProps> = ({
  programmings,
  tourisms,
  loading,
  onStatusChange,
  refreshing,
  onRefresh,
  headerComponent,
}) => {
  // Combinar programmings y tourisms en una sola lista
  const combinedData = [
    ...programmings.map(item => ({ ...item, type: 'programming' as const })),
    ...tourisms.map(item => ({ ...item, type: 'tourism' as const })),
  ];

  // Ordenar por fecha de inicio
  combinedData.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const renderItem = ({ item }: { item: any }) => (
    <ServiceItem
      item={item}
      type={item.type}
      onStatusChange={onStatusChange}
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

  if (combinedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="event-busy" size={50} color="#666" />
        <Text style={styles.emptyText}>No hay servicios programados</Text>
        <Text style={styles.emptySubText}>para la fecha seleccionada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={() => headerComponent ? <>{headerComponent}</> : null}
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
    marginBottom: 2,
  },
  timeText: {
    color: '#CCC',
    fontSize: 14,
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
  },
  detailText: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  planillaButton: {
    backgroundColor: '#FF9500',
  },
  mapButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ServiceList;