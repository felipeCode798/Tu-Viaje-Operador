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
  onSwichChange?: (value: boolean) => void;
  switchDay?: boolean;
  active?: boolean;
}

export const ConfigDay: React.FC<ConfigDayProps> = ({ 
  title, 
  onCuposChange, 
  onSwichChange, 
  switchDay = false, 
  active = false 
}) => {
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.substring(1);
  const [cupos, setCupos] = useState<string>("");

  const handleCuposChange = (text: string) => {
    const numericText = text.replace(/\D/g, '');
    setCupos(numericText);
    
    const cuposNumber = parseInt(numericText, 10);
    if (!isNaN(cuposNumber)) { 
      onCuposChange(cuposNumber);
    } else {
      onCuposChange(0); 
    }
  };

  const formatCupos = (value: string): string => {
    if (!value) return '';
    
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
        maxLength={3}
        value={formatCupos(cupos)}
      />

      {switchDay && onSwichChange ? (
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
  },
});