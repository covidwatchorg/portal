import Adapter from 'enzyme-adapter-react-16'
import { configure } from 'enzyme'
import { act } from 'react-dom/test-utils'

configure({ adapter: new Adapter() })

// For some reason this library (imported in store/index.js) was causing the following error in all tests:
// (node:4250) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'createElement' of undefined
// at new file (.../permission-portal/frontend/node_modules/jsdom/lib/jsdom/browser/Window.js:532:34)
// at file (.../permission-portal/frontend/node_modules/browser-image-compression/lib/utils.js:66:5)
// at new Promise (<anonymous>)
// at img (.../permission-portal/frontend/node_modules/browser-image-compression/lib/utils.js:66:5)
// at .../permission-portal/frontend/node_modules/browser-image-compression/lib/utils.js:124:11
// If we mock it, this warning seems to go away, so for now this is our solution
jest.mock('browser-image-compression', () => {
  return {}
})

global.waitForComponentToPaint = async (wrapper) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    wrapper.update()
  })
}
