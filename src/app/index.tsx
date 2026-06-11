import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, Image , TouchableOpacity} from 'react-native';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 2000);
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
          onPress={() => setShowOnboarding(false)}
          style={{ backgroundColor: '#208AEF', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12 }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: '#F7F9FC',
      }}
    >
      <View
        style={{
          backgroundColor: '#208AEF',
          paddingTop: 70,
          paddingBottom: 5,
          paddingHorizontal: 10,
        }}
      >
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
      <View
        style={{
          flexDirection:'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
          }}
        >
          Welcome 
        </Text>
        <Text
          style={{
            fontSize: 24,
          }}
        >
          You don't have any tasks
        </Text>
      </View> 

     <View
        style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 25,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >

        <FontAwesome name="home" size={24} color="#2F73F6" />
        
        <TouchableOpacity
          onPress={() => router.push('/addTask')}
          style={{
            backgroundColor: '#2F73F6',
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
            <FontAwesome name="plus" size={24} color="white" />
        </TouchableOpacity>

        <FontAwesome name="search" size={24} color="#2F73F6" />
      </View>
    </View>
  );
}