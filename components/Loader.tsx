import LottieView from "lottie-react-native";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { height, width } = Dimensions.get("window");

interface LoaderProps {
  // Puedes agregar props aquí si son necesarias
}

interface LoaderState {
  // Puedes agregar estado aquí si es necesario
}

export class Loader extends React.Component<LoaderProps, LoaderState> {
  private animation: LottieView | null = null;

  componentDidMount() {
    if (this.animation) {
      this.animation.play(0, 55);
    }
  }

  resetAnimation = () => {
    if (this.animation) {
      this.animation.reset();
      this.animation.play();
    }
  };

  render() {
    return (
      <View style={styles.preloader}>
        <LottieView
          ref={(animation) => {
            this.animation = animation;
          }}
          style={{ width: width / 6, height: height / 6 }}
          source={require('../../../tuviaje/Cliente/Movil/Hibrida/tu-viaje-operador/assets/images/bus.json')} 
        />
        <Text style={{ color: "white" }}>{"Cargando..."}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  preloader: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: height,
    backgroundColor: "black",
  },
});