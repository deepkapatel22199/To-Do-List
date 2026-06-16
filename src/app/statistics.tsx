import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export default function Statistics() {
  const { theme, isDarkMode } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    const savedTasks = await AsyncStorage.getItem('tasks');
    setTasks(savedTasks ? JSON.parse(savedTasks) : []);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false;

    const due = new Date(task.dueDate);
    const now = new Date();

    return due.getTime() < now.getTime();
  }).length;

  const highPriority = tasks.filter((task) => task.priority === 'High').length;
  const mediumPriority = tasks.filter((task) => task.priority === 'Medium').length;
  const lowPriority = tasks.filter((task) => task.priority === 'Low').length;

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          backgroundColor: theme.header,
          paddingTop: 60,
          paddingBottom: 24,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
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
              marginLeft: 18,
            }}
          >
            Statistics
          </Text>
        </View>

        <Text
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 15,
            marginTop: 8,
            marginLeft: 40,
          }}
        >
          Track your productivity and task progress
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 20,
            marginBottom: 18,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#E5E7EB',
          }}
        >
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900' }}>
            Completion Rate
          </Text>

          <Text
            style={{
              color: '#208AEF',
              fontSize: 46,
              fontWeight: '900',
              marginTop: 10,
            }}
          >
            {completionRate}%
          </Text>

          <Text style={{ color: theme.subText, fontSize: 14, fontWeight: '700' }}>
            {completedTasks} of {totalTasks} tasks completed
          </Text>

          <View
            style={{
              height: 12,
              backgroundColor: isDarkMode ? '#334155' : '#E5E7EB',
              borderRadius: 999,
              overflow: 'hidden',
              marginTop: 18,
            }}
          >
            <View
              style={{
                width: `${completionRate}%`,
                height: '100%',
                backgroundColor: '#208AEF',
                borderRadius: 999,
              }}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          <StatCard title="Total" value={totalTasks} icon="tasks" color="#208AEF" theme={theme} isDarkMode={isDarkMode} />
          <StatCard title="Done" value={completedTasks} icon="check-circle" color="#22C55E" theme={theme} isDarkMode={isDarkMode} />
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          <StatCard title="Pending" value={pendingTasks} icon="hourglass-half" color="#F59E0B" theme={theme} isDarkMode={isDarkMode} />
          <StatCard title="Overdue" value={overdueTasks} icon="exclamation-circle" color="#EF4444" theme={theme} isDarkMode={isDarkMode} />
        </View>

        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#E5E7EB',
          }}
        >
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900', marginBottom: 16 }}>
            Priority Breakdown
          </Text>

          <PriorityRow label="High Priority" value={highPriority} color="#EF4444" theme={theme} />
          <PriorityRow label="Medium Priority" value={mediumPriority} color="#F59E0B" theme={theme} />
          <PriorityRow label="Low Priority" value={lowPriority} color="#22C55E" theme={theme} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ title, value, icon, color, theme, isDarkMode }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 22,
        padding: 18,
        marginRight: title === 'Total' || title === 'Pending' ? 10 : 0,
        borderWidth: 1,
        borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      }}
    >
      <FontAwesome name={icon} size={22} color={color} />

      <Text style={{ color, fontSize: 28, fontWeight: '900', marginTop: 12 }}>
        {value}
      </Text>

      <Text style={{ color: theme.subText, fontSize: 14, fontWeight: '800' }}>
        {title}
      </Text>
    </View>
  );
}

function PriorityRow({ label, value, color, theme }: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 11,
            height: 11,
            borderRadius: 6,
            backgroundColor: color,
            marginRight: 10,
          }}
        />

        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>
          {label}
        </Text>
      </View>

      <Text style={{ color, fontSize: 16, fontWeight: '900' }}>
        {value}
      </Text>
    </View>
  );
}