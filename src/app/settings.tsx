import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import BottomNav from './bottomNav';
import SearchModal from './searchModel';
import { useState } from 'react';

export default function Settings() {
    const { theme, isDarkMode, setIsDarkMode } = useTheme();
    const [searchVisible, setSearchVisible] = useState(false);

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
            Settings
        </Text>
        <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <FontAwesome name="search" size={22} color="white" />
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={{ color: theme.subText, fontSize: 14, fontWeight: '800', marginBottom: 8 }}>
          Preferences
        </Text>

        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            overflow: 'hidden',
            marginBottom: 22,
          }}
        >
          <SettingRow icon="moon-o" title="Dark Mode" color="#64748B" theme={theme}>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </SettingRow>

        </View>
      </ScrollView>
      <BottomNav active="Settings" />
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
    />
    </View>
  );
}

function SettingRow({ icon, title, value, color, theme, children, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={children ? 1 : 0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}
    >
      <FontAwesome name={icon} size={18} color={color} />

      <Text
        style={{
          flex: 1,
          color: theme.text,
          fontSize: 15,
          fontWeight: '800',
          marginLeft: 14,
        }}
      >
        {title}
      </Text>

      {children ? (
        children
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {value && (
            <Text
              style={{
                color: theme.subText,
                fontSize: 13,
                fontWeight: '800',
                marginRight: 8,
              }}
            >
              {value}
            </Text>
          )}

          <FontAwesome name="chevron-right" size={13} color={theme.subText} />
        </View>
      )}
    </TouchableOpacity>
    
  );
}