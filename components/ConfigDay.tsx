import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  View,
  Text,
  TextInput,
  Switch,
} from 'react-native';

const { height, width } = Dimensions.get('window');

interface ConfigDayProps {
  title: string;
  onCuposChange: (cupos: number) => void;
  onSwichChange: (value: boolean) => void;
  switchDay?: boolean;
  active?: boolean;
}

export const ConfigDay: React.FC<ConfigDayProps> = ({ 
  title, 
  onCuposChange, 
  onSwichChange, 
  switchDay, 
  active 
}) => {
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.substring(1);
  const [cupos, setCupos] = useState<string>("");

  const handleCuposChange = (text: string) => {
    // Remover caracteres no numéricos excepto puntos
    const numericText = text.replace(/[^\d.]/g, '');
    
    // Validar que solo haya números y máximo un punto decimal
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return; // No permitir múltiples puntos
    }
    
    setCupos(numericText);
    
    // Convertir a número y llamar al callback
    const numberValue = parseFloat(numericText);
    if (!isNaN(numberValue)) { 
      onCuposChange(numberValue);
    } else {
      onCuposChange(0); 
    }
  };

  const formatNumber = (value: string): string => {
    if (!value) return "";
    
    // Remover todos los caracteres no numéricos
    const numericValue = value.replace(/\D/g, "");
    
    // Formatear con separadores de miles
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <View style={styles.containerDay}>
      <Text style={{ color: 'white', width: width * 0.2 }}> 
        {capitalizedTitle} 
      </Text>
      <TextInput
        style={[styles.texColorWite, styles.textInput]}
        keyboardType="numeric"
        placeholder="Cupos diarios"
        placeholderTextColor="gray"
        onChangeText={handleCuposChange}
        maxLength={6} // Aumentado para permitir números más grandes formateados
        value={formatNumber(cupos)}
      />

      {switchDay ? (
        <View style={{ paddingLeft: 2 }}>
          <Switch
            style={styles.swichStyle}
            trackColor={{ false: '#767577', true: '#E2770f' }}
            onValueChange={onSwichChange}
            value={active}
            thumbColor={active ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  containerDay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    alignContent: 'center',
  },
  texColorWite: {
    color: 'white',
  },
  textInput: {
    fontSize: Platform.OS === 'ios' ? height * 0.015 : height * 0.016,
    marginVertical: 7,
    paddingVertical: 7,
    textAlign: 'center',
    borderColor: 'white',
    lineHeight: Platform.OS === 'ios' ? height * 0.02 : height * 0.02,
    borderWidth: width * 0.002,
    borderRadius: height * 0.02,
    width: width * 0.3,
  },
  swichStyle: {
    // Estilos adicionales para el switch si son necesarios
  },
});