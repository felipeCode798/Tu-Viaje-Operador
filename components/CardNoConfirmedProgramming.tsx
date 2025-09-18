import React, { useState } from 'react';
import { Dimensions, View, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import ConfirmadosList from './itemsList/ConfirmadosList';
import ModalTableProgrammings from './ModalTableProgrammings';
import { Programming, Tourism, isProgramming, isTourism } from '../types';

const { width, height } = Dimensions.get('window');

interface CardNoConfirmedProgrammingProps {
  turism: any;
  programming: Array<Programming | Tourism>;
  ModalPermissions: () => void;
  infoItems: (item: any) => void;
  currentCoords: (item: any) => void;
  refrescar: () => void;
  cordsFin: (item: any) => void;
}

const CardNoConfirmedProgramming: React.FC<CardNoConfirmedProgrammingProps> = ({
  turism,
  programming,
  ModalPermissions,
  infoItems,
  currentCoords,
  refrescar,
  cordsFin,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeModalTour, setActiveModalTour] = useState(false);

  const handleConfirm = (item: Programming | Tourism) => {
    console.log('Confirmar', item);
    setActiveModalTour(true);
  };

  const handleReject = (item: Programming | Tourism) => {
    console.log('Rechazar', item);
    ModalPermissions();
    infoItems(item);
    currentCoords(item);
    cordsFin(item);
    refrescar();
  };

  const _renderContent = (item: Programming | Tourism) => (
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

  const formatTimeFromProgramming = (item: Programming) => {
    const startTime = parseInt(item.start);
    const date = new Date(startTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return hours > 12
      ? `${hours - 12}:${minutes.toString().padStart(2, '0')} PM`
      : `${hours}:${minutes.toString().padStart(2, '0')} AM`;
  };

  const formatTimeFromTourism = (item: Tourism) => {
    const idaTime = parseInt(item.ida);
    const date = new Date(idaTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return hours > 12
      ? `${hours - 12}:${minutes.toString().padStart(2, '0')} PM`
      : `${hours}:${minutes.toString().padStart(2, '0')} AM`;
  };

  const calculateSubstringLength = (percentage: number): number => {
    return Math.floor(width * percentage);
  };

  return (
    <View>
      {programming.map((item, index) => {
        if (isProgramming(item) && item.statusService === 'NoConfirmado') {
          return (
            <View key={item._id}>
              <TouchableOpacity
                onPress={() => {
                  const newIndex = activeIndex === index ? null : index;
                  setActiveIndex(newIndex);
                  console.log('Active Index:', newIndex);
                }}>
                <ConfirmadosList
                  typeItem={item.tipoProducto || 'program'}
                  status={item.status.toLowerCase()}
                  colorFont={`${item.status.toLowerCase()}Color`}
                  time={formatTimeFromProgramming(item)}
                  route={
                    item.tour.origin.name
                      .toLowerCase()
                      .substring(0, calculateSubstringLength(0.015)) +
                    ' - ' +
                    item.tour.destination.name
                      .toLowerCase()
                      .substring(0, calculateSubstringLength(0.015))
                  }
                />
              </TouchableOpacity>

              {activeIndex === index && _renderContent(item)}
              {activeModalTour && activeIndex === index && (
                <ModalTableProgrammings
                  visible={activeModalTour}
                  onClose={() => setActiveModalTour(false)}
                  item={item}
                />
              )}
            </View>
          );
        } else if (isTourism(item) && turism.estadoDelProductoTurismo === 'NoConfirmado') {
          return (
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
                  typeItem={item.tipoProducto || 'tour'}
                  status={item.status.toLowerCase()}
                  colorFont={`${item.status.toLowerCase()}Color`}
                  time={formatTimeFromTourism(item)}
                  route={item.destino.name.substring(
                    0,
                    calculateSubstringLength(0.039)
                  )}
                />
              </TouchableOpacity>
            </View>
          );
        }
        return null;
      })}
    </View>
  );
};

export default CardNoConfirmedProgramming;