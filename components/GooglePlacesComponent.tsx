import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { GOOGLE_MAPS_KEY } from '../constants/keys.json';

const { height, width } = Dimensions.get('window');

interface PlaceResult {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface GooglePlacesComponentProps {
  savePlaces: (places: PlaceResult[]) => void;
  closeModal: () => void;
  cantElements: number;
}

export const GooglePlacesComponent: React.FC<GooglePlacesComponentProps> = ({
  savePlaces,
  closeModal,
  cantElements
}) => {
  const [selectedPlaces, setSelectedPlaces] = useState<PlaceResult[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  // ✅ Buscar lugares usando la API de Google Places directamente
  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(query)}` +
        `&key=${GOOGLE_MAPS_KEY}` +
        `&language=es` +
        `&components=country:co`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        setSearchResults(data.predictions);
      } else {
        console.log('Error en Places API:', data.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error buscando lugares:', error);
      Alert.alert('Error', 'No se pudieron cargar los lugares');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Obtener detalles del lugar seleccionado
  const getPlaceDetails = async (placeId: string, placeName: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${placeId}` +
        `&key=${GOOGLE_MAPS_KEY}` +
        `&language=es`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        const place = data.result;
        const newPlace: PlaceResult = {
          name: placeName,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          address: place.formatted_address
        };

        setSelectedPlaces(prev => [...prev, newPlace]);
        setSearchText('');
        setSearchResults([]);
        setShowError(false);
      }
    } catch (error) {
      console.error('Error obteniendo detalles:', error);
      Alert.alert('Error', 'No se pudieron obtener los detalles del lugar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    searchPlaces(text);
  };

  const handlePlaceSelect = (place: any) => {
    if (selectedPlaces.length >= cantElements) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    getPlaceDetails(place.place_id, place.description);
  };

  const handleRemovePlace = (index: number) => {
    setSelectedPlaces(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePlaces = () => {
    if (selectedPlaces.length === 0) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    savePlaces(selectedPlaces);
    closeModal();
  };

  const handleCancel = () => {
    savePlaces([]);
    closeModal();
  };

  // ✅ Agregar lugares manualmente (fallback)
  const addManualPlace = () => {
    if (!searchText.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    if (selectedPlaces.length >= cantElements) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const newPlace: PlaceResult = {
      name: searchText.trim(),
      latitude: 4.6097 + (Math.random() * 0.01),
      longitude: -74.0817 + (Math.random() * 0.01),
      address: 'Ubicación ingresada manualmente'
    };

    setSelectedPlaces(prev => [...prev, newPlace]);
    setSearchText('');
    setSearchResults([]);
    setShowError(false);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {cantElements > 1 ? 'Selecciona puntos de recogida' : 'Selecciona punto de llegada'}
        </Text>
        <Text style={styles.subtitle}>
          {cantElements > 1 
            ? `Puedes seleccionar hasta ${cantElements} lugares` 
            : 'Selecciona un lugar como punto final'
          }
        </Text>
      </View>

      {/* BUSCADOR MANUAL */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Buscar ubicación..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearchChange}
          onSubmitEditing={addManualPlace}
          returnKeyType="search"
        />
        
        <TouchableOpacity 
          style={[
            styles.addButton,
            (!searchText.trim() || selectedPlaces.length >= cantElements) && styles.addButtonDisabled
          ]} 
          onPress={addManualPlace}
          disabled={!searchText.trim() || selectedPlaces.length >= cantElements}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* RESULTADOS DE BÚSQUEDA - MEJORADO */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#E2991C" />
          <Text style={styles.loadingText}>Buscando lugares...</Text>
        </View>
      )}

      {searchResults.length > 0 && (
        <View style={styles.resultsWrapper}>
          <Text style={styles.resultsTitle}>Sugerencias:</Text>
          <ScrollView 
            style={styles.resultsContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={result.place_id}
                style={[
                  styles.resultItem,
                  index === searchResults.length - 1 && styles.lastResultItem
                ]}
                onPress={() => handlePlaceSelect(result)}
              >
                <Text style={styles.resultText}>{result.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* MENSAJE DE ERROR */}
      {showError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {selectedPlaces.length >= cantElements 
              ? `Solo puedes seleccionar hasta ${cantElements} punto(s)`
              : 'Debes seleccionar al menos un lugar'
            }
          </Text>
        </View>
      )}

      {/* LUGARES SELECCIONADOS */}
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedTitle}>
          {cantElements > 1 ? 'Puntos seleccionados' : 'Punto seleccionado'} 
          ({selectedPlaces.length}/{cantElements})
        </Text>
        
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
        >
          {selectedPlaces.length > 0 ? (
            selectedPlaces.map((result, index) => (
              <View key={index} style={styles.placeItem}>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeNumber}>{index + 1}.</Text>
                  <View style={styles.placeDetails}>
                    <Text style={styles.placeName}>{result.name}</Text>
                    {result.address && (
                      <Text style={styles.placeAddress}>{result.address}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemovePlace(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {cantElements > 1 
                  ? 'Busca y selecciona los puntos de recogida' 
                  : 'Busca y selecciona el punto de llegada'
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* ✅ BOTONES DENTRO DEL FONDO DEL MODAL */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedPlaces.length > 0 ? styles.saveButtonActive : styles.saveButtonDisabled
          ]}
          onPress={handleSavePlaces}
          disabled={selectedPlaces.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {selectedPlaces.length > 0 
              ? `Guardar ${selectedPlaces.length} ${selectedPlaces.length === 1 ? 'punto' : 'puntos'}`
              : 'Selecciona al menos un punto'
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f4f4f',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#3d3d3d',
    color: 'white',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#E2991C',
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#666',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
  },
  loadingText: {
    color: '#ccc',
    marginLeft: 10,
    fontSize: 14,
  },
  // ✅ MEJORADO: Contenedor de resultados más grande
  resultsWrapper: {
    marginBottom: 15,
    maxHeight: height * 0.35, // 35% de la altura de la pantalla
    minHeight: 150, // Mínimo 150 de altura
  },
  resultsTitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
    maxHeight: height * 0.3, // 30% de la altura para el scroll
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  lastResultItem: {
    borderBottomWidth: 0, // Sin borde en el último elemento
  },
  resultText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedContainer: {
    flex: 1,
    marginBottom: 15,
    minHeight: 200, // Altura mínima para la sección de seleccionados
  },
  selectedTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  placeItem: {
    backgroundColor: '#2d2d2d',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: 'orange',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeNumber: {
    color: 'orange',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 25,
  },
  placeDetails: {
    flex: 1,
  },
  placeName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  placeAddress: {
    color: '#ccc',
    fontSize: 12,
  },
  removeButton: {
    padding: 5,
    marginLeft: 10,
  },
  removeText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 30,
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
  // ✅ NUEVO: Contenedor para los botones
  buttonsContainer: {
    marginTop: 10,
  },
  saveButton: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  saveButtonActive: {
    backgroundColor: '#E2991C',
    borderColor: '#E2991C',
  },
  saveButtonDisabled: {
    backgroundColor: '#2d2d2d',
    borderColor: '#555',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelButtonText: {
    color: '#ccc',
    fontSize: 16,
  },
});