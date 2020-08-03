import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>')
global.window = dom
global.document = dom.document

import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { configure, shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'
import { createStore } from '../src/store'
import AddMemberModal from '../src/components/AddMemberModal'

configure({ adapter: new Adapter() })

jest.mock('../src/store')
const AddMemberModalWrapper = createStore(AddMemberModal)

test('renders correctly', () => {
  var showAddMemberModal = true
  const onAddMemberCancel = jest.fn()
  const onAddMemberSuccess = jest.fn()
  const onAddMemberFailure = jest.fn()

  const wrapper = shallow(
    <AddMemberModalWrapper
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
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
    <AddMemberModalWrapper
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
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
    <AddMemberModalWrapper
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
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
    <AddMemberModalWrapper
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
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
