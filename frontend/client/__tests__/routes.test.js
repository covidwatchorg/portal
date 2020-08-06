import React from 'react'
import { mount } from 'enzyme'
import App from '../App'
import { MemoryRouter } from 'react-router'
import { rootStore } from '../src/store/model'
import NotFound from '../src/screens/404'
import CodeValidations from '../src/screens/CodeValidations'
import Login from '../src/screens/Login'
import reactRouter from 'react-router-dom'
import ChangePasswordModal from '../src/components/ChangePasswordModal'

// Make sure we don't call any Firebase functions
jest.mock('../src/store/firebase')

beforeAll(() => {
  // Mock BrowserRouter as it overrides MemoryRouter used in test
  // Comment below suppreses eslint error that prevents us from commiting
  // eslint-disable-next-line react/display-name
  reactRouter.BrowserRouter = ({ children }) => <div> {children} </div>
})

test('404 for invalid link', () => {
  const wrapper = mount(
    <MemoryRouter initialEntries={['/random']}>
      <App />
    </MemoryRouter>
  )
  expect(wrapper.find(NotFound)).toHaveLength(1)
})

test('/ leads to /code_validations', () => {
  const wrapper = mount(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  )

  expect(wrapper.find(Login)).toHaveLength(1)
})

test('non-auth routes', () => {
  rootStore.user.__update({ isSignedIn: true, isAdmin: false, isFirstTimeUser: false })

  let wrapper = mount(
    <MemoryRouter initialEntries={['/branding']}>
      <App />
    </MemoryRouter>
  )
  expect(wrapper.find(CodeValidations)).toHaveLength(1)

  wrapper = mount(
    <MemoryRouter initialEntries={['/manage_members']}>
      <App />
    </MemoryRouter>
  )
  expect(wrapper.find(CodeValidations)).toHaveLength(1)
})

test('first time user', () => {
  rootStore.user.__update({ isSignedIn: true, isAdmin: false, isFirstTimeUser: true })

  const wrapper = mount(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  )
  expect(wrapper.find(ChangePasswordModal)).toHaveLength(1)

  // Ensure we can't dismiss the change password modal
  wrapper.find('.modal-background').at(0).simulate('click')
  expect(wrapper.find(ChangePasswordModal)).toHaveLength(1)
})
