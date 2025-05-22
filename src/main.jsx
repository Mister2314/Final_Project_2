import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './language/i18n/i18n.jsx';

createRoot(document.getElementById('root')).render(
    <App />
)
