import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { Icon } from "react-native-elements";

const { height, width } = Dimensions.get("window");

// Interfaces para las props y el estado
interface Passenger {
  _id: string;
  cel: string;
  names: string;
  lastnames: string;
}

interface ModalListPassagersProps {
  showModal: boolean;
  closeModal: () => void;
  refreshing: () => void;
  passengers: Passenger[];
}

interface ModalListPassagersState {
  numeroPasajero: string;
  mensaje: string;
}

interface WhatsAppData {
  numero: string;
  mgs: string;
}

export class ModalListPassagers extends React.Component<ModalListPassagersProps, ModalListPassagersState> {
  constructor(props: ModalListPassagersProps) {
    super(props);
    this.state = {
      numeroPasajero: "",
      mensaje: "",
    };
  }

  goToWhatsapp = (item: WhatsAppData): void => {
    let whatsappNo = item.numero;
    let whatsappMsg = item.mgs;
    Linking.openURL(`whatsapp://send?phone=${whatsappNo}&text=${encodeURIComponent(whatsappMsg)}`);
  };

  render() {
    return (
      <View>
        <View>
          <Modal
            animationType="fade"
            visible={this.props.showModal}
            transparent={true}
          >
            <View style={styles.centeredView}>
              <View style={styles.modal}>
                <View style={styles.cardIcon}>
                  <View style={styles.Icon}>
                    <Icon name="message" size={width * 0.045} color="white" />
                  </View>
                  <View style={styles.textoCardInf}>
                    <Text style={{ fontSize: width * 0.044, color: "#fff", marginLeft: width * 0.1 }}>
                      LISTADO DE PASAJEROS
                    </Text>
                  </View>
                </View>

                {this.props.passengers.length > 0 ? (
                  <ScrollView style={styles.viewPasa}>
                    {this.props.passengers.map((item) => {
                      return (
                        <TouchableOpacity
                          key={item._id}
                          onPress={() => {
                            this.goToWhatsapp({
                              numero: `+57${item.cel}`,
                              mgs: `Hola ${item.names} ${item.lastnames}`,
                            });
                          }}
                          style={styles.BottonPasajeros}
                        >
                          <Text style={styles.text}>
                            {`${item.names} ${item.lastnames}`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <View style={styles.viewPasa}>
                    <Text style={styles.text}>
                      No hay pasajeros
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => {
                    this.props.closeModal();
                    this.props.refreshing();
                  }}
                  style={styles.BottonClose}
                >
                  <Text style={[styles.text, styles.textClose]}>Cerrar</Text>
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
    padding: 35,
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
    height: height * 0.45,
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
    marginBottom: height * 0.035, // Eliminada la duplicación
    marginTop: -height * 0.05,
    alignContent: "center",
    alignSelf: "center",
  },
});