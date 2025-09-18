import React, { Component } from 'react';
import { TouchableOpacity, Text, View, Appearance, Dimensions } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_KEY } from './../constants/keys.json';

const { height, width } = Dimensions.get('window');

const colorScheme = Appearance.getColorScheme();
if (colorScheme === 'dark') {
  console.log('dark mode componente google places');
}

// Interfaces para las props y el estado
interface PlaceResult {
  name: string;
  latitude: number;
  longitude: number;
}

interface GooglePlacesComponentProps {
  savePlaces: (places: PlaceResult[]) => void;
  closeModal: () => void;
  cantElements: number;
}

interface GooglePlacesComponentState {
  searchResults: PlaceResult[];
  shoeError: boolean;
}

export class GooglePlacesComponent extends Component<GooglePlacesComponentProps, GooglePlacesComponentState> {
  constructor(props: GooglePlacesComponentProps) {
    super(props);

    this.state = {
      searchResults: [],
      shoeError: false,
    };
  }

  savePlaces = (): void => {
    this.props.savePlaces(this.state.searchResults);
    this.props.closeModal();
  }

  render() {
    return (
      <>
        <GooglePlacesAutocomplete
          placeholder="Buscar"
          textInputProps={{
            placeholderTextColor: colorScheme === 'dark' ? 'black' : 'black',
          }}
          styles={{
            textInput: {
              color: colorScheme === 'dark' ? 'black' : 'black',
            },
            description: {
              color: colorScheme === 'dark' ? 'black' : 'black',
            },
          }}
          fetchDetails={true}
          onPress={(data: { structured_formatting: { main_text: any; }; }, details = null) => {
            if (details?.geometry?.location) {
              if (this.state.searchResults.length < this.props.cantElements) {
                this.setState({
                  searchResults: [
                    ...this.state.searchResults,
                    {
                      name: data.structured_formatting.main_text,
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    },
                  ],
                });
              } else {
                this.setState({ shoeError: true });
              }
            }
          }}
          query={{
            key: GOOGLE_MAPS_KEY,
            language: 'es',
            components: 'country:CO',
          }}
        />
        {this.state.shoeError && (
          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 20,
                marginTop: width * 0.10,
              }}>
              Solo puedes seleccionar {this.props.cantElements} punto(s)
            </Text>
          </View>
        )}
        {this.state.searchResults.length > 0 && (
          <View>
            <Text
              style={{
                color: colorScheme === 'dark' ? 'white' : 'white',
                fontSize: 18,
                marginVertical: width * 0.02,
              }}>
              Presiona para eliminar punto
            </Text>
          </View>
        )}

        <View style={{ marginBottom: height * 0.05 }}>
          {this.state.searchResults.map((result, i) => {
            return (
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  marginVertical: width * 0.01,
                }}
                onPress={() => {
                  const newSearchResults = [...this.state.searchResults];
                  newSearchResults.splice(i, 1);
                  this.setState({ searchResults: newSearchResults });
                }}
                key={i}>
                {result.name}
              </Text>
            );
          })}
        </View>

        <TouchableOpacity
          style={{
            height: 30,
            borderRadius: 50,
            marginBottom: width * 0.02,
            backgroundColor: '#E2991C',
          }}
          onPress={this.savePlaces}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              textAlign: 'center',
              lineHeight: width * 0.08,
            }}>
            Guardar punto(s)
          </Text>
        </TouchableOpacity>
      </>
    );
  }
}