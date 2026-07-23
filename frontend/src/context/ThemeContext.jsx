import { createContext, useEffect } from 'react';

// Dark-only. Light mode was removed; the context stays so existing consumers
// keep working, but theme is fixed to dark and toggling is a no-op.
export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};
