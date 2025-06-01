import React from 'react'; // Added for React.Suspense and React.StrictMode
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/i18n'; // Import the i18n configuration

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback="Loading..."> {/* Add Suspense for async translation loading */}
      <App />
    </React.Suspense>
  </React.StrictMode>
);
