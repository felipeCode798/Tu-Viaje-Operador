import React, { Component } from "react";
import { Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { Dimensions, Text, View, StyleSheet } from "react-native";

const { height, width } = Dimensions.get("window");

// Type assertion para el componente Icon
const FixedIcon = Icon as unknown as React.ComponentType<{
  name: string;
  color: string;
  size: number;
}>;

interface NoConfirmadosListProps {
  typeItem?: "tour" | "travel";
  status?: string;
  colorFont?: string;
  time?: string;
  route?: string;
}

interface NoConfirmadosListState {
  // Puedes agregar estado si es necesario
}

export default class NoConfirmadosList extends Component<NoConfirmadosListProps, NoConfirmadosListState> {
  render() {
    const {
      typeItem = "tour",
      status = "pendiente",
      colorFont = "pendienteColor",
      time = " 1:00 PM",
      route = "Popayan - Cali",
    } = this.props;

    return (
      <View style={styles.infoData}>
        <View style={[styles.infoIcon]}>
          <FixedIcon
            name={typeItem === "tour" ? "suitcase" : "bus"}
            color="#fff"
            size={25}
          />
        </View>
        <View>
          <Text style={[styles.colorW, styles.infoDataText]}>{route}</Text>
        </View>
        <View>
          <Text style={[styles.colorW, styles.infoDataText]}>{time}</Text>
        </View>
        <View style={{ position: "absolute", right: width * 0.09 }}>
          <FixedIcon
            name="chevron-right"
            color="#fff"
            size={35}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerHeader: {
    backgroundColor: "black",
    borderBottomWidth: 0,
    justifyContent: "space-between",
  },
  header: {
    position: "absolute",
    top: -height * 0.02,
    width: width,
    alignItems: "center",
  },
  filter: {
    position: "absolute",
    right: 2,
    top: height * -0.02,
  },
  icon: {
    position: "absolute",
    right: -width * 0.15,
  },
  container: {
    flex: 1,
    backgroundColor: "#4f4f4f",
    bottom: 0,
  },
  switch: {
    flexDirection: "row",
    top: height * 0.02,
    marginHorizontal: width * 0.06,
    zIndex: 3,
    backgroundColor: "#2F2F2F",
    height: height * 0.06,
    borderRadius: height * 0.03,
  },
  switchText: {
    width: width * 0.429,
    justifyContent: "center",
    alignItems: "center",
    color: "#575757",
    fontFamily: "Roboto",
    fontSize: 16,
  },
  switchTextActive: {
    margin: width * 0.01,
    borderRadius: height * 0.03,
    backgroundColor: "#E2991C",
  },
  containerInfoData: {
    marginTop: height * 0.05,
  },
  infoData: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: height * 0.01,
    marginHorizontal: width * 0.05,
    backgroundColor: "#010101",
    height: height * 0.07,
    borderRadius: height * 0.09,
  },
  infoDataText: {
    fontFamily: "Roboto",
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
    color: "#fff",
  },
  pendienteColor: {
    color: "#56D0FD",
  },
  canceladoColor: {
    color: "#FF5249",
  },
  finalizadoColor: {
    color: "#E2991C",
  },
  progresoColor: {
    color: "#3ECE12",
  },
});