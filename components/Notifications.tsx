import React from 'react';
import { Text, View, Platform } from 'react-native';
import PushPopup from './PushPopup';

// Interfaces para las notificaciones
interface NotificationData {
  title: string;
  body: string;
}

interface Notification {
  data: NotificationData;
}

interface AppContainerState {
  notification: Notification | null;
  timeOut: number | null;
}

interface AppContainerProps {
  navigation?: any;
}

export default class AppContainer extends React.Component<AppContainerProps, AppContainerState> {
  static navigationOptions = {
    header: null,
  };

  constructor(props: AppContainerProps) {
    super(props);
    this.state = {
      notification: null,
      timeOut: null,
    };
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      // Notifications.setNotificationChannelAsync('popup', {
      //   name: 'Remainders',
      //   importance: Notifications.AndroidImportance.MAX,
      //   vibrationPattern: [0, 250, 250, 250],
      //   lightColor: '#FF231F7C',
      // });
    }
  }

  _handleNotification = (notification: Notification) => {
    if (this.state.timeOut) {
      clearTimeout(this.state.timeOut);
    }
    
    const timeOut = setTimeout(() => {
      this.setState({ notification: notification });
    }, 500) as unknown as number;
    
    this.setState({ notification: null, timeOut });
  };

  componentWillUnmount() {
    if (this.state.timeOut) {
      clearTimeout(this.state.timeOut);
    }
  }

  render() {
    return (
      <View style={Platform.OS === 'ios' ? { position: 'absolute', zIndex: 2 } : {}}>
        {this.state.notification !== null ? (
          <PushPopup
            appTitle={'Tu Viaje App'}
            timeText={'Now'}
            title={this.state.notification.data.title}
            body={this.state.notification.data.body}
          />
        ) : (
          <View />
        )}
      </View>
    );
  }
}