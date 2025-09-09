import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MessagesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <MaterialIcons name="search" size={24} color="#FF9500" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={80} color="#FF9500" />
          <Text style={styles.emptyTitle}>No hay mensajes</Text>
          <Text style={styles.emptySubtitle}>
            Los mensajes y notificaciones aparecerán aquí
          </Text>
        </View>

        {/* Future message items will go here */}
        {/* Ejemplo de como se vería un mensaje */}
        <View style={styles.messagePreview}>
          <View style={styles.messageItem}>
            <View style={styles.messageAvatar}>
              <MaterialIcons name="business" size={24} color="#FF9500" />
            </View>
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageSender}>Sistema</Text>
                <Text style={styles.messageTime}>10:30 AM</Text>
              </View>
              <Text style={styles.messageText}>
                Bienvenido a la aplicación. Aquí recibirás notificaciones importantes.
              </Text>
            </View>
            <View style={styles.messageIndicator}>
              <View style={styles.unreadDot} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  filterIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  messagePreview: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  messageIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9500',
  },
});

export default MessagesScreen;