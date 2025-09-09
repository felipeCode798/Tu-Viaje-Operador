import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleLogout = () => {
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
          onPress: logout,
        },
      ]
    );
  };

  const handleTermsAndConditions = () => {
    // Aquí puedes abrir un modal, navegar a otra pantalla o abrir un enlace web
    Alert.alert(
      'Términos y Condiciones',
      'Esta función abrirá los términos y condiciones de la aplicación.',
      [
        { text: 'OK' }
      ]
    );
  };

  const formatUserType = (type: string) => {
    return type === 'Conductor' ? 'Conductor' : 'Empresa';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tu Perfil</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="power-settings-new" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: user?.enterprise?.image || 'https://via.placeholder.com/120x120/FF9500/FFFFFF?text=Usuario'
              }}
              style={styles.profileImage}
            />
          </View>
          
          <Text style={styles.userName}>
            {user?.names} {user?.lastName}
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
          {/* Notifications */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications" size={24} color="#fff" />
              <Text style={styles.settingLabel}>Notificaciones</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#666', true: '#FF9500' }}
              thumbColor={pushNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Email Notifications */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="email" size={24} color="#fff" />
              <Text style={styles.settingLabel}>Notificaciones correo</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#666', true: '#FF9500' }}
              thumbColor={emailNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
  settingLabel: {
    fontSize: 18,
    color: 'white',
    marginLeft: 15,
    fontWeight: '500',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    padding: 10,
  },
  navItemActive: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
  },
});

export default SettingsScreen;