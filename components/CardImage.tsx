import React, { Component } from 'react';
import {View, Image, StyleSheet, Text, TouchableOpacity, ImageSourcePropType, ViewStyle} from 'react-native';
import IconVec from 'react-native-vector-icons/FontAwesome';

interface AppButtonProps {
  actionPress: () => void;
  urlImage: string;
  children?: React.ReactNode;
  height: number;
  width: number;
  heightTotal: number;
  url?: boolean;
  timer?: boolean;
  stringTimer?: string;
  containerStyle?: ViewStyle;
}

const CustomCard: React.FC<{style?: ViewStyle; children: React.ReactNode}> = ({style, children}) => (
  <View style={[{
    backgroundColor: 'white',
    borderRadius: 5,
    margin: 8,
    padding: 0,
    borderWidth: 1,
    borderColor: 'black',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }, style]}>
    {children}
  </View>
);

export default class AppButton extends Component<AppButtonProps> {
    render() {
        const {actionPress, urlImage, children, height, width, heightTotal, url, timer, stringTimer} = this.props;
        let image: ImageSourcePropType = require('../assets/images/icon.png');
        let uri: {uri: string} = {uri: ''};
        
        if (url) {
            uri = {
                uri: urlImage !== '' ? urlImage : 'https://dubsism.files.wordpress.com/2017/12/image-not-found.png'
            };
        } else {
            image = urlImage as ImageSourcePropType;
        }

        return (
            <View>
                <TouchableOpacity onPress={actionPress}>
                    <CustomCard style={{
                        borderRadius: 5,
                        minHeight: heightTotal * 0.24,
                        padding: 0,
                        borderWidth: 1,
                        borderColor: 'black'
                    }}>
                        <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
                            {timer && (
                                <View style={{
                                    position: 'absolute', 
                                    top: 0,
                                    width: width * 0.6,
                                    height: height * 0.2,
                                    alignItems: 'flex-start',
                                    paddingLeft: width * 0.03,
                                    zIndex: 1,
                                    backgroundColor: 'black',
                                    borderBottomRightRadius: 5,
                                }}>
                                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                        <IconVec 
                                            style={{paddingRight: width * 0.01, marginTop: 2}}
                                            name='clock-o'
                                            size={15}
                                            color='white'
                                        />
                                        <Text style={{
                                            color: "white", 
                                            fontFamily: 'Roboto',
                                            fontSize: 15,
                                        }}>
                                            {stringTimer}
                                        </Text>
                                    </View>
                                </View>
                            )}
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
                    </CustomCard>
                </TouchableOpacity>
            </View>
        );
    }
}