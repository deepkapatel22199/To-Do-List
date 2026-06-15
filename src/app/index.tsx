import { useEffect, useState, useCallback} from 'react';
import { router, useFocusEffect} from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { View, Text, ActivityIndicator, Image , TouchableOpacity, FlatList, Alert, Modal, TextInput} from 'react-native';
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

export default function Index() {
  const { isDarkMode, setIsDarkMode, theme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'Priority' | 'Due Date'>('Newest');
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);


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

  const toggleSubTask = async (taskId: string, subTaskId: string) => {
  const updatedTasks = tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          subTasks: (task.subTasks || []).map((sub) =>
            sub.id === subTaskId
              ? { ...sub, completed: !sub.completed }
              : sub
          ),
        }
      : task
  );

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
    }, 500);
  }, []);

  useEffect(() => {
  const checkOnboardingStatus = async () => {
    const onboardingSeen = await AsyncStorage.getItem('onboardingSeen');

    if (onboardingSeen === 'true') {
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }

    setCheckingOnboarding(false);
  };

  checkOnboardingStatus();
}, []);

  if (showSplash || checkingOnboarding) {
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
          NextTask
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
           onPress={async () => {
            await AsyncStorage.setItem('onboardingSeen', 'true');
            setShowOnboarding(false);
        }}
          style={{ backgroundColor: '#208AEF', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12 }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDueDate = (date: string) => {
  if (!date) return 'No due date';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'No due date';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getPriorityStyle = (priority: string) => {
  if (priority === 'High') {
    return {
      bg: '#FEE2E2',
      text: '#B91C1C',
      icon: '#EF4444',
    };
  }

  if (priority === 'Medium') {
    return {
      bg: '#FEF3C7',
      text: '#92400E',
      icon: '#F59E0B',
    };
  }

  return {
    bg: '#DCFCE7',
    text: '#166534',
    icon: '#22C55E',
  };
};

  const renderTaskItem = ({ item }: { item: Task }) => {
    const priorityStyle = getPriorityStyle(item.priority);
    return (
      <View
        style={{
          backgroundColor: theme.card,
          padding: 18,
          borderRadius: 22,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: isDarkMode ? '#263445' : '#E5E7EB',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
          elevation: 4,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View 
            style={{ 
              flex: 1, 
              paddingRight: 10 
            }}
          >
            <Text
              style={{
                fontSize: 19,
                fontWeight: '800',
                color: theme.text,
                textDecorationLine: item.completed ? 'line-through' : 'none',
                opacity: item.completed ? 0.55 : 1,
              }}
            >
              {item.title}
            </Text>
            {item.description ? (
            <Text 
              style={{ 
                color: theme.subText, 
                marginTop: 6,
                fontSize:15, 
                lineHeight: 20,
              }}
            >
              {item.description}
            </Text>
            ) : null }
          </View>
          {/* Priority Badges */  }
          <View
            style={{
              backgroundColor: priorityStyle.bg,
              paddingVertical: 7,
              paddingHorizontal: 11,
              borderRadius: 20,
              height : 34,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <FontAwesome
              name="circle"
              size={9}
              color={priorityStyle.icon}
            />
            <Text
            style={{
              color: priorityStyle.text,
              fontWeight: 'bold',
              fontSize: 13,
              paddingLeft: 6,
              }}
            >
              {item.priority}
            </Text>
          </View>
        </View>
        {/* Subtasks field */}
        {item.subTasks && item.subTasks.length > 0 && (
        <View 
          style={{ 
            marginTop: 14, 
            backgroundColor: isDarkMode ? '#121212' : '#F8FAFC',
            borderRadius: 14,
            padding: 12,
          }}
        >
          {item.subTasks.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            onPress={() => toggleSubTask(item.id, sub.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <FontAwesome
              name={sub.completed ? 'check-circle' : 'circle-o'}
              size={17}
              color={sub.completed ? '#208AEF' : theme.subText}
            />

            <Text
              style={{
                color: sub.completed ? theme.subText : theme.text,
                marginLeft: 10,
                fontSize: 14,
                textDecorationLine: sub.completed ? 'line-through' : 'none',
                flex: 1,
              }}
            >
              {sub.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/*Badges*/ }
    <View
       style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 14,
      }}
    > 
       
        {/* Status Badge */ }
      <View
        style={{
          backgroundColor: item.completed ? '#DCFCE7' : '#FEF3C7',
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 10,
        }}
      >
      <FontAwesome
          name={item.completed ? 'check-square' : 'hourglass-half'}
          size={14}
          color={item.completed ? '#166534' : '#92400E'}
        />
      <Text
        style={{
          color: item.completed ? '#166534' : '#92400E',
          fontWeight: '800',
          fontSize: 13,
          paddingLeft: 6,
        }}
      >
        {item.completed ? 'Completed' : 'Pending'}
      </Text>
    </View>
      {/* Due Date Badge */ }
    <View
      style={{
        backgroundColor: isDarkMode ? '#1E3A5F' : '#E3F2FD',
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <FontAwesome name="calendar" size={14} color="#208AEF" />
    <Text
      style={{
        color: isDarkMode ? '#BFDBFE' : '#1565C0',
        fontWeight: '800',
        fontSize: 12,
        marginLeft: 6,
      }}
    >
      {formatDueDate(item.dueDate)}
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
      style={{ flexDirection: 'row', alignItems: 'center' }}
    >
    <FontAwesome
      name={item.completed ? 'undo' : 'check-circle'}
      size={17}
      color={item.completed ? '#22C55E' : '#208AEF'}
    />
      <Text 
        style={{ 
          color: item.completed ? '#22C55E' : '#208AEF', 
          fontWeight: '800', 
          paddingLeft: 6,
        }}
      >
        {item.completed ? 'Undo' : ' Complete'}
      </Text>
    </TouchableOpacity>
        {/*Edit Button*/ }
    <TouchableOpacity 
      onPress={() => router.push(`/addTask?id=${item.id}`)}
      style={{ flexDirection: 'row', alignItems: 'center',  }}
    >
      <FontAwesome name="pencil" size={17} color="#208AEF" />
      <Text style={{ color: '#208AEF', fontWeight: 'bold', paddingLeft: 6 }}>
        Edit
      </Text>
    </TouchableOpacity>
        {/*Delete Button*/ }
    <TouchableOpacity 
      onPress={() => deleteTask(item.id)}
      style={{ flexDirection: 'row', alignItems: 'center',  }}
    >
      <FontAwesome name="trash" size={17} color="#EF4444" />
      <Text style={{ color: '#EF4444', fontWeight: '800', paddingLeft: 6 }}>
        Delete
      </Text>
    </TouchableOpacity>
  </View>
  </View>
);
  };

 const priorityValue = (priority: string) => {
  if (priority === 'High') return 3;
  if (priority === 'Medium') return 2;
  return 1;
};

const displayedTasks = [...tasks]
  .filter((task) => {
    if (filter === 'Pending') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  })
  .sort((a, b) => {
    if (sortBy === 'Priority') {
      return priorityValue(b.priority) - priorityValue(a.priority);
    }

    if (sortBy === 'Due Date') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    if (sortBy === 'Oldest') {
      return Number(a.id) - Number(b.id);
    }

    return Number(b.id) - Number(a.id);
  });

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
      marginBottom: 18,
    }}
  >
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: isDarkMode ? '#263445' : '#E5E7EB',
      }}
    >
     
      <Text style={{ color: theme.text, fontSize: 24, fontWeight: '900' }}>
        {totalTasks}
      </Text>
       <Text style={{ color: theme.subText, fontSize: 13, fontWeight: '700' }}>Total</Text>
    </View>

    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: isDarkMode ? '#263445' : '#E5E7EB',
      }}
    >
      
      <Text style={{ color: '#F9A825', fontSize: 24, fontWeight: '900' }}>
        {pendingTasks}
      </Text>
      <Text style={{ color: theme.subText, fontSize: 13, fontWeight: '700' }}>Pending</Text>
    </View>

    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? '#263445' : '#E5E7EB',
      }}
    >
      
      <Text style={{ color: '#2E7D32', fontSize: 24, fontWeight: '900' }}>
        {completedTasks}
      </Text>
      <Text style={{ color: theme.subText, fontSize: 13, fontWeight: '700' }}>Done</Text>
    </View>
  </View>

  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 12,
      zIndex : 1000,
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

    <View style={{ position: 'relative' }}>
  <TouchableOpacity
    onPress={() => setSortDropdownVisible(!sortDropdownVisible)}
    style={{
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        color: theme.subText,
        fontSize: 11,
        fontWeight: '800',
        marginRight: 6,
      }}
    >
      SORT BY
    </Text>

    <Text
      style={{
        color: theme.text,
        fontSize: 13,
        fontWeight: '800',
        marginRight: 6,
      }}
    >
      {sortBy}
    </Text>

    <FontAwesome name="chevron-down" size={11} color={theme.subText} />
  </TouchableOpacity>

  {sortDropdownVisible && (
    <View
      style={{
        position: 'absolute',
        top: 44,
        right: 0,
        width: 155,
        backgroundColor: theme.card,
        borderRadius: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? '#334155' : '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 10,
        zIndex: 999,
      }}
    >
      {(['Newest', 'Oldest', 'Priority', 'Due Date'] as const).map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => {
            setSortBy(item);
            setSortDropdownVisible(false);
          }}
          style={{
            paddingVertical: 11,
            paddingHorizontal: 14,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: sortBy === item ? '#208AEF' : theme.text,
              fontSize: 14,
              fontWeight: sortBy === item ? '900' : '700',
            }}
          >
            {item}
          </Text>

          {sortBy === item && (
            <FontAwesome name="check" size={14} color="#208AEF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>  


  </View>

  <View
  style={{
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
  }}
>
  {(['All', 'Pending', 'Completed'] as const).map((item) => (
    <TouchableOpacity
      key={item}
      onPress={() => setFilter(item)}
      style={{
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 22,
        backgroundColor: filter === item ? '#208AEF' : theme.card,
        borderWidth: 1,
        marginRight: 6,
        borderColor: filter === item ? '#208AEF' : isDarkMode ? '#334155' : '#E5E7EB',
      }}
    >
      <Text
        style={{
          color: filter === item ? 'white' : theme.text,
          fontWeight: 'bold',
          fontSize: 14,
        }}
      >
        {item}
      </Text>
    </TouchableOpacity>
  ))}
</View>

  <FlatList
    data={displayedTasks}
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

      {/*Search Modal*/ } 
      <Modal
  visible={searchVisible}
  transparent={true}
  animationType="slide"
>
  <View
    style={{
      flex: 1,
      backgroundColor: isDarkMode
        ? 'rgba(0,0,0,0.65)'
        : 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    }}
  >
    <View
      style={{
        backgroundColor: theme.card,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 30,
        maxHeight: '80%',
      }}
    >
      {/* Top Bar */}
      <View
        style={{
          width: 45,
          height: 5,
          borderRadius: 10,
          backgroundColor: isDarkMode ? '#475569' : '#CBD5E1',
          alignSelf: 'center',
          marginBottom: 18,
        }}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <View>
          <Text
            style={{
              color: theme.text,
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            Search Tasks
          </Text>

          <Text
            style={{
              color: theme.subText,
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Find and open your task quickly
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setSearchVisible(false);
            setSearchText('');
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.background,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesome name="times" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View
        style={{
          backgroundColor: theme.background,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isDarkMode ? '#334155' : '#E5E7EB',
          marginBottom: 18,
        }}
      >
        <FontAwesome name="search" size={18} color={theme.subText} />

        <TextInput
          placeholder="Search by title or description..."
          placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
          value={searchText}
          onChangeText={setSearchText}
          style={{
            flex: 1,
            color: theme.text,
            fontSize: 16,
            paddingVertical: 12,
            marginLeft: 12,
          }}
        />

        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <FontAwesome name="close" size={18} color={theme.subText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Empty Hint */}
      {searchText.trim() === '' && (
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 30,
          }}
        >
          <FontAwesome name="search" size={42} color={theme.subText} />

          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: 'bold',
              marginTop: 14,
            }}
          >
            Start typing to search
          </Text>

          <Text
            style={{
              color: theme.subText,
              fontSize: 14,
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            Search results will appear here.
          </Text>
        </View>
      )}

      {/* Search Results */}
      {searchText.trim() !== '' && filteredTasks.length > 0 && (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSearchVisible(false);
                setSearchText('');
                router.push(`/addTask?id=${item.id}`);
              }}
              style={{
                backgroundColor: theme.background,
                padding: 14,
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? '#334155' : '#E5E7EB',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: 'bold',
                    fontSize: 16,
                    flex: 1,
                  }}
                >
                  {item.title}
                </Text>

                <FontAwesome name="chevron-right" size={14} color={theme.subText} />
              </View>

              <Text
                style={{
                  color: theme.subText,
                  marginTop: 6,
                }}
                numberOfLines={2}
              >
                {item.description}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color:
                      item.priority === 'High'
                        ? '#E53935'
                        : item.priority === 'Medium'
                        ? '#F9A825'
                        : '#2E7D32',
                    fontWeight: 'bold',
                    fontSize: 13,
                  }}
                >
                  {item.priority}
                </Text>

                <Text
                  style={{
                    color: theme.subText,
                    marginHorizontal: 8,
                  }}
                >
                  •
                </Text>

                <Text
                  style={{
                    color: item.completed ? '#2E7D32' : '#F9A825',
                    fontWeight: 'bold',
                    fontSize: 13,
                  }}
                >
                  {item.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* No Results */}
      {searchText.trim() !== '' && filteredTasks.length === 0 && (
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 30,
          }}
        >
          <FontAwesome name="exclamation-circle" size={42} color={theme.subText} />

          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: 'bold',
              marginTop: 14,
            }}
          >
            No tasks found
          </Text>

          <Text
            style={{
              color: theme.subText,
              fontSize: 14,
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            Try searching with a different keyword.
          </Text>
        </View>
      )}
    </View>
  </View>
</Modal>
    </View>
  );
}
