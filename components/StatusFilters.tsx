import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type StatusType = 'Todos' | 'Pendientes' | 'Iniciados' | 'Finalizados' | 'Cancelados';

interface StatusFiltersProps {
  activeStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
}

const StatusFilters: React.FC<StatusFiltersProps> = ({
  activeStatus,
  onStatusChange,
}) => {
  const statusOptions: { 
    type: StatusType; 
    icon: string; 
    label: string; 
    color: string;
    bgColor: string;
  }[] = [
    { 
      type: 'Todos', 
      icon: 'refresh', 
      label: 'Todos',
      color: '#888',
      bgColor: '#333'
    },
    { 
      type: 'Pendientes', 
      icon: 'schedule', 
      label: 'Pendientes',
      color: '#60A5FA',
      bgColor: '#1E3A8A'
    },
    { 
      type: 'Iniciados', 
      icon: 'play-arrow', 
      label: 'Iniciados',
      color: '#34D399',
      bgColor: '#064E3B'
    },
    { 
      type: 'Finalizados', 
      icon: 'check-circle', 
      label: 'Finalizados',
      color: '#F59E0B',
      bgColor: '#78350F'
    },
    { 
      type: 'Cancelados', 
      icon: 'cancel', 
      label: 'Cancelados',
      color: '#F87171',
      bgColor: '#7F1D1D'
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollContainer}
    >
      {statusOptions.map((option) => (
        <TouchableOpacity
          key={option.type}
          style={[
            styles.statusButton,
            activeStatus === option.type && styles.activeStatusButton,
            activeStatus === option.type && { borderColor: option.color }
          ]}
          onPress={() => onStatusChange(option.type)}
        >
          <View style={[
            styles.iconContainer,
            activeStatus === option.type && { backgroundColor: option.bgColor }
          ]}>
            <MaterialIcons
              name={option.icon as any}
              size={24}
              color={activeStatus === option.type ? option.color : '#666'}
            />
          </View>
          <Text
            style={[
              styles.statusText,
              activeStatus === option.type && styles.activeStatusText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 15,
  },
  container: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  statusButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  activeStatusButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    textAlign: 'center',
  },
  activeStatusText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default StatusFilters;