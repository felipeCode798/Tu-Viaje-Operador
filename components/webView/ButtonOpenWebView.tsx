import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Interfaces específicas para los estilos
interface CustomStyles {
  modalBtnBot: ViewStyle;
  text: TextStyle;
  textB: TextStyle;
}

interface ButtonOpenWebViewProps {
  styles: CustomStyles;
  texto: string;
  action: () => void;
}

export class ButtonOpenWebView extends React.Component<ButtonOpenWebViewProps> {
  render() {
    const { styles, texto, action } = this.props;
    return (
      <View>
        <TouchableOpacity
          onPress={action}
          style={styles.modalBtnBot}
        >
          <Text style={[styles.text, styles.textB]}>
            {texto}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}