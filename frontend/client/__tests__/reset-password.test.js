import { mount } from 'enzyme'
import React from 'react'
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
  it.each([
    ['Changes password succesfully (ResetPasswordModal)', ResetPasswordModal, 'horsebattery123', 'horsebattery123'],
    [
      'Does not change password when confirmation does not match (ResetPasswordModal)',
      ResetPasswordModal,
      'password1',
      'password2',
    ],
    ['Changes password succesfully (ChangePasswordModal)', ChangePasswordModal, 'horsebattery123', 'horsebattery123'],
    [
      'Does not change password when confirmation does not match (ChangePasswordModal)',
      ChangePasswordModal,
      'password1',
      'password2',
    ],
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
      .at(2)
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
    await global.waitForComponentToPaint(wrapper)

    if (confirmPassword == newPassword) {
      expect(auth.currentUser.updatePassword).toHaveBeenCalledWith(newPassword)
    } else {
      expect(auth.currentUser.updatePassword).toHaveBeenCalledTimes(0)
    }
  })

  it('does not allow new password to be current password (ResetPasswordModal only)', async () => {
    const ModalWrapped = createStore(ResetPasswordModal)
    const onSuccess = jest.fn()
    const onFailure = jest.fn()
    const wrapper = mount(<ModalWrapped onSuccess={onSuccess} onFailure={onFailure} />)

    // Mock reauthenticateWithCredential
    auth.currentUser.reauthenticateWithCredential.mockImplementation(() => {})

    const currentPassword = 'password'
    const newPassword = 'password'
    const confirmPassword = 'password'

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

    await global.waitForComponentToPaint(wrapper)

    expect(auth.currentUser.updatePassword).toHaveBeenCalledTimes(0)
  })
})
