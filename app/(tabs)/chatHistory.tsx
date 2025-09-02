import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Avatar, Header, Divider, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { Loader } from '../../components/Loader';
import ConfirmadosList from '../../components/itemsList/ConfirmadosList';
import { ModalListPassagers } from '../../components/ModalListPassagers';
import { showMessage, hideMessage } from 'react-native-flash-message';
import ChatServices from '../../services/ChatServices';
import HomeServices from '../../services/homeServices';

const { height, width } = Dimensions.get('window');

interface ChatHistoryScreenProps {
  navigation: any;
  user: any;
  dispatch: any;
}

interface Passenger {
  id: string;
  // Agrega otras propiedades según sea necesario
}

interface MergeDataItem {
  _id: string;
  tipoProducto: string;
  status: string;
  start?: string;
  ida?: string;
  end?: string;
  vuelta?: string;
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
  // Agrega otras propiedades según sea necesario
}

const ChatHistoryScreen: React.FC<ChatHistoryScreenProps> = ({ navigation, user, dispatch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(false);
  const [mergeData, setMergeData] = useState<MergeDataItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [dateIn, setDateIn] = useState<Date>(new Date());
  const [driverData, setDriverData] = useState([]);

  const _onRefresh = () => {
    setRefreshing(true);
    setMergeData([]);
    getProgrammingDriver(dateIn);
  };

  useEffect(() => {
    onLoading();
  }, []);

  const onLoading = async (date: Date = new Date()) => {
    setMergeData([]);
    getProgrammingDriver(date);
  };

  const getProgrammingDriver = (date: Date) => {
    setMergeData([]);
    setDateIn(date);
    setLoading(true);

    const peticion = user.tipoUser === 'Conductor' 
      ? 'getProgrammingDriver' 
      : 'getProgrammingsEnterprise';

    HomeServices[peticion]();

    HomeServices[peticion](
      user.idUser,
      new Date(date).getTime().toString(),
    )
      .then((data: any[]) => {
        const processedData = data.map(item => ({
          ...item,
          tipoProducto: 'program'
        }));
        
        setMergeData(prevData => [...prevData, ...processedData]);
        setRefreshing(false);
        getTourismsDriver(date);
      })
      .catch((err: any) => {
        console.log(err);
        setRefreshing(false);
        setLoading(false);
        getTourismsDriver(date);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
  };

  const getTourismsDriver = (date: Date) => {
    setLoading(true);
    setDateIn(date);

    const peticion = user.tipoUser === 'Conductor' 
      ? 'getTourismsDriver' 
      : 'getTourismByEnterprises';
      
    HomeServices[peticion](
      user.idUser,
      `${new Date(date).getFullYear()}-${
        new Date(date).getMonth() + 1
      }-${new Date(date).getDate()}`,
    )
      .then((data: any[]) => {
        const processedData = data.map(item => ({
          ...item,
          tipoProducto: 'tour'
        }));
        
        setMergeData(prevData => [...prevData, ...processedData]);
        setRefreshing(false);
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setRefreshing(false);
        setLoading(false);
      });
  };

  const getPassengers = (id: string, type: string) => {
    console.log('Ingreso al servicio de obtener pasajeros');
    ChatServices.getPassengers(id, type)
      .then((data: Passenger[]) => {
        console.log("QUE HAY AQUI MANO", data);
        setPassengers(data);
        setLoading(false);
        showModal();
      })
      .catch((err: any) => {
        console.log(err);
        setRefreshing(false);
        setLoading(false);
      });
  };

  const showModalHandler = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const goChat = (item: any) => {
    dispatch({
      type: 'SET_INFOCHAT',
      infoChat: {
        idService: item.id,
        item: item,
      },
    });
    navigation.navigate('Chat');
  };

  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <Header
        centerComponent={{
          text: 'Mensajes',
          style: {
            color: '#fff',
            fontSize: 30,
            fontFamily: 'Roboto',
            top: -12,
          },
        }}
        containerStyle={{
          backgroundColor: 'black',
          borderBottomWidth: 0,
        }}
      />

      <View style={[styles.containerHeader]}>
        <View style={[styles.iconHeader]}>
          <Icon name="message" size={width * 0.12} color="white" />
        </View>
        <View>
          <Text style={[styles.textHeader]}>
            Conversa con tus clientes confirmados
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={'#E2991C'}
            colors={['#E2991C', 'black', '#E2991C', 'black']}
          />
        }
      >
        <View style={styles.containerInfoData}>
          {mergeData.map((item) => {
            if (
              (item.tipoProducto === 'program' &&
                (item.status === 'Pendiente' || item.status === 'Progreso')) ||
              (item.tipoProducto === 'tour' &&
                (item.status === 'Pendiente' || item.status === 'Progreso'))
            ) {
              return (
                <View key={item._id}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.tipoProducto === 'program') {
                        getPassengers(item._id, 'Programming');
                      } else if (item.tipoProducto === 'tour') {
                        showModalHandler();
                      }
                    }}
                  >
                    <ConfirmadosList
                      typeItem={item.tipoProducto}
                      status={item.status.toLowerCase()}
                      colorFont={`${item.status.toLowerCase()}Color`}
                      time={
                        new Date(parseInt(item.start || item.ida)).getHours() > 12
                          ? `${
                              new Date(parseInt(item.start || item.ida)).getHours() - 12
                            }:${new Date(
                              parseInt(item.start || item.ida)
                            ).getMinutes()} PM`
                          : `${new Date(
                              parseInt(item.ida || item.start)
                            ).getHours()}:${new Date(
                              parseInt(item.vuelta || item.end)
                            ).getMinutes()} AM`
                      }
                      route={
                        item.tipoProducto === 'program'
                          ? `${item.tour?.origin.name
                              .toLowerCase()
                              .substring(0, parseInt(width * 0.015))} - ${item.tour?.destination.name
                              .toLowerCase()
                              .substring(0, parseInt(width * 0.015))}`
                          : item.destino?.name.substring(0, parseInt(width * 0.039)) || ''
                      }
                      key={item._id}
                    />
                  </TouchableOpacity>
                </View>
              );
            } else {
              return null;
            }
          })}
        </View>

        <ModalListPassagers
          showModal={showModal}
          closeModal={closeModal}
          passengers={passengers}
          refreshing={_onRefresh}
        />
      </ScrollView>
    </View>
  );
};

