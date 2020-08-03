import React from 'react'
import { mount } from 'enzyme'
import { rootStore } from '../src/store/model'
import MenuItem from '@material-ui/core/MenuItem'
import NavBar from '../src/components/NavBar'
import reactRouter from 'react-router-dom'

beforeAll(() => {
  rootStore.user.__update({ isSignedIn: true, isFirstTimeUser: false, firstName: 'testUser' })

  // Mock the links in the navbar
  // eslint-disable-next-line react/display-name
  reactRouter.Link = ({ children }) => <div> {children} </div>
})

test('non-auth menu', () => {
  const wrapper = mount(<NavBar store={{ data: rootStore }} />)
  expect(wrapper.find(MenuItem)).toHaveLength(3)
})

test('auth menu', () => {
  rootStore.user.__update({ isAdmin: true })
  const wrapper = mount(<NavBar store={{ data: rootStore }} />)
  expect(wrapper.find(MenuItem)).toHaveLength(5)
})
