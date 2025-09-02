import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { connect } from "react-redux";

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
  driver: string;
  estado: string;
  id: string;
}

interface ConfirmedModalProps {
  statustitle: string;
  statusmessage: string;
  confirm: () => void;
  showModal: boolean;
  decline: () => void;
  user?: User;
  infoItems?: InfoItems;
}

interface RootState {
  session: {
    user: User;
  };
  infoItems: {
    infoItems: InfoItems;
  };
}

const ConfirmedModal: React.FC<ConfirmedModalProps> = (props) => {
  const { statustitle, statusmessage, confirm, showModal, decline } = props;

  const handleConfirm = () => {
    console.log("Confirm button pressed!");
    confirm();
  };

  const handleDecline = () => {
    console.log("Decline button pressed!");
    decline();
  };

  return (
    <Modal animationType="fade" visible={showModal} transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modal}>
          <Text
            style={{
              fontSize: width * 0.05,
              color: "white",
              textAlign: "justify",
            }}
          >
            {statustitle}
          </Text>

          <Text
            style={{
              fontSize: width * 0.05,
              color: "white",
              textAlign: "justify",
            }}
          >
            {statusmessage}
          </Text>

          <View style={styles.containerButton}>
            <View>
              <TouchableOpacity
                onPress={handleConfirm}
                style={styles.BottonAceptar}
              >
                <Text style={styles.text}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                onPress={handleDecline}
                style={styles.BottonCancelar}
              >
                <Text style={styles.text}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => {
  const { user } = state.session;
  const { infoItems } = state.infoItems;

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
      origen: infoItems.origin,
      destino: infoItems.destino,
      fechaSalida: infoItems.fechaSalida,
      fechallegada: infoItems.fechallegada,
      lugarRecogida: infoItems.lugarRecogida,
      lugarLLegada: infoItems.lugarLLegada,
      driver: infoItems.driver,
      estado: infoItems.estado,
      id: infoItems.id,
    },
  };
};

export default connect(mapStateToProps)(ConfirmedModal);

const styles = StyleSheet.create({
  containerButton: {
    backgroundColor: "black",
    height: width * 0.1,
    width: width * 0.80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: height * 0.06,
    paddingTop: height * 0.04,
  },
  BottonAceptar: {
    height: width * 0.09,
    backgroundColor: "#E2991C",
    borderRadius: 100,
    bottom: height * 0.01,
    width: width * 0.389,
    alignContent: "center",
    marginBottom: height * 0.02,
    alignItems: "center",
  },
  BottonCancelar: {
    height: width * 0.09,
    backgroundColor: "#E2991C",
    borderRadius: 100,
    bottom: height * 0.01,
    width: width * 0.389,
    alignContent: "center",
    marginBottom: height * 0.02,
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(0,0,0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    zIndex: 1,
  },
  modal: {
    backgroundColor: "black",
    borderRadius: width * 0.05,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: height * 0.1,
    elevation: 5,
    width: width * 0.87,
    height: height * 0.25,
    alignContent: "center",
  },
  text: {
    fontSize: width * 0.05,
    color: "#FFF",
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    paddingRight: width * 0.02,
    paddingTop: height * 0.004,
  },
});