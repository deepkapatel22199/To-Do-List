import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Image } from 'react-native';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 3000);
  }, []);

  if (showSplash) {
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
          To Do List 
        </Text>
        <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>
          Make your daily tasks easier
        </Text>
        <ActivityIndicator color="white" style={{ marginTop: 25 }} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>
        My To-Do App
      </Text>
    </View>
  );
}