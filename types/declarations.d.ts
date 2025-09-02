declare module '@tighten/react-native-time-input' {
  import { Component } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  interface TimeInputProps {
    setCurrentTime?: boolean;
    onTimeChange?: (time: string) => void;
    theme?: {
      inputBackgroundColor?: string;
      inputTextColor?: string;
    };
    styles?: {
      componentContainer?: ViewStyle;
    };
  }

  export default class TimeInput extends Component<TimeInputProps> {}
}

declare module '@codler/react-native-keyboard-aware-scroll-view' {
  import { Component } from 'react';
  import { ScrollViewProps } from 'react-native';

  export class KeyboardAwareScrollView extends Component<ScrollViewProps> {
    scrollToFocusedInput: (event: any) => void;
  }
}