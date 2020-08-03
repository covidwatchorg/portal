import React from 'react'
import { mount } from 'enzyme'
import { rootStore } from '../src/store/model'
import Footer from '../src/components/Footer'
const https = require('https')

const wrapper = mount(<Footer store={{ data: rootStore }} />)

test('privacy policy link is valid', (done) => {
  function callback(res) {
    expect(res.statusCode).toBe(200)
    done()
  }

  https.get(wrapper.find('a').at(0).props().href, callback)
})

test('support link is valid', (done) => {
  function callback(res) {
    expect(res.statusCode).toBe(200)
    done()
  }

  https.get(wrapper.find('a').at(1).props().href, callback)
})
