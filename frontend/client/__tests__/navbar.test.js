import React from 'react'
import { mount } from 'enzyme'
import { rootStore } from '../src/store/model'
import MenuItem from '@material-ui/core/MenuItem'
import NavBar from '../src/components/NavBar'
import { auth } from '../src/store/firebase'
import { createStore } from '../src/store'
import toJson from 'enzyme-to-json'

// Mock Redirect to avoid router error
jest.mock('react-router-dom', () => {
  return {
    // eslint-disable-next-line react/display-name
    Link: () => {
      return <div></div>
    },
    useHistory: () => {
      return Object()
    },
  }
})

// Mock auth.signOut()
// note: setPersistence and onAuthStateChanged are set to empty functions in this mock bc otherwise they will be undefined in this mock store
jest.mock('../src/store/firebase', () => {
  return {
    ...jest.requireActual('../src/store/firebase'),
    auth: {
      signOut: jest.fn(),
      setPersistence: () => {},
      onAuthStateChanged: () => {},
    },
  }
})

describe('NavBar', () => {
  let wrapper

  beforeEach(() => {
    rootStore.user.__update({ isSignedIn: true, isFirstTimeUser: false, firstName: 'itUser' })
    wrapper = mount(<NavBar store={{ data: rootStore }} />)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly', () => {
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('has 3 MenuItems for a non-admin', () => {
    expect(wrapper.find(MenuItem)).toHaveLength(3)
  })

  it('has 5 MenuItems for an admin', () => {
    rootStore.user.__update({ isAdmin: true })
    wrapper = mount(<NavBar store={{ data: rootStore }} />)
    expect(wrapper.find(MenuItem)).toHaveLength(5)
  })

  it('logs out a user when they click Log Out', () => {
    const NavBarWrapped = createStore(NavBar)
    wrapper = mount(<NavBarWrapped />)
    wrapper.find('#logout').at(0).simulate('click')
    expect(auth.signOut).toHaveBeenCalled()
  })
})
