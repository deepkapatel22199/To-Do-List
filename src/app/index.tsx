import { useEffect, useState, useCallback} from 'react';
import { router, useFocusEffect} from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { View, Text, ActivityIndicator, Image , TouchableOpacity, FlatList, Alert, Modal, TextInput, ScrollView} from 'react-native';
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
  category: string;
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
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'Priority' | 'Due Date' | 'Category'>('Newest');
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

  const isTaskOverdue = (date: string, completed: boolean) => {
  if (!date || completed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  return due < today;
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

  const formatTaskTime = (date: string) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isToday = (date: Date) => {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isTomorrow = (date: Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

  const getSectionTitle = (date: string) => {
  const d = new Date(date);

  if (isNaN(d.getTime())) return 'Upcoming';
  if (isToday(d)) return "Today's Tasks";
  if (isTomorrow(d)) return "Tomorrow's Tasks";
  if (isTaskOverdue(date, false)) return "Overdue Tasks";

  return 'Upcoming';
};


  const renderTaskItem = ({ item }: { item: Task }) => {
  const priorityStyle = getPriorityStyle(item.priority);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/taskDetail?id=${item.id}`)}
      style={{
        backgroundColor: theme.card,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#263445' : '#E5E7EB',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => toggleCompleteTask(item.id)}>
          <FontAwesome
            name={item.completed ? 'check-circle' : 'circle-o'}
            size={22}
            color={item.completed ? '#22C55E' : '#CBD5E1'}
          />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              color: theme.text,
              fontSize: 15,
              fontWeight: '900',
              textDecorationLine: item.completed ? 'line-through' : 'none',
            }}
          >
            {item.title}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <FontAwesome name="calendar-o" size={11} color={theme.subText} />

            <Text
              style={{
                color: theme.subText,
                fontSize: 11,
                fontWeight: '700',
                marginLeft: 5,
              }}
            >
              {formatDueDate(item.dueDate)}
            </Text>

            <Text style={{ color: theme.subText, marginHorizontal: 7 }}>|</Text>

            <Text
              style={{
                color: '#208AEF',
                fontSize: 11,
                fontWeight: '900',
              }}
            >
              {item.category || 'Other'}
            </Text>
          </View>
        </View>
              <TouchableOpacity
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: priorityStyle.bg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  }}
>
  <FontAwesome
    name="flag"
    size={12}
    color={priorityStyle.icon}
  />

  <Text
    style={{
      color: priorityStyle.text,
      fontSize: 11,
      fontWeight: '900',
      marginLeft: 6,
    }}
  >
    {item.priority}
  </Text>
</TouchableOpacity>
      </View>
    </TouchableOpacity>
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

    if (sortBy === 'Category') {
      return (a.category || 'Other').localeCompare(b.category || 'Other');
    }

    if (sortBy === 'Oldest') {
      return Number(a.id) - Number(b.id);
    }

    return Number(b.id) - Number(a.id);
  });

  type TaskSection = "Today's Tasks" | "Tomorrow's Tasks" | "Upcoming" | "Overdue";

const taskSections: TaskSection[] = [
  "Today's Tasks",
  "Tomorrow's Tasks",
  "Upcoming",
  "Overdue",
];


const groupedTasks: Record<TaskSection, Task[]> = {
  "Today's Tasks": [],
  "Tomorrow's Tasks": [],
  Upcoming: [],
  Overdue: [],
};

displayedTasks.forEach((task) => {
  if (!task.dueDate) {
    groupedTasks.Upcoming.push(task);
    return;
  }

  const due = new Date(task.dueDate);

  if (isNaN(due.getTime())) {
    groupedTasks.Upcoming.push(task);
    return;
  }

  const today = new Date();

  const dueOnlyDate = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  );

  const todayOnlyDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

const now = new Date();

if (!task.completed && due.getTime() < now.getTime()) {
  groupedTasks.Overdue.push(task);
  return;
}

  if (isToday(due)) {
    groupedTasks["Today's Tasks"].push(task);
    return;
  }

  if (isTomorrow(due)) {
    groupedTasks["Tomorrow's Tasks"].push(task);
    return;
  }

  groupedTasks.Upcoming.push(task);
});

const firstVisibleSection = taskSections.find(
  (section) => groupedTasks[section].length > 0
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

  const progressPercentage =
  totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100);
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
        {/* Progress Card */}
<View
  style={{
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: isDarkMode ? '#263445' : '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
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
          color: theme.text,
          fontSize: 15,
          fontWeight: '900',
          marginBottom: 8,
        }}
      >
        Today's Progress
      </Text>

      <Text
        style={{
          color: '#208AEF',
          fontSize: 34,
          fontWeight: '900',
          marginBottom: 2,
        }}
      >
        {progressPercentage}%
      </Text>

      <Text
        style={{
          color: theme.subText,
          fontSize: 13,
          fontWeight: '600',
          marginBottom: 14,
        }}
      >
        {completedTasks} of {totalTasks} tasks completed
      </Text>
    </View>

    <Image
      source={require('../../assets/images/Target.png')}
      style={{
        width: 101,
        height: 101,
        resizeMode: 'contain',
      }}
    />
  </View>

  <View
    style={{
      height: 10,
      backgroundColor: isDarkMode ? '#334155' : '#E5E7EB',
      borderRadius: 999,
      overflow: 'hidden',
      marginTop: 4,
    }}
  >
    <View
  style={{
    height: 10,
    backgroundColor: isDarkMode ? '#334155' : '#E5E7EB',
    borderRadius: 999,
    overflow:'hidden',
  }}
>
  <View
    style={{
      width:
        progressPercentage === 0
          ? '0%'
          : `${Math.max(progressPercentage, 3)}%`,
      height: '100%',
      backgroundColor: '#208AEF',
      borderRadius: 999,
    }}
  />
</View>
</View>
</View>
    {/*---------------------- counter --------------------------*/}
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

      {/*------------------------------------- filter All , pending , completed ---------------------------------------*/}
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
  {/*----------------------------------------------- sort by section -------------------------------------*/}
  <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingHorizontal: 20,
    paddingBottom: 120,
  }}
>
 {taskSections.map((sectionTitle) => {
  const sectionTasks = groupedTasks[sectionTitle] || [];

  if (sectionTasks.length === 0) {
    return null;
  }

  return (
    <View
  key={sectionTitle}
  style={{
    marginBottom: 18,
    zIndex: sectionTitle === firstVisibleSection ? 1000 : 1,
  }}
>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
          zIndex: 1000,
        }}
      >
        <Text
          style={{
            color: sectionTitle === 'Overdue' ? '#EF4444' : theme.text,
            fontSize: 18,
            fontWeight: '900',
          }}
        >
          {sectionTitle}
        </Text>

        {sectionTitle === firstVisibleSection && (
  <View style={{ position: 'relative' }}>
    <TouchableOpacity
      onPress={() => setSortDropdownVisible(!sortDropdownVisible)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: theme.subText, fontSize: 12, fontWeight: '800', marginRight: 6 }}>
        Sort By
      </Text>

      <Text style={{ color: theme.text, fontSize: 13, fontWeight: '900', marginRight: 4 }}>
        {sortBy}
      </Text>

      <FontAwesome name="chevron-down" size={10} color={theme.subText} />
    </TouchableOpacity>

    {sortDropdownVisible && (
      <View
        style={{
          position: 'absolute',
          top: 28,
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
          elevation: 20,
          zIndex: 9999,
        }}
      >
        {(['Newest', 'Oldest', 'Priority', 'Due Date', 'Category'] as const).map((item) => (
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
)}
      </View>
 {/* ------------------------------------------------*/}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 18,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDarkMode ? '#263445' : '#E5E7EB',
        }}
      >
        {sectionTasks.map((task: Task) => (
          <View key={task.id}>{renderTaskItem({ item: task })}</View>
        ))}
      </View>
    </View>
  );
})}
</ScrollView>
</View>
)}

    {/*-------------------------------------NavBar ------------------*/}
     {/* Floating Add Button */}
<TouchableOpacity
  onPress={() => router.push('/addTask')}
  style={{
    position: 'absolute',
    bottom: 95,
    right: 24,

    backgroundColor: '#208AEF',

    width: 64,
    height: 64,
    borderRadius: 32,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#208AEF',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 12,
    zIndex: 999,
  }}
>
  <FontAwesome
    name="plus"
    size={28}
    color="white"
  />
</TouchableOpacity>

{/* Bottom Footer */}
<View
  style={{
    position: 'absolute',
    bottom: 18,
    left: 18,
    right: 18,
    height: 76,
    borderRadius: 28,
    backgroundColor: theme.card,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 18,
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
  <TouchableOpacity 
     style={{
      flex: 1,
      alignItems: 'center',
    }}
  >
    <FontAwesome name="home" size={25} color="#208AEF" />
    <Text style={{ color: '#208AEF', fontSize: 12, fontWeight: '800', marginTop: 4 }}>
      Home
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => router.push('/statistics')}
     style={{
    flex: 1,
    alignItems: 'center',
  }}
  >
    <FontAwesome name="bar-chart" size={24} color={theme.icon} />
    <Text style={{ color: theme.icon, fontSize: 12, fontWeight: '800', marginTop: 4 }}>
      Stats
    </Text>
  </TouchableOpacity>


  <TouchableOpacity
    onPress={() => router.push('/calendar')}
    style={{ alignItems: 'center', flex: 1 }}
  >
    <FontAwesome name="calendar" size={24} color={theme.icon} />
    <Text style={{ color: theme.icon, fontSize: 12, fontWeight: '800', marginTop: 4 }}>
      Calendar
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => router.push('/settings')}
    style={{ alignItems: 'center', flex: 1 }}
  >
    <FontAwesome name="cog" size={25} color={theme.icon} />
    <Text style={{ color: theme.icon, fontSize: 12, fontWeight: '800', marginTop: 4 }}>
      Settings
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
