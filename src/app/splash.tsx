import { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const onboardingSeen = await AsyncStorage.getItem('onboardingSeen');

      if (onboardingSeen === 'true') {
        router.replace('/');
      } else {
        router.replace('/onBoarding');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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