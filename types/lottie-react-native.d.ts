declare module 'lottie-react-native' {
  import { Component } from 'react';
  import { ViewProps, StyleProp, ViewStyle } from 'react-native';

  export interface LottieViewProps extends ViewProps {
    source: string | { uri: string } | any;
    autoPlay?: boolean;
    loop?: boolean;
    speed?: number;
    progress?: number;
    style?: StyleProp<ViewStyle>;
    resizeMode?: 'cover' | 'contain' | 'center';
  }

  export default class LottieView extends Component<LottieViewProps> {
    play: (startFrame?: number, endFrame?: number) => void;
    reset: () => void;
    pause: () => void;
    resume: () => void;
  }
}