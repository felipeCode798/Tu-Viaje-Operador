// GooglePlacesComponent.tsx - VERSIÓN FINAL MEJORADA

import React, { Component } from 'react';
import { TouchableOpacity, Text, View, Dimensions } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_KEY } from './../constants/keys.json';

const { height, width } = Dimensions.get('window');

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
  showError: boolean;
}

export class GooglePlacesComponent extends Component<GooglePlacesComponentProps, GooglePlacesComponentState> {
  constructor(props: GooglePlacesComponentProps) {
    super(props);

    this.state = {
      searchResults: [], // ✅ INICIALIZAR SIEMPRE EL ARRAY
      showError: false,
    };
  }

  savePlaces = (): void => {
    // ✅ VERIFICAR QUE searchResults EXISTA Y SEA UN ARRAY
    const results = Array.isArray(this.state.searchResults) 
      ? this.state.searchResults 
      : [];
    
    console.log("💾 Guardando lugares:", results);
    console.log("📊 Cantidad de lugares:", results.length);
    
    this.props.savePlaces(results);
    this.props.closeModal();
  }

  render() {
    // ✅ Asegurar que searchResults nunca sea undefined
    const searchResults = this.state.searchResults || [];
    
    return (
      <View style={{ flex: 1, backgroundColor: '#4f4f4f', padding: 20 }}>
        <GooglePlacesAutocomplete
          placeholder="Buscar ubicación..."
          textInputProps={{
            placeholderTextColor: 'gray',
            color: 'white',
          }}
          styles={{
            container: {
              flex: 0,
            },
            textInput: {
              backgroundColor: '#2d2d2d',
              color: 'white',
              height: 50,
              borderRadius: 10,
              paddingHorizontal: 15,
              fontSize: 16,
            },
            listView: {
              backgroundColor: '#2d2d2d',
              borderRadius: 10,
              marginTop: 10,
            },
            description: {
              color: 'white',
            },
            row: {
              backgroundColor: '#2d2d2d',
            },
          }}
          fetchDetails={true}
          onPress={(data, details = null) => {
            console.log("📍 Lugar seleccionado:", data.structured_formatting.main_text);
            
            if (details?.geometry?.location) {
              if (searchResults.length < this.props.cantElements) {
                this.setState({
                  searchResults: [
                    ...searchResults,
                    {
                      name: data.structured_formatting.main_text,
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    },
                  ],
                  showError: false,
                });
              } else {
                this.setState({ showError: true });
                setTimeout(() => this.setState({ showError: false }), 3000);
              }
            }
          }}
          query={{
            key: GOOGLE_MAPS_KEY,
            language: 'es',
            components: 'country:co',
          }}
          enablePoweredByContainer={false}
        />
        
        {this.state.showError && (
          <View style={{ marginTop: 20, backgroundColor: '#ff6b6b', padding: 10, borderRadius: 5 }}>
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
              Solo puedes seleccionar {this.props.cantElements} punto(s)
            </Text>
          </View>
        )}

        {/* LISTA DE RESULTADOS SELECCIONADOS */}
        <View style={{ marginTop: 20, flex: 1 }}>
          <Text style={{ color: 'white', fontSize: 16, marginBottom: 10, fontWeight: 'bold' }}>
            Puntos seleccionados ({searchResults.length}/{this.props.cantElements}):
          </Text>
          
          {searchResults.map((result, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                const newSearchResults = [...searchResults];
                newSearchResults.splice(i, 1);
                this.setState({ 
                  searchResults: newSearchResults,
                  showError: false 
                });
              }}
              style={{
                backgroundColor: '#2d2d2d',
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                borderLeftWidth: 3,
                borderLeftColor: 'orange',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, flex: 1 }}>
                {i + 1}. {result.name}
              </Text>
              <Text style={{ color: '#ff6b6b', fontSize: 12 }}>
                ✕ Eliminar
              </Text>
            </TouchableOpacity>
          ))}
          
          {searchResults.length === 0 && (
            <View style={{ 
              padding: 20, 
              backgroundColor: '#2d2d2d', 
              borderRadius: 10,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: '#666',
            }}>
              <Text style={{ color: '#999', textAlign: 'center', fontSize: 14 }}>
                Busca y selecciona {this.props.cantElements > 1 ? 'hasta ' + this.props.cantElements + ' lugares' : 'un lugar'}
              </Text>
            </View>
          )}
        </View>

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity
          style={{
            backgroundColor: searchResults.length > 0 ? '#E2991C' : '#666',
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
            alignItems: 'center',
          }}
          onPress={this.savePlaces}
          disabled={searchResults.length === 0}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            {searchResults.length > 0 
              ? `Guardar ${searchResults.length} ${this.props.cantElements > 1 ? 'puntos' : 'punto'}`
              : 'Selecciona al menos un punto'
            }
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}