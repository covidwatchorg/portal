class StateManager {
  constructor() {
    // Hack pattern to make state a private variable in ES6 because Javascript is an abomination
    // see: https://stackoverflow.com/a/28165599
    var _state = {
      user: {
        email: '',
        isAdmin: false,
        isSuperAdmin: false,
        disabled: true,
        prefix: '',
        firstName: '',
        lastName: '',
        organizationID: '',
      },
    }

    this.get = () => _state
  }
}

export default new StateManager()
