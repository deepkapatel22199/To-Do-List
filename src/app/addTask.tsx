import { View, Text, TextInput, TouchableOpacity, ScrollView, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {useState, useEffect } from  'react';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SubTask = {
  id: string;
  text: string;
  completed: boolean;
};

type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  completed: boolean;
  subTasks: SubTask[];
};

export default function AddTask() {
  const { isDarkMode, setIsDarkMode, theme } = useTheme();
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [checklistText, setChecklistText] = useState('');
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);

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
      setSubTasks(selectedTask.subTasks || []);
    }
  };

  loadTaskForEdit();
}, [id]);

  const addChecklistItem = () => {
  if (checklistText.trim() === '') return;

  const newSubTask: SubTask = {
    id: Date.now().toString(),
    text: checklistText.trim(),
    completed: false,
  };

  setSubTasks([...subTasks, newSubTask]);
  setChecklistText('');
};

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
            completed: false,
            subTasks,
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
      completed: false,
      subTasks,
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
      <View
        style={{
          backgroundColor: theme.card,
          marginHorizontal: 20,
          marginTop: 24,
          padding: 22,
          borderRadius: 26,
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          borderWidth: 1,
          borderColor: isDarkMode ? '#263445' : '#E5E7EB',
        }}
      >
        <TextInput
        placeholder="Enter Task Title"
        placeholderTextColor={isDarkMode ? '#A0AEC0' : '#666'}
        value={title}
        onChangeText={setTitle}
        style={{
          backgroundColor: theme.inputBackground, 
          color: theme.text,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: isDarkMode ? '#334155' : '#E5E7EB' ,
          fontSize: 17,
          fontWeight: '600',
        }}
      />

      <TextInput
        placeholder="Enter Task Description"
        placeholderTextColor={isDarkMode ? '#A0AEC0' : '#666'}
        value={description}
        onChangeText={setDescription}
        multiline
        style={{
          backgroundColor: theme.inputBackground,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          height: 130,
          borderWidth: 1,
          borderColor: isDarkMode ? '#334155' : '#E5E7EB' ,
          textAlignVertical: 'top',
          color: theme.text,
          fontSize: 16,
          lineHeight: 22,
        }}
      />
  {/*checkList UI*/}
       <TextInput
  placeholder="Enter Tasks ..."
  placeholderTextColor={isDarkMode ? '#A0AEC0' : '#666'}
  value={checklistText}
  onChangeText={setChecklistText}
  onSubmitEditing={addChecklistItem}
  returnKeyType="done"
  style={{
    backgroundColor: theme.inputBackground,
    color: theme.text,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#E5E7EB',
    fontSize: 16,
    marginBottom: 12,
  }}
/>

{subTasks.map((item) => (
  <View
    key={item.id}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      backgroundColor: isDarkMode ? '#111827' : '#F8FAFC',
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? '#263445' : '#E5E7EB',
    }}
  >
    <FontAwesome name="circle-o" size={17} color={theme.subText} />

    <Text style={{ color: theme.text, marginLeft: 10, fontSize: 15, flex: 1 }}>
      {item.text}
    </Text>
  </View>
))}
      {/*Priority Section*/ }
      <Text 
        style={{ 
          color: theme.text, 
          fontWeight: '800', 
          marginBottom: 12 , 
          fontSize: 16
          }} 
        >
          Priority
      </Text>

      <View style={{ marginBottom: 22 }}>
  {['Low', 'Medium', 'High'].map((item) => {
     const colors = getPriorityColors(item);
    const selected = priority === item;
    return(
    <TouchableOpacity
      key={item}
      onPress={() => setPriority(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: selected ? colors.bg : theme.inputBackground,
        padding: 15,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: selected ? colors.border : isDarkMode ? '#334155' : '#E5E7EB',
      }}
    >
      <FontAwesome
        name={selected ? 'check-circle' : 'square-o'}
        size={22}
        color={selected ? colors.icon : theme.subText}
      />

      <Text
        style={{
          color: selected ? colors.text : theme.text,
          fontWeight: '800',
          fontSize: 16,
          marginLeft: 12,
        }}
      >
        {item === 'Low' 
        ? '🟢 Low Priority' : 
        item === 'Medium' ? 
        '🟡 Medium Priority' : 
        '🔴 High Priority'}
      </Text>
    </TouchableOpacity>
    );
})}
</View>
      
      {/* Date Picker */}
      <Text
        style={{ color: theme.text, fontWeight: 'bold', marginBottom: 8 , fontSize: 16}} >
        Due Date
      </Text>

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={{
          backgroundColor: theme.inputBackground,
          borderRadius: 14,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: isDarkMode ? '#334155' : '#E5E7EB',
          flexDirection: 'row',
            alignItems: 'center',
        }}
      >
      <FontAwesome name="calendar" size={18} color={theme.text} />
      <Text style={{ color: theme.text, marginLeft: 12,   fontSize: 16 }}>
        {dueDate.toLocaleDateString()}
      </Text>
    </TouchableOpacity>

    {showDatePicker && (
      <DateTimePicker
        value={dueDate}
        mode="date"
        display="default"
        onValueChange={(event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
          setDueDate(selectedDate);
      }
    }}
  />
)}

      {/* Save Button */}

      <TouchableOpacity
        onPress={handleAddTask}
        style={{
          backgroundColor: '#208AEF',
          padding: 17,
          borderRadius: 18,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          shadowColor: '#208AEF',
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 6,
        }}
      >

        <FontAwesome
          name={id ? 'save' : 'plus'}
          size={17}
          color="white"
          style={{ marginRight: 8 }}
        />
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 16 }}>
          {id ? 'Update Task' : 'Add Task'}
        </Text>
      </TouchableOpacity>
 
      </View>
      </ScrollView>
         </SafeAreaView>
  );
}