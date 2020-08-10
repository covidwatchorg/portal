import Adapter from 'enzyme-adapter-react-16'
import { configure } from 'enzyme'
import { act } from 'react-dom/test-utils'

configure({ adapter: new Adapter() })

global.waitForComponentToPaint = async (wrapper) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    wrapper.update()
  })
}
