import 'core-js/stable'
import 'regenerator-runtime/runtime.js'
import 'cross-fetch/polyfill'
import ReactDOM from 'react-dom'
import React from 'react'
import App from './App'
import * as Sentry from '@sentry/react'
import './styles/index.scss'
import { disableReactDevTools } from '@fvilers/disable-react-devtools'

Sentry.init({
  dsn: 'https://13821d959c3a4f10944bb8ef579d034d@o410040.ingest.sentry.io/5283616',
  environment: process.env.NODE_ENV,
})

// Disable react dev tools to make it difficult for hackers to access the store and explore protected routes
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  disableReactDevTools()
}

ReactDOM.render(<App />, document.getElementById('root'))
