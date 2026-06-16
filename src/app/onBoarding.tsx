import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Onboarding() {
  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    router.replace('/');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Image
        source={require('../../assets/images/splash-icon.png')}
        style={{ width: 160, height: 160, marginBottom: 30 }}
      />

      <Text
        style={{
          fontSize: 30,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        Manage Your Tasks Easily
      </Text>

      <Text
        style={{
          fontSize: 16,
          textAlign: 'center',
          color: '#666',
          marginBottom: 40,
        }}
      >
        Add, edit, complete, and organize your daily tasks in one simple app.
      </Text>

      <TouchableOpacity
        onPress={finishOnboarding}
        style={{
          backgroundColor: '#208AEF',
          paddingVertical: 15,
          paddingHorizontal: 50,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
}