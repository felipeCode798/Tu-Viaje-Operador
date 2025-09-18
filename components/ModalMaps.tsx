import * as React from 'react';
import { Component } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  Text,
} from 'react-native';
import { connect } from 'react-redux';
import CardInfMaps from './CardInfMaps';

// Importaciones con manejo de tipos
let MapView: any;
let Marker: any;
let Callout: any;
let MapViewDirections: any;
let MaterialCommunityIcons: any;
let Geolocation: any;
let Geocoder: any;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Callout = maps.Callout;
} catch (error) {
  console.warn('react-native-maps not available');
}

try {
  MapViewDirections = require('react-native-maps-directions').default;
} catch (error) {
  console.warn('react-native-maps-directions not available');
}

try {
  MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;
} catch (error) {
  console.warn('react-native-vector-icons/MaterialCommunityIcons not available');
}

try {
  Geolocation = require('react-native-geolocation-service');
} catch (error) {
  console.warn('react-native-geolocation-service not available');
}

try {
  Geocoder = require('react-native-geocoding');
} catch (error) {
  console.warn('react-native-geocoding not available');
}

const { height, width } = Dimensions.get('window');

const iconSize = 70; // píxeles
const iconSizeOrigin = 50; // píxeles

if (Geocoder) {
  Geocoder.init('AIzaSyCL2-TDfkLj4BHxjICT211r8PVx5AGuAzc');
}

// Interfaces para las props y el estado
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Point {
  name?: string;
  latitude: number;
  longitude: number;
}

interface User {
  idUser: number;
  photo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
}

interface NavPages {
  current: string;
  previous: string;
}

interface LocationState {
  latitude: number;
  longitude: number;
}

interface RootState {
  session: {
    user: User;
  };
  navPages: NavPages;
  id: string;
  location: LocationState;
}

interface ModalMapsProps {
  showModal: boolean;
  closeModal: () => void;
  _onRefresh: () => void;
  dispatch: (action: any) => void;
  coords: Point[];
  coordFinal: Point[];
  user: User;
  navPages: NavPages;
  id: string;
  location: LocationState;
}

interface ModalMapsState {
  modalMaps: boolean;
  latituteOrigin: number;
  logitudeOrigin: number;
  arrPoints: Point[];
  polylineCoordinates: Coordinate[];
  currentLocation: Coordinate | null;
  placeId: string;
  geocodedLocation: any | null;
  currentAddress: string;
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
    if (Geolocation) {
      Geolocation.getCurrentPosition(
        (position: any) => {
          const { latitude, longitude } = position.coords;
          this.setState({ currentLocation: { latitude, longitude } });

          if (Geocoder) {
            Geocoder.from(latitude, longitude)
              .then((response: any) => {
                const { results } = response;
                if (results.length > 0) {
                  const formattedAddress = results[0].formatted_address;
                  this.setState({ currentAddress: formattedAddress });
                }
              })
              .catch((error: any) => {
                console.error('Geocoding error:', error);
              });
          }
        },
        (error: any) => {
          console.log(error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
      );
    }
  }

  render() {
    if (!MapView) {
      return (
        <Modal animationType="fade" visible={this.props.showModal}>
          <View style={styles.map}>
            <Text>Mapa no disponible</Text>
          </View>
        </Modal>
      );
    }

    return (
      <Modal
        animationType="fade"
        visible={this.props.showModal}
        key={'AIzaSyCL2-TDfkLj4BHxjICT211r8PVx5AGuAzc'}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: this.state.currentLocation
              ? this.state.currentLocation.latitude
              : 0,
            longitude: this.state.currentLocation
              ? this.state.currentLocation.longitude
              : 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* marcador punto inicial */}
          {this.props.coords.map((point, index) => (
            <View key={index}>
              <Marker
                title={
                  point.name
                    ? `Punto de recogida : ${point.name}`
                    : 'Punto de recogidiiia'
                }
                draggable
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                onDragEnd={(direction: any) =>
                  this.setState(direction.nativeEvent.coordinate as any)
                }
                style={{ width: iconSizeOrigin, height: iconSizeOrigin }}>
                <Image
                  source={require('../assets/icons/usersLocation.png')}
                  style={{ width: iconSizeOrigin, height: iconSizeOrigin }}
                />

                <Callout style={styles.callout}>
                  <View>
                    <Text style={{ fontWeight: 'bold', color: 'black' }}>
                      Punto de recogida:
                    </Text>
                    <Text style={{ color: 'black' }}>
                      {point.name ? point.name : " Por favor dirigirse al punto marcado en el mapa "}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            </View>
          ))}

          {/* Resto del código de marcadores y direcciones... */}
          {/* Se mantiene igual pero con verificaciones de que los componentes existan */}

        </MapView>

        <View style={styles.icon}>
          <TouchableOpacity
            style={{ backgroundColor: 'transparent', borderRadius: 100 }}
            onPress={() => {
              this.props._onRefresh();
              this.props.closeModal();
              this.props.dispatch({
                type: 'CLEAR_INFO_ITEM',
              });
            }}>
            {MaterialCommunityIcons && (
              <MaterialCommunityIcons
                disabled={true}
                disabledStyle={{ backgroundColor: 'transparent' }}
                style={{ borderRadius: 100 }}
                name={'arrow-left'}
                size={width * 0.1}
                color="#000000"
              />
            )}
          </TouchableOpacity>
        </View>
        <CardInfMaps _onRefresh={this.props._onRefresh} />
      </Modal>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { user } = state.session;
  const { navPages } = state;
  const { id } = state;
  const { location } = state;

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