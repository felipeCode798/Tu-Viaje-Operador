// components/FloatButtonModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext'; // ✅ AGREGADO

const FloatButtonModal: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth(); // ✅ Obtener el usuario del contexto

  const handleCreateProgramming = () => {
    setModalVisible(false);
    
    // ✅ Pasar el usuario como parámetro
    router.push({
      pathname: '/CreateProgramming',
      params: {
        userId: user?._id || user?.id || '',
        userName: user?.names || '',
      }
    });
  };

  const handleCreateTourism = () => {
    setModalVisible(false);
    
    router.push({
      pathname: '/CreateTourisms',
      params: {
        userId: user?._id || user?.id || '',
        userName: user?.names || '',
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.floatButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Servicio</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleCreateProgramming}
            >
              <MaterialIcons name="directions-bus" size={24} color="#FF9500" />
              <Text style={styles.optionText}>Crear viaje express</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleCreateTourism}
            >
              <MaterialIcons name="tour" size={24} color="#FF9500" />
              <Text style={styles.optionText}>Crear paquete turístico</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 105,
    right: 20,
    zIndex: 1000,
  },
  floatButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default FloatButtonModal;