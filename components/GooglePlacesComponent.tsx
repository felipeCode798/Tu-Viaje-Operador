// GooglePlacesComponent.tsx - VERSIÓN COMPLETAMENTE CORREGIDA
import React, { Component } from 'react';
import { TouchableOpacity, Text, View, Dimensions, StyleSheet } from 'react-native';
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
      searchResults: [], // ✅ INICIALIZAR SIEMPRE COMO ARRAY VACÍO
      showError: false,
    };
  }

  // ✅ MÉTODO MEJORADO PARA GUARDAR LUGARES - SIN PARÁMETROS
  savePlaces = (): void => {
    const { searchResults } = this.state;
    
    // ✅ GARANTIZAR que siempre sea un array
    const placesToSave = Array.isArray(searchResults) ? searchResults : [];
    
    console.log("💾 Guardando lugares:", placesToSave);
    console.log("📊 Cantidad de lugares:", placesToSave.length);
    
    // ✅ LLAMAR LA FUNCIÓN CON EL ARRAY GARANTIZADO
    this.props.savePlaces(placesToSave);
    this.props.closeModal();
  }

  // ✅ MÉTODO MEJORADO PARA AGREGAR LUGARES
  addPlace = (data: any, details: any = null): void => {
    if (!details?.geometry?.location) {
      console.warn("⚠️ No se pudieron obtener las coordenadas del lugar");
      return;
    }

    const { searchResults } = this.state;
    const { cantElements } = this.props;

    // ✅ GARANTIZAR que searchResults sea un array
    const currentResults = Array.isArray(searchResults) ? searchResults : [];

    if (currentResults.length < cantElements) {
      const newPlace: PlaceResult = {
        name: data.structured_formatting.main_text,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };

      this.setState({
        searchResults: [...currentResults, newPlace],
        showError: false,
      });
    } else {
      this.setState({ showError: true });
      setTimeout(() => this.setState({ showError: false }), 3000);
    }
  }

  // ✅ MÉTODO MEJORADO PARA ELIMINAR LUGARES
  removePlace = (index: number): void => {
    const { searchResults } = this.state;
    
    // ✅ GARANTIZAR que searchResults sea un array
    const currentResults = Array.isArray(searchResults) ? searchResults : [];
    
    if (index >= 0 && index < currentResults.length) {
      const newResults = [...currentResults];
      newResults.splice(index, 1);
      
      this.setState({ 
        searchResults: newResults,
        showError: false 
      });
    }
  }

  render() {
    // ✅ GARANTIZAR que searchResults nunca sea undefined
    const { searchResults = [] } = this.state;
    const { cantElements } = this.props;

    return (
      <View style={styles.container}>
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
          onPress={this.addPlace}
          query={{
            key: GOOGLE_MAPS_KEY,
            language: 'es',
            components: 'country:co',
          }}
          enablePoweredByContainer={false}
        />
        
        {this.state.showError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Solo puedes seleccionar {cantElements} punto(s)
            </Text>
          </View>
        )}

        {/* LISTA DE RESULTADOS SELECCIONADOS */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            Puntos seleccionados ({searchResults.length}/{cantElements}):
          </Text>
          
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={`place-${index}`}
              onPress={() => this.removePlace(index)}
              style={styles.placeItem}
            >
              <Text style={styles.placeName}>
                {index + 1}. {result.name}
              </Text>
              <Text style={styles.removeText}>
                ✕ Eliminar
              </Text>
            </TouchableOpacity>
          ))}
          
          {searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Busca y selecciona {cantElements > 1 ? 'hasta ' + cantElements + ' lugares' : 'un lugar'}
              </Text>
            </View>
          )}
        </View>

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            searchResults.length > 0 ? styles.saveButtonActive : styles.saveButtonDisabled
          ]}
          onPress={this.savePlaces}
          disabled={searchResults.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {searchResults.length > 0 
              ? `Guardar ${searchResults.length} punto(s) seleccionado(s)`
              : 'Selecciona al menos un punto'
            }
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f4f4f',
    padding: 20,
  },
  errorContainer: {
    marginTop: 20,
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 20,
    flex: 1,
  },
  resultsTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  placeItem: {
    backgroundColor: '#2d2d2d',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'orange',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  removeText: {
    color: '#ff6b6b',
    fontSize: 12,
  },
  emptyState: {
    padding: 20,
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#666',
  },
  emptyStateText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: '#E2991C',
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});