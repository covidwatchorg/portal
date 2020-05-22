import ReactDOM from 'react-dom'
import React from 'react'
import Routes from './Routes'
import './Styles/application.scss'
import { firebase, FirebaseContext } from './src/components/Firebase'
import { DatastoreProvider } from './src/components/Datastore'

ReactDOM.render(
  <FirebaseContext.Provider value={firebase}>
    <DatastoreProvider>
      <Routes />
    </DatastoreProvider>
  </FirebaseContext.Provider>,
  document.getElementById('root')
)
