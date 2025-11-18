// components/CustomGooglePlaces.tsx
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface PlaceResult {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface CustomGooglePlacesProps {
  savePlaces: (places: PlaceResult[]) => void;
  closeModal: () => void;
  cantElements: number;
}

const CustomGooglePlaces: React.FC<CustomGooglePlacesProps> = ({
  savePlaces,
  closeModal,
  cantElements
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const mockResults: PlaceResult[] = [
        {
          name: `${text} - Punto 1`,
          latitude: 4.710989,
          longitude: -74.072092,
          address: 'Bogotá, Colombia'
        },
        {
          name: `${text} - Punto 2`, 
          latitude: 4.711989,
          longitude: -74.073092,
          address: 'Bogotá, Colombia'
        },
        {
          name: `${text} - Punto 3`,
          latitude: 4.712989,
          longitude: -74.074092,
          address: 'Bogotá, Colombia'
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = (place: PlaceResult) => {
    if (selectedPlaces.length >= cantElements) {
      alert(`Solo puedes seleccionar hasta ${cantElements} lugares`);
      return;
    }
    
    setSelectedPlaces(prev => [...prev, place]);
    setSearchText('');
    setSearchResults([]);
  };

  const handleRemovePlace = (index: number) => {
    setSelectedPlaces(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (selectedPlaces.length === 0) {
      alert('Debes seleccionar al menos un lugar');
      return;
    }
    
    savePlaces(selectedPlaces);
    closeModal();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ubicación..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color="orange" />}
      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.resultsTitle}>Resultados de búsqueda:</Text>
          <ScrollView style={styles.searchResultsList}>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.searchResultItem}
                onPress={() => handleSelectPlace(result)}
              >
                <Text style={styles.searchResultName}>{result.name}</Text>
                {result.address && (
                  <Text style={styles.searchResultAddress}>{result.address}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.selectedContainer}>
        <Text style={styles.resultsTitle}>
          {cantElements > 1 ? 'Puntos seleccionados' : 'Punto seleccionado'} 
          ({selectedPlaces.length}/{cantElements})
        </Text>
        
        <ScrollView style={styles.selectedList}>
          {selectedPlaces.length > 0 ? (
            selectedPlaces.map((place, index) => (
              <View key={index} style={styles.selectedItem}>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeNumber}>{index + 1}.</Text>
                  <View style={styles.placeDetails}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    {place.address && (
                      <Text style={styles.placeAddress}>{place.address}</Text>
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
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedPlaces.length > 0 ? styles.saveButtonActive : styles.saveButtonDisabled
          ]}
          onPress={handleSave}
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
          onPress={closeModal}
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
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2d2d2d',
    color: 'white',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
  },
  searchResultsContainer: {
    marginBottom: 15,
    maxHeight: 200,
  },
  searchResultsList: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  searchResultName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  searchResultAddress: {
    color: '#ccc',
    fontSize: 12,
  },
  selectedContainer: {
    flex: 1,
    marginBottom: 15,
  },
  resultsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedList: {
    flex: 1,
  },
  selectedItem: {
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
  buttonsContainer: {
    marginTop: 'auto',
  },
  saveButton: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: {
    color: '#ccc',
    fontSize: 16,
  },
});

export default CustomGooglePlaces;