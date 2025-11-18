import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { ButtonOpenWebView } from "./webView/ButtonOpenWebView";
import { server } from "./../constants/Urls";
import { Loader } from "./Loader";
import { Icon } from "react-native-elements";
import CreateTourisms from "../app/(tabs)/CreateTourisms";

const { height, width } = Dimensions.get("window");

interface ModalWebViewProps {

}

interface ModalWebViewState {
  URL: string;
  ModelVisible: boolean;
  LoaderVisible: boolean;
  WebViewCrearViaje?: boolean;
}

export class ModalWebView extends React.Component<ModalWebViewProps, ModalWebViewState> {
  constructor(props: ModalWebViewProps) {
    super(props);
    this.state = {
      URL: "",
      ModelVisible: false,
      LoaderVisible: true,
    };
  }

  showSpinner = (): void => {
    this.setState({ LoaderVisible: true });
  }

  hideSpinner = (): void => {
    this.setState({ LoaderVisible: false });
  }

  render() {
    const handleEwbView = (param: string): void => {
      this.setState({ 
        URL: `${server}:5000/#/${param}-form-webview`,
        ModelVisible: true 
      });
    };

    return (
      <View>
        <Modal
          animationType="fade"
          style={styles.modalWeb}
          visible={this.state.ModelVisible}
        >
          <CreateTourisms/>

          {this.state.LoaderVisible ? (
            <Loader /> 
          ) : (
            <>
              <View style={styles.icon}>
                <Icon
                  name={"ios-arrow-back"}
                  size={width * 0.1}
                  color="#000000"
                  type={"ionicon"}
                  onPress={() =>
                    this.setState({
                      WebViewCrearViaje: false,
                      URL: "",
                      ModelVisible: false,
                    })
                  }
                />
              </View>
            </>
          )}
        </Modal>
        <ButtonOpenWebView
          styles={styles}
          texto="Crear viaje express"
          action={() => handleEwbView("program")}
        />
        <ButtonOpenWebView
          styles={styles}
          texto="Crear paquete turistico"
          action={() => handleEwbView("tourisms")}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalWeb: {
    flex: 1,
    height: height,
    width: width,
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
    height: height * 0.075,
    marginTop: height * 0.035,
    alignItems: "center",
  },
  text: {
    fontSize: width * 0.07,
    color: "#FFF",
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    marginTop: height * 0.001,
  },
  textB: {
    lineHeight: width * 0.16,
  },
  BottonClose: {
    position: "absolute",
    backgroundColor: "#868686",
    borderRadius: 100,
    top: height * 0.02,
    right: height * 0.02,
    width: width * 0.1,
    height: width * 0.1,
    alignContent: "center",
  },
  textClose: {
    lineHeight: width * 0.11,
  },
  icon: {
    borderRadius: 100,
    backgroundColor: "transparent", 
    color: "transparent",
    position: "absolute",
    top: height * 0.03,
    left: width * 0.03,
    alignItems: "flex-start",
    zIndex: 1,
  },
});