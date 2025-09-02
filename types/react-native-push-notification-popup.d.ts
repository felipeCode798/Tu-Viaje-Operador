declare module 'react-native-push-notification-popup' {
  import { Component } from 'react';
  import { ImageSourcePropType } from 'react-native';

  export interface NotificationPopupProps {
    ref?: (ref: NotificationPopup) => void;
  }

  export interface ShowOptions {
    onPress?: () => void;
    appIconSource?: ImageSourcePropType;
    appTitle?: string;
    timeText?: string;
    title?: string;
    body?: string;
  }

  export default class NotificationPopup extends Component<NotificationPopupProps> {
    show: (options: ShowOptions) => void;
    hide: () => void;
  }
}