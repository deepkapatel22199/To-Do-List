import React, { createContext,  useEffect, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDarkMode, setIsDarkModeState] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);


  useEffect(() => {
  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');

      if (savedTheme !== null) {
        setIsDarkModeState(savedTheme === 'true');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setThemeLoaded(true);
    }
  };

  loadTheme();
}, []);

const setIsDarkMode = async (value: boolean) => {
  try {
    setIsDarkModeState(value);
    await AsyncStorage.setItem('isDarkMode', value.toString());
  } catch (error) {
    console.log('Error saving theme:', error);
  }
};

  const theme = {
    background: isDarkMode ? '#121212' : '#F7F9FC',
    header: isDarkMode ? '#1E1E1E' : '#208AEF',
    card: isDarkMode ? '#1E1E1E' : 'white',
    icon: isDarkMode ? 'white' : '#208AEF',
    text: isDarkMode ? 'white' : 'black',
    plus: isDarkMode ? '#121212' : '#208AEF',
    subText: isDarkMode ? '#B0B0B0' : '#666',
    inputBackground: isDarkMode ? '#1E1E1E' : 'white',
};

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);