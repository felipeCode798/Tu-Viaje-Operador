import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Programming, Tourism } from '../types';
import moment from 'moment';

interface ServiceListProps {
  programmings: Programming[];
  tourisms: Tourism[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: string, type: 'programming' | 'tourism') => void;
  userType: 'Conductor' | 'Empresa' | null;
}

interface ServiceItemProps {
  item: Programming | Tourism;
  type: 'programming' | 'tourism';
  onStatusChange: (id: string, newStatus: string, type: 'programming' | 'tourism') => void;
  userType: 'Conductor' | 'Empresa' | null;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  item,
  type,
  onStatusChange,
  userType
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'Pendiente':
        return '#60A5FA';
      case 'started':
      case 'Iniciado':
        return '#34D399';
      case 'finished':
      case 'Finalizado':
        return '#F59E0B';
      case 'cancelled':
      case 'Cancelado':
        return '#F87171';
      default:
        return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
      case 'Pendiente':
        return 'Pendiente';
      case 'started':
      case 'Iniciado':
        return 'Iniciado';
      case 'finished':
      case 'Finalizado':
        return 'Finalizado';
      case 'cancelled':
      case 'Cancelado':
        return 'Cancelado';
      default:
        return 'Sin estado';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
      case 'Pendiente':
        return 'Iniciado';
      case 'started':
      case 'Iniciado':
        return 'Finalizado';
      default:
        return null;
    }
  };

  const getRouteText = () => {
    if (type === 'tourism') {
      const tourism = item as Tourism;
      const origin = tourism.origen && tourism.origen.length > 0 
        ? tourism.origen[0].name 
        : 'Origen no definido';
      const destination = tourism.destino?.name || 'Destino no definido';
      return `${origin} - ${destination}`;
    } else {
      const programming = item as Programming;
      const origin = programming.tour?.origin?.name || 'Origen no definido';
      const destination = programming.tour?.destination?.name || 'Destino no definido';
      return `${origin} - ${destination}`;
    }
  };

  const getTime = () => {
    if (type === 'tourism') {
      const tourism = item as Tourism;
      return moment(tourism.ida).format('h:mm a');
    } else {
      const programming = item as Programming;
      return moment(programming.start).format('h:mm a');
    }
  };

  const getIcon = () => {
    if (type === 'tourism') {
      return 'luggage';
    } else {
      return 'directions-bus';
    }
  };

  const handleStatusPress = () => {
    const nextStatus = getNextStatus(item.statusService);
    if (nextStatus) {
      Alert.alert(
        'Cambiar Estado',
        `¿Deseas cambiar el estado a "${getStatusText(nextStatus)}"?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Confirmar',
            onPress: () => onStatusChange(item._id, nextStatus, type)
          }
        ]
      );
    } else if (item.statusService === 'pending' || item.statusService === 'Pendiente') {
      // Mostrar opciones para servicios pendientes
      Alert.alert(
        'Cambiar Estado',
        'Selecciona el nuevo estado:',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Iniciar',
            onPress: () => onStatusChange(item._id, 'Iniciado', type)
          },
          {
            text: 'Cancelar Servicio',
            style: 'destructive',
            onPress: () => onStatusChange(item._id, 'Cancelado', type)
          }
        ]
      );
    } else if (item.statusService === 'started' || item.statusService === 'Iniciado') {
      // Mostrar opciones para servicios iniciados
      Alert.alert(
        'Cambiar Estado',
        'Selecciona el nuevo estado:',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Finalizar',
            onPress: () => onStatusChange(item._id, 'Finalizado', type)
          },
          {
            text: 'Cancelar Servicio',
            style: 'destructive',
            onPress: () => onStatusChange(item._id, 'Cancelado', type)
          }
        ]
      );
    } else {
      Alert.alert(
        'Estado no modificable',
        'Este servicio ya ha sido finalizado o cancelado y no puede cambiar su estado.'
      );
    }
  };

  const canChangeStatus = () => {
    const status = item.statusService;
    return status === 'pending' || status === 'Pendiente' || 
           status === 'started' || status === 'Iniciado';
  };

  return (
    <View style={styles.serviceItem}>
      <View style={styles.serviceHeader}>
        <MaterialIcons name={getIcon()} size={20} color="#555" />
        <Text style={styles.serviceRoute}>{getRouteText()}</Text>
        <Text style={styles.serviceTime}>{getTime()}</Text>
      </View>
      
      <View style={styles.serviceDetails}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusService) }]}>
          <Text style={styles.statusText}>{getStatusText(item.statusService)}</Text>
        </View>
        
        {userType === 'Conductor' && canChangeStatus() && (
          <TouchableOpacity 
            style={styles.changeStatusButton}
            onPress={handleStatusPress}
          >
            <Text style={styles.changeStatusText}>Cambiar Estado</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ServiceList: React.FC<ServiceListProps> = ({
  programmings,
  tourisms,
  loading,
  onStatusChange,
  userType
}) => {
  // Combinar y ordenar servicios por hora
  const allServices = [
    ...programmings.map(item => ({ ...item, type: 'programming' as const })),
    ...tourisms.map(item => ({ ...item, type: 'tourism' as const }))
  ].sort((a, b) => {
    const timeA = a.type === 'tourism' 
      ? moment((a as Tourism).ida).valueOf() 
      : moment((a as Programming).start).valueOf();
    
    const timeB = b.type === 'tourism' 
      ? moment((b as Tourism).ida).valueOf() 
      : moment((b as Programming).start).valueOf();
    
    return timeA - timeB;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </View>
    );
  }

  if (allServices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="event-busy" size={50} color="#CCC" />
        <Text style={styles.emptyText}>No hay servicios programados</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={allServices}
      keyExtractor={(item) => `${item.type}-${item._id}`}
      renderItem={({ item }) => (
        <ServiceItem
          item={item}
          type={item.type}
          onStatusChange={onStatusChange}
          userType={userType}
        />
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  serviceItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceRoute: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 8,
  },
  serviceTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  changeStatusButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ServiceList;