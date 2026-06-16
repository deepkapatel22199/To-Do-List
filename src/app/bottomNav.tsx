import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type BottomNavProps = {
  active: 'Home' | 'Stats' | 'Calendar' | 'Settings';
};

export default function BottomNav({ active }: BottomNavProps) {
  const { theme } = useTheme();

  const navItems = [
    { name: 'Home', icon: 'home', route: '/' },
    { name: 'Stats', icon: 'bar-chart', route: '/statistics' },
    { name: 'Calendar', icon: 'calendar', route: '/calendar' },
    { name: 'Settings', icon: 'cog', route: '/settings' },
  ] as const;

  return (
    <>
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
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
          zIndex: 999,
        }}
      >
        <FontAwesome name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Navbar */}
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
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
          elevation: 8,
        }}
      >
        {navItems.map((item) => {
          const isActive = active === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push(item.route)}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <FontAwesome
                name={item.icon}
                size={item.name === 'Settings' ? 25 : 24}
                color={isActive ? '#208AEF' : theme.icon}
              />

              <Text
                style={{
                  color: isActive ? '#208AEF' : theme.icon,
                  fontSize: 12,
                  fontWeight: '800',
                  marginTop: 4,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}