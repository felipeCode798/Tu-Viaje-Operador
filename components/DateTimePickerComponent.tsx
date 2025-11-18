import React, { Component } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Input } from "react-native-elements";
import Moment from 'moment';

const DateTimePicker: any = require('react-native-modal-datetime-picker').default;
const Icon: any = require('react-native-vector-icons/FontAwesome').default;

interface DateTimePickerComponentProps {
  label: string;
  callback: (date: string) => void;
}

interface DateTimePickerComponentState {
  isDateTimePickerVisible: boolean;
  date: string;
}

export default class DateTimePickerComponent extends Component<DateTimePickerComponentProps, DateTimePickerComponentState> {
  constructor(props: DateTimePickerComponentProps) {
    super(props);
    this.state = {
      isDateTimePickerVisible: false,
      date: 'dd/mm/yyyy',
    };
  }

  _showDateTimePicker = (): void => {
    this.setState({ isDateTimePickerVisible: true });
  };

  _hideDateTimePicker = (): void => {
    this.setState({ isDateTimePickerVisible: false });
  };

  _handleDatePicked = (date: Date): void => {
    const formattedDate = this.formatDate(date);
    this.setState({ date: formattedDate });
    this.props.callback(formattedDate);
    this._hideDateTimePicker();
  };

  formatDate = (date: Date): string => {
    Moment.locale('en');
    return Moment(date).format('DD/MM/YYYY');
  };

  render() {
    const { label } = this.props;
    const { width } = Dimensions.get('window');
    
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={this._showDateTimePicker}>
          <Input
            editable={false}
            label={label}
            labelStyle={{
              color: "#696969",
              fontSize: 16,
              fontFamily: 'Roboto',
              fontWeight: '200'
            }}
            placeholder='dd-mm-yyyy'
            rightIcon={
              <Icon
                name='calendar'
                size={width * 0.05}
                color='black'
              />
            }
            value={this.state.date}
            inputStyle={{ fontSize: width * 0.04, color: "#575757", fontFamily: 'Roboto' }}
          />
        </TouchableOpacity>
        
        <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
          mode={'date'}
          datePickerModeAndroid={'calendar'}
        />
      </View>
    );
  }
}