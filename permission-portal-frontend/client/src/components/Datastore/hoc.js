import React, { Component } from 'react'
import DatastoreContext from './context'

const withDatastore = (WrappedComponent) => {
  return class WithDatastore extends Component {
    render() {
      return (
        <DatastoreContext.Consumer>
          {({ firestore, data, query }) => {
            firestore.data = data
            firestore.query = query
            return <WrappedComponent firestore={firestore} {...this.props} />
          }}
        </DatastoreContext.Consumer>
      )
    }
  }
}

const setTitle = (title) => (WrappedComponent) => {
  return class extends React.Component {
    componentDidMount() {
      document.title = title
    }
    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

export { withDatastore, setTitle }
