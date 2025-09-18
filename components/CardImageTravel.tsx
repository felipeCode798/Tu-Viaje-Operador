import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View, ImageBackground, Text, ImageSourcePropType, ImageURISource } from 'react-native';

// Solución temporal para react-native-stars
const Stars = require('react-native-stars') as any;

// Solución temporal para react-native-vector-icons
const IconComponent = { 
  name: 'star',
  size: 15,
  color: 'white'
} as any;

interface AppButtonProps {
  actionPress: () => void;
  urlImageOne?: string;
  urlImageTwo?: string;
  children?: React.ReactNode;
  height?: number;
  width?: number;
  heightTotal?: number;
  widthTotal?: number;
  url?: boolean;
  status?: string;
}

interface AppButtonState {
  // Puedes agregar estado si es necesario
}

export default class AppButton extends Component<AppButtonProps, AppButtonState> {
  render() {
    const { actionPress, urlImageOne, urlImageTwo, children, height,
            width, heightTotal, widthTotal, url, status } = this.props;
    
    let imageOne: ImageSourcePropType = require('../assets/images/icon.png');
    let imageTwo: ImageSourcePropType = require('../assets/images/icon.png');
    let uriOne: ImageURISource = { uri: '' };
    let uriTwo: ImageURISource = { uri: '' };
    
    if (url) {
      uriOne = {
        uri: urlImageOne !== '' ? urlImageOne!
          : 'https://dubsism.files.wordpress.com/2017/12/image-not-found.png'
      };
      uriTwo = {
        uri: urlImageTwo !== '' ? urlImageTwo!
          : 'https://dubsism.files.wordpress.com/2017/12/image-not-found.png'
      };
    } else {
      imageOne = urlImageOne as ImageSourcePropType;
      imageTwo = urlImageTwo as ImageSourcePropType;
    }

    const opacityValue = status === 'Proximo' ? 0.8 : status === 'En progreso' ? 0.8 : 0.4;

    // Componentes de estrellas como elementos JSX simples (solución temporal)
    const fullStar = (
      <Text style={[styles.myStarStyle, { fontSize: width ? width * 0.05 : 15 }]}>
        ⭐
      </Text>
    );

    const emptyStar = (
      <Text style={[styles.myStarStyle, styles.myEmptyStarStyle, { fontSize: width ? width * 0.05 : 15 }]}>
        ☆
      </Text>
    );

    return (
      <View>
        <TouchableOpacity onPress={actionPress}>
          <View style={{
            flex: 1,
            minHeight: heightTotal ? heightTotal * 0.24 : undefined,
            padding: 0,
            borderWidth: 0,
            borderColor: 'transparent',
            paddingHorizontal: widthTotal ? widthTotal * 0.03 : 0,
            paddingVertical: heightTotal ? heightTotal * 0.005 : 0,
          }}>
            <View style={{flex: 1}}>
              {children}
              <View style={{flex: 1, flexDirection: 'row'}}>
                <ImageBackground
                  style={{
                    flex: 1, 
                    height: height, 
                    width: undefined,
                    backgroundColor: 'black',
                    borderBottomLeftRadius: 5, 
                    borderTopLeftRadius: 5
                  }}
                  imageStyle={{
                    borderBottomLeftRadius: 5, 
                    borderTopLeftRadius: 5,
                    width: undefined,
                    opacity: opacityValue
                  }}
                  source={url ? uriOne : imageOne}
                >
                  <View style={{flex: 1}}>
                    <Text style={{
                      flex: 1, 
                      fontFamily: 'Roboto', 
                      color: "white",
                      paddingLeft: widthTotal ? widthTotal * 0.02 : 0, 
                      paddingTop: heightTotal ? heightTotal * 0.01 : 0,
                      fontSize: 15
                    }}>
                      {status}
                    </Text>
                    <View style={{
                      flex: 1, 
                      justifyContent: 'flex-end',
                      alignItems: 'center', 
                      paddingBottom: heightTotal ? heightTotal * 0.01 : 0
                    }}>
                      <Text style={{
                        fontFamily: 'Roboto', 
                        color: "white",
                        fontSize: 17,
                      }}>
                        {"Cali"}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
                <ImageBackground
                  style={{
                    flex: 1, 
                    height: height, 
                    width: undefined,
                    backgroundColor: 'black',
                    borderTopRightRadius: 5, 
                    borderBottomRightRadius: 5
                  }}
                  imageStyle={{
                    borderTopRightRadius: 5, 
                    borderBottomRightRadius: 5,
                    width: undefined,
                    opacity: opacityValue
                  }}
                  source={url ? uriTwo : imageTwo}
                >
                  <View style={{flex: 1}}>
                    <View style={{
                      flex: 1, 
                      alignItems: 'flex-end',
                      paddingTop: heightTotal ? heightTotal * 0.01 : 0, 
                      paddingRight: widthTotal ? widthTotal * 0.02 : 0
                    }}>
                      <Stars
                        default={4}
                        count={5}
                        half={false}
                        disabled={true}
                        fullStar={fullStar}
                        emptyStar={emptyStar}
                      />
                    </View>
                    <View style={{
                      flex: 1, 
                      justifyContent: 'flex-end',
                      alignItems: 'center', 
                      paddingBottom: heightTotal ? heightTotal * 0.01 : 0
                    }}>
                      <Text style={{
                        fontFamily: 'Roboto', 
                        color: "white",
                        fontSize: 17,
                      }}>
                        {"Armenia"}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  myStarStyle: {
    color: 'white',
    backgroundColor: 'transparent',
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  cardStarStyle: {
    color: 'black',
    backgroundColor: 'transparent',
    textShadowColor: 'gray',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  myEmptyStarStyle: {
    color: 'white',
  },
});