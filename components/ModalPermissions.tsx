import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

interface ModalPermissionsProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

interface Permission {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  granted: boolean;
}

const MOCK_PERMISSIONS: Permission[] = [
  {
    id: '1',
    title: 'Ubicación',
    description: 'Necesario para mostrar tu ubicación en el mapa y calcular rutas',
    icon: 'location-on',
    required: true,
    granted: false
  },
  {
    id: '2',
    title: 'Cámara',
    description: 'Para tomar fotos de documentos y reportes de viaje',
    icon: 'camera-alt',
    required: false,
    granted: false
  },
  {
    id: '3',
    title: 'Almacenamiento',
    description: 'Para guardar fotos y documentos del viaje',
    icon: 'storage',
    required: false,
    granted: false
  },
  {
    id: '4',
    title: 'Notificaciones',
    description: 'Para recibir alertas importantes sobre tus viajes',
    icon: 'notifications',
    required: true,
    granted: false
  },
  {
    id: '5',
    title: 'Teléfono',
    description: 'Para realizar llamadas de emergencia durante el viaje',
    icon: 'phone',
    required: false,
    granted: false
  }
];

const ModalPermissions: React.FC<ModalPermissionsProps> = ({
  visible,
  onClose,
  onAccept
}) => {
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS);

  const togglePermission = (id: string) => {
    setPermissions(prev =>
      prev.map(permission =>
        permission.id === id
          ? { ...permission, granted: !permission.granted }
          : permission
      )
    );
  };

  const handleAcceptAll = () => {
    setPermissions(prev =>
      prev.map(permission => ({ ...permission, granted: true }))
    );
    onAccept();
  };

  const requiredPermissionsGranted = permissions
    .filter(p => p.required)
    .every(p => p.granted);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <MaterialIcons name="security" size={32} color="#FF9500" />
            <Text style={styles.headerTitle}>Permisos de la Aplicación</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Para brindarte la mejor experiencia, necesitamos acceso a ciertas funciones de tu dispositivo.
            </Text>
          </View>

          <ScrollView style={styles.permissionsList}>
            {permissions.map((permission) => (
              <View key={permission.id} style={styles.permissionItem}>
                <View style={styles.permissionLeft}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons 
                      name={permission.icon as any} 
                      size={24} 
                      color="#FF9500" 
                    />
                  </View>
                  <View style={styles.permissionInfo}>
                    <Text style={styles.permissionTitle}>
                      {permission.title}
                      {permission.required && (
                        <Text style={styles.requiredText}> *</Text>
                      )}
                    </Text>
                    <Text style={styles.permissionDescription}>
                      {permission.description}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.permissionToggle,
                    permission.granted && styles.permissionToggleActive
                  ]}
                  onPress={() => togglePermission(permission.id)}
                >
                  <MaterialIcons
                    name={permission.granted ? "check" : "close"}
                    size={20}
                    color={permission.granted ? "white" : "#999"}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              * Permisos requeridos para el funcionamiento básico
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onClose}
              >
                <Text style={styles.skipButtonText}>Saltar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAcceptAll}
              >
                <Text style={styles.acceptButtonText}>Aceptar Todos</Text>
              </TouchableOpacity>
            </View>

            {!requiredPermissionsGranted && (
              <Text style={styles.warningText}>
                Algunos permisos requeridos no están activados. La aplicación podría no funcionar correctamente.
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    height: height * 0.85,
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginLeft: 15,
  },
  closeButton: {
    padding: 5,
  },
  descriptionContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  requiredText: {
    color: '#FF9500',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  permissionToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  permissionToggleActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  footerNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#3a3a3a',
    borderRadius: 25,
    marginRight: 10,
  },
  skipButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FF9500',
    borderRadius: 25,
    marginLeft: 10,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
});

export default ModalPermissions;