import { Dimensions, View, TouchableOpacity, Text } from 'react-native';
import ConfirmadosList from './itemsList/ConfirmadosList';
import { useState, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

interface ProgrammingItem {
  _id: string;
  tipoProducto: 'program' | 'travel' | 'tour'; 
  statusService: string;
  status: string;
  start?: string;
  ida?: string;
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
    let conf: ProgrammingItem[] = [];
    programming.forEach((item) => {
      if (item.tipoProducto === 'program' && item.statusService === 'Confirmado') {
        conf.push(item);
      }
    });

    setConfirmados(conf);
  }, [programming]);

  useEffect(() => {
  }, [confirmados]);

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

  const formatTime = (timestamp: string | undefined, is24Hour: boolean = false): string => {
    if (!timestamp) return '--:--';
    
    const date = new Date(parseInt(timestamp));
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? ' PM' : ' AM';
    
    if (!is24Hour && hours > 12) {
      hours -= 12;
    }
    
    return `${hours}:${minutes}${!is24Hour ? period : ''}`;
  };

  const mapTipoProducto = (tipo: 'program' | 'travel' | 'tour'): 'program' | 'tour' | undefined => {
    if (tipo === 'travel') return 'tour';
    return tipo;
  };

  return (
    <View>
      {programming.map(
        (item, index) =>
          item.statusService === 'Confirmado' && (
            <View key={index}>
              {item.tipoProducto === 'program' ? (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => {
                    infoItems(item);
                    ModalPermissions();
                    cordsFin(item);
                  }}>
                  <ConfirmadosList
                    typeItem={mapTipoProducto(item.tipoProducto)}
                    status={item.status}
                    colorFont={`${item.status.toLowerCase()}Color`}
                    time={formatTime(item.start)}
                    route={
                      item.tour?.origin.name
                        .toLowerCase()
                        .substring(0, Math.floor(width * 0.015)) +
                      ' - ' +
                      item.tour?.destination.name
                        .toLowerCase()
                        .substring(0, Math.floor(width * 0.015))
                    }
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => {
                    infoItemsTurims(item);
                    currrentCoordsTurism(item);
                    ModalPermissions();
                    coordsFinalTurism(item);
                    refrescar();
                  }}>
                  <ConfirmadosList
                    typeItem={mapTipoProducto(item.tipoProducto)}
                    status={item.status}
                    colorFont={`${item.status.toLowerCase()}Color`}
                    time={formatTime(item.ida)}
                    route={item.destino?.name
                      .substring(0, Math.floor(width * 0.039)) // Convertido a número entero
                      .toUpperCase() || ''}
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