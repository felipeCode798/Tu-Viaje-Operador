import { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import ChatServices from '../../../tuviaje/Cliente/Movil/Hibrida/tu-viaje-operador/services/ChatServices';
import { formatDate, formValidationDateHour12 } from '../../../tuviaje/Cliente/Movil/Hibrida/tu-viaje-operador/utils/DateFormat';

const {height, width} = Dimensions.get('window');

interface Passenger {
  names: string;
  lastnames: string;
  numberId: string;
  phone: string;
  email: string;
}

interface Item {
  _id: string;
  tour: {
    origin: {
      name: string;
    };
    destination: {
      name: string;
    };
  };
  enterprise: {
    name: string;
    nit: string;
  };
  driverInfo: {
    names: string;
    lastName: string;
  };
  start: string;
  end: string;
}

interface ModalTableProgrammingsProps {
  visible: boolean;
  onClose: () => void;
  item: Item;
}

export const ModalTableProgrammings = ({visible, onClose, item}: ModalTableProgrammingsProps) => {
  const [data, setData] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ChatServices.getPassengers(item._id, 'Programming')
      .then((res: Passenger[]) => {
        setData(res);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [item._id]);

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
            {item.tour ? `${item.tour.origin.name} - ${item.tour.destination.name}` : 'Ruta no disponible'}
          </Text>

          <View style={styles.containerText}>
            <View style={styles.itemRow}>
              <Text style={styles.modalText}>
                Empresa: {item.enterprise?.name?.substring(0, 10) || 'No disponible'}
              </Text>
              <Text style={styles.modalText}>Nit: {item.enterprise?.nit || 'No disponible'}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.modalText}>
                Ruta: {item.tour ? `${item.tour.origin.name} - ${item.tour.destination.name}` : 'No disponible'}
              </Text>
              <Text style={styles.modalText}>
                Conductor: {item.driverInfo ? `${item.driverInfo.names.substring(0, 6)} ${item.driverInfo.lastName.substring(0, 5)}` : 'No asignado'}
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
                {formValidationDateHour12(item.start)}
              </Text>
              <Text style={styles.modalText}>
                {formValidationDateHour12(item.end)}
              </Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#D88C0C" style={styles.loader} />
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
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>
                        {passenger.names} {passenger.lastnames}
                      </Text>
                      <Text style={styles.tableCell}>{passenger.numberId}</Text>
                      <Text style={styles.tableCell}>{passenger.phone}</Text>
                      <Text style={styles.tableCell}>{passenger.email}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.TitleTatlecustom}>No hay pasajeros</Text>
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
    height: height * 0.99,
    backgroundColor: '#4F4F4F',
    borderRadius: 10,
    width: width * 0.99,
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
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'space-around',
  },
  modalTextTitle: {
    fontSize: height * 0.02,
    marginBottom: 15,
    backgroundColor: '#0F0F0F',
    width: width * 0.99,
    textAlign: 'center',
    color: 'white',
    height: height * 0.08,
    textAlignVertical: 'center',
  },
  TitleTatlecustom: {
    fontSize: height * 0.02,
    marginBottom: 15,
    backgroundColor: 'transparent',
    width: width * 0.99,
    textAlign: 'center',
    color: 'white',
    height: height * 0.08,
    textAlignVertical: 'center',
  },
  modalTextTitleRuta: {
    fontSize: height * 0.02,
    marginBottom: 10,
    backgroundColor: 'transparent',
    width: width * 0.99,
    textAlign: 'center',
    color: '#D88C0C',
    textAlignVertical: 'center',
    padding: 0,
    margin: 0,
  },
  modalText: {
    fontSize: height * 0.015,
    marginBottom: 15,
    backgroundColor: 'transparent',
    width: width * 0.4,
    color: 'white',
  },
  button: {
    marginTop: 5,
    backgroundColor: '#D88C0C',
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
    alignItems: 'center',
  },
  tableContainer: {
    width: '95%',
    marginBottom: 2,
    backgroundColor: '#939393',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    paddingVertical: 8,
  },
  tableHeaderText: {
    fontSize: height * 0.015,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: height * 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: height * 0.012,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
});