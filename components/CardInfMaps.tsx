import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import CondicionalButtonApp from "./CondicionalButtonApp";

const { height, width } = Dimensions.get("window");

const BusIcon = () => (
  <Text style={{ fontSize: width * 0.04, color: "white" }}>🚌</Text>
);

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
  origen?: string;
  destino?: string;
  fechaSalida: string;
  fechallegada: string;
  lugarRecogida: string;
  lugarLLegada: string;
  driver?: string;
  conductor?: string;
  estado: string;
  id: string;
  origin?: string;
}

interface CardInfMapsProps {
  _onRefresh: () => void;
}

interface RootState {
  session: {
    user: User;
  };
  infoItems: InfoItems;
}

const CardInfMaps: React.FC<CardInfMapsProps> = ({ _onRefresh }) => {
  const user = useSelector((state: RootState) => state.session.user);
  const infoItems = useSelector((state: RootState) => state.infoItems);

  const [monda] = useState(false);
  const [newStatus] = useState("Progreso");
  const [id] = useState(infoItems.id);
  const [type] = useState(user.tipoUser);
  const [statusFinal] = useState("Finalizado");
  const [statusCancelled] = useState("Cancelado");

  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <View style={styles.Icon}>
          <BusIcon />
        </View>
        <View style={styles.textoCardInf}>
          <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
            {infoItems.origen !== undefined
              ? `${infoItems.origen} - ${infoItems.destino}`
              : "PROGRAMACIÓN"}
          </Text>
        </View>
      </View>
      <View style={styles.vistaDates}>
        <Text
          adjustsFontSizeToFit
          style={{ fontSize: width * 0.044, color: "#fff" }}
        >
          Fecha de salida:
        </Text>
        <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
          {user.tipoUser === "Conductor"
            ? "Lugar de recogida: "
            : "Conductor: "}
        </Text>
        <>
          <Text></Text>
        </>
        <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
          Fecha de llegada:
        </Text>
        <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
          Destino:
        </Text>
      </View>

      <View style={styles.vistasDes}>
        <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
          {`${new Date(
            parseInt(infoItems.fechaSalida)
          ).getDate()}/${
            new Date(parseInt(infoItems.fechaSalida)).getMonth() + 1
          }/${new Date(
            parseInt(infoItems.fechaSalida)
          ).getFullYear()}`}
        </Text>
    
        <Text style={{ fontSize: width * 0.044, color: "#fff"  }}>
          {user.tipoUser === "Conductor"
            ? infoItems.lugarRecogida.substring(0, 17)
            : infoItems.driver || "No asignado"}
        </Text>
        <>
          <Text> </Text>
        </>
        <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
          {`${new Date(
            parseInt(infoItems.fechallegada)
          ).getDate()}/${
            new Date(parseInt(infoItems.fechallegada)).getMonth() + 1
          }/${new Date(
            parseInt(infoItems.fechallegada)
          ).getFullYear()}`}
        </Text>
        <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
          {infoItems.lugarLLegada}
        </Text>
      </View>

      <View style={{
          position: "relative",
          backgroundColor: "transparent",
          borderRadius: 24,
          bottom: height * 0.05,
          width: width * 0.70,
          height: width * 0.1,
          alignContent: "center",
          alignSelf: "center",
          margin: height * 0.2
        }}>
        <CondicionalButtonApp _onRefresh={_onRefresh} />
      </View>
    </View>
  );
};

export default CardInfMaps;

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    backgroundColor: "black",
    borderRadius: 24,
    bottom: height * 0.03,
    alignSelf: "center",
    width: width * 0.9,
    height: width * 0.55,
    alignContent: "center",
    zIndex: 1,
  },
  cardIcon: {
    position: "relative",
    backgroundColor: "#E2991C",
    borderRadius: 24,
    bottom: height * 0.03,
    width: width * 0.55,
    height: width * 0.09,
    alignContent: "center",
    alignSelf: "center",
  },
  vistaDates: {
    position: "absolute",
    alignItems: "flex-start",
    paddingLeft: width * 0.06,
    paddingTop: height * 0.03,
  },
  vistasDes: {
    position: "absolute",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    paddingRight: width * 0.06,
    paddingTop: height * 0.03,
  },
  textoCardInf: {
    position: "absolute",
    alignItems: "flex-start",
    paddingLeft: width * 0.13,
    paddingTop: height * 0.009,
  },
  Icon: {
    paddingTop: height * 0.012,
    alignSelf: "flex-start",
    paddingLeft: width * 0.08,
  },
  buttonRigth: {
    position: "absolute",
    alignSelf: "flex-end",
    bottom: height * 0.01,
    right: width * 0.01,
    height: width * 0.5,
    width: width * 0.5,
    backgroundColor: "red",
  },
  buttonLetf: {},
});