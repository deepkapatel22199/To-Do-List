import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import {useState, useRef} from  'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type TaskItem = {
  id: string;
  text: string;
  completed: boolean;
};

export default function AddTask() {
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [itemText, setItemText] = useState('');
  const [items, setItems] = useState<TaskItem[]>([]);

  const inputRef = useRef<TextInput>(null);

   const addItem = () => {
    if (itemText.trim() === '') return;

    const newItem: TaskItem = {
      id: Date.now().toString(),
      text: itemText.trim(),
      completed: false,
    };

    setItems([...items, newItem]);
    setItemText('');
  };

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
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
              Create Task
            </Text>
            <Text
              style={{
                color: '#EAF4FF',
                fontSize: 16,
              }}
            >
              Add a new task to your list
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
        style={{
          backgroundColor: '#208AEF',
          padding: 16,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Add Task
        </Text>
      </TouchableOpacity>
 
      </View>
         </SafeAreaView>
  );
}