const mapStateToProps = (state: any) => {
  const { navPages } = state.navPages;
  const { user } = state.session;

  console.log('-------------------USER', user);
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
    navPages: {
      current: navPages.current,
      previous: navPages.previous,
    },
  };
};

export default connect(mapStateToProps)(ChatHistoryScreen);

const styles = StyleSheet.create({
  containerHeader: {
    backgroundColor: '#E2991C',
    height: height * 0.13,
  },
  iconHeader: {
    height: height * 0.06,
    marginVertical: 10,
  },
  textHeader: {
    color: 'white',
    alignContent: 'center',
    textAlign: 'center',
    fontSize: width * 0.04,
  },
  textOrigin: {
    color: '#FFF',
    fontFamily: 'Roboto',
    fontSize: height * 0.02,
    alignSelf: 'flex-start',
  },
  textHoraOut: {
    color: '#FFF',
    fontFamily: 'Roboto',
    fontSize: height * 0.02,
    alignSelf: 'flex-end',
    marginRight: width * 0.03,
  },
  textDate: {
    color: '#FFF',
    fontFamily: 'Roboto',
    fontSize: height * 0.02,
    alignSelf: 'center',
    left: width * 0.09,
  },
  viewMensajes: {
    flex: 1,
    alignContent: 'center',
    paddingHorizontal: width * 0.046,
    marginTop: height * 0.01,
    alignContent: 'center',
  },
  cardMensajes: {
    flex: 0.8,
    backgroundColor: 'black',
    height: height * 0.3,
    paddingVertical: height * 0.013,
    borderRadius: height * 0.02,
    paddingHorizontal: width * 0.013,
    borderWidth: width * 0.002,
    borderColor: '#575757',
  },
  icon: {
    flex: 0.15,
    alignSelf: 'flex-start',
    marginRight: width * 0.03,
    marginLeft: width * 0.03,
    alignItems: 'center',
  },
  containerInfoData: {
    backgroundColor: '#4f4f4f',
    height: height * 0.8,
  },
  containerStyle: {
    color: '#FFF',
  },
});