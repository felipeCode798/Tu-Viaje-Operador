import { Camera, CameraView } from 'expo-camera'; // Importación corregida
import * as React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Button, Icon, Overlay } from 'react-native-elements';

const {height, width} = Dimensions.get('window');

interface BarcodeScannerProps {
  close: () => void;
  callback: (scanElements: string[]) => void;
}

interface BarcodeScannerState {
  hasCameraPermission: boolean | null;
  scanned: boolean;
  viewConfirm: boolean;
  scanElements: string[];
}

export default class BarcodeScanner extends React.Component<BarcodeScannerProps, BarcodeScannerState> {
  state: BarcodeScannerState = {
    hasCameraPermission: null,
    scanned: false,
    viewConfirm: false,
    scanElements: [],
  };

  async componentDidMount() {
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      this.setState({ hasCameraPermission: status === 'granted' });
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      this.setState({hasCameraPermission: false});
    }
  };

  handleBarCodeScanned = (scanningResult: any) => {
    const { type, data } = scanningResult;
    this.setState({scanned: true});
    const elements = data.split(',');
    if (elements.length === 3) {
      this.setState({scanElements: elements, viewConfirm: true});
    } else {
      alert(`Hay un error con la lectura, OPRIMA en volver a scanear`);
    }
  };

  modalConfirmUser = () => {
    return (
      <Overlay
        isVisible={this.state.viewConfirm}
        overlayStyle={{
          width: width * 0.9,
          height: height * 0.3,
          borderTopWidth: 5, 
          borderTopColor: '#E2991C',
          backgroundColor: 'white'
        }}
        backdropStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <View style={{flex: 1}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View
              style={{
                flex: 3,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
              <Text style={{fontSize: 20}}>{'Confirmacion de Seguridad'}</Text>
            </View>
            <View
              style={{
                flex: 0.5,
                alignItems: 'flex-end',
                alignSelf: 'flex-start',
              }}>
              <Icon
                onPress={() => this.setState({viewConfirm: false})}
                name="close"
                size={25}
                color="black"
              />
            </View>
          </View>
          <View style={{flex: 3}}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Roboto',
                color: '#575757',
                paddingVertical: height * 0.03,
                paddingHorizontal: width * 0.05,
              }}>
              {'El usuario es: ' +
                this.state.scanElements[0] +
                '\n' +
                'y compro ' +
                this.state.scanElements[2] +
                ' puestos'}
            </Text>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 1, paddingHorizontal: width * 0.02}}>
                <Button
                  onPress={() => {
                    this.setState({viewConfirm: false});
                    this.props.callback(this.state.scanElements);
                  }}
                  buttonStyle={{
                    backgroundColor: '#E2991C',
                    borderRadius: 2,
                    width: width * 0.35,
                    height: height * 0.06,
                  }}
                  title={'CONFIRMAR'}
                  titleStyle={{fontFamily: 'Roboto', color: 'white'}}
                />
              </View>
              <View style={{flex: 1, paddingHorizontal: width * 0.02}}>
                <Button
                  onPress={() => {
                    alert(`Oprima Volver a scanear para leer otra vez el qr`);
                    this.setState({viewConfirm: false});
                  }}
                  buttonStyle={{
                    backgroundColor: 'transparent',
                    borderColor: 'black',
                    borderWidth: 2,
                    borderRadius: 2,
                    width: width * 0.35,
                    height: height * 0.06,
                  }}
                  title={'CANCELAR'}
                  titleStyle={{fontFamily: 'Roboto', color: 'black'}}
                />
              </View>
            </View>
          </View>
        </View>
      </Overlay>
    );
  };

  render() {
    const {hasCameraPermission, scanned} = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          style={{width: width, height: height}}
        />
        {scanned && (
          <Button
            title={'Volver a Scanear'}
            onPress={() => this.setState({scanned: false})}
            buttonStyle={{backgroundColor: '#E2991C'}}
          />
        )}
        <Button
          title={'Cerrar Scan'}
          onPress={() => this.props.close()}
          buttonStyle={{backgroundColor: '#E2991C'}}
        />
        {this.state.viewConfirm ? this.modalConfirmUser() : <View />}
      </View>
    );
  }
}