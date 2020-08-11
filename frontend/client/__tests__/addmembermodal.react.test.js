import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>')
global.window = dom
global.document = dom.document

import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { configure, shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'
import { rootStore } from '../src/store/model'
import AddMemberModal from '../src/components/AddMemberModal'

configure({ adapter: new Adapter() })

jest.mock('../src/store')

test('renders correctly', () => {
  var showAddMemberModal = true
  const onAddMemberCancel = jest.fn()
  const onAddMemberSuccess = jest.fn()
  const onAddMemberFailure = jest.fn()

  const wrapper = shallow(
    <AddMemberModal
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
      store={rootStore}
    />
  )

  expect(toJson(wrapper)).toMatchSnapshot()
})

test('clicking close button hides modal', () => {
  var showAddMemberModal = true
  const onAddMemberCancel = jest.fn()
  const onAddMemberSuccess = jest.fn()
  const onAddMemberFailure = jest.fn()

  const wrapper = mount(
    <AddMemberModal
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
      store={rootStore}
    />
  )

  wrapper.find('.close-btn').at(0).simulate('click')

  expect(onAddMemberCancel.mock.calls.length).toBe(1)

  wrapper.unmount()
})

test('clicking modal background hides modal', () => {
  var showAddMemberModal = true
  const onAddMemberCancel = jest.fn()
  const onAddMemberSuccess = jest.fn()
  const onAddMemberFailure = jest.fn()

  const wrapper = mount(
    <AddMemberModal
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
      store={rootStore}
    />
  )

  wrapper.find('.modal-background').at(0).simulate('click')

  expect(onAddMemberCancel.mock.calls.length).toBe(1)

  wrapper.unmount()
})

test('successfully create new user', () => {
  var showAddMemberModal = true
  const onAddMemberCancel = jest.fn()
  const onAddMemberSuccess = jest.fn()
  const onAddMemberFailure = jest.fn()

  const wrapper = mount(
    <AddMemberModal
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
      store={rootStore}
    />
  )

  wrapper.instance().createUser = jest.fn(() => Promise.resolve())

  const firstName = 'Test'
  const lastName = 'Test'
  const email = 'testuser@soylentgreen.com'
  const role = 'Test Validator'

  wrapper
    .find('#firstName')
    .at(0)
    .simulate('change', {
      target: {
        name: 'firstName',
        value: firstName,
      },
    })
  wrapper
    .find('#lastName')
    .at(0)
    .simulate('change', {
      target: {
        name: 'lastName',
        value: lastName,
      },
    })
  wrapper
    .find('#email')
    .at(0)
    .simulate('change', {
      target: {
        name: 'email',
        value: email,
      },
    })
  wrapper
    .find('#role')
    .at(0)
    .simulate('change', {
      target: {
        name: 'role',
        value: role,
      },
    })
  wrapper.find('.save-button').at(0).simulate('click')

  expect(wrapper.instance().createUser).toBeCalledWith({
    email: email,
    firstName: firstName,
    lastName: lastName,
    isAdmin: false,
  })

  // expect(onAddMemberSuccess).toBeCalled()
  wrapper.unmount()
})
