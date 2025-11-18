import React from 'react';
import { View } from 'react-native';
import NotificationPopup from 'react-native-push-notification-popup';

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

  private popup: NotificationPopup | null = null;

  constructor(props: PushPopupProps) {
    super(props);
    const { appTitle, timeText, title, body } = this.props;
    this.state = {
      appTitle: appTitle,
      timeText: timeText,
      title: title,
      body: body
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

  private setPopupRef = (ref: NotificationPopup | null): void => {
    this.popup = ref;
  };

  render() {
    return (
      <NotificationPopup ref={this.setPopupRef} />
    );
  }
}