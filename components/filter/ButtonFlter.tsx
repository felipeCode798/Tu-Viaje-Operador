import React, { Component } from 'react';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  Dimensions,
  Text,
  View,
  StyleSheet,
  Image,
  Platform,
  ImageSourcePropType,
  Pressable,
} from 'react-native';

const { height, width } = Dimensions.get('window');

interface ButtonFilterProps {
  color: string;
  text: string;
  activeItemStatus?: boolean;
  action: (color: string) => void;
}

interface ButtonFilterState {}

export default class ButtonFilter extends Component<ButtonFilterProps, ButtonFilterState> {
  render() {
    const urlLocal = '../../assets/icons/';
    const colorImageMap: Record<string, ImageSourcePropType> = {
      pendientes: require(`${urlLocal}pendientes.png`),
      iniciado: require(`${urlLocal}iniciado.png`),
      cancelado: require(`${urlLocal}cancelado.png`),
      finalizado: require(`${urlLocal}finalizado.png`),
      todos: require(`${urlLocal}todos.png`),
    };

    const { color } = this.props;
    const imageSource = colorImageMap[color] || require(`${urlLocal}iniciado.png`);

    return (
      <Pressable
        onPress={() => {
          this.props.action(this.props.color);
        }}
      >
        <View style={styles.container}>
          <View
            style={[
              styles.containerImage,
              this.props.activeItemStatus && styles.active,
            ]}
          >
            <Image source={imageSource} style={styles.image} />
          </View>
          <Text style={styles.textWhite}>{this.props.text}</Text>
        </View>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerImage: {
    padding: Platform.OS === 'ios' ? height * 0.01 : height * 0.013,
    backgroundColor: '#2F2F2F',
    borderRadius: 100,
  },
  textWhite: {
    color: '#fff',
    fontSize: height * 0.01,
  },
  image: {
    width: width * 0.06,
    height: Platform.OS === 'ios' ? height * 0.027 : height * 0.04,
  },
  active: {
    borderWidth: 1.5,
    borderColor: '#E2991C',
  },
});