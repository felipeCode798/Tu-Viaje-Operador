import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 + insets.bottom : 65 + insets.bottom,
          position: 'absolute',
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 5,
        },
      }}>
      
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: 'Programación',
          tabBarIcon: ({ color, size = 28 }) => (
            <MaterialIcons name="schedule" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="MessagesScreen"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color, size = 28 }) => (
            <MaterialIcons name="chat" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="SettingsScreen"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size = 28 }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      
      {/* Excluir estas pantallas del tab bar */}
      <Tabs.Screen
        name="CreateTourisms"
        options={{
          href: null, // Esto oculta la pantalla del tab bar
        }}
      />
      
      <Tabs.Screen
        name="CreateProgramming"
        options={{
          href: null, // Esto oculta la pantalla del tab bar
        }}
      />
    </Tabs>
  );
}