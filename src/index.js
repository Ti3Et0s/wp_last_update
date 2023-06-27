import React from 'react';
import { createRoot } from 'react-dom/client';

import MyComponent from './components/MyComponent';

import './styles/MyComponent.css';

createRoot(document.getElementById('my-last-modified-plugin-react')).render(
	<MyComponent />
);
