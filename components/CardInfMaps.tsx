import { Component } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { connect } from "react-redux";
import CondicionalButtonApp from "./CondicionalButtonApp";

const { height, width } = Dimensions.get("window");

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
  conductor?: string;
  estado: string;
  id: string;
}

interface CardInfMapsProps {
  user: User;
  infoItems: InfoItems;
  _onRefresh: () => void;
}

interface CardInfMapsState {
  monda: boolean;
  newStatus: string;
  id: string;
  type: string;
  statusFinal: string;
  statusCancelled: string;
}

interface RootState {
  session: {
    user: User;
  };
  infoItems: {
    infoItems: InfoItems;
  };
}

class CardInfMaps extends Component<CardInfMapsProps, CardInfMapsState> {
  constructor(props: CardInfMapsProps) {
    super(props);
    this.state = {
      monda: false,
      newStatus: "Progreso",
      id: this.props.infoItems.id,
      type: this.props.user.tipoUser,
      statusFinal: "Finalizado",
      statusCancelled: "Cancelado",
    };
  }

  render() {
    const { infoItems, user } = this.props;

    return (
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <View style={styles.Icon}>
            <Icon
              name={"bus"}
              size={width * 0.04}
              color={"white"}
            />
          </View>
          <View style={styles.textoCardInf}>
            <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
              {infoItems.origin !== undefined
                ? `${infoItems.origin} - ${infoItems.destino}`
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
      
          <Text style={{ fontSize: width * 0.044, color: "#fff" }}>
            {user.tipoUser === "Conductor"
              ? infoItems.lugarRecogida.substring(0, 17)
              : infoItems.conductor || "No asignado"}
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
          <CondicionalButtonApp _onRefresh={this.props._onRefresh} />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { user } = state.session;
  const { infoItems } = state.infoItems;

  console.log("\n-------------------------->props desde el el map <==============================================", infoItems);

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
      origin: infoItems.origin,
      destino: infoItems.destino,
      fechaSalida: infoItems.fechaSalida,
      fechallegada: infoItems.fechallegada,
      lugarRecogida: infoItems.lugarRecogida,
      lugarLLegada: infoItems.lugarLLegada,
      conductor: infoItems.conductor || "No asignado",
      estado: infoItems.estado,
      id: infoItems.id,
    },
  };
};

export default connect(mapStateToProps)(CardInfMaps);

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