import * as React from 'react';
import {Component} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  Text,
} from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import CardInfMaps from './CardInfMaps';
import {connect} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';

const {height, width} = Dimensions.get('window');

const iconSize = 70;
const iconSizeOrigin = 50;

Geocoder.init('AIzaSyCL2-TDfkLj4BHxjICT211r8PVx5AGuAzc');

interface Coordinate {
  latitude: number;
  longitude: number;
  name?: string;
}

interface ModalMapsProps {
  showModal: boolean;
  coords: Coordinate[];
  coordFinal: Coordinate[];
  closeModal: () => void;
  _onRefresh: () => void;
  dispatch: (action: any) => void;
  user?: {
    idUser: number;
    photo: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    email: string;
    password: string;
  };
  navPages?: {
    current: string;
    previous: string;
  };
  id?: string;
  location?: any;
}

interface ModalMapsState {
  modalMaps: boolean;
  latituteOrigin: number;
  logitudeOrigin: number;
  arrPoints: Coordinate[];
  polylineCoordinates: Coordinate[];
  currentLocation: Coordinate | null;
  placeId: string;
  geocodedLocation: Coordinate | null;
  currentAddress: string;
}

interface RootState {
  session: {
    user: any;
  };
  navPages: {
    navPages: any;
  };
  id: {
    id: string;
  };
  location: any;
}

class ModalMaps extends Component<ModalMapsProps, ModalMapsState> {
  constructor(props: ModalMapsProps) {
    super(props);
    this.state = {
      modalMaps: false,
      latituteOrigin: 3.393237,
      logitudeOrigin: -76.526969,
      arrPoints: [],
      polylineCoordinates: [],
      currentLocation: null,
      placeId: '',
      geocodedLocation: null,
      currentAddress: '',
    };
  }

  componentDidMount() {
    Geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        this.setState({currentLocation: {latitude, longitude}});

        Geocoder.from(latitude, longitude)
          .then((response) => {
            const {results} = response;
            if (results.length > 0) {
              const formattedAddress = results[0].formatted_address;
              this.setState({currentAddress: formattedAddress});
            }
          })
          .catch((error) => {
            console.error('Geocoding error:', error);
          });
      },
      (error) => {
        console.log(error);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }

  render() {
    const { showModal, coords, coordFinal, closeModal, _onRefresh, dispatch } = this.props;
    const { currentLocation, currentAddress } = this.state;

    return (
      <Modal
        animationType="fade"
        visible={showModal}
        key={'AIzaSyCL2-TDfkLj4BHxjICT211r8PVx5AGuAzc'}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: currentLocation ? currentLocation.latitude : 0,
            longitude: currentLocation ? currentLocation.longitude : 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* marcador punto inicial */}
          {coords.map((point, index) => (
            <View key={index}>
              <Marker
                title={point.name ? `Punto de recogida : ${point.name}` : 'Punto de recogidiiia'}
                draggable
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                style={{width: iconSizeOrigin, height: iconSizeOrigin}}>
                <Image
                  source={require('../assets/icons/usersLocation.png')}
                  style={{width: iconSizeOrigin, height: iconSizeOrigin}}
                />
                <Callout style={styles.callout}>
                  <View>
                    <Text style={{fontWeight: 'bold', color: 'black'}}>
                      Punto de recogida:
                    </Text>
                    <Text style={{color: 'black'}}>
                      {point.name ? point.name : " Por favor dirigirse al punto marcado en el mapa "}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            </View>
          ))}

          {/* marcador punto final */}
          {coordFinal.map((point, index) => (
            <View key={index}>
              <Marker
                draggable
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
              >
                <Image
                  source={require('../assets/icons/endLocation.png')}
                  style={{width: iconSize, height: iconSize}}
                />
                <Callout style={styles.callout}>
                  <View>
                    <Text style={{fontWeight: 'bold', color: 'black'}}>
                      Lugar de llegada:
                    </Text>
                    <Text style={{color: 'black'}}>{point.name}</Text>
                  </View>
                </Callout>
              </Marker>
            </View>
          ))}

          {currentLocation && coords.length > 0 && (
            <MapViewDirections
              origin={currentLocation}
              destination={{
                latitude: coords[0].latitude,
                longitude: coords[0].longitude,
              }}
              apikey="AIzaSyCL2-TDfkLj4BHxjICT211r8PVx5AGuAzc"
              strokeWidth={3}
              strokeColor="black"
              precision="high"
            />
          )}

          {coords.map((pointDirection, i) => {
            if (i === coords.length - 1) return null;
            return (
              <MapViewDirections
                key={i}
                origin={{
                  latitude: coords[i].latitude,
                  longitude: coords[i].longitude,
                }}
                destination={{
                  latitude: coords[i + 1].latitude,
                  longitude: coords[i + 1].longitude,
                }}
                apikey="AIzaSyCL2-TDfkLj4BHxjICT211r8PVx5AGuAzc"
                strokeWidth={3}
                strokeColor="black"
                precision="high"
              />
            );
          })}

          {coords.length > 0 && coordFinal.length > 0 && (
            <MapViewDirections
              origin={{
                latitude: coords[coords.length - 1].latitude,
                longitude: coords[coords.length - 1].longitude,
              }}
              destination={{
                latitude: coordFinal[0].latitude,
                longitude: coordFinal[0].longitude,
              }}
              apikey="AIzaSyCL2-TDfkLj4BHxjICT211r8PVx5AGuAzc"
              strokeWidth={3}
              strokeColor="black"
              precision="high"
            />
          )}

          {/* foto del conductor */}
          {currentLocation && (
            <Marker coordinate={currentLocation}>
              <Image
                source={require('../assets/icons/busLocation.png')}
                style={{width: iconSize, height: iconSize}}
              />
              <Callout style={styles.callout}>
                <View>
                  <Text style={{fontWeight: 'bold', color: 'black'}}>
                    Ubicación Actual:
                  </Text>
                  <Text>{currentAddress}</Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>

        <View style={styles.icon}>
          <TouchableOpacity
            style={{backgroundColor: 'transparent', borderRadius: 100}}
            onPress={() => {
              _onRefresh();
              closeModal();
              dispatch({
                type: 'CLEAR_INFO_ITEM',
              });
            }}>
            <MaterialCommunityIcons
              disabled={true}
              disabledStyle={{backgroundColor: 'transparent'}}
              style={{borderRadius: 100}}
              name={'arrow-left'}
              size={width * 0.1}
              color="#000000"
            />
          </TouchableOpacity>
        </View>
        <CardInfMaps _onRefresh={_onRefresh} />
      </Modal>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const {user} = state.session;
  const {navPages} = state.navPages;
  const {id} = state.id;
  const {location} = state;

  console.log("LOCATION ======= ", location);

  return {
    user: {
      idUser: user.idUser,
      photo: user.photo,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      email: user.email,
      password: user.password,
    },
    navPages: {
      current: navPages.current,
      previous: navPages.previous,
    },
    id: id,
    location: location,
  };
};

export default connect(mapStateToProps)(ModalMaps);

const styles = StyleSheet.create({
  map: {
    position: 'relative',
    height: height,
    width: width,
  },
  icon: {
    padding: 10,
    borderRadius: 100,
    backgroundColor: 'transparent',
    color: 'transparent',
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.01,
    alignItems: 'flex-start',
  },
  callout: {
    width: width * 0.5,
    borderRadius: 50,
  },
  calloutContainer: {
    backgroundColor: 'orange',
    borderRadius: 20,
  },
});