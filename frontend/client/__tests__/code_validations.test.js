import React from 'react'
import { mount } from 'enzyme'
import { rootStore } from '../src/store/model'
import { createStore } from '../src/store'
import CodeValidations from '../src/screens/CodeValidations'
import PendingOperationButton from '../src/components/PendingOperationButton'
import Toast from '../src/components/Toast'
import { getVerificationCodeCallable } from '../src/store/firebase'
import { getDay } from '../src/util/time'

// Mock Redirect to avoid router error
jest.mock('react-router-dom', () => {
  return {
    __esModule: true,
    // eslint-disable-next-line react/display-name
    Redirect: () => {
      return <div></div>
    },
  }
})

// Mock getVerificationCodeCallable
jest.mock('../src/store/firebase', () => {
  return {
    ...jest.requireActual('../src/store/firebase'),
    __esModule: true,
    getVerificationCodeCallable: jest.fn(() => Promise.resolve('123456')),
  }
})

describe('test code validations', () => {
  let CodeVWrapped

  beforeEach(() => {
    // In Code Validations, the Toast uses createRef. createRef breaks when wrapping CodeValidations with createStore, not sure why. So, we mock it here.
    jest.spyOn(React, 'createRef').mockImplementation(() => {
      return { current: { show: () => {} } }
    })
    rootStore.user.__update({ isSignedIn: true, isFirstTimeUser: false })

    CodeVWrapped = createStore(CodeValidations)
  })

  test('generate code is disabled by default', () => {
    const wrapped = mount(<CodeVWrapped />)
    expect(wrapped.find(PendingOperationButton).at(0).props().disabled).toBe(true)
  })

  // Dates more than 14 days in the past or in the future are invalid
  test.each([
    [-16, 'Date cannot be more than 14 days ago'],
    [5, 'Date cannot be in the future'],
  ])('dates %i days away are invalid', (numDaysAway, expectedMessage) => {
    const wrapped = mount(<CodeVWrapped />)

    var date = new Date()
    date.setDate(date.getDate() + numDaysAway)

    wrapped.find('#date-picker').simulate('change', {
      target: {
        value: getDay(date),
        classList: {
          add: () => {},
          remove: () => {},
        },
      },
    })

    // Ensure Generate Code button is disabled and Toast has the correct error message
    expect(wrapped.find(PendingOperationButton).at(0).props().disabled).toBe(true)
    expect(wrapped.find(Toast).at(0).props().message).toBe(expectedMessage)
  })

  test('can generate code', async () => {
    var wrapped = mount(<CodeVWrapped />)

    // Pick valid date
    wrapped.find('#date-picker').simulate('change', {
      target: {
        value: getDay(new Date()),
        classList: {
          add: () => {},
          remove: () => {},
        },
      },
    })
    // Can't generate a code with a date, even if it's valid
    expect(wrapped.find(PendingOperationButton).at(0).props().disabled).toBe(true)

    // Click diagnosis button
    wrapped.find('.radio-input').at(0).simulate('click')

    // Ensure "Generate Code" button is enabled and click it
    expect(wrapped.find(PendingOperationButton).at(0).props().disabled).toBe(false)
    wrapped.find('.button').at(0).simulate('click')

    expect(getVerificationCodeCallable).toHaveBeenCalled()
  })
})
