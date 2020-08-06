import { mount } from 'enzyme'
import React from 'react'
import { act } from 'react-dom/test-utils'
import ChangePasswordModal from '../src/components/ChangePasswordModal'
import ResetPasswordModal from '../src/components/ResetPasswordModal'
import { createStore } from '../src/store'
import { auth } from '../src/store/firebase'

// Mock auth.currentUser.updatePassword()
jest.mock('../src/store/firebase', () => {
  return {
    auth: {
      currentUser: {
        email: 'test@test.com',
        updatePassword: jest.fn(() => Promise.resolve(true)),
        reauthenticateWithCredential: jest.fn(() => Promise.resolve(true)),
      },
      EmailAuthProvider: { credential: () => {} },
      setPersistence: () => {},
      onAuthStateChanged: () => {},
    },
    // Nested function hell mocking the db
    db: {
      collection: () => {
        return {
          doc: () => {
            return { update: () => Promise.resolve(true) }
          },
        }
      },
    },
  }
})

describe('reset password', () => {
  const waitForComponentToPaint = async (wrapper) => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
      wrapper.update()
    })
  }

  test.each([
    ['Reset Password Modal success', ResetPasswordModal, 'password1', 'password1'],
    ['Reset Password Modal invalid input', ResetPasswordModal, 'password1', 'password2'],
    ['Change Password Modal success', ChangePasswordModal, 'password1', 'password1'],
    ['Change Password Modal invalid input', ChangePasswordModal, 'password1', 'password2'],
  ])('Test %s', async (title, modal, newPassword, confirmPassword) => {
    const ModalWrapped = createStore(modal)
    const onSuccess = jest.fn()
    const onFailure = jest.fn()
    const wrapper = mount(<ModalWrapped onSuccess={onSuccess} onFailure={onFailure} />)

    const currentPassword = 'password'

    if (modal == ResetPasswordModal) {
      wrapper
        .find('#current-password')
        .at(1)
        .simulate('change', {
          target: {
            name: 'current-password',
            value: currentPassword,
          },
        })
    }
    wrapper
      .find('#new-password')
      .at(1)
      .simulate('change', {
        target: {
          name: 'new-password',
          value: newPassword,
        },
      })
    wrapper
      .find('#confirm-password')
      .at(1)
      .simulate('change', {
        target: {
          name: 'confirm-password',
          value: confirmPassword,
        },
      })

    // Click "Change Password" button
    wrapper.find('.button').at(0).simulate('click')
    await waitForComponentToPaint(wrapper)

    if (confirmPassword == newPassword) {
      expect(auth.currentUser.updatePassword).toHaveBeenCalledWith(newPassword)
    } else {
      expect(auth.currentUser.updatePassword).toHaveBeenCalledTimes(0)
    }
  })

  test('Reset password modal: changing to current password is invalid', async () => {
    const ModalWrapped = createStore(ResetPasswordModal)
    const onSuccess = jest.fn()
    const onFailure = jest.fn()
    const wrapper = mount(<ModalWrapped onSuccess={onSuccess} onFailure={onFailure} />)

    // Mock current password == new password error from firebase
    auth.currentUser.reauthenticateWithCredential.mockImplementation(() => Promise.reject('expected error'))

    const currentPassword = 'password'
    const newPassword = 'password1'
    const confirmPassword = 'password1'

    wrapper
      .find('#current-password')
      .at(1)
      .simulate('change', {
        target: {
          name: 'current-password',
          value: currentPassword,
        },
      })
    wrapper
      .find('#new-password')
      .at(1)
      .simulate('change', {
        target: {
          name: 'new-password',
          value: newPassword,
        },
      })
    wrapper
      .find('#confirm-password')
      .at(1)
      .simulate('change', {
        target: {
          name: 'confirm-password',
          value: confirmPassword,
        },
      })

    wrapper.find('.button').at(0).simulate('click')
    await waitForComponentToPaint(wrapper)

    expect(auth.currentUser.updatePassword).toHaveBeenCalledTimes(0)
  })
})
