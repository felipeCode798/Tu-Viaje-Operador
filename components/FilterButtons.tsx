import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type FilterType = 'Todos' | 'Viajes' | 'Paquetes';

interface FilterButtonsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: { type: FilterType; icon: string; label: string }[] = [
    { type: 'Todos', icon: 'place', label: 'Todos' },
    { type: 'Viajes', icon: 'directions-bus', label: 'Viajes' },
    { type: 'Paquetes', icon: 'luggage', label: 'Paquetes' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.type}
          style={[
            styles.filterButton,
            activeFilter === filter.type && styles.activeFilterButton,
          ]}
          onPress={() => onFilterChange(filter.type)}
        >
          <MaterialIcons
            name={filter.icon as any}
            size={20}
            color={activeFilter === filter.type ? '#FF9500' : 'white'}
            style={styles.filterIcon}
          />
          <Text
            style={[
              styles.filterText,
              activeFilter === filter.type && styles.activeFilterText,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: '#3a3a3a',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeFilterButton: {
    backgroundColor: 'transparent',
    borderColor: '#FF9500',
  },
  filterIcon: {
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  activeFilterText: {
    color: '#FF9500',
  },
});

export default FilterButtons;