import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

type UserType = 'Conductor' | 'Empresa';

interface LoginFormData {
  email: string;
  password: string;
  userType: UserType | '';
}

interface SelectOption {
  id: string;
  label: UserType;
  value: UserType;
}

const LoginScreen: React.FC = () => {
  const { login, forgotPassword, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    userType: 'Conductor',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState<boolean>(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const [isSendingRecovery, setIsSendingRecovery] = useState<boolean>(false);

  const userTypeOptions: SelectOption[] = [
    { id: '1', label: 'Conductor', value: 'Conductor' },
    { id: '2', label: 'Empresa', value: 'Empresa' },
  ];

  const handleInputChange = (field: keyof LoginFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async (): Promise<void> => {
    if (!formData.email || !formData.password || !formData.userType) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (formData.userType === 'Conductor' && !emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
        userType: formData.userType as UserType
      });
      
    } catch (error: any) {
      console.error('Error en handleLogin:', error);
      
      let errorMessage = error.message || 'Error al iniciar sesión';
      
      if (errorMessage.includes('incorrectas') || errorMessage.includes('incorrectos')) {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (errorMessage.includes('conexión') || errorMessage.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      } else if (errorMessage.includes('GraphQL') || errorMessage.includes('query')) {
        errorMessage = 'Error del servidor. Intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };
  
  const handleOpenForgotPassword = (): void => {
    setRecoveryEmail(formData.email); // Prellenar con el email del formulario
    setShowForgotPasswordModal(true);
  };

  const handleSendRecoveryEmail = async (): Promise<void> => {
    if (!recoveryEmail) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    try {
      setIsSendingRecovery(true);
      const success = await forgotPassword(recoveryEmail);
      
      if (success) {
        Alert.alert(
          'Solicitud enviada', 
          'Si el correo está registrado en nuestro sistema, ' +
          'recibirás un enlace de recuperación. ' +
          'Revisa tu bandeja de entrada y carpeta de spam.'
        );
        setShowForgotPasswordModal(false);
        setRecoveryEmail('');
      } else {
        Alert.alert(
          'Información', 
          'No se pudo procesar la solicitud. ' +
          'Esto puede deberse a que el correo no está registrado ' +
          'o a un problema temporal del servicio.'
        );
      }
    } catch (error: any) {
      console.error('Error en recuperación:', error);
      
      let errorMessage = 'Error al procesar la solicitud';
      
      if (error.message.includes('conexión') || error.message.includes('internet')) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSendingRecovery(false);
    }
  };

  const selectUserType = (userType: UserType): void => {
    setFormData(prev => ({
      ...prev,
      userType,
    }));
    setShowUserTypeModal(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={require('../../assets/images/bgLoginOperators.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logoBlancoOperador.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            
            <View style={styles.inputContainer}>
              <MaterialIcons 
                name="email" 
                size={20} 
                color="#666" 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Correo"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons 
                name="lock" 
                size={20} 
                color="#666" 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Contraseña"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                disabled={isLoading}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.inputContainer} 
              onPress={() => setShowUserTypeModal(true)}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <MaterialIcons 
                name="business" 
                size={20} 
                color="#666" 
                style={styles.inputIcon} 
              />
              <Text style={styles.selectText}>
                {formData.userType}
              </Text>
              <MaterialIcons 
                name="keyboard-arrow-down" 
                size={24} 
                color="#666" 
                style={styles.dropdownIcon} 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleOpenForgotPassword} disabled={isLoading}>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton]} 
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>INGRESAR</Text>
                  <MaterialIcons 
                    name="arrow-forward" 
                    size={20} 
                    color="white" 
                    style={styles.arrowIcon} 
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <Modal
        visible={showUserTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserTypeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona el tipo de usuario</Text>
            
            <FlatList
              data={userTypeOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    formData.userType === item.value && styles.selectedOption
                  ]}
                  onPress={() => selectUserType(item.value)}
                >
                  <MaterialIcons 
                    name={item.value === 'Conductor' ? 'person' : 'business'}
                    size={24} 
                    color={formData.userType === item.value ? '#FF9500' : '#666'}
                    style={styles.optionIcon}
                  />
                  <Text style={[
                    styles.optionText,
                    formData.userType === item.value && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {formData.userType === item.value && (
                    <MaterialIcons 
                      name="check" 
                      size={20} 
                      color="#FF9500" 
                    />
                  )}
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowUserTypeModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showForgotPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.recoveryModalContent}>
            <View style={styles.recoveryHeader}>
              <Text style={styles.recoveryTitle}>Recuperar Contraseña</Text>
              <TouchableOpacity 
                onPress={() => setShowForgotPasswordModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.recoveryDescription}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>

            <View style={styles.recoveryInputContainer}>
              <MaterialIcons 
                name="email" 
                size={20} 
                color="#666" 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#666"
                value={recoveryEmail}
                onChangeText={setRecoveryEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSendingRecovery}
              />
            </View>

            <TouchableOpacity 
              style={[styles.recoveryButton, isSendingRecovery && styles.recoveryButtonDisabled]} 
              onPress={handleSendRecoveryEmail}
              disabled={isSendingRecovery}
            >
              {isSendingRecovery ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.recoveryButtonText}>Enviar enlace de recuperación</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.recoveryCancelButton}
              onPress={() => {
                setShowForgotPasswordModal(false);
                setRecoveryEmail('');
              }}
              disabled={isSendingRecovery}
            >
              <Text style={styles.recoveryCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    //shadowOpacity: 0.25,
    //shadowRadius: 3.84,
  },
  logo: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  forgotPassword: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#FF9500',
    borderRadius: 25,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    letterSpacing: 0.5,
  },
  arrowIcon: {
    marginLeft: 5,
  },

  selectText: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'center',
    lineHeight: 50,
  },
  placeholderText: {
    color: '#666',
  },
  dropdownIcon: {
    marginLeft: 'auto',
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
    width: '85%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#FF9500',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  modalCloseText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
   recoveryModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  recoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recoveryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
    marginLeft: 10,
  },
  recoveryDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  recoveryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recoveryButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  recoveryButtonDisabled: {
    opacity: 0.7,
  },
  recoveryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recoveryCancelButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  recoveryCancelText: {
    color: '#666',
    fontSize: 16,
  },
});

export default LoginScreen;