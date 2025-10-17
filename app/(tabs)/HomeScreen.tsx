import { MaterialIcons } from '@expo/vector-icons';
import 'moment/locale/es';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CalendarComponent from '../../components/CalendarComponent';
import FilterButtons from '../../components/FilterButtons';
import FloatButtonModal from '../../components/FloatButtonModal';
import ServiceList from '../../components/ServiceList';
import StatusFilters from '../../components/StatusFilters';
import { useAuth } from '../../contexts/AuthContext';
import HomeServices from '../../services/homeServices';
import { Programming, Tourism } from '../../types';

const { width, height } = Dimensions.get('window');

type FilterType = 'Todos' | 'Viajes' | 'Paquetes';
type StatusType = 'Todos' | 'Pendientes' | 'Iniciados' | 'Finalizados' | 'Cancelados';
type ConfirmationType = 'Confirmados' | 'No confirmados';

const HomeScreen: React.FC = () => {
  const { user, userType, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');
  const [activeStatus, setActiveStatus] = useState<StatusType>('Todos');
  const [confirmationFilter, setConfirmationFilter] = useState<ConfirmationType>('No confirmados');
  const [allProgrammings, setAllProgrammings] = useState<Programming[]>([]);
  const [allTourisms, setAllTourisms] = useState<Tourism[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [showMapsModal, setShowMapsModal] = useState<boolean>(false);
  const [showPlanillaModal, setShowPlanillaModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  console.log('User en HomeScreen:', user);
  console.log('UserType en HomeScreen:', userType);
  console.log('🔘 Should show float button:', userType === 'Empresa');

  const updateServiceStatus = useCallback((id: string, newStatus: string, newStatusService?: string, type: 'programming' | 'tourism' = 'programming') => {
    console.log('🔄 Actualizando estado local:', { id, newStatus, newStatusService, type });
    
    if (type === 'programming') {
      setAllProgrammings(prev => 
        prev.map(item => 
          item._id === id 
            ? { 
                ...item, 
                status: newStatus,
                ...(newStatusService && { statusService: newStatusService })
              }
            : item
        )
      );
    } else {
      setAllTourisms(prev => 
        prev.map(item => 
          item._id === id 
            ? { 
                ...item, 
                status: newStatus,
                ...(newStatusService && { statusService: newStatusService })
              }
            : item
        )
      );
    }
  }, []);

  // Función para formatear fechas
  const formatDate = useCallback((timestamp: string | number): string => {
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
  }, []);

  // Función para procesar los datos y formatear las fechas
  const processData = useCallback((data: any[]) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => {
      const processedItem = { ...item };
      
      if (item.start) {
        processedItem.startFormatted = formatDate(item.start);
      }
      if (item.end) {
        processedItem.endFormatted = formatDate(item.end);
      }
      if (item.ida) {
        processedItem.idaFormatted = formatDate(item.ida);
      }
      if (item.vuelta) {
        processedItem.vueltaFormatted = formatDate(item.vuelta);
      }
      
      return processedItem;
    });
  }, [formatDate]);

  // Función para cargar datos desde los servicios
  const loadData = useCallback(async (showLoader = true) => {
    if (!user || !userType) {
      console.warn('Usuario o tipo de usuario no disponible');
      if (showLoader) setLoading(false);
      return;
    }

    console.log('🔄 loadData called', { 
      userType, 
      userId: user?.idUser || user?._id,
      selectedDate: selectedDate.toISOString() 
    });
    
    if (showLoader) setLoading(true);
    
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 3);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 3);
      endDate.setHours(23, 59, 59, 999);
      
      console.log('📅 Rango de fechas para carga:', {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      
      if (userType === 'Conductor') {
        console.log('🚗 Loading data for Driver...');
        
        const programmingData = await HomeServices.getProgrammingDriver(
          user.idUser || user._id, 
          startDate.getTime().toString()
        );
        
        console.log('📊 Programming data received:', programmingData);
        
        const processedProgrammings = processData(programmingData || []);
        setAllProgrammings(processedProgrammings);

        const tourismDate = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
        console.log('🎯 Tourism date:', tourismDate);
        
        const tourismData = await HomeServices.getTourismsDriver(
          user.idUser || user._id, 
          tourismDate
        );
        
        console.log('🏨 Tourism data received:', tourismData);
        
        const processedTourisms = processData(tourismData || []);
        setAllTourisms(processedTourisms);
        
      } else if (userType === 'Empresa') {
        console.log('🏢 Loading data for Enterprise...');
        
        const programmingData = await HomeServices.getProgrammingsEnterprise(
          user.idUser || user._id, 
          startDate.getTime().toString()
        );
        
        console.log('📊 Enterprise programming data:', programmingData);
        
        const processedProgrammings = processData(programmingData || []);
        setAllProgrammings(processedProgrammings);

        const tourismData = await HomeServices.getTourismByEnterprises(
          user.idUser || user._id, 
          startDate.getTime().toString()
        );
        
        console.log('🏨 Enterprise tourism data:', tourismData);
        
        const processedTourisms = processData(tourismData || []);
        setAllTourisms(processedTourisms);
      }
      
      console.log('✅ Data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', 'Error al cargar los datos: ' + ('Error desconocido'));
    } finally {
      if (showLoader) {
        setLoading(false);
        console.log('🏁 Loading finished');
      }
    }
  }, [selectedDate, user, userType, processData]);

  // Cargar datos cuando cambie la fecha
  useEffect(() => {
    console.log('🔃 useEffect triggered - Loading data...');
    loadData();
  }, [selectedDate, loadData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  }, [loadData]);

  // Filtrar datos según los filtros aplicados
  const getFilteredData = useCallback(() => {
    console.log('=== DEBUG FILTRO ===');
    console.log('Programmings originales:', allProgrammings.length);
    console.log('Tourisms originales:', allTourisms.length);
    console.log('Filtro activo:', activeFilter);
    console.log('Estado activo:', activeStatus);
    console.log('Confirmación:', confirmationFilter);
    console.log('Fecha seleccionada:', selectedDate.toISOString());
      
    let filteredProgrammings = [...allProgrammings];
    let filteredTourisms = [...allTourisms];

    // Filtrar por fecha seleccionada
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);

    console.log('📅 Rango de fecha seleccionada:', {
      start: selectedDateStart.getTime(),
      end: selectedDateEnd.getTime()
    });

    // Filtrar programaciones por fecha exacta
    filteredProgrammings = filteredProgrammings.filter(programming => {
      if (!programming.start) return false;
      
      const programStartTime = parseInt(programming.start.toString(), 10);
      
      if (isNaN(programStartTime) || programStartTime <= 0) {
        return false;
      }
      
      const programDate = new Date(programStartTime);
      const programDateOnly = new Date(programDate.getFullYear(), programDate.getMonth(), programDate.getDate());
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      const isSameDate = programDateOnly.getTime() === selectedDateOnly.getTime();
      
      console.log('📊 Programación fecha comparación:', {
        id: programming._id,
        programStartTime: programStartTime,
        programDate: programDate.toISOString(),
        programDateOnly: programDateOnly.toISOString(),
        selectedDateOnly: selectedDateOnly.toISOString(),
        isSameDate: isSameDate
      });

      return isSameDate;
    });

    // Filtrar turismos por fecha exacta
    filteredTourisms = filteredTourisms.filter(tourism => {
      if (!tourism.ida) return false;
      
      const tourismStartTime = parseInt(tourism.ida.toString(), 10);
      
      if (isNaN(tourismStartTime) || tourismStartTime <= 0) {
        return false;
      }
      
      const tourismDate = new Date(tourismStartTime);
      const tourismDateOnly = new Date(tourismDate.getFullYear(), tourismDate.getMonth(), tourismDate.getDate());
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      return tourismDateOnly.getTime() === selectedDateOnly.getTime();
    });

    console.log('📅 Después de filtrar por fecha - Programmings:', filteredProgrammings.length);
    console.log('📅 Después de filtrar por fecha - Tourisms:', filteredTourisms.length);

    // Filtrar por tipo
    if (activeFilter === 'Viajes') {
      filteredTourisms = [];
      console.log('📍 Filtrado: Mostrando solo Viajes');
    } else if (activeFilter === 'Paquetes') {
      filteredProgrammings = [];
      console.log('📍 Filtrado: Mostrando solo Paquetes');
    }

    // Filtrar por estado
    if (activeStatus !== 'Todos') {
      const statusMap = {
        'Pendientes': 'Pendiente',
        'Iniciados': 'Progreso',
        'Finalizados': 'Finalizado',
        'Cancelados': 'Cancelado'
      };
      
      const targetStatus = statusMap[activeStatus];
      console.log('🎯 Filtrando por estado:', targetStatus);
      
      filteredProgrammings = filteredProgrammings.filter(p => p.status === targetStatus);
      filteredTourisms = filteredTourisms.filter(t => t.status === targetStatus);
    }

    // Filtrar por confirmación
    if (confirmationFilter === 'Confirmados') {
      console.log('✅ Mostrando Confirmados');
      filteredProgrammings = filteredProgrammings.filter(p => 
        p.statusService === 'Confirmado'
      );
      filteredTourisms = filteredTourisms.filter(t => 
        t.statusService === 'Confirmado'
      );
    } else {
      console.log('❌ Mostrando No Confirmados');
      filteredProgrammings = filteredProgrammings.filter(p => 
        p.statusService !== 'Confirmado'
      );
      filteredTourisms = filteredTourisms.filter(t => 
        t.statusService !== 'Confirmado'
      );
    }

    console.log('📊 Después de todos los filtros - Programmings:', filteredProgrammings.length);
    console.log('📊 Después de todos los filtros - Tourisms:', filteredTourisms.length);
    
    if (filteredProgrammings.length > 0) {
      console.log('📋 Programmings filtrados:', filteredProgrammings.map(p => ({
        id: p._id,
        status: p.status,
        statusService: p.statusService,
        start: p.start,
        startFormatted: p.startFormatted
      })));
    }
    
    console.log('=== FIN DEBUG ===');

    return { programmings: filteredProgrammings, tourisms: filteredTourisms };
  }, [allProgrammings, allTourisms, activeFilter, activeStatus, confirmationFilter, selectedDate]);

  // Función para cambiar el estado de un servicio
  const handleStatusChange = useCallback(async (id: string, newStatus: string, type: 'programming' | 'tourism') => {
    try {
      console.log('🔄 Iniciando cambio:', { id, newStatus, type });
      
      // Determinar si es una confirmación
      const isConfirmation = newStatus === 'Confirmado' || newStatus === 'NoConfirmado';
      
      let result;
      
      if (isConfirmation) {
        console.log('🎯 Esto es una CONFIRMACIÓN - Enviar al backend');
        
        // Validar que solo empresas puedan confirmar
        if (userType !== 'Empresa') {
          Alert.alert('Permiso Denegado', 'Solo las empresas pueden confirmar servicios.');
          return;
        }
        
        // Enviar confirmación al backend
        const userTypeForServer = userType === 'Conductor' ? 'Conductor' : 'Empresa';
        if (type === 'programming') {
          result = await HomeServices.changesStatusByProgramming(id, newStatus, userTypeForServer, true);
        } else {
          result = await HomeServices.changeStatusTourism(id, newStatus, userTypeForServer, true);
        }
        
      } else {
        console.log('🎯 Esto es un CAMBIO DE ESTADO normal - Enviar al backend');
        
        // Lógica existente para cambios de estado normales
        const userTypeForServer = userType === 'Conductor' ? 'Conductor' : 'Empresa';
        if (type === 'programming') {
          result = await HomeServices.changesStatusByProgramming(id, newStatus, userTypeForServer, false);
        } else {
          result = await HomeServices.changeStatusTourism(id, newStatus, userTypeForServer, false);
        }
      }
      
      console.log('📩 Resultado:', result);
      
      if (result?.status === 'OK') {
        // ACTUALIZACIÓN DEL ESTADO LOCAL INMEDIATA
        if (type === 'programming') {
          setAllProgrammings(prev => 
            prev.map(item => 
              item._id === id 
                ? { 
                    ...item, 
                    // Para confirmaciones, cambiar statusService; para estados normales, cambiar status
                    ...(isConfirmation 
                      ? { statusService: newStatus }
                      : { status: newStatus }
                    )
                  }
                : item
            )
          );
        } else {
          setAllTourisms(prev => 
            prev.map(item => 
              item._id === id 
                ? { 
                    ...item, 
                    ...(isConfirmation 
                      ? { statusService: newStatus }
                      : { status: newStatus }
                    )
                  }
                : item
            )
          );
        }
        
        // MOSTRAR MENSAJE DE ÉXITO
        Alert.alert('✅ Éxito', result?.message || 'Operación completada correctamente');
        
        // Recargar datos después de un breve delay para asegurar consistencia
        setTimeout(() => {
          loadData(false);
        }, 500);
        
      } else {
        throw new Error(result?.message || 'Error en la operación');
      }
      
    } catch (error: any) {
      console.error('💥 Error:', error);
      Alert.alert('❌ Error', error.message || 'Error de conexión');
      
      // Recargar datos para restaurar estado consistente
      setTimeout(() => {
        loadData(false);
      }, 500);
    }
  }, [loadData, userType]);

  // Función para abrir modal de planilla
  const handleOpenPlanilla = useCallback((service: any) => {
    setSelectedService(service);
    setShowPlanillaModal(true);
  }, []);

  // Función para abrir modal de mapa
  const handleOpenMap = useCallback((service: any) => {
    setSelectedService(service);
    setShowMapsModal(true);
  }, []);

  // Obtener datos filtrados
  const { programmings: filteredProgrammings, tourisms: filteredTourisms } = getFilteredData();

  // Render condicional DESPUÉS de todos los hooks
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Programación</Text>
        <TouchableOpacity 
          style={styles.filterIcon}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons name="tune" size={24} color="#FF9500" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View>
          <CalendarComponent
            selectedDate={selectedDate}
            onDateChange={(newDate) => {
              console.log('📅 Date changed to:', newDate);
              setSelectedDate(newDate);
            }}
          />

          {showFilters && (
            <>
              <FilterButtons
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              <StatusFilters
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
              />
            </>
          )}

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

        <ServiceList
          programmings={filteredProgrammings}
          tourisms={filteredTourisms}
          loading={loading}
          onStatusChange={handleStatusChange}
          onOpenPlanilla={handleOpenPlanilla}
          onOpenMap={handleOpenMap}
          refreshing={refreshing}
          onRefresh={onRefresh}
          userType={userType}
        />
      </View>

      {/* ✅ Botón flotante para empresas - POSICIÓN CORREGIDA */}
      {userType === 'Empresa' && <FloatButtonModal />}

      {/* Modal de Planilla */}
      <Modal
        visible={showPlanillaModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlanillaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Planilla de Servicio</Text>
              <TouchableOpacity onPress={() => setShowPlanillaModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {selectedService && (
              <View style={styles.modalBody}>
                <Text style={styles.serviceInfo}>
                  Servicio: {selectedService._id}
                </Text>
                <Text style={styles.serviceInfo}>
                  Estado: {selectedService.status}
                </Text>
                {/* Aquí puedes agregar más información de la planilla */}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Mapa */}
      <Modal
        visible={showMapsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMapsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mapa del Servicio</Text>
              <TouchableOpacity onPress={() => setShowMapsModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {selectedService && (
              <View style={styles.modalBody}>
                <Text style={styles.serviceInfo}>
                  Mostrando mapa para el servicio: {selectedService._id}
                </Text>
                {/* Aquí integrarías tu componente de mapa */}
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    paddingVertical: 10,
  },
  serviceInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});

export default HomeScreen;