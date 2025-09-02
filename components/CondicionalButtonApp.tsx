import React, { Component, createRef } from 'react';
import { Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import HomeServices from '../../../tuviaje/Cliente/Movil/Hibrida/tu-viaje-operador/services/HomeServices';
import AppButton from './AppButton';
import ConfirmedModal from './ConfirmedModal';
import { ModalConfirmedStatusResponse, ModalConfirmedStatusResponseRef } from './ModalConfirmedStatusResponse';

interface User {
  idUser: number;
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
  origin: string;
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

interface CondicionalButtonAppProps {
  user: User;
  infoItems: InfoItems;
  _onRefresh: () => void;
}

interface CondicionalButtonAppState {
  loading: boolean;
  newStatus: string;
  id: string;
  type: string;
  statusFinal: string;
  statusCancelled: string;
  refreshing: string;
  buttonState: string;
  upDateState: boolean;
  showModal: boolean;
  title: string;
  message: string;
  modal: boolean;
}

interface RootState {
  session: {
    user: User;
  };
  infoItems: {
    infoItems: InfoItems;
  };
}

class CondicionalButtonApp extends Component<CondicionalButtonAppProps, CondicionalButtonAppState> {
  private childRef = createRef<ModalConfirmedStatusResponseRef>();
  
  constructor(props: CondicionalButtonAppProps) {
    super(props);
    this.state = {
      loading: false,
      newStatus: 'Progreso',
      id: this.props.infoItems.id,
      type: this.props.user.tipoUser,
      statusFinal: 'Finalizado',
      statusCancelled: 'Cancelado',
      refreshing: 'false',
      buttonState: this.props.infoItems.estado,
      upDateState: false,
      showModal: false,
      title: 'default',
      message: 'default',
      modal: false,
    };
  }

  changeDescription = (): { statusTitle: string; statusMessage: string } => {
    let statusTitle = '';
    let statusMessage = '';

    if (this.props.user.tipoUser === 'Conductor') {
      if (this.state.buttonState === 'Pendiente') {
        statusTitle = 'Iniciar Viaje';
        statusMessage = '¿Desea iniciar el viaje?';
      } else if (this.state.buttonState === 'Progreso') {
        statusTitle = 'Finalizar Viaje';
        statusMessage = '¿Desea finalizar el viaje?';
      } else {
        statusTitle = 'Finalizar Viaje';
        statusMessage = '¿Desea finalizar el viaje?';
      }
    } else {
      if (
        this.props.infoItems.tipo === 'TourismPopulateResponse' &&
        this.state.buttonState === 'Pendiente'
      ) {
        statusTitle = 'Cancelar Turismo';
        statusMessage = '¿Desea cancelar el Turismo?';
      } else if (this.state.buttonState === 'Pendiente') {
        statusTitle = 'CANCELAR VIAJE';
        statusMessage = '¿Desea cancelar el viaje?';
      }
    }
    console.log('title', statusTitle, 'message', statusMessage);
    return { statusTitle, statusMessage };
  };

  showModalConfirm = () => {
    this.setState({ showModal: true });
  };

  stateChange = () => {
    this.setState({ upDateState: true });
  };

  noUpDate = () => {
    this.setState({ showModal: false });
  };

  upDate = () => {
    this.setState({ showModal: false });
    this.setState({ upDateState: true });

    this.changesStatusByProgramming();
    this.props._onRefresh();
  };

  handleStateChange = (key: keyof CondicionalButtonAppState, value: any) => {
    this.setState({ [key]: value } as Pick<CondicionalButtonAppState, keyof CondicionalButtonAppState>);
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  ShowModal = () => {
    this.setState({ showModal: true });
  };

  FuncionDelHijo = () => {
    if (this.childRef.current) {
      this.childRef.current.handleModal();
    }
  };

  changesStatusByProgramming = async () => {
    try {
      const { user } = this.props;
      const { id, type } = this.state;

      if (
        user.tipoUser === 'Conductor' &&
        this.state.buttonState === 'Pendiente'
      ) {  
        if (
          this.props.infoItems.estadoDelProductoPrograma === 'Confirmado'
        ) {
          await HomeServices.changesStatusByProgramming(
            id,
            this.state.newStatus,
            type,
          )
            .then((resp: any) => {
              console.log("----->ZZZZZZZres" , resp);
              
              if (resp.status === 'OK') {
                this.handleStateChange('buttonState', 'Progreso');
                this.setState({ message: resp.message });
                this.setState({ modal: true });
                this.FuncionDelHijo();
              }
              else {
                this.setState({
                  message: (resp.message =
                    'Ya existe una programación en progreso no puedes iniciar este viaje'),
                });
                this.setState({ modal: true });
                this.FuncionDelHijo();
              }
            })
            .catch((err: Error) => {
              console.log('err', err);
            })
        } else {
          await HomeServices.changesStatusByProgramming(
            id,
            this.state.statusCancelled,
            type,
          ).then((resp: any) => {
            if (resp.status === 'Fail') {
              this.setState({
                message: (resp.message =
                  'Esta programación no ha sido confirmada'),
              });
              this.setState({ modal: true });
              this.FuncionDelHijo();
            }
          })
          .catch((err: Error) => {
            console.log('err', err);
          })
        }
      } else if (
        user.tipoUser === 'Conductor' &&
        this.state.buttonState === 'Pendiente'
      ) {
        await HomeServices.changesStatusByProgramming(
          id,
          this.state.newStatus,
          type,
        )
          .then((resp: any) => {
            console.log(
              'reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeesp',
              resp,
            );
            if (resp.status === 'OK') {
              this.handleStateChange('buttonState', 'Progreso');
              this.setState({ message: resp.message });
              this.setState({ modal: true });
              this.FuncionDelHijo();
            } else {
              this.setState({
                message: (resp.message =
                  'Ya existe una Programación en Progreso'),
              });
              this.setState({ modal: true });
              this.FuncionDelHijo();
            }
          })
          .catch((err: Error) => {
            console.log('err', err);
          });
      } else if (
        user.tipoUser === 'Conductor' &&
        this.state.buttonState === 'Progreso'
      ) {
        await HomeServices.changesStatusByProgramming(
          id,
          this.state.statusFinal,
          type,
        )
          .then((resp: any) => {
            console.log(
              'reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeesp',
              resp,
            );
            if (resp.status === 'OK') {
              this.handleStateChange('buttonState', 'Finalizado');
              this.setState({ message: resp.message });
              this.setState({ modal: true });
              this.FuncionDelHijo();
            }
          })
          .catch((err: Error) => {
            console.log('err', err);
          });
      } else if (
        user.tipoUser === 'Empresa' &&
        this.state.buttonState === 'Pendiente'
      ) {
        if (this.props.infoItems.tipo === 'TourismPopulateResponse') {
          await HomeServices.changeStatusTourism(
            id,
            this.state.statusCancelled,
            type,
          )
            .then((resp: any) => {
              console.log(
                'reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeesp',
                resp,
              );

              if (resp.status === 'OK') {
                this.handleStateChange('buttonState', 'Cancelado');
                this.setState({ message: resp.message });
                this.setState({ modal: true });
                this.FuncionDelHijo();
              }
            })
            .catch((err: Error) => {
              console.log('err', err);
            });
        } else {
          await HomeServices.changesStatusByProgramming(
            id,
            this.state.statusCancelled,
            type,
          )
            .then((resp: any) => {
              if (resp.status === 'OK') {
                this.handleStateChange('buttonState', 'Cancelado');
                this.setState({ message: resp.message });
                this.setState({ modal: true });
                this.FuncionDelHijo();
              }
            })
            .catch((err: Error) => {
              console.log('err', err);
            });
        }
      }
      console.log('Se cambió el estado del elemento correctamente.');
    } catch (error) {
      console.log('Hubo un error al cambiar el estado del elemento:', error);
    }
  };

  render() {
    let { width, height } = Dimensions.get('window');
    const { user } = this.props;
    const isConductor = user.tipoUser === 'Conductor';
    const isPendiente = this.state.buttonState === 'Pendiente';
    const isProgreso = this.state.buttonState === 'Progreso';

    let title, iconName, disabled;
    let bgColor = '#E2991C';
    let iconColor = '#fff';

    const { statusMessage, statusTitle } = this.changeDescription();

    if (isConductor) {
      if (isPendiente) {
        title = 'Iniciar Viaje';
        iconName = 'bus';
      } else if (isProgreso) {
        title = 'Finalizar Viaje';
        iconName = 'bus';
      } else {
        title = 'Finalizar Viaje';
        iconName = 'bus';
        disabled = true;
        iconColor = 'black';
      }
    } else {
      if (isPendiente) {
        title = 'CANCELAR VIAJE';
        iconName = 'bus';
        iconColor = 'white';
      } else {
        title = 'Cancelar Viaje';
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
          showModal={this.state.showModal}
          decline={this.noUpDate}
          confirm={this.upDate}
        />

        <AppButton
          action={() => {
            this.showModalConfirm();
            this.changeDescription();
          }}
          title={title}
          bgColor={bgColor}
          iconName={iconName}
          iconSize={width * 0.045}
          radius={20}
          iconColor={iconColor}
          disabled={disabled}
          buttonHeight={height * 0.05}
          buttonWidth={width * 0.72}
        />

        <ModalConfirmedStatusResponse
          ref={this.childRef}
          showModal={this.state.modal}
          setModal={(modalNew: boolean) => this.setState({ ...this.state, modal: modalNew })}
          statusmessage={this.state.message}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { user } = state.session;
  const { infoItems } = state.infoItems;

  return {
    user: {
      idUser: user.idUser,
      photo: user.photo,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      email: user.email,
      password: user.password,
      tipoUser: user.tipoUser,
    },
    infoItems: {
      idItem: infoItems.idItem,
      origen: infoItems.origin,
      destino: infoItems.destino,
      fechaSalida: infoItems.fechaSalida,
      fechallegada: infoItems.fechallegada,
      lugarRecogida: infoItems.lugarRecogida,
      lugarLLegada: infoItems.lugarLLegada,
      driver: infoItems.driver,
      estado: infoItems.estado,
      id: infoItems.id,
      tipo: infoItems.tipo,
      estadoDelProductoPrograma: infoItems.estadoDelProductoPrograma,
    },
  };
};

export default connect(mapStateToProps)(CondicionalButtonApp);