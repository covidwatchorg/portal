import { mount } from 'enzyme'
import React from 'react'
import ManageMembers from '../src/screens/ManageTeams'
import { createStore } from '../src/store'
import { rootStore, defaultUser } from '../src/store/model'
import { initiatePasswordRecoveryCallable } from '../src/store/firebase'
import { act } from 'react-dom/test-utils'

// Mock getVerificationCodeCallable
jest.mock('../src/store/firebase', () => {
  return {
    ...jest.requireActual('../src/store/firebase'),
    initiatePasswordRecoveryCallable: jest.fn(() => {
      Promise.resolve(true)
    }),
  }
})

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

describe('manage members', () => {
  // Without this, a warning is thrown, see https://github.com/enzymejs/enzyme/issues/2073
  const waitForComponentToPaint = async (wrapper) => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
      wrapper.update()
    })
  }

  test('password reset email', async () => {
    rootStore.user.__update({ isSignedIn: true, isAdmin: true, isFirstTimeUser: false, signedInWithEmailLink: false })
    let defaultUserClone = Object.assign({}, defaultUser)
    // Put a fake user in the store
    defaultUserClone.firstName = 'foo'
    defaultUserClone.lastName = 'bar'
    defaultUserClone.email = 'baz@test.com'
    defaultUserClone.isAdmin = false

    rootStore.organization.__setMembers([defaultUserClone])
    const ManageMembersWrapped = createStore(ManageMembers)
    const wrapped = mount(<ManageMembersWrapped />)

    wrapped.find('a').at(0).simulate('click')

    await waitForComponentToPaint(wrapped)

    expect(initiatePasswordRecoveryCallable).toHaveBeenCalled()
  })
})
