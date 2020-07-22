import React from 'react'
import PageTitle from '../components/PageTitle'

const NotFound = () => {
  return (
    <div className="module-container module-container-not-login">
      <PageTitle title="404 Not Found" />
      <div id="not-found">
        <h1>404</h1>
        <h2>This page does not exist.</h2>
      </div>
    </div>
  )
}

export default NotFound
