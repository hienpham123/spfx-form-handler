import React from 'react';
import ReactDOM from 'react-dom/client';
import RealWorldExample from './RealWorldExample';
import { initializeIcons } from '@fluentui/react';
import '@fluentui/react/dist/css/fabric.min.css';

// Initialize Fluent UI icons
initializeIcons();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <RealWorldExample />
  </React.StrictMode>
);

