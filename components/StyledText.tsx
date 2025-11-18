import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';

interface MonoTextProps extends TextProps {
}

export class MonoText extends React.Component<MonoTextProps> {
  render() {
    const { style, ...restProps } = this.props;
    return (
      <Text 
        {...restProps} 
        style={[style, { fontFamily: 'space-mono' }]} 
      />
    );
  }
}