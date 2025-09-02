declare module 'react-native-modal-selector' {
  import { Component, ReactNode } from 'react';
  import { StyleProp, ViewStyle, TextStyle } from 'react-native';

  export interface ModalSelectorOption {
    key: string | number;
    label: string;
    section?: boolean;
    accessibilityLabel?: string;
    component?: ReactNode;
  }

  export interface ModalSelectorProps {
    data: ModalSelectorOption[];
    initValue?: string;
    initValueText?: string;
    supportedOrientations?: ('portrait' | 'landscape')[];
    accessible?: boolean;
    scrollViewAccessibilityLabel?: string;
    cancelButtonAccessibilityLabel?: string;
    cancelText?: string;
    children?: ReactNode;
    onChange?: (option: ModalSelectorOption) => void;
    onModalOpen?: () => void;
    onModalClose?: () => void;
    keyExtractor?: (item: ModalSelectorOption) => string;
    labelExtractor?: (item: ModalSelectorOption) => string;
    componentExtractor?: (item: ModalSelectorOption) => ReactNode;
    style?: StyleProp<ViewStyle>;
    initValueTextStyle?: StyleProp<TextStyle>;
    selectStyle?: StyleProp<ViewStyle>;
    selectTextStyle?: StyleProp<TextStyle>;
    optionStyle?: StyleProp<ViewStyle>;
    optionTextStyle?: StyleProp<TextStyle>;
    optionContainerStyle?: StyleProp<ViewStyle>;
    cancelStyle?: StyleProp<ViewStyle>;
    cancelTextStyle?: StyleProp<TextStyle>;
    overlayStyle?: StyleProp<ViewStyle>;
    sectionStyle?: StyleProp<ViewStyle>;
    sectionTextStyle?: StyleProp<TextStyle>;
    animationType?: 'none' | 'slide' | 'fade';
    disabled?: boolean;
    backdropPressToClose?: boolean;
    openButtonContainerAccessibilityLabel?: string;
  }

  export default class ModalSelector extends Component<ModalSelectorProps> {}
}