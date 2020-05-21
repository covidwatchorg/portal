import ReactDOM from 'react-dom'
import React from 'react'
import Routes from './Routes'
import './Styles/application.scss'
import { firebase, FirebaseContext } from './src/components/Firebase'
import { createStore } from './src/state'

ReactDOM.render(
  <FirebaseContext.Provider value={firebase}>
    <Routes />
  </FirebaseContext.Provider>,
  document.getElementById('root')
)
