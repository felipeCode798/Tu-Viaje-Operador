import React, { Component } from "react";
import { Button } from "react-native-elements";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Dimensions } from "react-native";

interface AppButtonProps {
  disabled?: boolean;
  action: () => void;
  iconName: string;
  iconColor: string;
  iconSize: number;
  title?: string;
  bgColor?: string;
  buttonHeight?: number;
  buttonWidth?: number;
  radius?: number;
}

export default class AppButton extends Component<AppButtonProps> {
  render() {
    const {
      disabled = false,
      action,
      iconName,
      iconColor,
      iconSize,
      title = "title Button",
      bgColor = "#E2991C",
      buttonHeight,
      buttonWidth,
      radius = 5,
    } = this.props;
    
    let { width } = Dimensions.get("window");

    if (buttonWidth !== undefined) {
      width = buttonWidth;
    }

    return (
      <Button
        disabled={disabled}
        onPress={action}
        buttonStyle={{
          backgroundColor: bgColor,
          height: buttonHeight,
          borderColor: "transparent",
          borderWidth: 0,
          borderRadius: radius,
          width: width,
        }}
        title={title}
        icon={
          <FontAwesome5 
            name={iconName} 
            size={iconSize} 
            color={iconColor} 
            style={{ marginLeft: 15, marginTop: 2 }} 
          />
        }
        iconRight={true}
        titleStyle={{ fontFamily: "Roboto", fontSize: width * 0.05 }}
      />
    );
  }
}