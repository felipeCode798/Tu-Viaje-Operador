import {Dimensions, View, TouchableOpacity, Text} from 'react-native';
import ConfirmadosList from './itemsList/ConfirmadosList';
import { useState, useEffect} from 'react';

const {width, height} = Dimensions.get('window');

interface ProgrammingItem {
  _id: string;
  tipoProducto: 'program' | 'tour';
  statusService: string;
  status: string;
  start: string;
  ida: string;
  tour?: {
    origin: {
      name: string;
    };
    destination: {
      name: string;
    };
  };
  destino?: {
    name: string;
  };
}

interface CardEnterpriceConfirmedProps {
  coordsFinalTurism: (item: ProgrammingItem) => void;
  currrentCoordsTurism: (item: ProgrammingItem) => void;
  infoItemsTurims: (item: ProgrammingItem) => void;
  programming: ProgrammingItem[];
  infoItems: (item: ProgrammingItem) => void;
  currentCoords: (item: ProgrammingItem) => void;
  ModalPermissions: () => void;
  cordsFin: (item: ProgrammingItem) => void;
  refrescar: () => void;
}

const CardEnterpriceConfirmed = ({
  coordsFinalTurism,
  currrentCoordsTurism,
  infoItemsTurims,
  programming,
  infoItems,
  currentCoords,
  ModalPermissions,
  cordsFin,
  refrescar,
}: CardEnterpriceConfirmedProps) => {

  const [confirmados, setConfirmados] = useState<ProgrammingItem[]>([]);

  useEffect(() => {
    const conf: ProgrammingItem[] = [];
    programming.forEach((item) => {
      if (item.tipoProducto === 'program' && item.statusService === 'Confirmado') {
        conf.push(item);
      }
    });

    setConfirmados(conf);
  }, [programming]);

  useEffect(() => {
    console.log('confirmados', confirmados);
  }, [confirmados]);

  const formatTime = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp));
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${period}`;
  };

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (confirmados.length === 0) {
    return (
      <View>
        <Text style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: width * 0.07,
          fontWeight: 'bold',
          color: 'white',
        }}>Servicios Inexistentes</Text>
      </View>
    );
  }

  return (
    <View>
      {programming.map(
        (item, index) =>
          item.statusService === 'Confirmado' && (
            <View key={item._id}>
              {item.tipoProducto === 'program' ? (
                <TouchableOpacity
                  onPress={() => {
                    console.log('===============================================>item', item);
                    infoItems(item);
                    ModalPermissions();
                    cordsFin(item);
                  }}>
                  <ConfirmadosList
                    typeItem="bus" // CORRECCIÓN: Mapear "program" a "bus"
                    status={item.status}
                    colorFont={`${item.status.toLowerCase()}Color` as any}
                    time={formatTime(item.start)}
                    route={
                      item.tour && item.tour.origin && item.tour.destination
                        ? `${truncateText(item.tour.origin.name.toLowerCase(), 10)} - ${truncateText(item.tour.destination.name.toLowerCase(), 10)}`
                        : 'Ruta no disponible'
                    }
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    infoItemsTurims(item);
                    currrentCoordsTurism(item);
                    ModalPermissions();
                    coordsFinalTurism(item);
                    refrescar();
                  }}>
                  <ConfirmadosList
                    typeItem={item.tipoProducto}
                    status={item.status}
                    colorFont={`${item.status.toLowerCase()}Color` as any}
                    time={item.ida ? formatTime(item.ida) : 'Hora no disponible'}
                    route={truncateText(item.destino?.name?.toUpperCase() || 'Destino no disponible', 15)}
                  />
                </TouchableOpacity>
              )}
            </View>
          ),
      )}
    </View>
  );
};

export default CardEnterpriceConfirmed;