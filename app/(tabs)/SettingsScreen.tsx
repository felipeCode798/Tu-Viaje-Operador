import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { POLITICAS } from '../../constants/politicas';
import { imageUrl } from '../../constants/Urls';
import { useAuth } from '../../contexts/AuthContext';

const { height, width } = Dimensions.get('window');

const SettingsScreen: React.FC = () => {
  // TODOS LOS HOOKS DEBEN ESTAR AL INICIO
  const { user, logout } = useAuth();
  const [viewTerms, setViewTerms] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Función mejorada para cerrar sesión
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevenir múltiples ejecuciones
    
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleTermsAndConditions = () => {
    setViewTerms(true);
  };

  const formatUserType = (type: string) => {
    return type === 'Conductor' ? 'Conductor' : 'Empresa';
  };

  // Función para obtener la URL correcta de la imagen de perfil
  const getProfileImageUrl = () => {
    // Primero intenta con la imagen de la empresa
    if (user?.enterprise?.image) {
      return { uri: user.enterprise.image };
    }
    
    // Luego intenta con la lógica del archivo antiguo
    if (user?.id || user?._id) {
      const userId = user.idUser || user.id || user._id;
      return { uri: `${imageUrl}${userId}.png` };
    }
    
    // Si no hay imagen, usa un placeholder
    return { uri: 'https://via.placeholder.com/120x120/FF9500/FFFFFF?text=Usuario' };
  };

  // Modal de Términos y Condiciones
  const renderTermsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={viewTerms}
      onRequestClose={() => setViewTerms(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.termsModal}>
          {/* Header del Modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setViewTerms(false)}
            >
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {/* Contenido del Modal */}
          <ScrollView style={styles.modalContent}>
            <Text style={styles.termsText}>
              {POLITICAS?.politicas || 'Términos y condiciones no disponibles.'}
            </Text>
          </ScrollView>
          
          {/* Footer del Modal */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => setViewTerms(false)}
            >
              <Text style={styles.acceptButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // CONTENIDO CONDICIONAL DESPUÉS DE TODOS LOS HOOKS
  const loadingView = (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tu Perfil</Text>
        <TouchableOpacity style={styles.logoutButton} disabled={true}>
          <MaterialIcons name="power-settings-new" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.centerContainer}>
        <MaterialIcons name="person" size={50} color="#FF9500" />
        <Text style={styles.errorText}>Cargando perfil...</Text>
      </View>
    </View>
  );

  // Si no hay usuario, mostrar vista de carga o error
  if (!user) {
    return loadingView;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tu Perfil</Text>
        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]} 
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <MaterialIcons 
            name={isLoggingOut ? "hourglass-empty" : "power-settings-new"} 
            size={24} 
            color={isLoggingOut ? "#333" : "#666"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={getProfileImageUrl()}
              style={styles.profileImage}
              onError={() => console.log('Error cargando imagen de perfil')}
            />
          </View>
          
          <Text style={styles.userName}>
            {user?.names || 'Usuario'} {user?.lastName || ''}
          </Text>
          
          <Text style={styles.userType}>
            {user?.type ? formatUserType(user.type) : 'Usuario'}
          </Text>

          {/* Contact Info Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <MaterialIcons name="phone" size={18} color="#333" />
              <Text style={styles.contactText}>{user?.phone || 'No disponible'}</Text>
            </View>
            
            <View style={styles.contactRow}>
              <MaterialIcons name="email" size={18} color="#333" />
              <Text style={styles.contactText}>{user?.email || 'No disponible'}</Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>Activo</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          {/* Terms and Conditions */}
          <TouchableOpacity 
            style={styles.settingItemClickable}
            onPress={handleTermsAndConditions}
          >
            <View style={styles.settingLeft}>
              <MaterialIcons name="description" size={24} color="#FF9500" />
              <Text style={styles.settingLabelClickable}>Términos y condiciones</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal de Términos y Condiciones */}
      {renderTermsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
  },
  logoutButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FF9500',
    padding: 4,
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    backgroundColor: '#333',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  userType: {
    fontSize: 18,
    color: '#FF9500',
    marginBottom: 25,
    fontWeight: '600',
  },
  contactCard: {
    width: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  statusRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingItemClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabelClickable: {
    fontSize: 18,
    color: '#FF9500',
    marginLeft: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  bottomSpacing: {
    height: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    height: height * 0.7,
    borderTopWidth: 5,
    borderTopColor: '#FF9500',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  termsText: {
    fontSize: 15,
    color: '#575757',
    textAlign: 'justify',
    lineHeight: 22,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  acceptButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;