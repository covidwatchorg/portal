import { mount } from 'enzyme'
import React from 'react'
import { act } from 'react-dom/test-utils'
import AddMemberModal from '../src/components/AddMemberModal'
import { createStore } from '../src/store'
import { createUserCallable } from '../src/store/firebase'

jest.mock('../src/store/firebase', () => {
  return {
    ...jest.requireActual('../src/store/firebase'),
    createUserCallable: jest.fn(async (newUser) => newUser),
  }
})

const waitForComponentToPaint = async (wrapper) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    wrapper.update()
  })
}

let AddMemberModalWrapped

beforeEach(() => {
  AddMemberModalWrapped = createStore(AddMemberModal)
})

test('clicking close button hides modal', () => {
  var showAddMemberModal = true
  const onAddMemberCancel = jest.fn()
  const onAddMemberSuccess = jest.fn()
  const onAddMemberFailure = jest.fn()

  const wrapper = mount(
    <AddMemberModalWrapped
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
    <AddMemberModalWrapped
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

test.each([
  ['', 'test', '', ''],
  ['test', 'test', 'invalidemail', 'Test Validator'],
])('test invalid input', async (firstName, lastName, email, role) => {
  var showAddMemberModal = true
  const onAddMemberCancel = jest.fn()
  const onAddMemberSuccess = jest.fn()
  const onAddMemberFailure = jest.fn()

  const wrapper = mount(
    <AddMemberModalWrapped
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
    />
  )

  wrapper
    .find('#firstName')
    .at(1)
    .simulate('change', {
      target: {
        name: 'firstName',
        value: firstName,
      },
    })
  wrapper
    .find('#lastName')
    .at(1)
    .simulate('change', {
      target: {
        name: 'lastName',
        value: lastName,
      },
    })
  wrapper
    .find('#email')
    .at(1)
    .simulate('change', {
      target: {
        name: 'email',
        value: email,
      },
    })
  wrapper
    .find('#role')
    .at(1)
    .simulate('change', {
      target: {
        name: 'role',
        value: role,
      },
    })

  wrapper.find('.button').at(0).simulate('click')

  await waitForComponentToPaint(wrapper)

  expect(createUserCallable).toHaveBeenCalledTimes(0)

  wrapper.unmount()
})

test('successfully create new user', async () => {
  var showAddMemberModal = true
  const onAddMemberCancel = jest.fn()
  const onAddMemberSuccess = jest.fn()
  const onAddMemberFailure = jest.fn()

  const wrapper = mount(
    <AddMemberModalWrapped
      hidden={!showAddMemberModal}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
    />
  )

  const firstName = 'Test'
  const lastName = 'Test'
  const email = 'testuser@soylentgreen.com'
  const role = 'Test Validator'

  wrapper
    .find('#firstName')
    .at(1)
    .simulate('change', {
      target: {
        name: 'firstName',
        value: firstName,
      },
    })
  wrapper
    .find('#lastName')
    .at(1)
    .simulate('change', {
      target: {
        name: 'lastName',
        value: lastName,
      },
    })
  wrapper
    .find('#email')
    .at(1)
    .simulate('change', {
      target: {
        name: 'email',
        value: email,
      },
    })
  wrapper
    .find('#role')
    .at(1)
    .simulate('change', {
      target: {
        name: 'role',
        value: role,
      },
    })

  wrapper.find('.button').at(0).simulate('click')

  await waitForComponentToPaint(wrapper)

  expect(createUserCallable).toBeCalledWith({
    email: email,
    firstName: firstName,
    lastName: lastName,
    isAdmin: false,
  })

  wrapper.unmount()
})
