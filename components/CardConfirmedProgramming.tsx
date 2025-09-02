import React, {useState} from 'react';
import {Dimensions, View, TouchableOpacity} from 'react-native';
import ConfirmadosList from './itemsList/ConfirmadosList';
import {Button} from 'react-native-paper';
import { ModalTableProgrammings } from './ModalTableProgrammings';
import { ProgrammingItem, TurismItem, TurismHandler } from '../types';

const {width, height} = Dimensions.get('window');

interface CardConfirmedProgrammingProps {
  turism: TurismItem;
  programming: ProgrammingItem[];
  infoItems: (item: ProgrammingItem) => void;
  currentCoords: (item: ProgrammingItem) => void;
  ModalPermissions: () => void;
  cordsFin: (item: ProgrammingItem) => void;
  refrescar: () => void;
}

const CardConfirmedProgramming = ({
  turism,
  programming,
  infoItems,
  currentCoords,
  ModalPermissions,
  cordsFin,
  refrescar,
}: CardConfirmedProgrammingProps) => {
  programming.find(item => {
    if (
      item.tipoProducto === 'program' &&
      item.statusService === 'Confirmado'
    ) {
      console.log('item', item);
    }
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeModalTour, setActiveModalTour] = useState(false);

  const handleConfirm = (item: ProgrammingItem) => {
    console.log('Confirmar', item);
    setActiveModalTour(true);
  };

  const handleReject = (item: ProgrammingItem) => {
    console.log('Rechazar', item);
    ModalPermissions();
    infoItems(item);
    currentCoords(item);
    cordsFin(item);
    refrescar();
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

  const formatTime = (timestamp: string, isTour: boolean = false) => {
    const date = new Date(parseInt(timestamp));
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${period}`;
  };

  // Función para truncar texto con límite de caracteres
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <View style={{zIndex: 1}}>
      {programming.map((item, index) =>
        item.tipoProducto === 'program' &&
        item.statusService === 'Confirmado' ? (
          <View key={item._id}>
            <TouchableOpacity
              onPress={() => {
                const newIndex = activeIndex === index ? null : index;
                setActiveIndex(newIndex);
                console.log('Active Index:', newIndex); 
              }}>
              <ConfirmadosList
                typeItem="bus" // CORRECCIÓN: Cambiado de "program" a "bus"
                status={item.status.toLowerCase()}
                colorFont={`${item.status.toLowerCase()}Color` as any}
                time={formatTime(item.start)}
                route={
                  item.tour && item.tour.origin && item.tour.destination
                    ? `${truncateText(item.tour.origin.name.toLowerCase(), 10)} - ${truncateText(item.tour.destination.name.toLowerCase(), 10)}`
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
                item={item as any} // CORRECCIÓN: Cast a any si hay incompatibilidad de tipos
              />
            ) : null}
          </View>
        ) : (
          item.tipoProducto === 'tour' &&
          turism.estadoDelProductoTurismo === 'Confirmado' && (
            <View key={item._id}>
              <TouchableOpacity
                onPress={() => {
                  ModalPermissions();
                  infoItems(item);
                  currentCoords(item);
                  cordsFin(item);
                  refrescar();
                }}>
                <ConfirmadosList
                  typeItem="tour"
                  status={item.status.toLowerCase()}
                  colorFont={`${item.status.toLowerCase()}Color` as any}
                  time={item.ida ? formatTime(item.ida, true) : 'Hora no disponible'}
                  route={item.destino?.name ? truncateText(item.destino.name, 15) : 'Destino no disponible'}
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

export default CardConfirmedProgramming;