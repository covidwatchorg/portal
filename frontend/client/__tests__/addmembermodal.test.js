import { mount, shallow } from 'enzyme'
import React from 'react'
import AddMemberModal from '../src/components/AddMemberModal'
import { createStore } from '../src/store'
import { createUserCallable } from '../src/store/firebase'
import toJson from 'enzyme-to-json'

jest.mock('../src/store/firebase', () => {
  return {
    ...jest.requireActual('../src/store/firebase'),
    createUserCallable: jest.fn(async (newUser) => newUser),
  }
})

describe('AddMemberModal', () => {
  let AddMemberModalWrapped
  let wrapper
  let onAddMemberCancel

  beforeEach(() => {
    AddMemberModalWrapped = createStore(AddMemberModal)

    var showAddMemberModal = true
    onAddMemberCancel = jest.fn()
    const onAddMemberSuccess = jest.fn()
    const onAddMemberFailure = jest.fn()

    wrapper = mount(
      <AddMemberModalWrapped
        hidden={!showAddMemberModal}
        onClose={onAddMemberCancel}
        onSuccess={onAddMemberSuccess}
        onFailure={onAddMemberFailure}
      />
    )
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly', () => {
    var showAddMemberModal = true
    const onAddMemberCancel = jest.fn()
    const onAddMemberSuccess = jest.fn()
    const onAddMemberFailure = jest.fn()

    const wrapper = shallow(
      <AddMemberModalWrapped
        hidden={!showAddMemberModal}
        onClose={onAddMemberCancel}
        onSuccess={onAddMemberSuccess}
        onFailure={onAddMemberFailure}
      />
    )
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('closes when close button is clicked', () => {
    wrapper.find('.close-btn').at(0).simulate('click')
    expect(onAddMemberCancel.mock.calls.length).toBe(1)
  })

  it('closes when background is clicked', () => {
    wrapper.find('.modal-background').at(0).simulate('click')
    expect(onAddMemberCancel.mock.calls.length).toBe(1)
  })

  it.each([
    ['', 'test', '', ''],
    ['test', 'test', 'invalidemail', 'Test Validator'],
  ])('does not allow invalid input', async (firstName, lastName, email, role) => {
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

    await global.waitForComponentToPaint(wrapper)

    expect(createUserCallable).toHaveBeenCalledTimes(0)
  })

  it('creates new user succesfully', async () => {
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

    await global.waitForComponentToPaint(wrapper)

    expect(createUserCallable).toBeCalledWith({
      email: email,
      firstName: firstName,
      lastName: lastName,
      isAdmin: false,
    })
  })
})
