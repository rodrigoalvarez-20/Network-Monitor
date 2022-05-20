import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GlobalStateProvider } from './utils/globalContext';
import axios from 'axios';

axios.defaults.baseURL = "http://20.225.148.220"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GlobalStateProvider>
    <CookiesProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CookiesProvider>
  </GlobalStateProvider>

);

