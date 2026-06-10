import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image , TouchableOpacity} from 'react-native';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

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