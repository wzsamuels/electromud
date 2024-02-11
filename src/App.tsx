// App.tsx
import React from 'react';
import {Route, HashRouter, Routes } from 'react-router-dom';
import MainWindow from './components/MainWindow';
import NewWorldWindow from './components/NewWorldWindow';
import SettingsWindow from './components/SettingsWindow';

const App = () => (
  <div className='bg-background dark:bg-darkBackground'>
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainWindow/>} />
        <Route path="/new-world" element={<NewWorldWindow />} />
        <Route path="/settings" element={<SettingsWindow/>}/>
      </Routes>
    </HashRouter>
  </div>
);

export default App;