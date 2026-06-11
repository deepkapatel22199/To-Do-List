import { useEffect, useState, useCallback} from 'react';
import { router, useFocusEffect} from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { View, Text, ActivityIndicator, Image , TouchableOpacity, FlatList, Alert} from 'react-native';
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

  const loadTasks = async () => {
  const savedTasks = await AsyncStorage.getItem('tasks');
  setTasks(savedTasks ? JSON.parse(savedTasks) : []);
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
          paddingTop: 70,
          paddingBottom: 5,
          paddingHorizontal: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
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
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
    <FontAwesome
      name={isDarkMode ? 'sun-o' : 'moon-o'}
      size={26}
      color="white"
      marginLeft={70}
    />
  </TouchableOpacity>
      </View> 
      {tasks.length === 0 ? (
      <View
        style={{
          flexDirection:'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.text,
          }}
        >
          Welcome 
        </Text>
        <Text
          style={{
            fontSize: 24,
            color: theme.text,
          }}
        >
          You don't have any tasks
        </Text>
      </View> 
      ) : (
  <FlatList
    data={tasks}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{
      padding: 20,
      paddingBottom: 120,
    }}
    renderItem={({ item }) => (
      <View
        style={{
          backgroundColor: theme.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.text,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            color: theme.subText,
            marginTop: 5,
          }}
        >
          {item.description}
        </Text>

        <Text
          style={{
            marginTop: 8,
            color: theme.text,
        }}
        >
          Priority: {item.priority}
        </Text>

        <Text
          style={{
            color: theme.text,
          }}
        >
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>

        <View
  style={{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 15,
  }}
>
  <TouchableOpacity
    onPress={() => router.push(`/addTask?id=${item.id}`)}
  >
    <Text style={{ color: '#208AEF', fontWeight: 'bold' }}>
      Edit
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => deleteTask(item.id)}
  >
    <Text style={{ color: 'red', fontWeight: 'bold' }}>
      Delete
    </Text>
  </TouchableOpacity>
</View>

      </View>
    )}
  />
)}
     <View
        style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 25,
          backgroundColor: theme.card,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >

        <FontAwesome name="home" size={24} color={theme.icon} />
        
        <TouchableOpacity
          onPress={() => router.push('/addTask')}
          style={{
            backgroundColor: theme.plus,
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
            <FontAwesome name="plus" size={24} color="white" />
        </TouchableOpacity>

        <FontAwesome name="search" size={24} color={theme.icon} />
      </View>
    </View>
  );
}
