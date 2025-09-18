import React, { Component } from 'react';
import { Dimensions, ImageBackground, ImageSourcePropType, StyleProp, ImageStyle, ViewStyle } from 'react-native';

const { height, width } = Dimensions.get('window');

interface BackgroundImageProps {
  source: ImageSourcePropType;
  children?: React.ReactNode;
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

interface BackgroundImageState {
  // Puedes agregar estado si es necesario
}

export default class BackgroundImage extends Component<BackgroundImageProps, BackgroundImageState> {
  render() {
    const { source, children, imageStyle, containerStyle } = this.props;
    
    return (
      <ImageBackground
        source={source}
        style={containerStyle}
        imageStyle={imageStyle}
      >
        {children}
      </ImageBackground>
    );
  }
}