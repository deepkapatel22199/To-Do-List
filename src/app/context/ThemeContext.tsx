import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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