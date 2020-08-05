import React from 'react'
import { mount } from 'enzyme'
import { rootStore } from '../src/store/model'
import MenuItem from '@material-ui/core/MenuItem'
import NavBar from '../src/components/NavBar'
import { auth } from '../src/store/firebase'
import { createStore } from '../src/store'

beforeAll(() => {
  rootStore.user.__update({ isSignedIn: true, isFirstTimeUser: false, firstName: 'testUser' })
})

// Mock Redirect to avoid router error
jest.mock('react-router-dom', () => {
  return {
    // eslint-disable-next-line react/display-name
    Redirect: () => {
      return <div></div>
    },
    // eslint-disable-next-line react/display-name
    Link: () => {
      return <div></div>
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

test('Non-admin user has 3 MenuItems', () => {
  const wrapper = mount(<NavBar store={{ data: rootStore }} />)
  expect(wrapper.find(MenuItem)).toHaveLength(3)
})

test('Admin user has 5 MenuItems', () => {
  rootStore.user.__update({ isAdmin: true })
  const wrapper = mount(<NavBar store={{ data: rootStore }} />)
  expect(wrapper.find(MenuItem)).toHaveLength(5)
})

test('When user clicks Log Out, user is logged out', () => {
  const NavBarWrapped = createStore(NavBar)
  const wrapped = mount(<NavBarWrapped />)
  wrapped.find('#logout').at(0).simulate('click')
  expect(auth.signOut).toHaveBeenCalled()
})
