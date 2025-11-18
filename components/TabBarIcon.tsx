import React from 'react';
import { Dimensions, Text, View, ViewStyle, TextStyle } from 'react-native';

const { height, width } = Dimensions.get('window');

interface TabBarIconProps {
  name: string;
  size: number;
  focused: boolean;
  title?: string;
}

let MaterialCommunityIcons: any;
try {
  MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;
} catch (e) {
  MaterialCommunityIcons = () => null;
}

export default class TabBarIcon extends React.Component<TabBarIconProps> {
  render() {
    const { name, size, focused, title } = this.props;
    
    const iconContainerStyle: ViewStyle = {
      alignSelf: 'center',
      backgroundColor: focused ? '#000' : undefined,
      borderRadius: 50,
      width: width * 0.165,
      paddingTop: height * 0.005,
      top: focused ? -15 : -4,
      height: height * 0.041,
      justifyContent: 'center',
      alignItems: 'center',
    };

    const textStyle: TextStyle = {
      color: 'white',
      top: -18,
      textAlign: 'center',
      fontSize: 10
    };

    const containerStyle: ViewStyle = {
      backgroundColor: 'black',
      width: width * 0.2
    };

    return (
      <View style={containerStyle}>
        <View style={iconContainerStyle}>
          <MaterialCommunityIcons
            name={name}
            size={size}
            color={focused ? 'orange' : 'white'}
          />
        </View>
        {focused && (
          <Text style={textStyle}>
            {title || 'default'}
          </Text>
        )}
      </View>
    );
  }
}