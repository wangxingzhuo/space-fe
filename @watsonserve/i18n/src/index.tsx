import { createRoot } from 'react-dom/client';
import './index.css';
import '@arco-design/web-react/dist/css/arco.css';
import App from './App';
import { i18n } from './api';

document.body.setAttribute('arco-theme', 'dark');

// i18n().then(t => {
//   (window as any).t = t;
//   console.log(t('open'));
// }).catch(() => undefined);

createRoot(document.getElementById('root')!).render(<App />);
