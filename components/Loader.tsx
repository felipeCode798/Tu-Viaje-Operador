import React, { useRef, useEffect } from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import LottieView from "lottie-react-native";

const { height, width } = Dimensions.get("window");

// Tipo para la referencia de Lottie
type LottieRef = React.ElementRef<typeof LottieView>;

interface LoaderProps {
  // Puedes agregar props aquí si es necesario
}

export const Loader: React.FC<LoaderProps> = () => {
  const animationRef = useRef<LottieRef>(null);

  useEffect(() => {
    // Usar aserción de tipo para acceder a los métodos
    const lottieInstance = animationRef.current as any;
    if (lottieInstance) {
      lottieInstance.play(0, 55);
    }
  }, []);

  const resetAnimation = () => {
    const lottieInstance = animationRef.current as any;
    if (lottieInstance) {
      lottieInstance.reset();
      lottieInstance.play();
    }
  };

  return (
    <View style={styles.preloader}>
      <LottieView
        ref={animationRef}
        style={{ width: width / 6, height: height / 6 }}
        source={require('../assets/images/bus.json')} 
      />
      <Text style={{ color: "white" }}>{"Cargando..."}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  preloader: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: height,
    backgroundColor: "black",
  },
});