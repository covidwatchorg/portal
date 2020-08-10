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

describe('Routes', () => {
  beforeAll(() => {
    // Mock BrowserRouter as it overrides MemoryRouter used in it
    // Comment below suppreses eslint error that prevents us from commiting
    // eslint-disable-next-line react/display-name
    reactRouter.BrowserRouter = ({ children }) => <div> {children} </div>
  })

  it('redirects to 404 for invalid link', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/random']}>
        <App />
      </MemoryRouter>
    )
    expect(wrapper.find(NotFound)).toHaveLength(1)
  })

  it('shows Login if user not signed in', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(wrapper.find(Login)).toHaveLength(1)
  })

  it('shows CodeValidations if non-admin user goes to admin-only route', () => {
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

  it('shows ChangePasswordModal on first login', () => {
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
})
