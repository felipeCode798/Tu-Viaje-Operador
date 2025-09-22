import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import CalendarComponent from '../../components/CalendarComponent';
import FilterButtons from '../../components/FilterButtons';
import StatusFilters from '../../components/StatusFilters';
import ServiceList from '../../components/ServiceList';
import { Programming, Tourism } from '../../types';
import moment from 'moment';

type FilterType = 'Todos' | 'Viajes' | 'Paquetes';
type StatusType = 'Todos' | 'Pendientes' | 'Iniciados' | 'Finalizados' | 'Cancelados';
type ConfirmationType = 'Confirmados' | 'No confirmados';

// DATOS QUEMADOS PARA PRUEBAS
const MOCK_PROGRAMMINGS: Programming[] = [
  {
    _id: '1',
    start: '2025-09-20T13:30:00.000Z',
    end: '2025-09-20T14:30:00.000Z',
    status: 'Progreso', // Confirmado
    statusService: 'pending',
    tour: {
      origin: { 
        name: 'CALI',
        latitude: 3.4516,
        longitude: -76.5320
      },
      destination: { 
        name: 'AEROPUERTO ALFONSO BONILLA',
        latitude: 3.5432,
        longitude: -76.3816
      }
    },
    enterprise: {
      name: 'Prueba Tem',
      nit: '102949402'
    },
    driverInfo: {
      names: 'Juan',
      lastName: 'Lopez'
    }
  },
  {
    _id: '2',
    start: '2025-09-20T09:00:00.000Z',
    end: '2025-09-20T12:00:00.000Z',
    status: 'Pendiente', // No confirmado
    statusService: 'started',
    tour: {
      origin: { 
        name: 'BOGOTÁ',
        latitude: 4.7110,
        longitude: -74.0721
      },
      destination: { 
        name: 'MEDELLÍN',
        latitude: 6.2442,
        longitude: -75.5812
      }
    },
    enterprise: {
      name: 'Transportes Valle',
      nit: '800123456'
    },
    driverInfo: {
      names: 'Carlos',
      lastName: 'Rodriguez'
    }
  },
  {
    _id: '3',
    start: '2025-09-20T15:00:00.000Z',
    end: '2025-09-20T18:00:00.000Z',
    status: 'Progreso', // Confirmado
    statusService: 'finished',
    tour: {
      origin: { 
        name: 'PEREIRA',
        latitude: 4.8133,
        longitude: -75.6961
      },
      destination: { 
        name: 'ARMENIA',
        latitude: 4.5339,
        longitude: -75.6811
      }
    },
    enterprise: {
      name: 'Rutas Express',
      nit: '900456789'
    },
    driverInfo: {
      names: 'Miguel',
      lastName: 'Hernandez'
    }
  }
];

const MOCK_TOURISMS: Tourism[] = [
  {
    _id: '4',
    start: '2025-09-20T08:00:00.000Z',
    end: '2025-09-20T20:00:00.000Z',
    status: 'Progreso', // Confirmado
    statusService: 'pending',
    tourism: {
      origin: { 
        name: 'CARTAGENA',
        latitude: 10.3910,
        longitude: -75.4794
      },
      destination: { 
        name: 'BARRANQUILLA',
        latitude: 10.9685,
        longitude: -74.7813
      }
    },
    enterprise: {
      name: 'Turismo Caribe',
      nit: '700987654'
    },
    driverInfo: {
      names: 'Ana',
      lastName: 'Martinez'
    }
  }
];

