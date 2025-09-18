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
import HomeServices from '../../services/homeServices';
import { Programming, Tourism } from '../../types';
import moment from 'moment';

type FilterType = 'Todos' | 'Viajes' | 'Paquetes';
type StatusType = 'Todos' | 'Pendientes' | 'Iniciados' | 'Finalizados' | 'Cancelados';
type ConfirmationType = 'Confirmados' | 'No confirmados';

const HomeScreen: React.FC = () => {
  const { user, userType, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');
  const [activeStatus, setActiveStatus] = useState<StatusType>('Todos');
  const [confirmationFilter, setConfirmationFilter] = useState<ConfirmationType>('Confirmados');
  const [programmings, setProgrammings] = useState<Programming[]>([]);
  const [tourisms, setTourisms] = useState<Tourism[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  // Cargar datos inicial
  const loadData = useCallback(async (showLoader = true) => {
    // Verificar que user no sea null antes de acceder a sus propiedades
    if (!user) {
        console.log('Usuario no autenticado');
        if (showLoader) setLoading(false);
        return;
    }
    
    if (showLoader) setLoading(true);
    
    try {
        const dateString = moment(selectedDate).format('YYYY-MM-DD');
        const timestamp = selectedDate.getTime();

        // Usar user.id con validación
        const userId = user.id || user._id;
        if (!userId) {
          console.error('ID de usuario no disponible');
          Alert.alert('Error', 'ID de usuario no disponible');
          return;
        }

        console.log('Cargando datos para usuario ID:', userId);

        if (userType === 'Conductor') {
          const [programmingsData, tourismsData] = await Promise.all([
              HomeServices.getProgrammingDriver(userId, dateString),
              HomeServices.getTourismsDriver(userId, dateString)
          ]);
          
          setProgrammings(programmingsData);
          setTourisms(tourismsData);
        } else {
          const [programmingsData, tourismsData] = await Promise.all([
              HomeServices.getProgrammingsEnterprise(userId, dateString),
              HomeServices.getTourismByEnterprises(userId, dateString)
          ]);
          
          setProgrammings(programmingsData);
          setTourisms(tourismsData);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
        if (showLoader) setLoading(false);
    }
  }, [user, userType, selectedDate]);

  // Recargar cuando cambie la fecha
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recargar cuando la pantalla esté enfocada
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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

    // Filtrar por confirmación - DEBUG
    console.log('Antes de filtrar por confirmación - Programmings:', filteredProgrammings.map(p => ({id: p._id, status: p.status})));
    console.log('Antes de filtrar por confirmación - Tourisms:', filteredTourisms.map(t => ({id: t._id, status: t.status})));

    // Filtrar por confirmación
    if (confirmationFilter === 'Confirmados') {
      // Cambiar 'confirmed' por 'Progreso' o 'Activo' según tu schema
      filteredProgrammings = filteredProgrammings.filter(p => 
        p.status === 'Progreso' || p.status === 'Activo' || p.status === 'Progreso'
      );
      filteredTourisms = filteredTourisms.filter(t => 
        t.status === 'Progreso' || t.status === 'Activo' || t.status === 'Progreso'
      );
    } else {
      filteredProgrammings = filteredProgrammings.filter(p => 
        p.status !== 'Progreso' && p.status !== 'Activo' && p.status !== 'Progreso'
      );
      filteredTourisms = filteredTourisms.filter(t => 
        t.status !== 'Progreso' && t.status !== 'Activo' && t.status !== 'Progreso'
      );
    }

    console.log('Después de filtrar - Programmings:', filteredProgrammings.length);
    console.log('Después de filtrar - Tourisms:', filteredTourisms.length);
    console.log('=== FIN DEBUG ===');

    return { programmings: filteredProgrammings, tourisms: filteredTourisms };
  }, [programmings, tourisms, activeFilter, activeStatus, confirmationFilter]);

  const handleStatusChange = async (id: string, newStatus: string, type: 'programming' | 'tourism') => {
    try {
      let result;
      if (type === 'programming') {
        result = await HomeServices.changesStatusByProgramming(id, newStatus, 'statusService');
      } else {
        result = await HomeServices.changeStatusTourism(id, newStatus, 'statusService');
      }

      if (result?.status) {
        Alert.alert('Éxito', 'Estado actualizado correctamente');
        await loadData(false); // Recargar datos sin mostrar loader
      } else {
        Alert.alert('Error', result?.message || 'No se pudo actualizar el estado');
      }
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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF9500']}
            tintColor="#FF9500"
          />
        }
      >
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

        {/* Service List */}
        <ServiceList
          programmings={filteredProgrammings}
          tourisms={filteredTourisms}
          loading={loading}
          onStatusChange={handleStatusChange}
          userType={userType}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </ScrollView>
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