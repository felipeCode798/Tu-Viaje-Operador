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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Puntos de Recogida</Text>
          <Text style={styles.subtitle}>Selecciona hasta {cantElements} lugares</Text>
        </View>
        <View style={styles.counterHeader}>
          <Text style={styles.counterHeaderText}>
            {selectedPlaces.length}/{cantElements}
          </Text>
        </View>
      </View>

      <View style={styles.searchSection}>
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

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#E2991C" />
            <Text style={styles.loadingText}>Buscando lugares...</Text>
          </View>
        )}
      </View>

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

      <View style={styles.mainContent}>
        {searchResults.length > 0 && (
          <View style={[
            styles.resultsSection,
            { flex: searchResults.length > 0 ? 0.7 : 0 }
          ]}>
            <Text style={styles.sectionTitle}>Sugerencias</Text>
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
                  <View style={styles.resultIcon}>
                    <Text style={styles.resultIconText}>📍</Text>
                  </View>
                  <Text style={styles.resultText}>{result.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[
          styles.selectedSection,
          searchResults.length > 0 && { flex: 0.3 }
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.selectedTitle}>Puntos seleccionados</Text>
          </View>
          
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={[
              styles.scrollContent,
              selectedPlaces.length === 0 && styles.emptyScrollContent
            ]}
          >
            {selectedPlaces.length > 0 ? (
              selectedPlaces.map((result, index) => (
                <View key={index} style={styles.placeCard}>
                  <View style={styles.placeNumber}>
                    <Text style={styles.placeNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{result.name}</Text>
                    {result.address && (
                      <Text style={styles.placeAddress}>{result.address}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemovePlace(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🗺️</Text>
                <Text style={styles.emptyStateTitle}>
                  Escoge las canadas de salida y regreso
                </Text>
                <View style={styles.separator} />
                <Text style={styles.emptyStateText}>
                  Selecciona al menos un punto
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

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
    width: '100%',
    height: '100%',
    backgroundColor: '#2d2d2d',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
  },
  counterHeader: {
    backgroundColor: '#E2991C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  counterHeaderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    color: 'white',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#555',
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#E2991C',
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#555',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  loadingText: {
    color: '#ccc',
    marginLeft: 10,
    fontSize: 14,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsSection: {
    marginBottom: 90,
  },
  sectionTitle: {
    color: '#E2991C',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultsContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555',
    maxHeight: height * 0.5,
    minHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    minHeight: 60,
  },
  lastResultItem: {
    borderBottomWidth: 0,
  },
  resultIcon: {
    marginRight: 15,
  },
  resultIconText: {
    fontSize: 14,
  },
  resultText: {
    color: 'white',
    fontSize: 13,
    lineHeight: 14,
    flex: 1,
  },
  selectedSection: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  selectedTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyScrollContent: {
    justifyContent: 'center',
  },
  placeCard: {
    backgroundColor: '#3a3a3a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#E2991C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  placeNumber: {
    backgroundColor: '#E2991C',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  placeAddress: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 16,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeText: {
    color: '#ff6b6b',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyStateIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyStateTitle: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#555',
    width: '60%',
    marginBottom: 12,
  },
  emptyStateText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ff4757',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    marginHorizontal: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#555',
    backgroundColor: '#2d2d2d',
  },
  saveButton: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButtonActive: {
    backgroundColor: '#E2991C',
  },
  saveButtonDisabled: {
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#555',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
});