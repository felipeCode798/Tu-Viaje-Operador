import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import ChatServices from '../services/ChatServices';
import { Programming } from '../types';

const { height, width } = Dimensions.get('window');

interface ModalTableProgrammingsProps {
  visible: boolean;
  onClose: () => void;
  item: Programming;
}

interface Passenger {
  _id: string;
  names: string;
  lastnames: string;
  numberId: string;
  phone: string;
  email: string;
  cel?: string;
  selectId?: string;
  selectOrigen?: string;
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
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
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

const ModalTableProgrammings: React.FC<ModalTableProgrammingsProps> = ({
  visible,
  onClose,
  item,
}) => {
  const [data, setData] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPassengers = async () => {
      if (visible && item._id) {
        try {
          setIsLoading(true);
          setError(null);
          
          const passengers = await ChatServices.getPassengers(item._id, 'Programming');
          
          console.log('📊 Pasajeros recibidos:', passengers);
          
          setData(passengers || []);
        } catch (err) {
          console.error('Error cargando pasajeros:', err);
          setError('Error al cargar los pasajeros');
          setData([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setData([]);
        setIsLoading(true);
        setError(null);
      }
    };

    loadPassengers();
  }, [visible, item._id]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.modalTextTitle}>Planilla de Pasajeros</Text>
          <Text style={styles.modalTextTitleRuta}>
            {item.tour?.origin?.name} - {item.tour?.destination?.name}
          </Text>

          <View style={styles.containerText}>
            <View style={styles.itemRow}>
              <Text style={styles.modalText}>
                Empresa: {item.enterprise?.name?.substring(0, 15) || 'N/A'}
              </Text>
              <Text style={styles.modalText}>
                Nit: {item.enterprise?.nit || 'N/A'}
              </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.modalText}>
                Ruta: {item.tour?.origin?.name} - {item.tour?.destination?.name}
              </Text>
              <Text style={styles.modalText}>
                Conductor: {item.driverInfo?.names?.substring(0, 8) || 'N/A'}{' '}
                {item.driverInfo?.lastName?.substring(0, 7) || ''}
              </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.modalText}>Fecha de Salida</Text>
              <Text style={styles.modalText}>Fecha de regreso</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.modalText}>{formatDate(item.start)}</Text>
              <Text style={styles.modalText}>{formatDate(item.end)}</Text>
            </View>

            <View style={styles.itemRow}>
              <Text style={styles.modalText}>Hora de salida</Text>
              <Text style={styles.modalText}>Hora de regreso</Text>
            </View>

            <View style={styles.itemRow}>
              <Text style={styles.modalText}>
                {formatTime(item.start)}
              </Text>
              <Text style={styles.modalText}>
                {formatTime(item.end)}
              </Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#D88C0C" style={styles.loader} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Nombres</Text>
                <Text style={styles.tableHeaderText}>Identificación</Text>
                <Text style={styles.tableHeaderText}>Teléfono</Text>
                <Text style={styles.tableHeaderText}>Email</Text>
              </View>
              <ScrollView style={styles.tableBody}>
                {data && data.length > 0 ? (
                  data.map((passenger, index) => (
                    <View key={passenger._id || index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>
                        {passenger.names} {passenger.lastnames}
                      </Text>
                      <Text style={styles.tableCell}>{passenger.numberId || 'N/A'}</Text>
                      <Text style={styles.tableCell}>{passenger.phone || passenger.cel || 'N/A'}</Text>
                      <Text style={styles.tableCell}>{passenger.email || 'N/A'}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.TitleTatlecustom}>No hay pasajeros registrados</Text>
                )}
              </ScrollView>
            </View>
          )}

          <Button mode="contained" onPress={onClose} style={styles.button}>
            Cerrar
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    height: height * 0.95,
    backgroundColor: '#4F4F4F',
    borderRadius: 10,
    width: width * 0.95,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  containerText: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    height: height * 0.25,
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  modalTextTitle: {
    fontSize: height * 0.025,
    marginBottom: 15,
    backgroundColor: '#0F0F0F',
    width: width * 0.95,
    textAlign: 'center',
    color: 'white',
    height: height * 0.08,
    textAlignVertical: 'center',
    fontWeight: 'bold',
  },
  TitleTatlecustom: {
    fontSize: height * 0.02,
    marginBottom: 15,
    backgroundColor: 'transparent',
    width: width * 0.95,
    textAlign: 'center',
    color: 'white',
    height: height * 0.08,
    textAlignVertical: 'center',
  },
  modalTextTitleRuta: {
    fontSize: height * 0.02,
    marginBottom: 10,
    backgroundColor: 'transparent',
    width: width * 0.95,
    textAlign: 'center',
    color: '#D88C0C',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    padding: 5,
  },
  modalText: {
    fontSize: height * 0.016,
    marginBottom: 8,
    backgroundColor: 'transparent',
    width: width * 0.4,
    color: 'white',
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#D88C0C',
    width: '80%',
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.85,
    alignItems: 'center',
  },
  tableContainer: {
    width: '95%',
    flex: 1,
    marginBottom: 10,
    backgroundColor: '#939393',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontSize: height * 0.016,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableBody: {
    maxHeight: height * 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#666',
    paddingVertical: 10,
    backgroundColor: '#7A7A7A',
  },
  tableCell: {
    fontSize: height * 0.014,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  loader: {
    marginVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ModalTableProgrammings;