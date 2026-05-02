import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProviderCustom = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      background: isDarkMode ? "#0f172a" : "#f8fafc",
      gradient: isDarkMode ? ["#0f172a", "#1e293b"] : ["#f0fdf4", "#ffffff"],
      text: isDarkMode ? "#ffffff" : "#0f172a",
      subText: isDarkMode ? "#94a3b8" : "#475569",
      emerald: "#10b981",
      border: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.2)",
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);