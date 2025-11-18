import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';

interface CalendarComponentProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  moment.locale('es');

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const weekDays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

  const getWeekDays = () => {
    const startOfWeek = moment(selectedDate).startOf('isoWeek');
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.clone().add(i, 'days');
      days.push({
        date: day.toDate(),
        dayNumber: day.date(),
        dayName: weekDays[i],
        isSelected: day.isSame(selectedDate, 'day'),
        isToday: day.isSame(today, 'day'),
      });
    }
    
    return days;
  };

  const weekDaysData = getWeekDays();

  const goToPreviousWeek = () => {
    const newDate = moment(selectedDate).subtract(7, 'days').toDate();
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = moment(selectedDate).add(7, 'days').toDate();
    onDateChange(newDate);
  };

  const selectDate = (date: Date) => {
    onDateChange(date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthText}>
          {monthNames[currentMonth]} / {monthNames[currentMonth === 11 ? 0 : currentMonth + 1]} {currentYear}
        </Text>
      </View>
      
      <View style={styles.weekNavigation}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={goToPreviousWeek}
        >
          <MaterialIcons name="chevron-left" size={24} color="white" />
        </TouchableOpacity>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.daysContainer}
          contentContainerStyle={styles.daysContent}
        >
          {weekDaysData.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                day.isSelected && styles.selectedDayButton,
                day.isToday && !day.isSelected && styles.todayButton,
              ]}
              onPress={() => selectDate(day.date)}
            >
              <Text style={[
                styles.dayName,
                day.isSelected && styles.selectedDayName,
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                day.isSelected && styles.selectedDayNumber,
                day.isToday && !day.isSelected && styles.todayNumber,
              ]}>
                {day.dayNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={goToNextWeek}
        >
          <MaterialIcons name="chevron-right" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3a3a3a',
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
  },
  monthHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  navButton: {
    padding: 5,
  },
  daysContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  daysContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  selectedDayButton: {
    backgroundColor: '#FF9500',
  },
  todayButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    marginBottom: 4,
  },
  selectedDayName: {
    color: 'white',
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  selectedDayNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayNumber: {
    color: '#FF9500',
  },
});

export default CalendarComponent;