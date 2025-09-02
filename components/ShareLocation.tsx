import React, {Component} from 'react';
import {Dimensions, Share} from 'react-native';
import {Icon} from "react-native-elements";

const {height, width} = Dimensions.get('window');

interface ShareLocationProps {
  size: number;
  color: string;
}

interface ShareLocationState {
  // Puedes agregar estado aquí si es necesario
}

export default class ShareLocation extends Component<ShareLocationProps, ShareLocationState> {

  onShare = async (): Promise<void> => {
    try {
      const result = await Share.share({
        message: "Av. Joaquín Borrero Sinisterra #50-107 a 50-53, Cali, Valle del Cauca",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  render() {
    const {size, color} = this.props;
    return (
      <Icon 
        onPress={this.onShare}
        name='share-google'
        size={size}
        color={color}
        type={'evilicon'}
      />
    );
  }
}