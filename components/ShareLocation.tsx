import React, { Component } from 'react';
import { Dimensions, Share, ShareContent } from 'react-native';
import { Icon } from "react-native-elements";

const { height, width } = Dimensions.get('window');

interface ShareLocationProps {
  size?: number;
  color?: string;
}

interface ShareLocationState {
  // Puedes agregar propiedades de estado si son necesarias
}

export default class ShareLocation extends Component<ShareLocationProps, ShareLocationState> {

  async onShare(): Promise<void> {
    const shareContent: ShareContent = {
      message: "Av. Joaquín Borrero Sinisterra #50-107 a 50-53, Cali, Valle del Cauca",
    };

    try {
      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Compartido con actividad:', result.activityType);
        } else {
          // shared
          console.log('Compartido exitosamente');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Compartir cancelado');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
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