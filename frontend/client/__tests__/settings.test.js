import React from 'react'
import { mount } from 'enzyme'
import { rootStore } from '../src/store/model'
import Settings from '../src/screens/Settings'
import { createStore } from '../src/store'
// import { act } from 'react-dom/test-utils'
// import { db } from '../src/store/index.js'

beforeEach(() => {
  rootStore.user.__update({ isSignedIn: true, isFirstTimeUser: false, firstName: 'testUser' })
})

// Mock Redirect and Link to avoid router error
jest.mock('react-router-dom', () => {
  return {
    __esModuleRedirect: true,
    // eslint-disable-next-line react/display-name
    Redirect: () => {
      return <div></div>
    },
    __esModuleLink: true,
    // eslint-disable-next-line react/display-name
    Link: () => {
      return <div></div>
    },
  }
})

// THIS IS TO GET RID OF A WARNING MESSAGE FOLLOWING COLBYS SUGGESTION FOR RESOLVING IT THAT I WASNT ABLE TO FULLY RESOLVE
// more info on waitForComponentToPaint here: https://github.com/enzymejs/enzyme/issues/2073
// const waitForComponentToPaint = async (wrapper) => {
//     await act(async () => {
//         await new Promise((resolve) => setTimeout(resolve, 0))
//         wrapper.update()
//     })
// }

// THIS IS GOING FOR CHECKING that line 150 in /store/index.js runs... this makes a Jest mock function of db.collection.doc.set
jest.mock('../src/store/index.js', () => {
  return {
    ...jest.requireActual('../src/store/index.js'),
    db: {
      collection: {
        doc: {
          set: jest.fn(),
        },
      },
    },
  }
})

// THESE TWO IMAGE TESTS ARE NOT WORKING AS DESIRED
// I believe the problem is that the example images are not actually being uploaded as desired
// so there is always an empty image
// I believe the images are stored in imgUploader in Settings.js so line 63 and 79 are useless for actually uploading the img
// that is the key to unlock here I think -- actually uploading the images correctly
// - Jesse

test('Upload photo of greater than 10 MB fails', () => {
  const SettingsWrapped = createStore(Settings)
  const wrapped = mount(<SettingsWrapped />)
    const spyUseRef = jest.spyOn(React, 'useRef')

  // hardcode path to 40 MB image in repo
  wrapped.find('#photo-upload-input').simulate('change', { target: { value: './large_image.jpg' } })

  // only valid as long as there is a single .btn-primary class in the DOM
  wrapped.find('.btn-primary').at(0).simulate('click')

  // ANOTHER APPROACH I WAS TRYING:
  // expect(db.collection.doc.set).not.toHaveBeenCalled()
  expect(spyUseRef).not.toHaveBeenCalled()

  wrapped.unmount()
})

test('Upload photo of less than 10MB succeeds', () => {
  const SettingsWrapped = createStore(Settings)
  const wrapped = mount(<SettingsWrapped />)
  const spyUseRef = jest.spyOn(React, 'useRef')

  wrapped.find('#photo-upload-input').simulate('change', { target: { value: './small_image.png' } })

  // only valid as long as there is a single .btn-primary class in the DOM
  wrapped.find('.btn-primary').at(0).simulate('click')
  expect(spyUseRef).toHaveBeenCalled()

  // ANOTHER APPROACH I WAS TRYING:
  // expect(db.collection.doc.set).toHaveBeenCalled()

  wrapped.unmount()
})
