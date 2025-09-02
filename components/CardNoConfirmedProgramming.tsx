import React, {useState} from 'react';
import {Dimensions, View, TouchableOpacity, Text} from 'react-native';
import ConfirmadosList from './itemsList/ConfirmadosList';
import {Button} from 'react-native-paper';
import {ModalTableProgrammings} from './ModalTableProgrammings';

const {width, height} = Dimensions.get('window');

// Definir interfaces base
interface TourInfo {
  origin: {
    name: string;
  };
  destination: {
    name: string;
  };
}

interface ProgrammingItem {
  _id: string;
  tipoProducto: 'program' | 'tour';
  statusService: string;
  status: string;
  start: string;
  ida: string;
  tour?: TourInfo;
  destino?: {
    name: string;
  };
  enterprise?: string;
  driverInfo?: string;
  end?: string;
}

interface TurismItem {
  estadoDelProductoTurismo: string;
}

interface Item extends ProgrammingItem {
  enterprise: string;
  driverInfo: string;
  end: string;
  tour?: TourInfo; // Hacer tour opcional para consistencia
}

interface CardNoConfirmedProgrammingProps {
  turism: TurismItem;
  programming: ProgrammingItem[];
  ModalPermissions: () => void;
  infoItems: (item: Item) => void;
  currentCoords: (item: Item) => void;
  refrescar: () => void;
  cordsFin: (item: Item) => void;
}

const CardNoConfirmedProgramming = ({
  turism,
  programming,
  ModalPermissions,
  infoItems,
  currentCoords,
  refrescar,
  cordsFin,
}: CardNoConfirmedProgrammingProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeModalTour, setActiveModalTour] = useState(false);

  // Función para convertir ProgrammingItem a Item
  const convertToItem = (programmingItem: ProgrammingItem): Item => {
    return {
      ...programmingItem,
      enterprise: programmingItem.enterprise || '',
      driverInfo: programmingItem.driverInfo || '',
      end: programmingItem.end || ''
    };
  };

  const handleConfirm = (item: ProgrammingItem) => {
    console.log('Confirmar', item);
    setActiveModalTour(true);
  };

  const handleReject = (item: ProgrammingItem) => {
    console.log('Rechazar', item);
    ModalPermissions();
    infoItems(convertToItem(item));
    currentCoords(convertToItem(item));
    cordsFin(convertToItem(item));
    refrescar();
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp));
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${period}`;
  };

  const _renderContent = (item: ProgrammingItem) => (
    <View
      style={{
        overflow: 'visible',
        paddingVertical: 5,
        borderRadius: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          backgroundColor: '#000000',
          padding: 5,
          borderRadius: 15,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          width: width * 0.9,
          height: height * 0.06,
          alignItems: 'center',
        }}>
        <Button
          mode="contained"
          onPress={() => handleConfirm(item)}
          style={{
            backgroundColor: 'orange',
            borderRadius: 5,
            width: width * 0.3,
            height: height * 0.04,
            marginVertical: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          labelStyle={{
            color: 'white',
            fontSize: height * 0.017,
            height: height * 0.025,
          }}>
          Planilla
        </Button>

        <Button
          mode="outlined"
          onPress={() => handleReject(item)}
          style={{
            backgroundColor: '#2F2F2F',
            borderRadius: 5,
            width: width * 0.3,
            height: height * 0.04,
            marginVertical: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          labelStyle={{
            color: 'white',
            fontSize: height * 0.017,
            height: height * 0.025,
          }}>
          Mapa
        </Button>
      </View>
    </View>
  );

  return (
    <View>
      {programming.map((item, index) =>
        item.tipoProducto === 'program' &&
        item.statusService === 'NoConfirmado' ? (
          <View key={item._id}>
            <TouchableOpacity
              onPress={() => {
                const newIndex = activeIndex === index ? null : index;
                setActiveIndex(newIndex);
                console.log('Active Index:', newIndex);
              }}>
              <ConfirmadosList
                typeItem={item.tipoProducto === 'program' ? 'bus' : item.tipoProducto}
                status={item.status.toLowerCase()}
                colorFont={`${item.status.toLowerCase()}Color` as any}
                time={formatTime(item.start)}
                route={
                  item.tour && item.tour.origin && item.tour.destination
                    ? `${item.tour.origin.name.toLowerCase().substring(0, Math.floor(width * 0.015))} - ${item.tour.destination.name.toLowerCase().substring(0, Math.floor(width * 0.015))}`
                    : 'Ruta no disponible'
                }
                key={item._id}
              />
            </TouchableOpacity>

            {activeIndex === index && _renderContent(item)}
            {activeModalTour && activeIndex === index ? (
              <ModalTableProgrammings
                visible={activeModalTour}
                onClose={() => setActiveModalTour(false)}
                item={item}
              />
            ) : null}
          </View>
        ) : (
          item.tipoProducto === 'tour' &&
          turism.estadoDelProductoTurismo === 'NoConfirmado' && (
            <View key={item._id}>
              <TouchableOpacity
                onPress={() => {
                  ModalPermissions();
                  infoItems(convertToItem(item));
                  currentCoords(convertToItem(item));
                  cordsFin(convertToItem(item));
                  refrescar();
                }}>
                <ConfirmadosList
                  typeItem={item.tipoProducto}
                  status={item.status.toLowerCase()}
                  colorFont={`${item.status.toLowerCase()}Color` as any}
                  time={item.ida ? formatTime(item.ida) : 'Hora no disponible'}
                  route={item.destino?.name?.substring(0, Math.floor(width * 0.039)) || 'Destino no disponible'}
                  key={item._id}
                />
              </TouchableOpacity>
            </View>
          )
        )
      )}
    </View>
  );
};

export default CardNoConfirmedProgramming;