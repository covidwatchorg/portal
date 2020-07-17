import React from 'react'
import '../../Styles/screens/404.scss'
import PageTitle from '../components/PageTitle'

const NotFound = () => {
  return (
    <div className="module-container">
      <PageTitle title="404 Not Found" />
      <div id="not-found">
        <h1>404</h1>
        <h2>This page does not exist.</h2>
      </div>
    </div>
  )
}

export default NotFound
