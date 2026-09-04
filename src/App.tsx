import React, { useEffect } from 'react';
import { AppRouter } from './routes';
import { useUIStore } from './store';

const App: React.FC = () => {
  const { theme } = useUIStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <AppRouter />;
};

export default App;
