import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { height, width } = Dimensions.get("window");

interface ModalPermissionsProps {
  showModal: boolean;
  closeModal: () => void;
  permiso: () => void;
  closePermissionModal: () => void;
}

interface ModalPermissionsState {
  numeroPasajero: string;
  mensaje: string;
  location: any;
  errMessage: string;
}

export class ModalPermissions extends React.Component<ModalPermissionsProps, ModalPermissionsState> {
  constructor(props: ModalPermissionsProps) {
    super(props);
    this.state = {
      numeroPasajero: "",
      mensaje: "",
      location: null,
      errMessage: "",
    };
  }

  render() {
    const { showModal, permiso, closePermissionModal } = this.props;

    return (
      <View>
        <View>
          <Modal
            animationType="fade"
            visible={showModal}
            transparent={true}
            onRequestClose={closePermissionModal}
          >
            <View style={styles.centeredView}>
              <View style={styles.modal}>
                <Text
                  style={{
                    fontSize: width * 0.042,
                    color: "#fff",
                    textAlign: "justify",
                  }}
                >
                  TuViaje recopila datos de ubicación para habilitar puntos de
                  encuentro, destinos, tu posición actual y realizar un
                  seguimiento para la seguridad de tu viaje incluso cuando la
                  aplicación está cerrada o no está en uso.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    permiso();
                    closePermissionModal();
                  }}
                  style={styles.BottonAceptar}
                >
                  <Text style={[styles.text, styles.textClose]}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  BottonPasajeros: {
    marginTop: height * 0.01,
    borderWidth: height * 0.0005,
    borderRadius: width * 0.02,
    borderColor: "black",
    width: width * 0.5,
    height: width * 0.12,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0, 0.4)",
  },
  cardIcon: {
    position: "relative",
    backgroundColor: "#E2991C",
    borderRadius: 24,
    bottom: height * 0.065,
    width: width * 0.65,
    height: width * 0.09,
    alignContent: "center",
    alignSelf: "center",
  },
  BottonAceptar: {
    position: "absolute",
    backgroundColor: "#E2991C",
    borderRadius: 100,
    bottom: height * 0.01,
    width: width * 0.5,
    alignContent: "center",
    marginBottom: height * 0.02,
  },
  BottonClose: {
    position: "absolute",
    backgroundColor: "#E2991C",
    borderRadius: 100,
    bottom: height * 0.01,
    width: width * 0.5,
    alignContent: "center",
  },
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(0,0,0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  Icon: {
    paddingTop: height * 0.012,
    alignSelf: "flex-start",
    paddingLeft: width * 0.07,
  },
  modal: {
    backgroundColor: "#4f4f4f",
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
    height: height * 0.3,
    alignContent: "center",
  },
  textClose: {
    lineHeight: width * 0.1,
  },
  text: {
    fontSize: width * 0.05,
    color: "#FFF",
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    lineHeight: width * 0.1,
  },
  textoCardInf: {
    position: "absolute",
    alignSelf: "center",
    paddingTop: height * 0.009,
  },
  viewPasa: {
    marginBottom: height * 0.02,
    marginTop: -height * 0.05,
    alignContent: "center",
    alignSelf: "center",
  },
});