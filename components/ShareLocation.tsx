import React, { Component } from 'react';
import { Dimensions, Share, ShareContent } from 'react-native';
import { Icon } from "react-native-elements";

const { height, width } = Dimensions.get('window');

interface ShareLocationProps {
  size?: number;
  color?: string;
}

interface ShareLocationState {
}

export default class ShareLocation extends Component<ShareLocationProps, ShareLocationState> {

  async onShare(): Promise<void> {
    const shareContent: ShareContent = {
      message: "Av. Joaquín Borrero Sinisterra #50-107 a 50-53, Cali, Valle del Cauca",
    };
  }

  render() {
    const { size, color } = this.props;
    return (
      <Icon 
        onPress={() => this.onShare()}
        name='share-google'
        size={size}
        color={color}
        type={'evilicon'}
      />
    );
  }
}