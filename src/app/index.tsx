import { useEffect, useState, useCallback} from 'react';
import { router, useFocusEffect} from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { View, Text, ActivityIndicator, Image , TouchableOpacity, FlatList, Alert, Modal, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  completed: boolean;
};

export default function Index() {
  const { isDarkMode, setIsDarkMode, theme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadTasks = async () => {
  const savedTasks = await AsyncStorage.getItem('tasks');
   const loadedTasks: Task[] = savedTasks
    ? JSON.parse(savedTasks)
    : [];

  loadedTasks.sort((a, b) => {
    if (a.completed === b.completed) return 0;

    return a.completed ? 1 : -1;
  });

  setTasks(loadedTasks);
  };

  const toggleCompleteTask = async (id: string) => {
  const updatedTasks = tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );


  updatedTasks.sort((a, b) => {
    if (a.completed === b.completed) return 0;

    return a.completed ? 1 : -1;
  });

  setTasks(updatedTasks);
  await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
};

  const deleteTask = async (id: string) => {
  Alert.alert(
    'Delete Task',
    'Are you sure you want to delete this task?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedTasks = tasks.filter((task) => task.id !== id);
          setTasks(updatedTasks);
          await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        },
      },
    ]
  );
};

useFocusEffect(
  useCallback(() => {
    loadTasks();
  }, [])
);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 2000);
  }, []);

  if (showSplash) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#208AEF',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={{
            width: 150,
            height: 150,
            marginBottom: 20,
          }}
        />
        <Text style={{ fontSize: 36, fontWeight: 'bold', color: 'white' }}>
          To Do List 
        </Text>
        <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>
          Make your daily tasks easier
        </Text>
        <ActivityIndicator color="white" style={{ marginTop: 25 }} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={{ width: 160, height: 160, marginBottom: 30 }}
        />

        <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
          Manage Your Tasks Easily
        </Text>

        <Text style={{ fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 40 }}>
          Add, edit, complete, and organize your daily tasks in one simple app.
        </Text>

        <TouchableOpacity
          onPress={() => setShowOnboarding(false)}
          style={{ backgroundColor: '#208AEF', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12 }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTaskItem = ({ item }: { item: Task }) => (
  <View
    style={{
      backgroundColor: theme.card,
      padding: 18,
      borderRadius: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#ccc',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    }}
  >
    <Text
      style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
        textDecorationLine: item.completed ? 'line-through' : 'none',
        opacity: item.completed ? 0.55 : 1,
      }}
    >
      {item.title}
    </Text>
    
    <Text 
      style={{ 
        color: theme.subText, 
        marginTop: 6,
        fontSize:15, 
        }}
      >
        {item.description}
    </Text>
    {/*Badges*/ }
    <View
       style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 14,
      }}
    > 
        {/* Priority Badges */  }
      <View
        style={{
          backgroundColor:
            item.priority === 'High'
            ? '#FFE5E5'
            : item.priority === 'Medium'
            ? '#FFF4CC'
            : '#E6F8E6',
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <FontAwesome
          name="circle"
          size={20}
          color={
            item.priority === 'High'
              ? '#E53935'
              : item.priority === 'Medium'
              ? '#F9A825'
              : '#2E7D32'
            }
        />
        <Text
          style={{
            color:
              item.priority === 'High'
              ? '#C62828'
              : item.priority === 'Medium'
              ? '#B8860B'
              : '#2E7D32',
            fontWeight: 'bold',
            fontSize: 13,
          }}
        >
          {item.priority} Priority 
        </Text>
      </View>
        {/* Status Badge */ }
      <View
        style={{
          backgroundColor: item.completed ? '#E6F8E6' : '#FFF4CC',
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: 20,
           flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
      <FontAwesome
          name={item.completed ? 'check-square' : 'hourglass-half'}
          size={14}
          color={item.completed ? '#2E7D32' : '#B8860B'}
        />
      <Text
        style={{
          color: item.completed ? '#2E7D32': '#B8860B',
          fontWeight: 'bold',
          fontSize: 13,
        }}
      >
        {item.completed ? 'Completed' : 'Pending'}
      </Text>
    </View>
      {/* Due Date Badge */ }
    <View
      style={{
        backgroundColor: '#E3F2FD',
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <FontAwesome name="calendar" size={14} color="#1565C0" />
    <Text
      style={{
        color: '#1565C0',
        fontWeight: 'bold',
        fontSize: 13,
      }}
    >
      {new Date(item.dueDate).toLocaleDateString()}
    </Text>
  </View>
</View>
      {/* Action Buttons */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
         borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#263445' : '#E5E7EB',
        marginTop: 16,
        paddingTop: 14,
      }}
    >
      {/*Complete/Undo Button*/ }
    <TouchableOpacity 
      onPress={() => toggleCompleteTask(item.id)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
    <FontAwesome
      name={item.completed ? 'undo' : 'check-circle'}
      size={17}
      color={item.completed ? 'green' : '#208AEF'}
    />
      <Text 
        style={{ 
          color: item.completed ? 'green' : '#208AEF', 
          fontWeight: 'bold' 
        }}
      >
        {item.completed ? 'Undo' : ' Complete'}
      </Text>
    </TouchableOpacity>
        {/*Edit Button*/ }
    <TouchableOpacity 
      onPress={() => router.push(`/addTask?id=${item.id}`)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      <FontAwesome name="pencil" size={17} color="#208AEF" />
      <Text style={{ color: '#208AEF', fontWeight: 'bold' }}>
        Edit
      </Text>
    </TouchableOpacity>
        {/*Delete Button*/ }
    <TouchableOpacity 
      onPress={() => deleteTask(item.id)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      <FontAwesome name="trash" size={17} color="red" />
      <Text style={{ color: 'red', fontWeight: 'bold' }}>
        Delete
      </Text>
    </TouchableOpacity>
  </View>
  </View>
);
  const filteredTasks = tasks.filter(
  (task) =>
    task.title
      .toLowerCase()
      .includes(searchText.toLowerCase()) ||
    task.description
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;
  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <View
        style={{
          backgroundColor: theme.header,
          paddingTop: 65,
          paddingBottom: 28,
          paddingHorizontal: 22,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
              fontSize: 32,
              fontWeight: 'bold',
              color:'white',
            }}
          >
            My Tasks
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: 'white',
              marginBottom: 10,
            }}
          >
            Organize your day with simple tasks
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
      size={26}
      color="white"
    />
  </TouchableOpacity>
</View>
      </View> 
      {tasks.length === 0 ? (
        <View
  style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  }}
>
  <View
    style={{
      backgroundColor: theme.card,
      width: '100%',
      padding: 30,
      borderRadius: 24,
      alignItems: 'center',

      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 5,
    }}
  >
    {/* Icon Circle */}
    <View
      style={{
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <FontAwesome
        name="tasks"
        size={40}
        color="#208AEF"
      />
    </View>

    {/* Title */}
    <Text
      style={{
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.text,
      }}
    >
      No Tasks Yet
    </Text>

    {/* Subtitle */}
    <Text
      style={{
        fontSize: 16,
        color: theme.subText,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 24,
      }}
    >
      Stay organized and productive.
      Create your first task to get started.
    </Text>

    {/* Add Task Button */}
    <TouchableOpacity
      onPress={() => router.push('/addTask')}
      style={{
        marginTop: 25,
        backgroundColor: '#208AEF',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <FontAwesome
        name="plus"
        size={16}
        color="white"
      />

      <Text
        style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: 16,
          marginLeft: 8,
        }}
      >
        Add First Task
      </Text>
    </TouchableOpacity>
  </View>
</View>
      ) : (
      <View style={{ flex: 1 }}>
  <View
    style={{
      flexDirection: 'row',
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 15,
      gap: 10,
    }}
  >
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: theme.subText, fontSize: 13 }}>Total</Text>
      <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>
        {totalTasks}
      </Text>
    </View>

    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: theme.subText, fontSize: 13 }}>Pending</Text>
      <Text style={{ color: '#F9A825', fontSize: 24, fontWeight: 'bold' }}>
        {pendingTasks}
      </Text>
    </View>

    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: theme.subText, fontSize: 13 }}>Done</Text>
      <Text style={{ color: '#2E7D32', fontSize: 24, fontWeight: 'bold' }}>
        {completedTasks}
      </Text>
    </View>
  </View>

  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 12,
    }}
  >
    <Text
      style={{
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.text,
      }}
    >
      Today&apos;s Tasks
    </Text>

    <Text
      style={{
        color: theme.subText,
        fontSize: 14,
        fontWeight: '600',
      }}
    >
      {pendingTasks} left
    </Text>
  </View>

  <FlatList
    data={tasks}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{
      paddingHorizontal: 20,
      paddingBottom: 120,
    }}
    renderItem={renderTaskItem}
    showsVerticalScrollIndicator={false}
  />