const HomeScreen: React.FC = () => {
  const { user, userType, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');
  const [activeStatus, setActiveStatus] = useState<StatusType>('Todos');
  const [confirmationFilter, setConfirmationFilter] = useState<ConfirmationType>('Confirmados');
  const [programmings, setProgrammings] = useState<Programming[]>(MOCK_PROGRAMMINGS);
  const [tourisms, setTourisms] = useState<Tourism[]>(MOCK_TOURISMS);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  console.log('User en HomeScreen:', user);
  console.log('UserType en HomeScreen:', userType);

  // Verificar si el usuario está autenticado
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Programación</Text>
        </View>
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={50} color="#FF9500" />
          <Text style={styles.errorText}>Usuario no autenticado</Text>
          <Text style={styles.errorSubText}>Por favor inicia sesión para acceder a esta funcionalidad</Text>
        </View>
      </View>
    );
  }

  // Simular carga de datos
  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Los datos ya están cargados como mock data
    setProgrammings(MOCK_PROGRAMMINGS);
    setTourisms(MOCK_TOURISMS);
    
    if (showLoader) setLoading(false);
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  }, [loadData]);

  // Filtrar datos
  const getFilteredData = useCallback(() => {
    console.log('=== DEBUG FILTRO ===');
    console.log('Programmings originales:', programmings.map(p => ({id: p._id, status: p.status, statusService: p.statusService})));
    console.log('Tourisms originales:', tourisms.map(t => ({id: t._id, status: t.status, statusService: t.statusService})));
    console.log('Filtro activo:', activeFilter);
    console.log('Estado activo:', activeStatus);
    console.log('Confirmación:', confirmationFilter);
      
    let filteredProgrammings = [...programmings];
    let filteredTourisms = [...tourisms];

    // Filtrar por tipo
    if (activeFilter === 'Viajes') {
      filteredTourisms = [];
    } else if (activeFilter === 'Paquetes') {
      filteredProgrammings = [];
    }

    // Filtrar por estado
    if (activeStatus !== 'Todos') {
      const statusMap = {
        'Pendientes': 'pending',
        'Iniciados': 'started',
        'Finalizados': 'finished',
        'Cancelados': 'cancelled'
      };
      
      const targetStatus = statusMap[activeStatus];
      filteredProgrammings = filteredProgrammings.filter(p => p.statusService === targetStatus);
      filteredTourisms = filteredTourisms.filter(t => t.statusService === targetStatus);
    }

    // Filtrar por confirmación
    if (confirmationFilter === 'Confirmados') {
      filteredProgrammings = filteredProgrammings.filter(p => 
        p.status === 'Progreso' || p.status === 'Activo'
      );
      filteredTourisms = filteredTourisms.filter(t => 
        t.status === 'Progreso' || t.status === 'Activo'
      );
    } else {
      filteredProgrammings = filteredProgrammings.filter(p => 
        p.status !== 'Progreso' && p.status !== 'Activo'
      );
      filteredTourisms = filteredTourisms.filter(t => 
        t.status !== 'Progreso' && t.status !== 'Activo'
      );
    }

    console.log('Después de filtrar - Programmings:', filteredProgrammings.length);
    console.log('Después de filtrar - Tourisms:', filteredTourisms.length);
    console.log('=== FIN DEBUG ===');

    return { programmings: filteredProgrammings, tourisms: filteredTourisms };
  }, [programmings, tourisms, activeFilter, activeStatus, confirmationFilter]);

  const handleStatusChange = async (id: string, newStatus: string, type: 'programming' | 'tourism') => {
    try {
      // Simular cambio de estado
      if (type === 'programming') {
        setProgrammings(prev => 
          prev.map(p => 
            p._id === id ? { ...p, statusService: newStatus as any } : p
          )
        );
      } else {
        setTourisms(prev => 
          prev.map(t => 
            t._id === id ? { ...t, statusService: newStatus as any } : t
          )
        );
      }
      
      Alert.alert('Éxito', 'Estado actualizado correctamente');
    } catch (error) {
      console.error('Error changing status:', error);
      Alert.alert('Error', 'Error al cambiar el estado del servicio');
    }
  };

  const { programmings: filteredProgrammings, tourisms: filteredTourisms } = getFilteredData();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Programación</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <MaterialIcons name="tune" size={24} color="#FF9500" />
        </TouchableOpacity>
      </View>

      {/* Content sin ScrollView para evitar anidación */}
      <View style={styles.content}>
        <ServiceList
          programmings={filteredProgrammings}
          tourisms={filteredTourisms}
          loading={loading}
          onStatusChange={handleStatusChange}
          userType={userType}
          refreshing={refreshing}
          onRefresh={onRefresh}
          headerComponent={
            <View>
              {/* Calendar */}
              <CalendarComponent
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />

              {/* Filter Buttons */}
              <FilterButtons
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {/* Status Filters */}
              <StatusFilters
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
              />

              {/* Confirmation Filter */}
              <View style={styles.confirmationContainer}>
                <TouchableOpacity
                  style={[
                    styles.confirmationButton,
                    confirmationFilter === 'Confirmados' && styles.confirmationButtonActive
                  ]}
                  onPress={() => setConfirmationFilter('Confirmados')}
                >
                  <Text style={[
                    styles.confirmationText,
                    confirmationFilter === 'Confirmados' && styles.confirmationTextActive
                  ]}>
                    Confirmados
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmationButton,
                    confirmationFilter === 'No confirmados' && styles.confirmationButtonInactive
                  ]}
                  onPress={() => setConfirmationFilter('No confirmados')}
                >
                  <Text style={[
                    styles.confirmationText,
                    confirmationFilter === 'No confirmados' && styles.confirmationTextInactive
                  ]}>
                    No confirmados
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
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
  content: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  confirmationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: '#3a3a3a',
    alignItems: 'center',
  },
  confirmationButtonActive: {
    backgroundColor: '#FF9500',
  },
  confirmationButtonInactive: {
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#666',
  },
  confirmationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  confirmationTextActive: {
    color: 'white',
  },
  confirmationTextInactive: {
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HomeScreen;