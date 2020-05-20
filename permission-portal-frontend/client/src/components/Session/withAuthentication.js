import React from 'react'

import AuthUserContext from './context'
import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'

const withAuthentication = (Component) => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        authUser: JSON.parse(localStorage.getItem('authUser')),
      }
    }

    componentDidMount() {
      this.listener = this.props.firebase.onAuthUserListener(
        (authUser) => {
          localStorage.setItem('authUser', JSON.stringify(authUser))
          this.setState({ authUser })
        },
        () => {
          localStorage.removeItem('authUser')
          this.setState({ authUser: null })
          if (this.props.history) {
            this.props.history.push(ROUTES.LANDING)
          }
        }
      )
    }

    componentWillUnmount() {
      this.listener()
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      )
    }
  }

  return withFirebase(WithAuthentication)
}

export default withAuthentication
