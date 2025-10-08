import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const FloatButtonModal: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleCreateProgramming = () => {
    setModalVisible(false);
    router.push('/FormProgramming');
  };

  const handleCreateTourism = () => {
    setModalVisible(false);
    router.push('/FormTourisms');
  };

  return (
    <View>
      <View style={[styles.floatButton, styles.center]}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.modalBtn}
        >
          <MaterialIcons 
            name="list-alt" 
            size={height * 0.03} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modal}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.text, styles.textClose]}>X</Text>
            </TouchableOpacity>

            <View style={[styles.center, styles.iconCenterModal]}>
              <MaterialIcons name="business" color="#FF9500" size={50} />
            </View>

            <TouchableOpacity
              onPress={handleCreateProgramming}
              style={styles.modalButton}
            >
              <Text style={[styles.text, styles.buttonText]}>
                Crear viaje express
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreateTourism}
              style={styles.modalButton}
            >
              <Text style={[styles.text, styles.buttonText]}>
                Crear paquete turístico
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  floatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  iconCenterModal: {
    position: 'absolute',
    backgroundColor: '#FFF',
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 100,
    top: -height * 0.05,
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: '#868686',
    borderRadius: 100,
    top: height * 0.01,
    right: height * 0.01,
    width: width * 0.09,
    alignContent: 'center',
  },
  modalBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 100,
    borderColor: '#FFF',
    width: width * 0.15,
    height: width * 0.15,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: width * 0.05,
    color: '#FFF',
    textAlign: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  textClose: {
    lineHeight: width * 0.1,
  },
  buttonText: {
    lineHeight: width * 0.16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#4f4f4f',
    borderRadius: width * 0.05,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: height * 0.1,
    elevation: 5,
    width: width * 0.87,
    height: height * 0.33,
    alignContent: 'center',
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#FF9500',
    borderRadius: 100,
    borderColor: 'black',
    elevation: 2,
    width: width * 0.7,
    marginTop: height * 0.02,
    alignItems: 'center',
    paddingVertical: 12,
  },
});

export default FloatButtonModal;