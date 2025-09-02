import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { connect, useDispatch, useSelector } from 'react-redux';
// Reemplazar con una librería compatible o crear componente personalizado
// import Toaster, { ToastStyles } from 'react-native-toaster';
import Notification from '../../components/Notifications';
import Moment from 'moment';
import CalendarStrip from 'react-native-calendar-strip';
// Cambiar la importación de la imagen
import { Asset } from 'expo-asset';
import HomeServices from '../../services/homeServices';
import FilterComponent from '../../components/filter/FilterComponent';
import FloatButtonModal from '../../components/FloatButtonModal';
import { Loader } from '../../components/Loader';
import ModalMaps from '../../components/ModalMaps';
import { ModalPermissions } from '../../components/ModalPermissions';
import CardConfirmedProgramming from '../../components/CardConfirmedProgramming';
import CardNoConfirmedProgramming from '../../components/CardNoConfirmedProgramming';
import CardEnterpriceConfirmed from '../../components/CardEnterpriceConfirmed';
import CardEnterpriceNoConfirmed from '../../components/CardEnterpriceNoConfirmed';
import moment from 'moment';
import 'moment/locale/es';
import { ProgrammingItem, TurismItem, TurismHandler} from '../../types';

const { height, width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
  user: any;
  dispatch: any;
  id: any;
  permission: any;
  location: any;
  infoItems: any;
}

interface MergeDataItem {
  _id: string;
  tipoProducto: 'tour' | 'program'; // Restringir a los valores específicos
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
  __typename?: string;
  statusService?: string;
  driver?: {
    names: string;
  };
  places?: any[];
  // Agrega otras propiedades según sea necesario
}

