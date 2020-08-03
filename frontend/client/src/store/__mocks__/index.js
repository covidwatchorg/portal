import { rootStore } from '../model'
import React from 'react'

const RootStoreContext = React.createContext()

const createStore = (WrappedComponent) => {
  rootStore.user.__update({ isSignedIn: true, isAdmin: false, isFirstTimeUser: false })
  return class extends React.Component {
    displayName = 'newStore'
    constructor(props) {
      super(props)
      this.data = rootStore
    }
    isSignInWithEmailLink = () => {}
    render() {
      return (
        <RootStoreContext.Provider value={this}>
          <WrappedComponent {...this.props} />
        </RootStoreContext.Provider>
      )
    }
  }
}

const withStore = (WrappedComponent) => {
  return class extends React.Component {
    displayName = 'storeConsumer'
    render() {
      return (
        <RootStoreContext.Consumer>
          {(store) => {
            return <WrappedComponent store={store} {...this.props} />
          }}
        </RootStoreContext.Consumer>
      )
    }
  }
}

export { createStore, withStore }
