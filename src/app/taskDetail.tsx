import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

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
  category?: string;
  dueDate: string;
  completed: boolean;
  subTasks?: SubTask[];
};

export default function TaskDetail() {
  const { id } = useLocalSearchParams();
  const { theme, isDarkMode } = useTheme();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = async () => {
    const savedTasks = await AsyncStorage.getItem('tasks');
    const tasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];

    const selectedTask = tasks.find((item) => item.id === id);
    setTask(selectedTask || null);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);

    if (isNaN(d.getTime())) return 'No date';

    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);

    if (isNaN(d.getTime())) return 'No time';

    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = () => {
  if (!task?.dueDate || task.completed) return false;

  const due = new Date(task.dueDate);

  if (isNaN(due.getTime())) return false;

  const now = new Date();

  return due.getTime() < now.getTime();
};

  const toggleComplete = async () => {
    const savedTasks = await AsyncStorage.getItem('tasks');
    const tasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];

    const updatedTasks = tasks.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));

    const updatedTask = updatedTasks.find((item) => item.id === id);
    setTask(updatedTask || null);
  };

  const deleteTask = async () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const savedTasks = await AsyncStorage.getItem('tasks');
          const tasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];

          const updatedTasks = tasks.filter((item) => item.id !== id);

          await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
          router.back();
        },
      },
    ]);
  };

  const duplicateTask = async () => {
    if (!task) return;

    const savedTasks = await AsyncStorage.getItem('tasks');
    const tasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];

    const duplicatedTask: Task = {
      ...task,
      id: Date.now().toString(),
      title: `${task.title} Copy`,
      completed: false,
    };

    const updatedTasks = [duplicatedTask, ...tasks];

    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    router.back();
  };

  if (!task) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>
          Task not found
        </Text>
      </View>
    );
  }

  const priorityColor =
    task.priority === 'High'
      ? '#EF4444'
      : task.priority === 'Medium'
      ? '#F59E0B'
      : '#22C55E';

  const priorityBg =
    task.priority === 'High'
      ? '#FEE2E2'
      : task.priority === 'Medium'
      ? '#FEF3C7'
      : '#DCFCE7';

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#0F6BFF',
          paddingTop: 58,
          paddingBottom: 22,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={22} color="white" />
          </TouchableOpacity>

          <Text style={{ color: 'white', marginHorizontal: 10 , fontSize: 20, fontWeight: '900' }}>
            Task Detail
          </Text>

        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        {/* Main Task Card */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            marginBottom: 16,
          }}
        >
          {/* Title + Priority */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 12,
            }}
          >
            <FontAwesome
              name={task.completed ? 'check-circle' : 'circle-o'}
              size={24}
              color={task.completed ? '#22C55E' : '#CBD5E1'}
              style={{ marginTop: 2 }}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: '900',
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </Text>

              {task.description ? (
                <Text
                  style={{
                    color: theme.subText,
                    fontSize: 15,
                    lineHeight: 22,
                    marginTop: 8,
                  }}
                >
                  {task.description}
                </Text>
              ) : null}
            </View>

            <View
              style={{
                backgroundColor: priorityBg,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 14,
                marginLeft: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <FontAwesome name="flag" size={12} color={priorityColor} />

              <Text
                style={{
                  color: priorityColor,
                  fontSize: 12,
                  fontWeight: '900',
                  marginLeft: 6,
                }}
              >
                {task.priority}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            style={{
              backgroundColor: task.completed ? '#DCFCE7' : '#FEF3C7',
              paddingVertical: 7,
              paddingHorizontal: 12,
              borderRadius: 14,
              alignSelf: 'flex-start',
              marginTop: 6,
            }}
          >
            <Text
              style={{
                color: task.completed ? '#166534' : '#92400E',
                fontSize: 12,
                fontWeight: '900',
              }}
            >
              {task.completed ? 'Completed' : 'Pending'}
            </Text>
          </View>

          {/* Overdue Warning */}
          {isOverdue() && (
            <View
              style={{
                backgroundColor: '#FEE2E2',
                padding: 13,
                borderRadius: 16,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <FontAwesome name="exclamation-circle" size={18} color="#EF4444" />

              <Text
                style={{
                  color: '#B91C1C',
                  fontWeight: '900',
                  marginLeft: 10,
                  fontSize: 14,
                }}
              >
                This task is overdue
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            marginBottom: 16,
          }}
        >
          <DetailRow icon="calendar" label="Due Date" text={formatDate(task.dueDate)} color="#208AEF" theme={theme} />
          <DetailRow icon="clock-o" label="Time" text={formatTime(task.dueDate)} color="#F59E0B" theme={theme} />
          <DetailRow icon="tag" label="Category" text={task.category || 'Other'} color="#6D5DF6" theme={theme} />
        </View>

        {/* Checklist */}
        {task.subTasks && task.subTasks.length > 0 && (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 18,
              borderWidth: 1,
              borderColor: isDarkMode ? '#334155' : '#E5E7EB',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontWeight: '900',
                marginBottom: 14,
              }}
            >
              Checklist
            </Text>

            {task.subTasks.map((sub) => (
              <View
                key={sub.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <FontAwesome
                  name={sub.completed ? 'check-circle' : 'circle-o'}
                  size={18}
                  color={sub.completed ? '#22C55E' : theme.subText}
                />

                <Text
                  style={{
                    color: sub.completed ? theme.subText : theme.text,
                    marginLeft: 10,
                    fontSize: 15,
                    fontWeight: '700',
                    textDecorationLine: sub.completed ? 'line-through' : 'none',
                  }}
                >
                  {sub.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        <ActionButton
          icon="pencil"
          text="Edit Task"
          color="#208AEF"
          onPress={() => router.push(`/addTask?id=${task.id}`)}
          theme={theme}
          isDarkMode={isDarkMode}
        />

        <ActionButton
          icon={task.completed ? 'undo' : 'check-circle'}
          text={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
          color="#22C55E"
          onPress={toggleComplete}
          theme={theme}
          isDarkMode={isDarkMode}
        />

        <ActionButton
          icon="copy"
          text="Duplicate Task"
          color="#2563EB"
          onPress={duplicateTask}
          theme={theme}
          isDarkMode={isDarkMode}
        />

        <ActionButton
          icon="trash"
          text="Delete Task"
          color="#EF4444"
          onPress={deleteTask}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, text, color, theme }: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
      }}
    >
      <FontAwesome name={icon} size={18} color={color} />

      <Text
        style={{
          color: theme.subText,
          fontSize: 15,
          fontWeight: '700',
          marginLeft: 14,
          flex: 1,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.text,
          fontSize: 15,
          fontWeight: '900',
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function ActionButton({ icon, text, color, onPress, theme, isDarkMode }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.card,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? '#334155' : '#E5E7EB',
      }}
    >
      <FontAwesome name={icon} size={18} color={color} />

      <Text
        style={{
          color,
          fontSize: 15,
          fontWeight: '900',
          marginLeft: 12,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}