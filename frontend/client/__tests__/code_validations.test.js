import React from 'react'
import { mount } from 'enzyme'
import { rootStore } from '../src/store/model'
import { createStore } from '../src/store'
import CodeValidations from '../src/screens/CodeValidations'
import PendingOperationButton from '../src/components/PendingOperationButton'
import { getVerificationCodeCallable } from '../src/store/firebase'
import { getTodayString } from '../src/util/time'

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
    getVerificationCodeCallable: jest.fn(() => Promise.resolve({ data: '123456' })),
  }
})

describe('Code Validations', () => {
  let CodeVWrapped

  beforeEach(() => {
    // In Code Validations, the Toast uses createRef. createRef breaks when wrapping CodeValidations with createStore, not sure why. So, we mock it here.
    jest.spyOn(React, 'createRef').mockImplementation(() => {
      return { current: { show: () => {} } }
    })
    rootStore.user.__update({ isSignedIn: true, isFirstTimeUser: false })

    CodeVWrapped = createStore(CodeValidations)
  })

  it('can generate code with correct options', async () => {
    // Mock document.getElementById used by the CodeValidations component.
    // JsDOM doesn't handle this well and document.getElementById returns null in the tests without this mock
    Object.defineProperty(document, 'getElementById', {
      value: () => {
        return { classList: { toggle: () => {}, add: () => {}, remove: () => {} } }
      },
    })

    var wrapped = mount(<CodeVWrapped />)

    // Pick valid date
    wrapped
      .find('#date-picker')
      .at(1)
      .simulate('change', {
        target: {
          value: getTodayString(),
        },
      })

    // Ensure "Generate Code" button is enabled and click it
    expect(wrapped.find(PendingOperationButton).at(0).props().disabled).toBe(false)
    wrapped.find('.button').at(0).simulate('click')

    await global.waitForComponentToPaint(wrapped)

    expect(getVerificationCodeCallable).toHaveBeenCalled()
  })
})
