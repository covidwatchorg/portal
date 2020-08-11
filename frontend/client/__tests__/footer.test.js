import React from 'react'
import { mount } from 'enzyme'
import { rootStore } from '../src/store/model'
import Footer from '../src/components/Footer'
const https = require('https')
import toJson from 'enzyme-to-json'

describe('Footer', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(<Footer store={{ data: rootStore }} />)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly', () => {
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it("has a valid 'privacy policy' link", (done) => {
    // See https://jestjs.io/docs/en/asynchronous
    function callback(res) {
      expect(res.statusCode).toBe(200)
      done()
    }

    https.get(wrapper.find('a').at(0).props().href, callback)
  })

  it("has a valid 'support' link", (done) => {
    function callback(res) {
      expect(res.statusCode).toBe(200)
      done()
    }

    https.get(wrapper.find('a').at(1).props().href, callback)
  })
})
