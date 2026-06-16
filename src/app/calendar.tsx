import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  category?: string;
  dueDate: string;
  completed: boolean;
};

export default function CalendarScreen() {
  const { theme, isDarkMode } = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarView, setCalendarView] = useState<'Month' | 'Week'>('Month');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [weekStartDate, setWeekStartDate] = useState(selectedDate);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    const savedTasks = await AsyncStorage.getItem('tasks');
    setTasks(savedTasks ? JSON.parse(savedTasks) : []);
  };

  const toDateKey = (date: string) => {
    const d = new Date(date);

    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const markedDates: any = {};

  const getTaskCountForDate = (dateKey: string) => {
    return tasks.filter(
      (task) => toDateKey(task.dueDate) === dateKey
    ).length;
  };

  tasks.forEach((task) => {
    if (!task.dueDate) return;

    const dateKey = toDateKey(task.dueDate);

    if (!dateKey) return;

    const taskCount = getTaskCountForDate(dateKey);

    markedDates[dateKey] = {
      dots: Array.from({ length: Math.min(taskCount, 3) }).map((_, index) => ({
        key: `task-${index}`,
        color: '#208AEF',
      })),
    };
  });

  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    selected: true,
    selectedColor: '#208AEF',
    selectedTextColor: '#FFFFFF',
  };

  const selectedTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;

    return toDateKey(task.dueDate) === selectedDate;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return '#EF4444';
    if (priority === 'Medium') return '#F59E0B';
    return '#22C55E';
  };

  const selectedDateText = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
  );

  const getWeekDates = () => {
    const selected = new Date(`${weekStartDate}T00:00:00`);
    const day = selected.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const monday = new Date(selected);
    monday.setDate(selected.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayNumber = String(date.getDate()).padStart(2, '0');

      return {
        date,
        dateKey: `${year}-${month}-${dayNumber}`,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
      };
    });
  };

  const weekDates = getWeekDates();

  const hasTasksOnDate = (dateKey: string) => {
    return tasks.some((task) => toDateKey(task.dueDate) === dateKey);
  };

  const goToPreviousWeek = () => {
    const current = new Date(`${weekStartDate}T00:00:00`);
    current.setDate(current.getDate() - 7);

    const dateKey = toDateKey(current.toISOString());
    setWeekStartDate(dateKey);
    setSelectedDate(dateKey);
  };

  const goToNextWeek = () => {
    const current = new Date(`${weekStartDate}T00:00:00`);
    current.setDate(current.getDate() + 7);

    const dateKey = toDateKey(current.toISOString());
    setWeekStartDate(dateKey);
    setSelectedDate(dateKey);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: theme.header,
          paddingTop: 58,
          paddingBottom: 18,
          paddingHorizontal: 18,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={22} color="white" />
          </TouchableOpacity>

          <Text
            style={{
              color: 'white',
              fontSize: 24,
              fontWeight: '900',
              marginLeft: 16,
            }}
          >
            Calendar
          </Text>
        </View>
      </View>

      {/* Month / Week Tabs */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginTop: 16,
          backgroundColor: theme.card,
          borderRadius: 16,
          padding: 5,
          borderWidth: 1,
          borderColor: isDarkMode ? '#334155' : '#E5E7EB',
        }}
      >
        {(['Month', 'Week'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCalendarView(item)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: calendarView === item ? '#208AEF' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: calendarView === item ? '#FFFFFF' : theme.text,
                fontWeight: '900',
                fontSize: 14,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calendar */}
     {calendarView === 'Month' ? (
  <Calendar
    markingType="multi-dot"
    current={selectedDate}
    markedDates={markedDates}
    onDayPress={(day) => {
      setSelectedDate(day.dateString);
    }}
    firstDay={1}
    theme={{
      calendarBackground: theme.card,
      dayTextColor: theme.text,
      monthTextColor: theme.text,
      textSectionTitleColor: theme.subText,
      todayTextColor: '#208AEF',
      selectedDayBackgroundColor: '#208AEF',
      selectedDayTextColor: '#FFFFFF',
      arrowColor: '#208AEF',
      textDayFontWeight: '700',
      textMonthFontWeight: '900',
      textDayHeaderFontWeight: '900',
    }}
    style={{
      margin: 16,
      borderRadius: 18,
      overflow: 'hidden',
    }}
  />
) : (
  <View
  style={{
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
    backgroundColor: theme.card,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#E5E7EB',
  }}
>

    <View
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  }}
>
  <TouchableOpacity onPress={goToPreviousWeek}>
    <FontAwesome name="chevron-left" size={16} color={theme.text} />
  </TouchableOpacity>

  <Text
    style={{
      color: theme.text,
      fontSize: 18,
      fontWeight: '900',
    }}
  >
    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })}
  </Text>

  <TouchableOpacity onPress={goToNextWeek}>
    <FontAwesome name="chevron-right" size={16} color={theme.text} />
  </TouchableOpacity>
