import React from 'react';
import { Dimensions, Text, View, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

interface ConfirmadosListProps {
  typeItem?: 'tour' | 'program';
  status?: string;
  colorFont?: string;
  time?: string;
  route?: string;
}

const ConfirmadosList: React.FC<ConfirmadosListProps> = ({
  typeItem = 'tour',
  status = 'pendiente',
  colorFont = 'pendienteColor',
  time = ' 1:00 PM',
  route = 'Popayan - Cali',
}) => {
  return (
    <View style={styles.infoData}>
      <View style={[styles.infoIcon]}>
        <MaterialIcons
          name={typeItem === 'tour' ? 'work' : 'directions-bus'}
          color="#fff"
          size={25}
        />
      </View>
      <View style={[styles.namePaq]}>
        <Text style={[styles.colorW, styles.infoDataText]}>{route}</Text>
      </View>
      <View style={[styles.timePac]}>
        <Text style={[styles.colorW, styles.infoDataText]}>{time}</Text>
      </View>
      <View style={[styles.statusPaq]}>
        <Text style={[styles[colorFont as keyof typeof styles], styles.infoDataText]}>
          {status}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoData: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: height * 0.01,
    marginHorizontal: width * 0.05,
    backgroundColor: '#010101',
    height: height * 0.07,
    borderRadius: height * 0.015,
    borderColor: '#FFF',
  },
  infoDataText: {
    fontFamily: 'Roboto',
    fontSize: Platform.OS === 'ios' ? width * 0.03 : width * 0.031,
  },
  infoIcon: {
    marginHorizontal: width * 0.08,
    width: 25,
  },
  namePaq: {
    width: width * 0.27,
  },
  timePac: {
    width: width * 0.2,
  },
  statusPaq: {
    width: width * 0.2,
  },
  colorW: {
    color: '#fff',
  },
  pendienteColor: {
    color: '#56D0FD',
  },
  canceladoColor: {
    color: '#FF5249',
  },
  finalizadoColor: {
    color: '#E2991C',
  },
  progresoColor: {
    color: '#3ECE12',
  },
});

export default ConfirmadosList;