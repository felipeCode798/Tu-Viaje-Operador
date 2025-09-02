import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions, Text, View, StyleProp, ViewStyle, TextStyle} from 'react-native';

const {height, width} = Dimensions.get('window');

interface TabBarIconProps {
  name: string;
  size: number;
  focused: boolean;
  title?: string;
}

export default class TabBarIcon extends React.Component<TabBarIconProps> {
  render() {
    const {name, size, focused, title} = this.props;
    
    return (
      <View style={{backgroundColor: 'black', width: width * 0.2}}>
        <MaterialCommunityIcons
          name={name}
          size={size}
          color={focused ? 'orange' : 'white'}
          style={{
            alignSelf: 'center',
            backgroundColor: focused ? '#000' : undefined,
            borderRadius: 50,
            width: width * 0.165,
            paddingTop: height * 0.005,
            top: focused ? -15 : -4,
            height: height * 0.041,
            textAlign: 'center',
          }}
        />
        {focused && (
          <Text style={{color: 'white', top: -18, textAlign: 'center', fontSize: 10}}>
            {title || 'default'}
          </Text>
        )}
      </View>
    );
  }
}