// Componente personalizado para reemplazar Toaster
const CustomToaster: React.FC<{ message: any }> = ({ message }) => {
  if (!message) return null;
  
  return (
    <View style={{
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 10,
      borderRadius: 5,
      zIndex: 1000
    }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>
        {typeof message === 'string' ? message : message.text || ''}
      </Text>
    </View>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, user, dispatch, id, permission, location, infoItems }) => {
  const [tour, setTour] = useState<any>(null);
  const [dateIn, setDateIn] = useState<Date>(new Date());
  const [message, setMessage] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [mergeData, setMergeData] = useState<MergeDataItem[]>([]);
  const [originalData, setOriginalData] = useState<MergeDataItem[]>([]);
  const [resetFilter, setResetFilter] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [closeModal, setCloseModal] = useState(true);
  const [confirmed, setConfirmed] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentCoords, setCurrentCoords] = useState([{ latitude: 3.538663, longitude: -76.382535, name: 'cordena inicial' }]);
  const [cordsFin, setCordsFin] = useState([{ latitude: -10.098, longitude: -73.065, name: 'cordenada final' }]);
  const [currentItem, setCurrentItem] = useState<any>({});
  const [showMaps, setShowMaps] = useState(false);
  const [ModelVisible, setModelVisible] = useState(false);
  const [programmingsInProcess, setProgrammingsInProcess] = useState('');
  const [reloaded, setReloaded] = useState<Date>(new Date());

  const infoItemsGlobal = (item: any) => {
    dispatch({
      type: 'SET_INFO_ITEMS',
      infoItems: {
        fechaSalida: item.start,
        destino: item.tour.destination.name,
        origen: item.tour.origin.name,
        fechallegada: item.end,
        lugarRecogida: item.places[0].name,
        lugarLLegada: item.tour.destination.name,
        estado: item.status,
        id: item._id,
        tipo: item.__typename,
        estadoDelProductoPrograma: item.statusService,
        conductor: item.driver.names,
      },
    });
  };

  const infoItemsGlobalTurism = (item: any) => {
    dispatch({
      type: 'SET_INFO_ITEMS',
      infoItems: {
        fechaSalida: item.ida,
        fechallegada: item.vuelta,
        lugarRecogida: item.origen[0].name,
        lugarLLegada: item.destino.place.name,
        estado: item.status,
        id: item._id,
        tipo: item.__typename,
        estadoDelProductoTurismo: item.statusService,
      },
    });
  };

  const cordenadasFinTurimsEnterprice = (item: any) => {
    setCordsFin([item.destino.place]);
  };

  const coordsItemTurimsEnterprice = (item: any) => {
    setCurrentCoords(item.origen);
  };

  const coordsItem = (item: any) => {
    setCurrentCoords(item.places);
  };

  const cordenadasFin = (item: any) => {
    setCordsFin([item.puntoFin]);
  };

  const _onRefresh = () => {
    setRefreshing(true);
    setMergeData([]);
    onLoading(dateIn);
  };

  const onLoading = async (date: Date = new Date()) => {
    switch (user.tipoUser) {
      case 'Conductor':
        getProgrammingDriver(date);
        break;
      case 'Empresa':
        getProgrammingByEnterprise(date);
        break;
      default:
        break;
    }
  };

  const getProgrammingByEnterprise = (date: Date) => {
    const parseDate = new Date(date).setHours(0, 0, 0, 0);
    setOriginalData([]);
    HomeServices.getProgrammingsEnterprise(user.idUser, parseDate)
      .then((data: any[]) => {
        const processedData: MergeDataItem[] = data.map(item => ({
          ...item,
          tipoProducto: 'program' as const
        }));
        setOriginalData(processedData);
        setMergeData(processedData);
        setRefreshing(false);
        getTourismByEnterprises(date);
      })
      .catch((err: any) => {
        getTourismByEnterprises(date);
        console.log(err);
        setRefreshing(false);
        setSpinner(false);
        setLoading(false);
      });
  };

  const getTourismByEnterprises = (date: Date) => {
    const parseDate = new Date(date).setHours(0, 0, 0, 0);
    HomeServices.getTourismByEnterprises(user.idUser, parseDate)
      .then((data: any[]) => {
        const processedData: MergeDataItem[] = data.map(item => ({
          ...item,
          tipoProducto: 'tour' as const
        }));
        setOriginalData(prevData => [...prevData, ...processedData]);
        setMergeData(prevData => [...prevData, ...processedData]);
        setRefreshing(false);
        ModelData();
      })
      .catch((err: any) => {
        console.log(err);
        setRefreshing(false);
        setSpinner(false);
        setLoading(false);
      });
  };

  const getProgrammingDriver = (date: Date) => {
    setOriginalData([]);
    setDateIn(date);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1500);

    HomeServices.getProgrammingDriver(
      user.idUser,
      new Date(date).getTime().toString(),
      user.tipoUser,
    )
      .then((data: any[]) => {
        const processedData: MergeDataItem[] = data.map(item => ({
          ...item,
          tipoProducto: 'program' as const
        }));
        setOriginalData(processedData);
        setMergeData(processedData);
        setRefreshing(false);
        getTourismsDriver(date);
      })
      .catch((err: any) => {
        getTourismsDriver(date);
        console.log(err);
        setRefreshing(false);
        setSpinner(false);
        setLoading(false);
      });
  };

  const getTourismsDriver = (date: Date) => {
    setDateIn(date);
    HomeServices.getTourismsDriver(
      user.idUser,
      `${new Date(date).getFullYear()}-${new Date(date).getMonth() + 1}-${new Date(date).getDate()}`,
    )
      .then((data: any[]) => {
        const processedData: MergeDataItem[] = data.map(item => ({
          ...item,
          tipoProducto: 'tour' as const
        }));
        setOriginalData(prevData => [...prevData, ...processedData]);
        setMergeData(prevData => [...prevData, ...processedData]);
        setRefreshing(false);
        ModelData();
      })
      .catch((err: any) => {
        console.log(err);
        setRefreshing(false);
        setSpinner(false);
      });
  };

  useEffect(() => {
    onLoading();
    setTimeout(() => {
      setConfirmed(false);
      setConfirmed(true);
    }, 1000);
  }, []);

  useEffect(() => {
    if (reloaded) {
      setReloaded(new Date());
      changeReset();
    }
  }, [reloaded]);

  const showModalHandler = () => {
    setShowMaps(true);
  };

  const changeResetFilter = () => {
    setResetFilter(false);
    setMergeData(originalData);
  };

  const ModelData = (filt: any = { type: 'Todos', status: 'todos' }) => {
    const { type, status, statusService } = filt;
    let data = originalData;

    if (type === 'Todos') {
      data = originalData;
    } else {
      data = originalData.filter(item => item.tipoProducto === type);
    }

    switch (type) {
      case 'Todos':
        data = originalData;
        break;
      case 'Viajes':
        data = originalData.filter(item => item.tipoProducto === 'program');
        break;
      case 'Turismos':
        data = originalData.filter(item => item.tipoProducto === 'tour');
        break;
    }

    switch (status) {
      case 'todos':
        break;
      case 'pendientes':
        data = data.filter(item => item.status === 'Pendiente');
        break;
      case 'iniciado':
        data = data.filter(item => item.status === 'Progreso');
        break;
      case 'finalizado':
        data = data.filter(item => item.status === 'Finalizado');
        break;
      case 'cancelado':
        data = data.filter(item => item.status === 'Cancelado');
        break;
      default:
        break;
    }

    switch (statusService) {
      case 'Confirmado':
        data = data.filter(item => item.statusService === 'Confirmado');
        break;
      case 'NoConfirmado':
        data = data.filter(item => item.statusService === 'No Confirmado');
        break;
      default:
        break;
    }

    setMergeData(data);
    setLoading(false);
  };

  const changeReset = () => {
    setTimeout(() => {
      if (confirmed) {
        setConfirmed(false);
        setConfirmed(true);
      } else {
        setConfirmed(true);
        setConfirmed(false);
      }
    }, 1000);
  };

  const getPermissionGoogle = async () => {
    let locationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permiso de ubicacion',
        message: 'Necesitamos tu permiso para acceder a tu ubicacion',
        buttonNeutral: 'Preguntar luego',
        buttonNegative: 'Cancelar',
        buttonPositive: 'OK',
      },
    );

    console.log('location permissions', locationPermission);
    return locationPermission;
  };

  const PermissionsGoogleUbi = async () => {
    if (
      location.location?.status === 'denied' ||
      location.location?.status === undefined ||
      location.location?.status === null
    ) {
      let status = await getPermissionGoogle();

      if (status !== 'granted') {
        console.log('No tiene permisos de ubicacion');
        dispatch({
          type: 'SET_LOCATION',
          location: { status, location: null },
        });
      }

      let coarseLocation = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Permiso de ubicacion',
          message: 'Necesitamos tu permiso para acceder a tu ubicacion',
          buttonNeutral: 'Preguntar luego',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        },
      );

      console.log('coarse location permissions', coarseLocation);
    }
  };

  const grantedPermissionTrue = () => {
    if (
      permission.status === 'granted' &&
      location.location?.status === 'granted'
    ) {
      showModalHandler();
    } else {
      getLocationPermission();
    }
  };

  const getLocationPermission = () => {
    if (location.location?.status === 'denied') {
      PermissionsGoogleUbi();
    }
    showModalHandler();
  };

  const hideModal = () => {
    dispatch({
      type: 'SET_PERMISSION',
      permission: { status: 'denied' },
    });
    setModelVisible(false);
  };

  const getHourWalkout = (dateStart: number) => {
    let fechaSalida = Moment(new Date(dateStart));
    let duration = Moment.duration(fechaSalida.diff(Moment(new Date())));
    let hours = duration.asHours();
    return hours < 0
      ? 'Debe Salir Ya.'
      : hours < 1
      ? parseFloat((hours * 100).toString()).toFixed(0) + ' Minutos Salida'
      : parseFloat(hours.toString()).toFixed(0) + ' Horas Salida';
  };

  const goWayRoute = (item: any) => {
    let newPlaces = [];
    for (const place of item.places) {
      newPlaces.push(place);
    }
    newPlaces.push(item.tour.destination.place);
    dispatch({
      type: 'SET_INFOROUTES',
      infoRoutes: {
        idProgrammingSelect: item.id,
        places: newPlaces,
        status: item.status,
        fuec: item.fuec,
        infoProgrammingSelect: {
          origin: item.tour.origin.name,
          destination: item.tour.destination.name,
          horaIn: Moment(new Date(parseFloat(item.start))).format('LT'),
          horaOut: Moment(new Date(parseFloat(item.end))).format('LT'),
        },
      },
    });
    if (!id || id.id !== item.id) {
      dispatch({
        type: 'SET_ID',
        id: { id: item.id, type: true },
      });
    } else {
      dispatch({
        type: 'SET_ID',
        id: { id: id.id, type: false },
      });
    }
    navigation.navigate('WayRoute');
  };

  const componentRouteDriver = (item: any) => {
    // Importar la imagen de manera correcta
    const routeImageSource = require('../../assets/images/routeImage.png');
    
    return (
      <View style={{ flex: 1, paddingHorizontal: width * 0.03 }}>
        <TouchableOpacity
          onPress={() => {
            item.status === 'FINISHED'
              ? console.log('finalizado')
              : goWayRoute(item);
          }}>
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#676767',
              borderRadius: 10,
              backgroundColor: 'white',
              height: height * 0.25,
              paddingVertical: height * 0.02,
              paddingHorizontal: width * 0.04,
            }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text
                  style={{
                    flex: 1,
                    color: 'red',
                    fontFamily: 'Roboto',
                    fontSize: 16,
                  }}>
                  {item.status === 'PENDING'
                    ? getHourWalkout(parseFloat(item.start))
                    : item.status === 'PROGRESS'
                    ? 'EN PROGRESO'
                    : 'FINALIZADO'}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                <Text
                  style={{
                    color: '#575757',
                    fontFamily: 'Roboto',
                    fontSize: 16,
                    paddingRight: width * 0.02,
                  }}>
                  {item.bus.capacity}
                </Text>
                <Icon name="user" size={width * 0.05} color="black" />
              </View>
            </View>
            <View style={{ flex: 3 }}>
              <Text
                style={{
                  position: 'absolute',
                  zIndex: 3,
                  top: height * 0.02,
                  left: width * 0.35,
                  fontFamily: 'Roboto',
                  fontSize: 16,
                  color: 'black',
                }}>
                {'214 KM'}
              </Text>
              <Image
                resizeMethod={'scale'}
                resizeMode={'stretch'}
                source={routeImageSource}
                style={{ flex: 1, width: null, height: null }}
              />
            </View>
            <View style={{ flex: 1.5, flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={{
                    color: '#575757',
                    fontFamily: 'Roboto',
                    fontSize: 16,
                    alignSelf: 'flex-start',
                  }}>
                  {item.tour.origin.name}
                </Text>
                <Text
                  style={{
                    color: '#868686',
                    fontFamily: 'Roboto',
                    fontSize: 14,
                    alignSelf: 'flex-start',
                  }}>
                  {Moment(new Date(parseFloat(item.start))).format('LT')}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={{
                    color: '#575757',
                    fontFamily: 'Roboto',
                    fontSize: 16,
                    alignSelf: 'flex-end',
                  }}>
                  {item.tour.destination.name}
                </Text>
                <Text
                  style={{
                    color: '#868686',
                    fontFamily: 'Roboto',
                    fontSize: 14,
                    alignSelf: 'flex-end',
                  }}>
                  {Moment(new Date(parseFloat(item.end))).format('LT')}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Notification />

      <View>
        <Header containerStyle={styles.containerHeader}>
          <View style={styles.header}>
            <Text
              style={[
                styles.colorW,
                {
                  fontSize: Platform.OS === 'ios' ? width * 0.05 : width * 0.04,
                },
              ]}>
              Programación
            </Text>
          </View>
          <View style={styles.filter}>
            <TouchableOpacity
              onPress={() => {
                setShowFilter(!showFilter);
              }}>
              <Icon
                disabled={true}
                disabledStyle={{ backgroundColor: '#000' }}
                name="filter"
                type="ionicon"
                color="#fff"
                size={25}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </Header>

        <CustomToaster message={message} />
      </View>
      <View style={{ flex: 8.6 }}>
        <View style={{ flex: 1.9, paddingVertical: height * 0.01 }}>
          <CalendarStrip
            scrollable
            calendarAnimation={{ type: 'parallel', duration: 0 }}
            daySelectionAnimation={{
              type: 'background',
              duration: 300,
              highlightColor: 'white',
            }}
            calendarHeaderStyle={{ color: 'white' }}
            calendarColor={'transparent'}
            style={{ 
              flex: 1, 
              height: undefined, // Remover fontFamily del estilo del componente
            }}
            dateNumberStyle={{
              color: 'white',
              fontFamily: 'Roboto',
              fontWeight: '200',
            }}
            highlightDateNumberStyle={{ color: 'black' }}
            highlightDateNameStyle={{ color: 'black' }}
            dateNameStyle={{ color: 'white', fontFamily: 'Roboto' }}
            iconLeft={require('../../assets/images/left-arrow.png')}
            iconRight={require('../../assets/images/right-arrow.png')}
            iconContainer={{ flex: 0.1 }}
            onDateSelected={(date: any) => {
              console.log('cambio la fecha **************');
              setResetFilter(true);
              onLoading(date);
              setReloaded(new Date());
            }}
          />
        </View>

        <View style={{ flex: 8 }}>
          {showFilter && (
            <FilterComponent
              callBack={ModelData}
              resetFilter={resetFilter}
              changeResetFilter={changeResetFilter}
              changeReset={changeReset}
            />
          )}

          <View style={styles.switch}>
            <Text
              onPress={() => {
                setConfirmed(true);
              }}
              style={[confirmed && styles.switchTextActive]}>
              <View>
                <Text style={[styles.colorW, styles.switchText]}>
                  Confirmados
                </Text>
              </View>
            </Text>

            <Text
              style={[!confirmed && styles.switchTextActive]}
              onPress={() => {
                setConfirmed(false);
              }}>
              <View>
                <Text style={[styles.colorW, styles.switchText]}>
                  No Confirmado
                </Text>
              </View>
            </Text>
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={_onRefresh}
                tintColor={'#E2991C'}
                colors={['#E2991C', 'black', '#E2991C', 'black']}
              />
            }>
            <ModalMaps
              coords={currentCoords}
              closeModal={() => setShowMaps(false)}
              showModal={showMaps}
              _onRefresh={_onRefresh}
              coordFinal={cordsFin}
            />

            <ModalPermissions
              showModal={ModelVisible}
              permiso={PermissionsGoogleUbi}
              closePermissionModal={() => setModelVisible(false)}
            />

            <View>
              {user.tipoUser === 'Conductor' ? (
                <View>
                  <View style={styles.containerInfoData}>
                    {confirmed ? (
                      <CardConfirmedProgramming
                        programming={mergeData as ProgrammingItem[]}
                        ModalPermissions={getLocationPermission}
                        infoItems={infoItemsGlobal}
                        currentCoords={coordsItem}
                        refrescar={_onRefresh}
                        cordsFin={cordenadasFin}
                        turism={infoItemsGlobalTurism as TurismItem}
                      />
                    ) : (
                      <CardNoConfirmedProgramming
                        programming={mergeData as ProgrammingItem[]}
                        ModalPermissions={getLocationPermission}
                        infoItems={infoItemsGlobal}
                        currentCoords={coordsItem}
                        refrescar={_onRefresh}
                        cordsFin={cordenadasFin}
                        turism={infoItemsGlobalTurism as TurismItem}
                      />
                    )}
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.containerInfoData}>
                    {confirmed ? (
                      <CardEnterpriceConfirmed
                        programming={mergeData as ProgrammingItem[]}
                        ModalPermissions={getLocationPermission}
                        infoItems={infoItemsGlobal}
                        refrescar={_onRefresh}
                        infoItemsTurims={infoItemsGlobalTurism}
                        currentCoords={coordsItem}
                        cordsFin={cordenadasFin}
                        currrentCoordsTurism={coordsItemTurimsEnterprice}
                        coordsFinalTurism={cordenadasFinTurimsEnterprice}
                      />
                    ) : (
                      <CardEnterpriceNoConfirmed
                        programming={mergeData as ProgrammingItem[]}
                        ModalPermissions={getLocationPermission}
                        infoItems={infoItemsGlobal}
                        currentCoords={coordsItem}
                        refrescar={_onRefresh}
                        cordsFin={cordenadasFin}
                        infoItemsTurims={infoItemsGlobalTurism}
                        currrentCoordsTurism={coordsItemTurimsEnterprice}
                        coordsFinalTurism={cordenadasFinTurimsEnterprice}
                      />
                    )}
                  </View>
                </View>
              )}
            </View>
            {mergeData.length === 0 && (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Roboto',
                    paddingTop: height * 0.1,
                    fontSize: width * 0.1,
                    color: 'white',
                  }}></Text>
              </View>
            )}
          </ScrollView>
          {user.tipoUser === 'Empresa' && (
            <FloatButtonModal navigation={navigation} />
          )}
        </View>
      </View>
    </View>
  );
};

