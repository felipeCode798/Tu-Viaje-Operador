import React, { Component } from 'react';
import { Dimensions, ImageBackground, ImageStyle, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';

const { height, width } = Dimensions.get('window');

interface BackgroundImageProps {
  source: ImageSourcePropType;
  children?: React.ReactNode;
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export default class BackgroundImage extends Component<BackgroundImageProps> {
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