import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";

const { height, width } = Dimensions.get("window");

// Definir interfaces para las props
interface Props {
  statustitle: string;
  statusmessage: string;
  confirm: () => void;
  showModal: boolean;
  decline: () => void;
}

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
  idItem: number;
  origen: string;
  destino: string;
  fechaSalida: string;
  fechallegada: string;
  lugarRecogida: string;
  lugarLLegada: string;
  driver: string;
  estado: string;
  id: number;
}

interface RootState {
  session: {
    user: User;
  };
  infoItems: InfoItems;
}

const ConfirmedModal: React.FC<Props> = ({ 
  statustitle, 
  statusmessage, 
  confirm, 
  showModal, 
  decline 
}) => {
  // Si necesitas los datos del store, usa useSelector
  const user = useSelector((state: RootState) => state.session.user);
  const infoItems = useSelector((state: RootState) => state.infoItems);

  const handleConfirm = () => {
    confirm();
  };

  const handleDecline = () => {
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
            {`${statustitle}`}
          </Text>

          <Text
            style={{
              fontSize: width * 0.05,
              color: "white",
              textAlign: "justify",
            }}
          >
            {`${statusmessage}`}
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

export default ConfirmedModal;

const styles = StyleSheet.create({
  containerButton: {
    backgroundColor: "black",
    height: width * 0.1,
    width: width * 0.8,
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