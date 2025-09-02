import React from 'react';
import { Text, TouchableOpacity, View, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface ButtonOpenWebViewProps {
  styles: {
    modalBtnBot: StyleProp<ViewStyle>;
    text: StyleProp<TextStyle>;
    textB: StyleProp<TextStyle>;
  };
  texto: string;
  action: () => void;
}

export class ButtonOpenWebView extends React.Component<ButtonOpenWebViewProps> {
  render() {
    const { styles, texto, action } = this.props;
    return (
      <View>
        <TouchableOpacity
          onPress={() => { action() }}
          style={[styles.modalBtnBot]}
        >
          <Text style={[styles.text, styles.textB]}>
            {texto}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}