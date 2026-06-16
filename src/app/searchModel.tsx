import { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
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

type SearchModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SearchModal({ visible, onClose }: SearchModalProps) {
  const { theme, isDarkMode } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      loadTasks();
    }
  }, [visible]);

  const loadTasks = async () => {
    const savedTasks = await AsyncStorage.getItem('tasks');
    setTasks(savedTasks ? JSON.parse(savedTasks) : []);
  };

  const filteredTasks = tasks.filter((task) => {
    const text = searchText.toLowerCase();

    return (
      task.title.toLowerCase().includes(text) ||
      task.description.toLowerCase().includes(text) ||
      task.priority.toLowerCase().includes(text) ||
      (task.category || '').toLowerCase().includes(text)
    );
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'No date';

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Header */}
        <View
          style={{
            paddingTop: 58,
            paddingHorizontal: 16,
            paddingBottom: 14,
            backgroundColor: theme.background,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
              placeholder="Search tasks..."
              placeholderTextColor={theme.subText}
              style={{
                flex: 1,
                backgroundColor: theme.card,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: theme.text,
                fontSize: 15,
                fontWeight: '700',
                borderWidth: 1,
                borderColor: isDarkMode ? '#334155' : '#E5E7EB',
              }}
            />

            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                onClose();
              }}
              style={{ marginLeft: 14 }}
            >
              <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {searchText.trim() === '' ? (
            <View style={{ marginTop: 20 }}>
              <Text style={{ color: theme.subText, fontSize: 14, fontWeight: '900', marginBottom: 12 }}>
                Suggestions
              </Text>

              <Suggestion icon="flag" text="High Priority Tasks" color="#EF4444" />
              <Suggestion icon="calendar" text="Today's Tasks" color="#208AEF" />
              <Suggestion icon="exclamation-circle" text="Overdue Tasks" color="#F59E0B" />
              <Suggestion icon="check-circle" text="Completed Tasks" color="#22C55E" />
            </View>
          ) : filteredTasks.length > 0 ? (
            <>
              <Text style={{ color: theme.subText, fontSize: 14, fontWeight: '900', marginVertical: 12 }}>
                Tasks ({filteredTasks.length})
              </Text>

              <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchText('');
                      onClose();
                      router.push(`/taskDetail?id=${item.id}`);
                    }}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#334155' : '#E5E7EB',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: theme.text, fontSize: 15, fontWeight: '900', flex: 1 }}>
                        {item.title}
                      </Text>

                      <Text
                        style={{
                          color:
                            item.priority === 'High'
                              ? '#EF4444'
                              : item.priority === 'Medium'
                              ? '#F59E0B'
                              : '#22C55E',
                          fontSize: 12,
                          fontWeight: '900',
                        }}
                      >
                        {item.priority}
                      </Text>
                    </View>

                    <Text style={{ color: theme.subText, fontSize: 12, fontWeight: '700', marginTop: 6 }}>
                      {formatDate(item.dueDate)} • {item.category || 'Other'}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 70 }}>
              <FontAwesome name="search" size={40} color={theme.subText} />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900', marginTop: 14 }}>
                No tasks found
              </Text>
              <Text style={{ color: theme.subText, fontSize: 14, fontWeight: '700', marginTop: 6 }}>
                Try another keyword.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Suggestion({ icon, text, color }: any) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <FontAwesome name={icon} size={18} color={color} />

      <Text style={{ fontSize: 15, fontWeight: '800', marginLeft: 14, flex: 1 }}>
        {text}
      </Text>

      <FontAwesome name="chevron-right" size={13} color="#94A3B8" />
    </View>
  );
}