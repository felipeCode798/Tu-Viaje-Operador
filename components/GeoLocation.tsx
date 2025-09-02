// import React, { Component } from "react";
// import { Platform, View } from "react-native";
// import * as Permissions from "expo-permissions";
// import * as Location from "expo-location";
// import Constants from "expo-constants";
// import Geocoder from "react-native-geocoding";
// import { connect } from "react-redux";

// interface LocationState {
//   objectLocation: any;
//   city: string | null;
//   latitude: number | null;
//   longitude: number | null;
// }

// interface GeoLocationProps {
//   dispatch: (action: any) => void;
//   callback: (location: any) => void;
//   location?: LocationState;
// }

// interface GeoLocationState {
//   location: Location.LocationObject | null;
//   errorMessage: string | null;
//   address: string;
//   petition: boolean;
// }

// interface RootState {
//   location: {
//     location: LocationState;
//   };
// }

// class GeoLocation extends Component<GeoLocationProps, GeoLocationState> {
//   constructor(props: GeoLocationProps) {
//     super(props);

//     this.state = {
//       location: null,
//       errorMessage: null,
//       address: "",
//       petition: false,
//     };

//     Geocoder.init("AIzaSyAUcMf7YEzpqyTYhOu7o_fDcWtNEeX9JiU");
//   }

//   componentDidMount() {
//     if (Platform.OS === "android" && !Constants.isDevice) {
//       this.setState({
//         errorMessage:
//           "Oops, this will not work on Sketch in an Android emulator. Try it on your device!",
//       });
//     } else {
//       this._getLocationAsync();
//     }
//   }

//   _getLocationAsync = async () => {
//     let { status } = await Permissions.askAsync(Permissions.LOCATION);
//     if (status !== "granted") {
//       this.setState({
//         errorMessage: "Permission to access location was denied",
//       });
//       console.log("NO PERMISO");
//       this.props.dispatch({
//         type: "SET_LOCATION",
//         location: {
//           objectLocation: null,
//           city: null,
//           latitude: null,
//           longitude: null,
//         },
//       });
//     } else {
//       let location = await Location.getCurrentPositionAsync({});
//       this.setState({ location });
//       this.props.dispatch({
//         type: "SET_LOCATION",
//         location: {
//           objectLocation: null,
//           city: null,
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         },
//       });
//       this.props.callback(location);
//       this.consultarCiudad(location.coords.latitude, location.coords.longitude);
//     }
//   };

//   consultarCiudad = (latitude: number, longitude: number) => {
//     if (this.state.petition === false) {
//       Geocoder.from(latitude, longitude)
//         .then((json) => {
//           this.setState({ address: json.results[0], petition: true });
//           this.props.callback(this.state.address);
//         })
//         .catch((error) => console.warn(error));
//     } else {
//       console.log("YA SE CONSULTO");
//     }
//   };

//   render() {
//     return <View />;
//   }
// }

// const mapStateToProps = (state: RootState) => {
//   const { location } = state.location;
//   return {
//     location: {
//       objectLocation: location?.objectLocation ?? null,
//       city: location?.city ?? null,
//       latitude: location?.latitude ?? null,
//       longitude: location?.longitude ?? null,
//     },
//   };
// };

// export default connect(mapStateToProps)(GeoLocation);