const mapStateToProps = (state: any) => {
  const { user } = state.session;
  const { navPages } = state.navPages;
  const { id } = state.id;
  const { permission } = state;
  const { location } = state;
  const { infoItems } = state;

  console.log('infoItems', infoItems);

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
    id: id,
    permission: permission,
    location: location,
    infoItems: infoItems,
  };
};

export default connect(mapStateToProps)(HomeScreen);

const styles = StyleSheet.create({
  containerHeader: {
    backgroundColor: 'black',
    borderBottomWidth: 0,
    justifyContent: 'space-between',
  },
  header: {
    position: 'absolute',
    top: -height * 0.02,
    width: width,
    alignItems: 'center',
  },
  filter: {
    position: 'absolute',
    right: -width * 0.15,
    top: height * -0.02,
  },
  icon: {
    position: 'absolute',
  },
  container: {
    flex: 1,
    backgroundColor: '#4f4f4f',
    bottom: 0,
    zIndex: 2,
  },
  switch: {
    flexDirection: 'row',
    top: height * 0.02,
    marginHorizontal: width * 0.06,
    zIndex: 3,
    backgroundColor: '#2F2F2F',
    height: height * 0.06,
    borderRadius: height * 0.03,
    marginBottom: height * 0.03,
  },
  switchText: {
    top: Platform.OS === 'ios' ? height * 0.004 : -height * 0.0025,
    margin: width * 0.01,
    width: width * 0.429,
    textAlign: 'center',
    paddingTop: height * 0.012,
    fontFamily: 'Roboto',
    fontSize: Platform.OS === 'ios' ? width * 0.05 : width * 0.04,
    fontWeight: 'bold',
  },
  switchTextActive: {
    borderRadius: height * 0.03,
    backgroundColor: '#E2991C',
    alignItems: 'center',
    fontFamily: 'Roboto',
    overflow: 'hidden',
  },
  containerInfoData: {
    marginBottom: height * 0.05,
  },
  infoData: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: height * 0.01,
    marginHorizontal: width * 0.05,
    backgroundColor: '#010101',
    height: height * 0.07,
    borderRadius: height * 0.09,
  },
  infoDataText: {
    fontFamily: 'Roboto',
    fontSize: width * 0.04,
    marginRight: width * 0.05,
  },

  infoIcon: {
    marginHorizontal: width * 0.08,
  },
  // colores de letras
  fz1: {
    fontSize: width * 0.05,
  },

  // colores de letras
  colorW: {
    color: '#fff',
  },
  pendingColor: {
    color: '#56D0FD',
  },
  cancelledColor: {
    color: '#FF5249',
  },
  finishedColor: {
    color: '#E2991C',
  },
  progressColor: {
    color: '#3ECE12',
  },
});