import ReactDOM from 'react-dom'
import React from 'react'
import App from './App'
import * as Sentry from '@sentry/react'
import './styles/application.scss'

Sentry.init({ dsn: 'https://13821d959c3a4f10944bb8ef579d034d@o410040.ingest.sentry.io/5283616' })

ReactDOM.render(<App />, document.getElementById('root'))
