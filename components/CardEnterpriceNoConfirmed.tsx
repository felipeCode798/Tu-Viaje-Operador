import React from 'react';
import {Dimensions, View, TouchableOpacity, Text} from 'react-native';
import ConfirmadosList from './itemsList/ConfirmadosList';
import NoConfirmadosList from './itemsList/NoConfirmados';
import {useState, useEffect} from 'react';

const {width, height} = Dimensions.get('window');

interface ProgrammingItem {
  _id: string;
  tipoProducto: 'program' | 'tour';
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

interface CardEnterpriceNoConfirmedProps {
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

const CardEnterpriceNoConfirmed = ({
  coordsFinalTurism,
  currrentCoordsTurism,
  infoItemsTurims,
  programming,
  infoItems,
  currentCoords,
  ModalPermissions,
  cordsFin,
  refrescar,
}: CardEnterpriceNoConfirmedProps) => {
  const [noConfirmados, setNoConfirmados] = useState<ProgrammingItem[]>([]);

  useEffect(() => {
    console.log('PROGRAMMING', programming);
    let conf: ProgrammingItem[] = [];

    programming.forEach((item) => {
      if (
        (item.tipoProducto === 'program' || item.tipoProducto === 'tour') &&
        item.statusService === 'NoConfirmado'
      ) {
        conf.push(item);
      }
    });
    setNoConfirmados(conf);
  }, [programming]);

  const formatTime = (timestamp: string | undefined): string => {
    if (!timestamp) return '--:--';
    
    const date = new Date(parseInt(timestamp));
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? ' PM' : ' AM';
    
    if (hours > 12) {
      hours -= 12;
    }
    
    return `${hours}:${minutes}${period}`;
  };

  if (noConfirmados.length === 0) {
    return (
      <View>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: width * 0.07,
            fontWeight: 'bold',
            color: 'white',
          }}>
          Servicios Inexistentes
        </Text>
      </View>
    );
  }

  return (
    <View>
      {noConfirmados.map(
        (item, index) =>
          item.statusService === 'NoConfirmado' && (
            <View key={index}>
              {item.tipoProducto === 'program' ? (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => {
                    infoItems(item);
                    currentCoords(item);
                    ModalPermissions();
                    cordsFin(item);
                    refrescar();
                  }}>
                  <ConfirmadosList
                    typeItem={item.tipoProducto}
                    status={item.status}
                    colorFont={`${item.status.toLowerCase()}Color`}
                    time={formatTime(item.start)}
                    route={
                      (item.tour?.origin.name || '')
                        .toLowerCase()
                        .substring(0, Math.floor(width * 0.015)) +
                      ' - ' +
                      (item.tour?.destination.name || '')
                        .toLowerCase()
                        .substring(0, Math.floor(width * 0.015))
                    }
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => {
                    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!HOLA AQUI ESTOY" , programming);          
                    infoItemsTurims(item);
                    currrentCoordsTurism(item);
                    ModalPermissions();
                    coordsFinalTurism(item);
                    refrescar();
                  }}>
                  <ConfirmadosList
                    typeItem={item.tipoProducto}
                    status={item.status}
                    colorFont={`${item.status.toLowerCase()}Color`}
                    time={formatTime(item.ida)}
                    route={(item.destino?.name || '')
                      .substring(0, Math.floor(width * 0.039))
                      .toUpperCase()}
                  />
                </TouchableOpacity>
              )}
            </View>
          ),
      )}
    </View>
  );
};

export default CardEnterpriceNoConfirmed;