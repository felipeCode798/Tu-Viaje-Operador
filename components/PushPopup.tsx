import React from 'react';
import { View } from 'react-native';

// Declaración simple para evitar la instalación de tipos
const NotificationPopup = require('react-native-push-notification-popup').default;

interface PushPopupProps {
  appTitle: string;
  timeText: string;
  title: string;
  body: string;
  navigation?: any;
}

interface PushPopupState {
  appTitle: string;
  timeText: string;
  title: string;
  body: string;
}

export default class PushPopup extends React.Component<PushPopupProps, PushPopupState> {
  static navigationOptions = {
    header: null,
  };

  private popup: any = null;

  constructor(props: PushPopupProps) {
    super(props);
    this.state = {
      appTitle: props.appTitle,
      timeText: props.timeText,
      title: props.title,
      body: props.body
    }
  }

  componentDidMount() {
    if (this.popup) {
      this.popup.show({
        onPress: () => { console.log('Pressed') },
        appIconSource: require('../assets/images/icon.png'),
        appTitle: this.state.appTitle,
        timeText: this.state.timeText,
        title: this.state.title,
        body: this.state.body,
      });
    }
  }

  render() {
    return (
      <NotificationPopup 
        ref={(ref: any) => { 
          this.popup = ref; 
        }} 
      />
    );
  }
}