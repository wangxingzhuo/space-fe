import { lazy, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Store } from '@/store';
import '@watsonserve/ui';
import Header from './components/header';

import('@/assets/style/index.styl');
const App = lazy(() => import('@/pages/app'));
const Records = lazy(() => import('@/pages/records'));
const Settings = lazy(() => import('@/pages/settings'));

function Root() {
  return (
    <StrictMode>
      <Store>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/records" element={<Records />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </Store>
    </StrictMode>
  );
}

createRoot(document.querySelector('.app')!).render(<Root />);
