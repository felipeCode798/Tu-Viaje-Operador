import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ImageSourcePropType } from 'react-native';

interface AppButtonProps {
  actionPress: () => void;
  urlImage?: string;
  children?: React.ReactNode;
  height?: number;
  width?: number;
  heightTotal?: number;
  url?: boolean;
  timer?: boolean;
  stringTimer?: string;
}

interface AppButtonState {
  // Puedes agregar estado si es necesario
}

export default class AppButton extends Component<AppButtonProps, AppButtonState> {
  render() {
    const { actionPress, urlImage, children, height, width, heightTotal, url, timer, stringTimer } = this.props;
    
    let image: ImageSourcePropType = require('../assets/images/icon.png');
    let uri: { uri: string } = { uri: '' };
    
    if (url) {
      uri = { 
        uri: urlImage !== '' ? urlImage! : 'https://dubsism.files.wordpress.com/2017/12/image-not-found.png' 
      };
    } else {
      image = urlImage as ImageSourcePropType;
    }

    return (
      <View>
        <TouchableOpacity onPress={actionPress}>
          <View style={{
            borderRadius: 5,
            minHeight: heightTotal ? heightTotal * 0.24 : undefined,
            padding: 0,
            borderWidth: 1,
            borderColor: 'black',
            backgroundColor: 'white',
            margin: 10,
            shadowColor: '#000000',
            shadowOffset: { width: 1, height: 5 },
            shadowRadius: 20,
            shadowOpacity: 1.0,
            elevation: 5,
          }}>
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
              {timer ? (
                <View style={{
                  position: 'absolute', 
                  top: 0,
                  width: width ? width * 0.6 : 0,
                  height: height ? height * 0.2 : 0,
                  alignItems: 'flex-start',
                  paddingLeft: width ? width * 0.03 : 0,
                  zIndex: 1,
                  backgroundColor: 'black',
                  borderBottomRightRadius: 5,
                }}>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View>
                      <Text style={{ 
                        paddingRight: width ? width * 0.01 : 0, 
                        marginTop: 2,
                        color: 'white',
                        fontSize: 15
                      }}>
                        ⏰
                      </Text>
                    </View>
                    <View>
                      <Text style={{
                        color: "white",
                        fontFamily: 'Roboto',
                        fontSize: 15,
                      }}>
                        {stringTimer}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : <View />}
              <Image
                style={{
                  flex: 1,
                  alignSelf: 'stretch',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  height: height,
                  width: width,
                  zIndex: 0
                }}
                source={url ? uri : image}
              />
            </View>
            {children}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  containerHome: {
    flex: 1,
    left: 1,
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 5,
  },
  inputs: {
    borderBottomWidth: 0,
  },
  styleCard: {
    borderBottomWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 5 },
    shadowRadius: 20,
    shadowOpacity: 1.0,
    elevation: 5,
    borderRadius: 5,
  },
});