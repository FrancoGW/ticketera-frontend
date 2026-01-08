import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import 'react-calendar/dist/Calendar.css';
import { createStandaloneToast, Flex, Image, Heading } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import store from './redux/stores/store';
import imgRandom from "/assets/img/logo.png"



const { ToastContainer } = createStandaloneToast()

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
