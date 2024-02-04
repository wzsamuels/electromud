import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ipcManager } from './ipcManager';

interface IpcContextType {
  data: string; // Adjust the type based on the actual data structure
}

const IpcContext = createContext<IpcContextType | undefined>(undefined);

interface IpcProviderProps {
  children: ReactNode;
}

export const IpcProvider: React.FC<IpcProviderProps> = ({ children }) => {
  const [data, setData] = useState<string>(""); // Adjust the type as necessary

  useEffect(() => {
    const listener = (newData: string) => { // Adjust the type based on your data
      setData(newData);
    };

    ipcManager.subscribe(listener);
    return () => {
      ipcManager.unsubscribe(listener);
    };
  }, []);

  return <IpcContext.Provider value={{ data }}>{children}</IpcContext.Provider>;
};

export const useIpcData = (): IpcContextType => {
  const context = useContext(IpcContext);
  if (!context) {
    throw new Error('useIpcData must be used within an IpcProvider');
  }
  return context;
};