</View>
 
 <View
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
  }}
>
  {weekDates.map((day) => {
    const isSelected = day.dateKey === selectedDate;
    const hasTask = hasTasksOnDate(day.dateKey);

    return (
      <TouchableOpacity
        key={day.dateKey}
        onPress={() => setSelectedDate(day.dateKey)}
        style={{
          width: 44,
          height: 78,
          borderRadius: 18,
          backgroundColor: isSelected ? '#208AEF' : theme.background,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isSelected
            ? '#208AEF'
            : isDarkMode
            ? '#334155'
            : '#E5E7EB',
        }}
      >
        <Text
          style={{
            color: isSelected ? '#FFFFFF' : theme.subText,
            fontSize: 11,
            fontWeight: '900',
          }}
        >
          {day.dayName}
        </Text>

        <Text
          style={{
            color: isSelected ? '#FFFFFF' : theme.text,
            fontSize: 18,
            fontWeight: '900',
            marginTop: 6,
          }}
        >
          {day.dayNumber}
        </Text>

        {getTaskCountForDate(day.dateKey) > 0 && (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      height: 8,
    }}
  >
    {Array.from({
      length: Math.min(
        getTaskCountForDate(day.dateKey),
        3
      ),
    }).map((_, index) => (
      <View
        key={index}
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          marginHorizontal: 1,
          backgroundColor: isSelected
            ? '#FFFFFF'
            : '#208AEF',
        }}
      />
    ))}

    {getTaskCountForDate(day.dateKey) > 3 && (
      <Text
        style={{
          color: isSelected
            ? '#FFFFFF'
            : '#208AEF',
          fontSize: 8,
          fontWeight: '900',
          marginLeft: 2,
        }}
      >
        +
      </Text>
    )}
  </View>
)}
      </TouchableOpacity>
    );
  })}
</View>
</View>
)}

      {/* Selected Day Tasks */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <View>
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontWeight: '900',
              }}
            >
              {selectedDateText}
            </Text>

            <Text
              style={{
                color: theme.subText,
                fontSize: 13,
                fontWeight: '700',
                marginTop: 3,
              }}
            >
              {selectedTasks.length} task{selectedTasks.length === 1 ? '' : 's'} scheduled
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/addTask')}
            style={{
              backgroundColor: '#208AEF',
              paddingVertical: 9,
              paddingHorizontal: 13,
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <FontAwesome name="plus" size={13} color="white" />
            <Text
              style={{
                color: 'white',
                fontSize: 13,
                fontWeight: '900',
                marginLeft: 6,
              }}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={selectedTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/taskDetail?id=${item.id}`)}
              style={{
                backgroundColor: theme.card,
                borderRadius: 18,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? '#334155' : '#E5E7EB',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome
                  name={item.completed ? 'check-circle' : 'circle-o'}
                  size={20}
                  color={item.completed ? '#22C55E' : theme.subText}
                />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 16,
                      fontWeight: '900',
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={{
                      color: theme.subText,
                      fontSize: 13,
                      fontWeight: '700',
                      marginTop: 5,
                    }}
                  >
                    {new Date(item.dueDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    • {item.category || 'Other'}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: `${getPriorityColor(item.priority)}20`,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: getPriorityColor(item.priority),
                      fontSize: 11,
                      fontWeight: '900',
                    }}
                  >
                    {item.priority}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <FontAwesome name="calendar-o" size={42} color={theme.subText} />

              <Text
                style={{
                  color: theme.text,
                  marginTop: 14,
                  fontSize: 17,
                  fontWeight: '900',
                }}
              >
                No tasks for this day
              </Text>

              <Text
                style={{
                  color: theme.subText,
                  marginTop: 6,
                  fontSize: 14,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                Tasks will only appear on their selected due date.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}