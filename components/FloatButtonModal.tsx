import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { connect } from "react-redux";
import { ButtonOpenWebView } from "./webView/ButtonOpenWebView";
import { NavigationProp } from "@react-navigation/native";

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

interface NavPages {
  current: string;
  previous: string;
}

interface FloatButtonModalProps {
  navigation: NavigationProp<any>;
  dispatch: (action: any) => void;
  user: User;
  navPages: NavPages;
  id: string;
}

interface FloatButtonModalState {
  modalVisible: boolean;
}

interface RootState {
  session: {
    user: User;
  };
  navPages: {
    navPages: NavPages;
  };
  id: {
    id: string;
  };
}

class FloatButtonModal extends Component<FloatButtonModalProps, FloatButtonModalState> {
  static navigationOptions = {
    header: null,
  };

  constructor(props: FloatButtonModalProps) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <View style={[styles.floatButton, styles.center]}>
          <TouchableOpacity
            onPress={() => {
              this.setState({ modalVisible: true });
            }}
            style={styles.modalBtn}
          >
            <Text
              style={{
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
                lineHeight: Platform.OS === 'ios' ? height * 0.067  : height * 0.078,
              }}
            >
              <Icon
                name={"list-alt"}
                style={styles.icon}
                size={Platform.OS === 'ios' ? height * 0.055 : height * 0.045}
                color={"white"}
                type="ionicon"
              />
            </Text>
            <Text style={[styles.text, styles.textN]}></Text>
          </TouchableOpacity>
        </View>

        <View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({ modalVisible: false });
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modal}>
                <View>
                  <Icon />
                </View>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      modalVisible: !this.state.modalVisible,
                    })
                  }
                  style={styles.BottonClose}
                >
                  <Text style={[styles.text, styles.textClose]}>X</Text>
                </TouchableOpacity>

                <View style={[styles.center, styles.iconCenterModal]}>
                  <Icon
                    name={"user"}
                    color={"#E2991C"}
                    size={50}
                    type="ionicon"
                  />
                </View>

                <ButtonOpenWebView
                  styles={styles}
                  texto="Crear viaje express"
                  action={() => {
                    this.props.dispatch({
                      type: "SET_NAVPAGES",
                      navPages: { current: "Home", previous: this.props.navPages.current },
                    });
                    
                    navigate("FormProgramming");
                    this.setState({ modalVisible: false });
                  }}
                />
                <ButtonOpenWebView
                  styles={styles}
                  texto="Crear paquete turístico"
                  action={() => {
                    this.props.dispatch({
                      type: "SET_NAVPAGES",
                      navPages: { current: "Home", previous: this.props.navPages.current },
                    });
                    
                    navigate("FormTourisms");
                    this.setState({ modalVisible: false });
                  }}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { user } = state.session;
  const { navPages } = state.navPages;
  const { id } = state.id;
  
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
    navPages: {
      current: navPages.current,
      previous: navPages.previous,
    },
    id: id,
  };
};

export default connect(mapStateToProps)(FloatButtonModal);

const styles = StyleSheet.create({
  floatButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    shadowColor: "black",
    shadowOpacity: 0.2,
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
  },
  iconCenterModal: {
    position: "absolute",
    backgroundColor: "#FFF",
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 100,
    top: -height * 0.05,
  },
  BottonClose: {
    position: "absolute",
    backgroundColor: "#868686",
    borderRadius: 100,
    top: height * 0.01,
    right: height * 0.01,
    width: width * 0.09,
    alignContent: "center",
  },
  modalBtn: {
    backgroundColor: "#E2991C",
    borderRadius: 100,
    borderColor: "#FFF",
    width: width * 0.15,
    height: width * 0.15,
    alignContent: "center",
  },
  text: {
    fontSize: width * 0.05,
    color: "#FFF",
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
  },
  textClose: {
    lineHeight: width * 0.1,
  },
  textN: {
    lineHeight: width * 0.15,
  },
  textB: {
    lineHeight: width * 0.16,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
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
    height: height * 0.33,
    alignContent: "center",
  },
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(0,0,0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalBtnTop: {
    backgroundColor: "#E2991C",
    borderRadius: 100,
    borderColor: "black",
    elevation: 2,
    width: width * 0.7,
    height: height * 0.075,
    marginTop: height * 0.02,
  },
  modalBtnBot: {
    backgroundColor: "#E2991C",
    borderRadius: 100,
    borderColor: "black",
    elevation: 2,
    width: width * 0.7,
    marginTop: height * 0.02,
    alignItems: "center",
  },
  icon: {
    bottom: height * 0.1,
  },
});