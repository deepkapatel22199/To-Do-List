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
  completedAt?: string;
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
    return new Date(task.dueDate).getTime() < new Date().getTime();
  }).length;


  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const productivityScore = completionRate;

    const calculateStreak = () => {
  const completedDates = tasks
    .filter((task) => task.completed)
    .map((task) => {
      const date = task.completedAt ? new Date(task.completedAt) : new Date(task.dueDate);

      return date.toDateString();
    });

  const uniqueDates = [...new Set(completedDates)];

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);

    if (uniqueDates.includes(checkDate.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const currentStreak = calculateStreak();
const bestStreak = currentStreak;

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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>
            Statistics
          </Text>

          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="search" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Productivity Score */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            marginBottom: 14,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: '900' }}>
            Productivity Score
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#208AEF', fontSize: 40, fontWeight: '900', marginTop: 6 }}>
                {productivityScore}%
              </Text>

              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '800' }}>
                Excellent Progress! 🎉
              </Text>
            </View>

            <View
              style={{
                width: 82,
                height: 82,
                borderRadius: 41,
                borderWidth: 12,
                borderColor: '#208AEF',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#208AEF', fontSize: 18, fontWeight: '900' }}>
                {productivityScore}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <StatBox title="Total Tasks" value={totalTasks} icon="calendar-plus-o" color="#208AEF" theme={theme} isDarkMode={isDarkMode} />
          <StatBox title="Completed" value={completedTasks} icon="check-circle" color="#22C55E" theme={theme} isDarkMode={isDarkMode} />
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          <StatBox title="Pending" value={pendingTasks} icon="clock-o" color="#F59E0B" theme={theme} isDarkMode={isDarkMode} />
          <StatBox title="Overdue" value={overdueTasks} icon="exclamation-circle" color="#EF4444" theme={theme} isDarkMode={isDarkMode} />
        </View>

        {/* Completion Rate */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '900' }}>
              Completion Rate
            </Text>

            <Text style={{ color: '#208AEF', fontSize: 18, fontWeight: '900' }}>
              {completionRate}%
            </Text>
          </View>

          <View
            style={{
              height: 9,
              backgroundColor: isDarkMode ? '#334155' : '#E5E7EB',
              borderRadius: 999,
              overflow: 'hidden',
              marginTop: 14,
            }}
          >
            <View
              style={{
                width: `${completionRate}%`,
                height: '100%',
                backgroundColor: '#22C55E',
                borderRadius: 999,
              }}
            />
          </View>

          <Text style={{ color: theme.subText, fontSize: 13, fontWeight: '700', marginTop: 10 }}>
            {completedTasks} of {totalTasks} tasks completed
          </Text>
        </View>

        {/* Streak Cards */}
        <View style={{ flexDirection: 'row' }}>
          <StreakBox title="Current Streak" value={`${currentStreak} Days`} icon="fire" color="#EF4444" theme={theme} isDarkMode={isDarkMode} />
          <StreakBox title="Best Streak" value={`${bestStreak} Days`} icon="trophy" color="#F59E0B" theme={theme} isDarkMode={isDarkMode} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({ title, value, icon, color, theme, isDarkMode }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 18,
        padding: 16,
        marginRight: title === 'Total Tasks' || title === 'Pending' ? 10 : 0,
        borderWidth: 1,
        borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: theme.text, fontSize: 13, fontWeight: '800' }}>
            {title}
          </Text>

          <Text style={{ color: title === 'Overdue' ? '#EF4444' : theme.text, fontSize: 28, fontWeight: '900', marginTop: 8 }}>
            {value}
          </Text>
        </View>

        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: `${color}20`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesome name={icon} size={20} color={color} />
        </View>
      </View>
    </View>
  );
}

function StreakBox({ title, value, icon, color, theme, isDarkMode }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 18,
        padding: 16,
        marginRight: title === 'Current Streak' ? 10 : 0,
        borderWidth: 1,
        borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      }}
    >
      <FontAwesome name={icon} size={24} color={color} />

      <Text style={{ color: theme.text, fontSize: 13, fontWeight: '800', marginTop: 10 }}>
        {title}
      </Text>

      <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}