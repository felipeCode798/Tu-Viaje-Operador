declare module 'react-native-modal-datetime-picker' {
  import { Component } from 'react';
  import { StyleProp, ViewStyle } from 'react-native';

  interface DateTimePickerProps {
    isVisible: boolean;
    onConfirm: (date: Date) => void;
    onCancel: () => void;
    mode?: 'date' | 'time' | 'datetime';
    datePickerModeAndroid?: 'calendar' | 'spinner' | 'default';
    minimumDate?: Date;
    maximumDate?: Date;
    date?: Date;
    style?: StyleProp<ViewStyle>;
  }

  export default class DateTimePicker extends Component<DateTimePickerProps> {}
}