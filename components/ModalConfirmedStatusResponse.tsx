import * as React from "react";
import { useImperativeHandle, ForwardedRef } from "react";
import { View, Text, StyleSheet, Modal, Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

// Definir interfaces para las props y la referencia
interface Props {
  statustitle?: string;
  statusmessage: string;
  showModal: boolean;
  setModal: (value: boolean) => void;
}

export interface ModalRef {
  handleModal: () => void;
}

const ModalConfirmedStatusResponse = React.forwardRef<ModalRef, Props>(
  (props, ref) => {
    const { statustitle, statusmessage, showModal, setModal } = props;

    const handleModal = () => {
      setTimeout(() => {
        setModal(!showModal);
      }, 2000);
    };

    useImperativeHandle(ref, () => ({
      handleModal,
    }));

    return (
      <Modal
        animationType="slide"
        visible={showModal}
        transparent={true}
      >
        <View style={styles.centeredView}>
          <View style={styles.modal}>
            <Text
              style={{
                fontSize: width * 0.05,
                color: "white",
                textAlign: "justify",
              }}
            >
              {`${statusmessage}`}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }
);

// Añadir displayName para mejor debugging
ModalConfirmedStatusResponse.displayName = "ModalConfirmedStatusResponse";

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(0,0,0, 0.4)",
    marginTop: 0,
    zIndex: 1,
  },
  modal: {
    backgroundColor: "#E2991C",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: height * 0.1,
    width: width,
    height: height * 0.11,
    alignContent: "center",
  },
});

export default ModalConfirmedStatusResponse; // Cambia a export default