</View>
)}
     <View
        style={{
          position: 'absolute',
          bottom: 25,
          left: 24,
          right: 24,
          height: 76,
          borderRadius: 28,
          backgroundColor: theme.card,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 28,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          elevation: 8,
        }}
      >
        {/*Home Button*/ }
        <TouchableOpacity
          style={{
          alignItems: 'center',
          justifyContent: 'center',
          }}
        >
          <FontAwesome name="home" size={30} color={theme.icon} />
          <Text
            style={{
              fontSize: 15,
              color: theme.icon,
              fontWeight: '600',
              marginTop: 4,
            }}
          >
          Home
        </Text>
        </TouchableOpacity>
        
          {/*Add Task Button*/ }
        <TouchableOpacity
          onPress={() => router.push('/addTask')}
          style={{
            backgroundColor: theme.plus,
            width: 68,
            height: 68,
            borderRadius: 34,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: theme.plus,
            shadowOpacity: 0.35,
            shadowRadius: 10,
            shadowOffset: {
              width: 0,
              height: 5,
            },
            elevation: 10,
          }}
        >
          <FontAwesome name="plus" size={30} color="white" />
        </TouchableOpacity>
          {/*Search Button*/ }
        <TouchableOpacity
          onPress={() => setSearchVisible(true)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        <FontAwesome name="search" size={30} color={theme.icon} />
        <Text
          style={{
            fontSize: 15,
            color: theme.icon,
            fontWeight: '600',
            marginTop: 4,
          }}
        >
          Search
        </Text>
        </TouchableOpacity>
      </View>
      <Modal
  visible={searchVisible}
  transparent={true}
  animationType="fade"
>
  <View
    style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
    }}
  >
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 15,
        }}
      >
        Search Tasks
      </Text>

      <TextInput
        placeholder="Search task..."
        placeholderTextColor="#888"
        value={searchText}
        onChangeText={setSearchText}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 12,
          padding: 12,
          color: theme.text,
          marginBottom: 15,
        }}
      />

      {searchText.trim() !== '' && (
  <FlatList
    data={filteredTasks}
    keyExtractor={(item) => item.id}
    style={{ maxHeight: 250 }}
    renderItem={({ item }) => (
      <View
        style={{
          backgroundColor: theme.background,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            color: theme.subText,
            marginTop: 4,
          }}
        >
          {item.description}
        </Text>
      </View>
    )}
  />
)}

  {searchText.trim() !== '' && filteredTasks.length === 0 && (
  <Text
    style={{
      color: theme.text,
      textAlign: 'center',
      marginTop: 10,
    }}
  >
    No tasks found
  </Text>
)}

      <TouchableOpacity
        onPress={() => {
          setSearchVisible(false);
          setSearchText('');
        }}
        style={{
          marginTop: 15,
          backgroundColor: theme.plus,
          padding: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Close
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
}
