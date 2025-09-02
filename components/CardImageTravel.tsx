import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View, ImageBackground, Text, ImageSourcePropType, StyleProp, ImageStyle} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Componente personalizado de estrellas para reemplazar react-native-stars
interface StarsProps {
  rating: number;
  maxStars?: number;
  starSize?: number;
  disabled?: boolean;
}

const CustomStars: React.FC<StarsProps> = ({ rating, maxStars = 5, starSize = 20, disabled = true }) => {
  const stars = [];
  
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <Icon
        key={i}
        name={i <= rating ? 'star' : 'star-o'}
        size={starSize}
        color="white"
        style={[
          styles.myStarStyle,
          i > rating && styles.myEmptyStarStyle
        ]}
      />
    );
  }
  
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

interface AppButtonProps {
  actionPress: () => void;
  urlImageOne: string;
  urlImageTwo: string;
  children?: React.ReactNode;
  height: number;
  width: number;
  heightTotal: number;
  widthTotal: number;
  url?: boolean;
  status?: string;
}

export default class AppButton extends Component<AppButtonProps> {
    render() {
        const {actionPress, urlImageOne, urlImageTwo, children, height,
            width, heightTotal, widthTotal, url, status} = this.props;
        
        let imageOne: ImageSourcePropType = require('../assets/images/icon.png');
        let imageTwo: ImageSourcePropType = require('../assets/images/icon.png');
        let uriOne: {uri: string} = {uri: ''};
        let uriTwo: {uri: string} = {uri: ''};
        
        if (url) {
            uriOne = {
                uri: urlImageOne !== '' ? urlImageOne : 'https://dubsism.files.wordpress.com/2017/12/image-not-found.png'
            };
            uriTwo = {
                uri: urlImageTwo !== '' ? urlImageTwo : 'https://dubsism.files.wordpress.com/2017/12/image-not-found.png'
            };
        } else {
            imageOne = urlImageOne as ImageSourcePropType;
            imageTwo = urlImageTwo as ImageSourcePropType;
        }

        const getOpacity = (): number => {
            switch (status) {
                case 'Proximo':
                case 'En progreso':
                    return 0.8;
                default:
                    return 0.4;
            }
        };

        const opacityStyle: StyleProp<ImageStyle> = { opacity: getOpacity() };

        return (
            <View>
                <TouchableOpacity onPress={actionPress}>
                    <View style={{
                        flex: 1,
                        minHeight: heightTotal * 0.24,
                        padding: 0,
                        borderWidth: 0,
                        borderColor: 'transparent',
                        paddingHorizontal: widthTotal * 0.03,
                        paddingVertical: heightTotal * 0.005,
                    }}>
                        <View style={{flex: 1}}>
                            {children}
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <ImageBackground
                                    style={{
                                        flex: 1, 
                                        height: height, 
                                        width: null, 
                                        backgroundColor: 'black',
                                        borderBottomLeftRadius: 5, 
                                        borderTopLeftRadius: 5
                                    }}
                                    imageStyle={{
                                        borderBottomLeftRadius: 5, 
                                        borderTopLeftRadius: 5, 
                                        width: null,
                                        ...opacityStyle
                                    }}
                                    source={url ? uriOne : imageOne}
                                >
                                    <View style={{flex: 1}}>
                                        <Text style={{
                                            flex: 1, 
                                            fontFamily: 'Roboto', 
                                            color: "white",
                                            paddingLeft: widthTotal * 0.02, 
                                            paddingTop: heightTotal * 0.01,
                                            fontSize: 15
                                        }}>
                                            {status}
                                        </Text>
                                        <View style={{
                                            flex: 1, 
                                            justifyContent: 'flex-end',
                                            alignItems: 'center', 
                                            paddingBottom: heightTotal * 0.01
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
                                        width: null, 
                                        backgroundColor: 'black',
                                        borderTopRightRadius: 5, 
                                        borderBottomRightRadius: 5
                                    }}
                                    imageStyle={{
                                        borderTopRightRadius: 5, 
                                        borderBottomRightRadius: 5, 
                                        width: null,
                                        ...opacityStyle
                                    }}
                                    source={url ? uriTwo : imageTwo}
                                >
                                    <View style={{flex: 1}}>
                                        <View style={{
                                            flex: 1, 
                                            alignItems: 'flex-end',
                                            paddingTop: heightTotal * 0.01, 
                                            paddingRight: widthTotal * 0.02
                                        }}>
                                            {/* Reemplazado Stars por CustomStars */}
                                            <CustomStars 
                                                rating={4}
                                                maxStars={5}
                                                starSize={width * 0.05}
                                                disabled={true}
                                            />
                                        </View>
                                        <View style={{
                                            flex: 1, 
                                            justifyContent: 'flex-end',
                                            alignItems: 'center', 
                                            paddingBottom: heightTotal * 0.01
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
        marginHorizontal: 1, // Pequeño espacio entre estrellas
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