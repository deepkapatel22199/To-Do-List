import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {useState, useEffect } from  'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: Date;
  completed: boolean;
};

export default function AddTask() {
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
    }
  };

  loadTaskForEdit();
}, [id]);

  const handleAddTask = async () => {
  if (title.trim() === '') {
    alert('Please enter task title');
    return;
  }

  const newTask: Task = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description.trim(),
    priority,
    dueDate: dueDate,
    completed: false,
  };

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
            dueDate: dueDate.toLocaleDateString(),
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
      dueDate: dueDate,
      completed: false,
    };

    await AsyncStorage.setItem('tasks', JSON.stringify([...oldTasks, newTask]));
  }
  router.back();
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F9FC' }}>
      <View
        style={{
          backgroundColor: '#208AEF',
          paddingTop: 60,
          paddingBottom: 10,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View 
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft:20
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {id ? 'Edit Task' : 'Create Task'}
            </Text>
            <Text
              style={{
                color: '#EAF4FF',
                fontSize: 16,
              }}
            >
              {id ? 'Update your task details' : 'Add a new task to your list'}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft:20
            }}
      >
        <TextInput
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#ddd',
        }}
      />

      <TextInput
        placeholder="Task Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 14,
          height: 120,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#ddd',
          textAlignVertical: 'top',
        }}
      />

      <View 
      style={{
              flexDirection: 'row',
              alignItems:'center',
              justifyContent: 'space-between',
              paddingLeft:20
            }}
      >
        <Text
  style={{
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  }}
>
  Priority
</Text>

<TouchableOpacity
  onPress={() => setPriority('Low')}
  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
>
  <Text style={{ fontSize: 20, marginRight: 10 }}>
    {priority === 'Low' ? '🟢' : '⚪'}
  </Text>
  <Text>Low</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => setPriority('Medium')}
  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
>
  <Text style={{ fontSize: 20, marginRight: 10 }}>
    {priority === 'Medium' ? '🟡' : '⚪'}
  </Text>
  <Text>Medium</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => setPriority('High')}
  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
>
  <Text style={{ fontSize: 20, marginRight: 10 }}>
    {priority === 'High' ? '🔴' : '⚪'}
  </Text>
  <Text>High</Text>
</TouchableOpacity>
      </View>
      

      <Text
  style={{
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  }}
>
  Due Date
</Text>

<TouchableOpacity
  onPress={() => setShowDatePicker(true)}
  style={{
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  }}
>
  <Text>
    {dueDate.toLocaleDateString()}
  </Text>
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

      <TouchableOpacity
        onPress={handleAddTask}
        style={{
          backgroundColor: '#208AEF',
          padding: 16,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {id ? 'Update Task' : 'Add Task'}
        </Text>
      </TouchableOpacity>
 
      </View>
         </SafeAreaView>
  );
}