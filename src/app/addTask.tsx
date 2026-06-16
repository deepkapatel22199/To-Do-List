import { View, Text, TextInput, TouchableOpacity, ScrollView, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {useState, useEffect } from  'react';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';


type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  time: string;
  category: string;
  completed: boolean;
};

export default function AddTask() {
  const { isDarkMode, setIsDarkMode, theme } = useTheme();
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');

  const { id } = useLocalSearchParams();
  

  useEffect(() => {
  const loadTaskForEdit = async () => {
    if (!id) return;

    const savedTasks = await AsyncStorage.getItem('tasks');
    const oldTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];

    const selectedTask = oldTasks.find((task) => task.id === id);

    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description);
      setPriority(selectedTask.priority);
      setDueDate(new Date(selectedTask.dueDate));
      setCategory(selectedTask.category || 'Work');
      if (selectedTask.dueDate) {
        setDueDate(new Date(selectedTask.dueDate));
      }
    }
  };

  loadTaskForEdit();
}, [id]);

 
  const handleAddTask = async () => {
  if (title.trim() === '') {
    alert('Please enter task title');
    return;
  }


  const savedTasks = await AsyncStorage.getItem('tasks');
  const oldTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];
  if (id) {
    const updatedTasks = oldTasks.map((task) =>
      task.id === id
        ? {
            ...task,
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate: dueDate.toISOString(),
            time: dueDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          category,
          completed: task.completed,
          }
        : task
    );

    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  } else {
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate.toISOString(),
      time: dueDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    category,
    completed: false,
    };

    await AsyncStorage.setItem('tasks', JSON.stringify([...oldTasks, newTask]));
  }
  router.back();
};

  const getPriorityColors = (item: string) => {
  if (item === 'High') {
    return {
      bg: '#FEE2E2',
      border: '#EF4444',
      text: '#B91C1C',
      icon: '#EF4444',
    };
  }

  if (item === 'Medium') {
    return {
      bg: '#FEF3C7',
      border: '#F59E0B',
      text: '#92400E',
      icon: '#F59E0B',
    };
  }

  return {
    bg: '#DCFCE7',
    border: '#22C55E',
    text: '#166534',
    icon: '#22C55E',
  };
};

  
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

  return (
    <SafeAreaView
    edges={['top']}
    style={{
      flex: 1,
      backgroundColor: theme.header,
    }}
  >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          backgroundColor: theme.background,
        }}
      >
      <View
        style={{
          backgroundColor: theme.header,
          paddingTop : 15,
          paddingBottom: 28,
          paddingHorizontal: 22,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: 'rgba(255,255,255,0.18)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FontAwesome name="arrow-left" size={22} color='white' />
          </TouchableOpacity>
          <View 
            style={{
              flex: 1, 
              marginLeft: 16,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {id ? 'Edit Task' : 'Create Task'}
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 17,
                marginTop: 4,
              }}
            >
              {id ? 'Update your task details' : 'Add a new task to your list'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsDarkMode(!isDarkMode)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: 'rgba(255,255,255,0.18)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
          <FontAwesome
            name={isDarkMode ? 'sun-o' : 'moon-o'}
            size={22}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
            {/*Form Card */ }
     {/* Form Content */}
<View
  style={{
    marginHorizontal: 20,
    marginTop: 24,
  }}
>
  {/* Task Title */}
  <View
    style={{
      backgroundColor: theme.card,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <FontAwesome name="pencil-square-o" size={22} color="#208AEF" />
    <TextInput
      placeholder="Task Title"
      placeholderTextColor={isDarkMode ? '#A0AEC0' : '#7C8596'}
      value={title}
      onChangeText={setTitle}
      style={{
        flex: 1,
        color: theme.text,
        fontSize: 17,
        marginLeft: 14,
        fontWeight: '600',
      }}
    />
  </View>

  {/* Description */}
  <View
    style={{
      backgroundColor: theme.card,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      flexDirection: 'row',
      alignItems: 'flex-start',
      minHeight: 105,
    }}
  >
    <FontAwesome name="file-text-o" size={22} color="#208AEF" style={{ marginTop: 4 }} />
    <TextInput
      placeholder="Description (optional)"
      placeholderTextColor={isDarkMode ? '#A0AEC0' : '#7C8596'}
      value={description}
      onChangeText={setDescription}
      multiline
      style={{
        flex: 1,
        color: theme.text,
        fontSize: 16,
        marginLeft: 14,
        textAlignVertical: 'top',
        lineHeight: 22,
      }}
    />
  </View>
    

  {/* Priority */}
  <TouchableOpacity
    style={{
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FontAwesome name="flag" size={22} color="#EF4444" />
      <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', marginLeft: 14 }}>
        Priority
      </Text>
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {['Low', 'Medium', 'High'].map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => setPriority(item)}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 14,
            marginLeft: 6,
            backgroundColor: priority === item ? getPriorityColors(item).bg : 'transparent',
          }}
        >
          <Text
            style={{
              color: priority === item ? getPriorityColors(item).text : theme.subText,
              fontWeight: '800',
              fontSize: 13,
            }}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </TouchableOpacity>

  {/* Due Date */}
  <TouchableOpacity
    onPress={() => setShowDatePicker(true)}
    style={{
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FontAwesome name="calendar" size={22} color="#208AEF" />
      <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', marginLeft: 14 }}>
        Due Date
      </Text>
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginRight: 10 }}>
        {formatDate(dueDate)}
      </Text>
      <FontAwesome name="chevron-down" size={14} color={theme.subText} />
    </View>
  </TouchableOpacity>

  {showDatePicker && (
    <DateTimePicker
      value={dueDate}
      mode="date"
      display="default"
      onChange={(event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
          setDueDate(selectedDate);
        }
      }}
    />
  )}
  {/* Time Block */}
  <TouchableOpacity
  onPress={() => setShowTimePicker(true)}
  style={{
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <FontAwesome name="clock-o" size={22} color="#208AEF" />
    <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', marginLeft: 14 }}>
      Time
    </Text>
  </View>

  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginRight: 10 }}>
      {formatTime(dueDate)}
    </Text>
    <FontAwesome name="chevron-down" size={14} color={theme.subText} />
  </View>
</TouchableOpacity>

{showTimePicker && (
  <DateTimePicker
    value={dueDate}
    mode="time"
    display="default"
    onChange={(event, selectedTime) => {
      setShowTimePicker(false);
      if (selectedTime) {
        const updatedDate = new Date(dueDate);
        updatedDate.setHours(selectedTime.getHours());
        updatedDate.setMinutes(selectedTime.getMinutes());
        setDueDate(updatedDate);
      }
    }}
  />
)}
  {/* Categary Block */}

  <View
  style={{
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#E5E7EB',
  }}
>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FontAwesome name="tag" size={22} color="#6D5DF6" />
      <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', marginLeft: 14 }}>
        Category
      </Text>
    </View>

    <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>
      {category}
    </Text>
  </View>

  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
    {['Work', 'Personal', 'Study', 'Shopping'].map((item) => (
      <TouchableOpacity
        key={item}
        onPress={() => setCategory(item)}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 16,
          marginRight: 8,
          marginBottom: 8,
          backgroundColor: category === item ? '#E3F2FD' : theme.background,
          borderWidth: 1,
          borderColor: category === item ? '#208AEF' : isDarkMode ? '#334155' : '#E5E7EB',
        }}
      >
        <Text
          style={{
            color: category === item ? '#208AEF' : theme.text,
            fontWeight: '800',
            fontSize: 13,
          }}
        >
          {item}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>


  {/* Reminder Placeholder */}
  <View
    style={{
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FontAwesome name="bell-o" size={22} color="#208AEF" />
      <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', marginLeft: 14 }}>
        Reminder
      </Text>
    </View>

    <Text style={{ color: theme.subText, fontSize: 16, fontWeight: '700' }}>
      None
    </Text>
  </View>

  {/* Save Button */}
  <TouchableOpacity
    onPress={handleAddTask}
    style={{
      backgroundColor: '#005BFF',
      padding: 18,
      borderRadius: 18,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: '#005BFF',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 6,
      marginBottom: 30,
    }}
  >
    <FontAwesome
      name={id ? 'save' : 'plus-circle'}
      size={22}
      color="white"
      style={{ marginRight: 10 }}
    />
    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 17 }}>
      {id ? 'Update Task' : 'Add Task'}
    </Text>
  </TouchableOpacity>
</View>
      </ScrollView>
         </SafeAreaView>
  );
}