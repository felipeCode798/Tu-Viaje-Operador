import React, { useState, useRef, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import AppButton from './AppButton';
import HomeServices from '../services/homeServices';
import ConfirmedModal from './ConfirmedModal';
import ModalConfirmedStatusResponse, { ModalRef } from './ModalConfirmedStatusResponse'; // Importa tanto el componente como la interfaz

interface User {
  idUser: string;
  photo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
  tipoUser: string;
}

interface InfoItems {
  idItem: string;
  origen: string;
  destino: string;
  fechaSalida: string;
  fechallegada: string;
  lugarRecogida: string;
  lugarLLegada: string;
  driver: string;
  estado: string;
  id: string;
  tipo: string;
  estadoDelProductoPrograma: string;
}

interface Props {
  _onRefresh: () => void;
}

interface RootState {
  session: {
    user: User;
  };
  infoItems: InfoItems;
}

const CondicionalButtonApp: React.FC<Props> = ({ _onRefresh }) => {
  const user = useSelector((state: RootState) => state.session.user);
  const infoItems = useSelector((state: RootState) => state.infoItems);
  
  const [loading, setLoading] = useState(false);
  const [newStatus] = useState('Progreso');
  const [id] = useState(infoItems.id);
  const [type] = useState(user.tipoUser);
  const [statusFinal] = useState('Finalizado');
  const [statusCancelled] = useState('Cancelado');
  const [refreshing] = useState('false');
  const [buttonState, setButtonState] = useState(infoItems.estado);
  const [upDateState, setUpDateState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('default');
  const [message, setMessage] = useState('default');
  const [modal, setModal] = useState(false);

  const childRef = useRef<ModalRef>(null);

  useEffect(() => {
    setButtonState(infoItems.estado);
  }, [infoItems.estado]);

  const changeDescription = (): { statusTitle: string; statusMessage: string } => {
    let statusTitle = '';
    let statusMessage = '';

    if (user.tipoUser === 'Conductor') {
      if (buttonState === 'Pendiente') {
        statusTitle = 'Iniciar Viaje';
        statusMessage = '¿Desea iniciar el viaje?';
      } else if (buttonState === 'Progreso') {
        statusTitle = 'Finalizar Viaje';
        statusMessage = '¿Desea finalizar el viaje?';
      } else {
        statusTitle = 'Finalizar Viaje';
        statusMessage = '¿Desea finalizar el viaje?';
      }
    } else {
      if (
        infoItems.tipo === 'TourismPopulateResponse' &&
        buttonState === 'Pendiente'
      ) {
        statusTitle = 'Cancelar Turismo';
        statusMessage = '¿Desea cancelar el Turismo?';
      } else if (buttonState === 'Pendiente') {
        statusTitle = 'CANCELAR VIAJE';
        statusMessage = '¿Desea cancelar el viaje?';
      }
    }
    return { statusTitle, statusMessage };
  };

  const showModalConfirm = (): void => {
    setShowModal(true);
  };

  const stateChange = (): void => {
    setUpDateState(true);
  };

  const noUpDate = (): void => {
    setShowModal(false);
  };

  const upDate = (): void => {
    setShowModal(false);
    setUpDateState(true);
    changesStatusByProgramming();
    _onRefresh();
  };

  const hideModal = (): void => {
    setShowModal(false);
  };

  const ShowModal = (): void => {
    setShowModal(true);
  };

  const FuncionDelHijo = (): void => {
    if (childRef.current) {
      childRef.current.handleModal();
    }
  };

  const changesStatusByProgramming = async (): Promise<void> => {
    try {
      setLoading(true);

      if (
        user.tipoUser === 'Conductor' &&
        buttonState === 'Pendiente'
      ) {
        if (
          infoItems.estadoDelProductoPrograma === 'Confirmado'
        ) {
          await HomeServices.changesStatusByProgramming(
            id,
            newStatus,
            type,
          )
            .then((resp: any) => {
              
              if (resp.status === 'OK') {
                setButtonState('Progreso');
                setMessage(resp.message);
                setModal(true);
                FuncionDelHijo();
              } else {
                setMessage(resp.message || 'Ya existe una programación en progreso no puedes iniciar este viaje');
                setModal(true);
                FuncionDelHijo();
              }
            })
            .catch((err: any) => {
              console.log('err', err);
            })
        } else {
          await HomeServices.changesStatusByProgramming(
            id,
            statusCancelled,
            type,
          ).then((resp: any) => {
            if (resp.status === 'Fail') {
              setMessage(resp.message || 'Esta programación no ha sido confirmada');
              setModal(true);
              FuncionDelHijo();
            }
          })
          .catch((err: any) => {
            console.log('err', err);
          })
        }
      } else if (
        user.tipoUser === 'Conductor' &&
        buttonState === 'Pendiente'
      ) {
        await HomeServices.changesStatusByProgramming(
          id,
          newStatus,
          type,
        )
          .then((resp: any) => {
            if (resp.status === 'OK') {
              setButtonState('Progreso');
              setMessage(resp.message);
              setModal(true);
              FuncionDelHijo();
            } else {
              setMessage(resp.message || 'Ya existe una Programación en Progreso');
              setModal(true);
              FuncionDelHijo();
            }
          })
          .catch((err: any) => {
            console.log('err', err);
          });
      } else if (
        user.tipoUser === 'Conductor' &&
        buttonState === 'Progreso'
      ) {
        await HomeServices.changesStatusByProgramming(
          id,
          statusFinal,
          type,
        )
          .then((resp: any) => {

            if (resp.status === 'OK') {
              setButtonState('Finalizado');
              setMessage(resp.message);
              setModal(true);
              FuncionDelHijo();
            }
          })
          .catch((err: any) => {
            console.log('err', err);
          });
      } else if (
        user.tipoUser === 'Empresa' &&
        buttonState === 'Pendiente'
      ) {
        if (infoItems.tipo === 'TourismPopulateResponse') {
          await HomeServices.changeStatusTourism(
            id,
            statusCancelled,
            type,
          )
            .then((resp: any) => {


              if (resp.status === 'OK') {
                setButtonState('Cancelado');
                setMessage(resp.message);
                setModal(true);
                FuncionDelHijo();
              }
            })
            .catch((err: any) => {
              console.log('err', err);
            });
        } else {
          await HomeServices.changesStatusByProgramming(
            id,
            statusCancelled,
            type,
          )
            .then((resp: any) => {
              if (resp.status === 'OK') {
                setButtonState('Cancelado');
                setMessage(resp.message);
                setModal(true);
                FuncionDelHijo();
              }
            })
            .catch((err: any) => {
              console.log('err', err);
            });
        }
      }
      
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isConductor = user.tipoUser === 'Conductor';
  const isPendiente = buttonState === 'Pendiente';
  const isProgreso = buttonState === 'Progreso';

  let titleBtn, iconName, disabled;
  let bgColor = '#E2991C';
  let iconColor = '#fff';

  const { statusMessage, statusTitle } = changeDescription();

  if (isConductor) {
    if (isPendiente) {
      titleBtn = 'Iniciar Viaje';
      iconName = 'bus';
    } else if (isProgreso) {
      titleBtn = 'Finalizar Viaje';
      iconName = 'bus';
    } else {
      titleBtn = 'Finalizar Viaje';
      iconName = 'bus';
      disabled = true;
      iconColor = 'black';
    }
  } else {
    if (isPendiente) {
      titleBtn = 'CANCELAR VIAJE';
      iconName = 'bus';
      iconColor = 'white';
    } else {
      titleBtn = 'Cancelar Viaje';
      iconName = 'bus';
      disabled = true;
      iconColor = 'black';
    }
  }

  return (
    <View style={{ zIndex: 999 }}>
      <ConfirmedModal
        statustitle={statusTitle}
        statusmessage={statusMessage}
        showModal={showModal}
        decline={noUpDate}
        confirm={upDate}
      />

      <AppButton
        action={() => {
          showModalConfirm();
          changeDescription();
        }}
        title={titleBtn}
        bgColor={bgColor}
        iconName={iconName}
        iconSize={screenWidth * 0.045}
        radius={20}
        iconColor={iconColor}
        disabled={disabled}
        buttonHeight={screenHeight * 0.05}
        buttonWidth={screenWidth * 0.72}
      />

      <ModalConfirmedStatusResponse
        ref={childRef}
        showModal={modal}
        setModal={setModal}
        statusmessage={message}
      />
    </View>
  );
};

export default CondicionalButtonApp;