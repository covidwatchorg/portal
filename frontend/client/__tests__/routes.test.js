import React from 'react'
import { mount } from 'enzyme'
import App from '../App'
import { MemoryRouter } from 'react-router'
import NotFound from '../src/screens/404'
import CodeValidations from '../src/screens/CodeValidations'
import reactRouter from 'react-router-dom'

// Uses mock at client/src/store/__mocks__/index.js
jest.mock('../src/store')

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

test('non-auth routes', () => {
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
